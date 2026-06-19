// store/useMeetingStore.ts
// Live, bidirectional meeting mode. Two people share one phone with a fixed
// language pair (You = source, Them = target). Each push-to-talk turn is
// transcribed in the speaker's known language (Whisper), translated to the
// other language (Bergamot), shown as a chat bubble immediately, and spoken
// aloud to the listener (TTS). On stop the whole conversation is summarized
// (Qwen3) and can be saved to history. Everything runs on-device.
import { create } from 'zustand';
import { summarizeMeeting } from '@/lib/summarize';
import { transcribeFile } from '@/lib/transcription';
import { translateText } from '@/lib/translation';
import { isTtsSupported, onSpeakStateChange, speakText, stopSpeaking } from '@/lib/tts';
import { useHistoryStore } from '@/store/useHistoryStore';
import { TranslationEntry } from '@/types/translation';

export type MeetingStatus = 'idle' | 'live' | 'summarizing' | 'ready' | 'error';

// Which side of the conversation spoke a turn.
export type TurnSide = 'you' | 'them';

// One conversation turn: what was said and its translation, with directions.
export type MeetingSegment = {
  id: string;
  side: TurnSide;
  fromLang: string; // language spoken
  toLang: string; // language it was translated to
  sourceText: string; // what was said, in fromLang
  translatedText: string; // translation, in toLang
};

type MeetingState = {
  status: MeetingStatus;
  durationSec: number;
  segments: MeetingSegment[];
  summary: string[];
  error: string | null;
  saved: boolean;
  busy: boolean; // a turn is being transcribed/translated
  speakingId: string | null; // id of the turn whose translation is playing aloud
  youLang: string; // the phone owner's language (source)
  themLang: string; // the other speaker's language (target)
  startSession: (youLang: string, themLang: string) => void;
  setDuration: (sec: number) => void;
  addTurn: (uri: string, side: TurnSide) => Promise<void>;
  speak: (seg: MeetingSegment) => void;
  endSession: () => Promise<void>;
  reset: () => void;
  save: () => Promise<void>;
  loadEntry: (entry: TranslationEntry) => void;
};

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

// Monotonic turn id — avoids collisions when two turns land in the same ms.
let turnSeq = 0;

// The conversation rendered in the phone owner's language: their own turns as
// spoken, the other speaker's turns as translated back for them. Used for the
// summary and the searchable history entry.
const inOwnerLanguage = (segments: MeetingSegment[]): string =>
  segments
    .map((s) => (s.side === 'you' ? s.sourceText : s.translatedText))
    .filter(Boolean)
    .join(' ');

export const useMeetingStore = create<MeetingState>((set, get) => ({
  status: 'idle',
  durationSec: 0,
  segments: [],
  summary: [],
  error: null,
  saved: false,
  busy: false,
  speakingId: null,
  youLang: '',
  themLang: '',

  startSession: (youLang, themLang) =>
    set({
      status: 'live',
      durationSec: 0,
      segments: [],
      summary: [],
      error: null,
      saved: false,
      busy: false,
      speakingId: null,
      youLang,
      themLang,
    }),

  setDuration: (durationSec) => set({ durationSec }),

  reset: () => {
    stopSpeaking();
    set({
      status: 'idle',
      durationSec: 0,
      segments: [],
      summary: [],
      error: null,
      saved: false,
      busy: false,
      speakingId: null,
    });
  },

  // Handle one finished push-to-talk recording: transcribe → translate → reveal
  // the bubble → speak the translation to the listener. A failed turn must not
  // kill the session, so errors are swallowed and the session stays live.
  addTurn: async (uri, side) => {
    const { youLang, themLang } = get();
    const from = side === 'you' ? youLang : themLang;
    const to = side === 'you' ? themLang : youLang;

    set({ busy: true });
    try {
      const sourceText = await transcribeFile(uri, from);
      if (!sourceText) {
        set({ busy: false });
        return; // nothing was heard
      }

      const translatedText = await translateText(sourceText, from, to).catch(() => '');
      const segment: MeetingSegment = {
        id: `t${turnSeq++}`,
        side,
        fromLang: from,
        toLang: to,
        sourceText,
        translatedText,
      };
      set({ segments: [...get().segments, segment], busy: false });

      // Speak the translation aloud for the listener — best-effort, never blocks.
      get().speak(segment);
    } catch (e) {
      set({ busy: false, error: toMessage(e) });
    }
  },

  // Play a turn's translation aloud and mark it as the speaking bubble. The
  // marker is cleared by the playback subscription below when audio ends.
  speak: (seg) => {
    if (!seg.translatedText || !isTtsSupported(seg.toLang)) return;
    set({ speakingId: seg.id });
    void speakText(seg.translatedText, seg.toLang).catch(() => {
      if (get().speakingId === seg.id) set({ speakingId: null });
    });
  },

  // End the session and summarize the whole conversation in the owner's
  // language. Best-effort summary — a failure must not lose the transcript.
  endSession: async () => {
    stopSpeaking();
    const { segments } = get();
    if (segments.length === 0) {
      set({ status: 'idle' });
      return;
    }
    set({ status: 'summarizing' });
    const transcript = inOwnerLanguage(segments);
    console.log('[meeting] summarizing transcript:', JSON.stringify(transcript));
    const summary = await summarizeMeeting(transcript).catch((e) => {
      // Surface the real reason in the Metro/device logs instead of hiding it.
      console.warn('[meeting] summary failed:', e);
      return [];
    });
    console.log('[meeting] summary result:', JSON.stringify(summary));
    set({ summary, status: 'ready' });
  },

  // Explicit, user-initiated save of the finished meeting to history. Keeps the
  // full transcript + summary + duration (detail) so the session can be reopened
  // in full, plus flattened text for search. Guarded to write at most once.
  save: async () => {
    const { status, saved, segments, summary, durationSec, youLang, themLang } = get();
    if (saved || status !== 'ready' || segments.length === 0) return;
    set({ saved: true });
    await useHistoryStore.getState().addEntry({
      mode: 'meeting',
      sourceLang: youLang,
      targetLang: themLang,
      sourceText: segments.map((s) => s.sourceText).join(' '),
      translatedText: inOwnerLanguage(segments),
      detail: { durationSec, segments: segments.map((s) => ({ ...s })), summary },
    });
  },

  // Reopen a saved session from History back into the Meeting view (read-only:
  // status 'ready', already marked saved).
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
      busy: false,
      speakingId: null,
      youLang: entry.sourceLang,
      themLang: entry.targetLang,
    });
  },
}));

// Clear the speaking marker whenever on-device playback stops (finished, was
// superseded by a new turn, or stopped on session end).
onSpeakStateChange((state) => {
  if (state !== 'idle') return;
  if (useMeetingStore.getState().speakingId) useMeetingStore.setState({ speakingId: null });
});
