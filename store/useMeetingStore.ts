// store/useMeetingStore.ts
// Meeting = record a whole talk, then translate + summarize it. One continuous
// recording (someone speaking, e.g. in Portuguese); on stop the audio is
// transcribed in the spoken language (Whisper), split into sentences and
// translated into the language you need (Bergamot), then the whole thing is
// summarized into a few bullet points (Qwen3) so it's easy to talk about. If the
// meeting is already in your language, it's transcribed and summarized as-is —
// no translation step. Everything runs on-device.
import { create } from 'zustand';
import { splitSentences } from '@/lib/sentences';
import { summarizeMeeting } from '@/lib/summarize';
import { transcribeFile } from '@/lib/transcription';
import { translateText } from '@/lib/translation';
import { isTtsSupported, onSpeakStateChange, speakText, stopSpeaking } from '@/lib/tts';
import { useHistoryStore } from '@/store/useHistoryStore';
import { TranslationEntry } from '@/types/translation';

export type MeetingStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'translating'
  | 'summarizing'
  | 'ready'
  | 'error';

// Kept for the saved-segment shape (single speaker → always 'them').
export type TurnSide = 'you' | 'them';

// One line of the recorded talk: a sentence and its translation.
export type MeetingSegment = {
  id: string;
  side: TurnSide;
  fromLang: string; // language spoken in the recording
  toLang: string; // language it was translated into
  sourceText: string; // the sentence, as spoken
  translatedText: string; // its translation ('' when the talk is already in toLang)
};

type MeetingState = {
  status: MeetingStatus;
  durationSec: number;
  segments: MeetingSegment[];
  summary: string[];
  error: string | null;
  saved: boolean;
  speakingId: string | null; // id of the segment whose text is playing aloud
  srcLang: string; // spoken language (source)
  tgtLang: string; // language to translate into (yours)
  startSession: (srcLang: string, tgtLang: string) => void;
  setDuration: (sec: number) => void;
  setError: (message: string) => void;
  process: (uri: string | null) => Promise<void>;
  speak: (seg: MeetingSegment) => void;
  reset: () => void;
  save: () => Promise<void>;
  loadEntry: (entry: TranslationEntry) => void;
};

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

// Monotonic segment id — avoids collisions when two land in the same ms.
let segSeq = 0;

// The talk rendered in the reader's language: the translation when present,
// otherwise the original (same-language meeting). Used for the summary + search.
const readable = (segments: MeetingSegment[]): string =>
  segments
    .map((s) => s.translatedText || s.sourceText)
    .filter(Boolean)
    .join(' ');

export const useMeetingStore = create<MeetingState>((set, get) => ({
  status: 'idle',
  durationSec: 0,
  segments: [],
  summary: [],
  error: null,
  saved: false,
  speakingId: null,
  srcLang: '',
  tgtLang: '',

  startSession: (srcLang, tgtLang) =>
    set({
      status: 'recording',
      durationSec: 0,
      segments: [],
      summary: [],
      error: null,
      saved: false,
      speakingId: null,
      srcLang,
      tgtLang,
    }),

  setDuration: (durationSec) => set({ durationSec }),

  setError: (error) => set({ status: 'error', error }),

  reset: () => {
    stopSpeaking();
    set({
      status: 'idle',
      durationSec: 0,
      segments: [],
      summary: [],
      error: null,
      saved: false,
      speakingId: null,
    });
  },

  // Process a finished recording: transcribe → translate each sentence (revealing
  // the transcript as it goes) → summarize the whole talk. A summary is always
  // attempted, even for a same-language meeting, so it's easy to talk about after.
  process: async (uri) => {
    const { srcLang, tgtLang } = get();
    set({ status: 'transcribing', error: null });
    try {
      const full = uri ? await transcribeFile(uri, srcLang) : '';
      if (!full) {
        set({ status: 'idle' }); // nothing was recorded
        return;
      }

      const sameLang = srcLang === tgtLang;
      const sentences = splitSentences(full);
      set({ status: 'translating', segments: [] });

      const segs: MeetingSegment[] = [];
      for (const sentence of sentences) {
        const translatedText = sameLang
          ? ''
          : await translateText(sentence, srcLang, tgtLang).catch(() => '');
        segs.push({
          id: `m${segSeq++}`,
          side: 'them',
          fromLang: srcLang,
          toLang: tgtLang,
          sourceText: sentence,
          translatedText,
        });
        set({ segments: [...segs] }); // progressive reveal
      }

      // Summarize the talk in the reader's language. Best-effort: a failed or
      // empty summary must never lose the transcript.
      set({ status: 'summarizing' });
      const summary = await summarizeMeeting(readable(segs)).catch((e) => {
        console.warn('[meeting] summary failed:', e);
        return [];
      });
      set({ summary, status: 'ready' });
    } catch (e) {
      set({ status: 'error', error: toMessage(e) });
    }
  },

  // Read one line aloud (the translation, or the original for a same-language
  // talk). The marker is cleared by the playback subscription below.
  speak: (seg) => {
    const text = seg.translatedText || seg.sourceText;
    const lang = seg.translatedText ? seg.toLang : seg.fromLang;
    if (!text || !isTtsSupported(lang)) return;
    set({ speakingId: seg.id });
    void speakText(text, lang).catch(() => {
      if (get().speakingId === seg.id) set({ speakingId: null });
    });
  },

  // Save the finished session to history (full transcript + summary + duration,
  // plus flattened text for search). Guarded to write at most once.
  save: async () => {
    const { status, saved, segments, summary, durationSec, srcLang, tgtLang } = get();
    if (saved || status !== 'ready' || segments.length === 0) return;
    set({ saved: true });
    await useHistoryStore.getState().addEntry({
      mode: 'meeting',
      sourceLang: srcLang,
      targetLang: tgtLang,
      sourceText: segments.map((s) => s.sourceText).join(' '),
      translatedText: readable(segments),
      detail: { durationSec, segments: segments.map((s) => ({ ...s })), summary },
    });
  },

  // Reopen a saved session from History into the Meeting view (read-only).
  loadEntry: (entry) => {
    const detail = entry.detail;
    if (!detail) return;
    stopSpeaking();
    set({
      status: 'ready',
      durationSec: detail.durationSec,
      segments: detail.segments,
      summary: detail.summary,
      error: null,
      saved: true,
      speakingId: null,
      srcLang: entry.sourceLang,
      tgtLang: entry.targetLang,
    });
  },
}));

// Clear the speaking marker whenever on-device playback stops.
onSpeakStateChange((state) => {
  if (state !== 'idle') return;
  if (useMeetingStore.getState().speakingId) useMeetingStore.setState({ speakingId: null });
});
