// store/useConverseStore.ts
// Converse mode state: the current source text, its translation, and status.
// Phase 1 feeds the source by typing; Phase 2 feeds it from voice
// (record -> transcribe -> translate -> speak), fully on-device.
import { create } from 'zustand';
import { translateText } from '@/lib/translation';
import { transcribeFile } from '@/lib/transcription';
import { isTtsSupported, speakText, stopSpeaking, toggleSpeak } from '@/lib/tts';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TranslationEntry } from '@/types/translation';

export type ConverseStatus =
  | 'idle'
  | 'recording'
  | 'transcribing'
  | 'translating'
  | 'ready'
  | 'error';

type ConverseState = {
  sourceText: string;
  translatedText: string;
  status: ConverseStatus;
  error: string | null;
  saved: boolean; // whether the current result has been saved to history
  setSourceText: (text: string) => void;
  reset: () => void;
  swapText: () => void;
  beginRecording: () => void;
  markTranscribing: () => void;
  setLiveText: (text: string) => void;
  finalizeVoice: (text: string, from: string, to: string) => Promise<void>;
  failVoice: (e: unknown) => void;
  runTranslation: (from: string, to: string, opts?: { autoSave?: boolean }) => Promise<void>;
  runVoice: (uri: string, from: string, to: string) => Promise<void>;
  save: (from: string, to: string) => Promise<void>;
  loadEntry: (entry: TranslationEntry) => void;
  speak: (to: string) => Promise<void>;
};

// Shared: translate the current source text and auto-play if on. History saving
// is handled by the callers (runTranslation / runVoice) once a result is ready.
const runTranslate = async (
  set: (partial: Partial<ConverseState>) => void,
  text: string,
  from: string,
  to: string
) => {
  set({ status: 'translating', translatedText: '', saved: false });
  const translatedText = await translateText(text, from, to);
  set({ translatedText, status: 'ready' });

  // Speak the result aloud when auto-play is on and the language has a voice.
  const { autoPlay, ttsSpeed } = useSettingsStore.getState();
  if (autoPlay && isTtsSupported(to)) {
    void speakText(translatedText, to, ttsSpeed).catch(() => {});
  }
};

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

export const useConverseStore = create<ConverseState>((set, get) => ({
  sourceText: '',
  translatedText: '',
  status: 'idle',
  error: null,
  saved: false,
  setSourceText: (text) => set({ sourceText: text }),
  reset: () => set({ sourceText: '', translatedText: '', status: 'idle', error: null, saved: false }),

  // When the user swaps languages, the existing translation already holds the
  // other direction — flip the two cards instead of re-running the model.
  swapText: () =>
    set((s) => ({ sourceText: s.translatedText, translatedText: s.sourceText, saved: false })),

  // Screen calls this when the user presses the mic (hold-to-speak).
  beginRecording: () => {
    stopSpeaking();
    set({ status: 'recording', error: null, sourceText: '', translatedText: '', saved: false });
  },

  // Batch path: the user tapped to stop. We're now transcribing the recorded
  // file (no live partial yet), so reflect that in the status line + indicator.
  // Skipped if an end-of-turn already moved us past recording.
  markTranscribing: () =>
    set((s) => (s.status === 'recording' ? { status: 'transcribing' } : {})),

  // Live streaming path: update the source card with the growing transcript as
  // the user speaks. Only meaningful while status is 'recording'.
  setLiveText: (text) => set({ sourceText: text }),

  // Live streaming path: the model signalled end-of-turn (or the user tapped to
  // stop). Translate the final transcript, speak it, and save — like runVoice
  // but the text is already transcribed live. Empty input returns to idle.
  finalizeVoice: async (text, from, to) => {
    const trimmed = text.trim();
    // No speech recognized: show a clear hint instead of silently blanking the
    // screen (which reads as "nothing happened"). Common when the mic captured
    // silence, or when the recorded audio couldn't be decoded.
    if (!trimmed) {
      set({
        status: 'error',
        error: "I didn't catch any speech. Tap the mic and speak clearly, a little closer to the phone.",
      });
      return;
    }
    set({ sourceText: trimmed, error: null });
    try {
      await runTranslate(set, trimmed, from, to);
      await get().save(from, to);
    } catch (e) {
      set({ status: 'error', error: toMessage(e) });
    }
  },

  // Voice capture failed (mic error, model load, decode). Surface it so the
  // user sees why nothing happened rather than landing back on a blank screen.
  failVoice: (e) => set({ status: 'error', error: toMessage(e) }),

  // Typed input path (Phase 1). Auto-saves the finished result to history; the
  // retranslate-on-language-change hook passes autoSave: false so flipping
  // languages updates the view without spamming a new entry each time.
  runTranslation: async (from, to, opts) => {
    const text = get().sourceText.trim();
    if (!text) return;
    set({ error: null });
    try {
      await runTranslate(set, text, from, to);
      if (opts?.autoSave !== false) await get().save(from, to);
    } catch (e) {
      set({ status: 'error', error: toMessage(e) });
    }
  },

  // Voice input path (Phase 2): transcribe the recording, then translate it.
  // A spoken translation is always a fresh result, so it auto-saves.
  runVoice: async (uri, from, to) => {
    set({ status: 'transcribing', error: null, translatedText: '' });
    try {
      const text = await transcribeFile(uri, from);
      if (!text) {
        set({ status: 'idle' });
        return;
      }
      set({ sourceText: text });
      await runTranslate(set, text, from, to);
      await get().save(from, to);
    } catch (e) {
      set({ status: 'error', error: toMessage(e) });
    }
  },

  // Save the current result to history (SQLite + embedding). Guarded so it only
  // ever writes one entry per translation; called automatically once a result
  // is ready (see runTranslation / runVoice).
  save: async (from, to) => {
    const { sourceText, translatedText, status, saved } = get();
    if (saved || status !== 'ready' || !sourceText || !translatedText) return;
    set({ saved: true });
    await useHistoryStore.getState().addEntry({
      mode: 'converse',
      sourceLang: from,
      targetLang: to,
      sourceText,
      translatedText,
    });
  },

  // Reopen a saved Converse entry from History into the live cards (read-only:
  // already marked saved so it isn't written again).
  loadEntry: (entry) => {
    stopSpeaking();
    set({
      sourceText: entry.sourceText,
      translatedText: entry.translatedText,
      status: 'ready',
      error: null,
      saved: true,
    });
  },

  // Manual speaker button — toggles play / pause / resume, replaying from the
  // start (instantly, from cache) once a clip has finished.
  speak: async (to) => {
    const { translatedText } = get();
    if (!translatedText) return;
    const { ttsSpeed } = useSettingsStore.getState();
    await toggleSpeak(translatedText, to, ttsSpeed).catch(() => {});
  },
}));
