// store/useDocumentStore.ts
// Document mode state (Phase 3): the captured image, the text OCR read from it,
// and its translation. The pipeline is photo -> OCR -> translate -> (optional
// speak), all fully on-device.
import { create } from 'zustand';
import { isOcrSupported, recognizeText } from '@/lib/ocr';
import { translateText } from '@/lib/translation';
import { isTtsSupported, speakText, stopSpeaking, toggleSpeak } from '@/lib/tts';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { TranslationEntry } from '@/types/translation';

export type DocumentStatus =
  | 'idle'
  | 'reading'
  | 'translating'
  | 'ready'
  | 'error';

type DocumentState = {
  imageUri: string | null;
  sourceText: string;
  translatedText: string;
  status: DocumentStatus;
  error: string | null;
  saved: boolean; // whether the current scan has been saved to history
  reset: () => void;
  process: (uri: string, from: string, to: string) => Promise<void>;
  save: (from: string, to: string) => Promise<void>;
  loadEntry: (entry: TranslationEntry) => void;
  speak: (to: string) => Promise<void>;
};

const toMessage = (e: unknown) =>
  e instanceof Error ? e.message : 'Something went wrong. Please try again.';

export const useDocumentStore = create<DocumentState>((set, get) => ({
  imageUri: null,
  sourceText: '',
  translatedText: '',
  status: 'idle',
  error: null,
  saved: false,

  reset: () => {
    stopSpeaking();
    set({ imageUri: null, sourceText: '', translatedText: '', status: 'idle', error: null, saved: false });
  },

  // Read text from a captured/picked photo, then translate it. A finished scan
  // auto-saves to history (with its image) once the translation is ready.
  process: async (uri, from, to) => {
    stopSpeaking();
    set({ imageUri: uri, sourceText: '', translatedText: '', status: 'reading', error: null, saved: false });
    try {
      const sourceText = await recognizeText(uri, from);
      if (!sourceText) {
        set({ status: 'error', error: 'No readable text found. Try again with clearer lighting.' });
        return;
      }
      set({ sourceText, status: 'translating' });

      const translatedText = await translateText(sourceText, from, to);
      set({ translatedText, status: 'ready' });

      // Speak the result when auto-play is on and the language has a voice.
      const { autoPlay, ttsSpeed } = useSettingsStore.getState();
      if (autoPlay && isTtsSupported(to)) {
        void speakText(translatedText, to, ttsSpeed).catch(() => {});
      }

      // Save the scan to history (best-effort — never block the result UI).
      void get().save(from, to);
    } catch (e) {
      set({ status: 'error', error: toMessage(e) });
    }
  },

  // Save the current scan to history (SQLite + embedding + persisted image).
  // Guarded so it only ever writes one entry per scan; called automatically
  // once a scan is ready (see process()).
  save: async (from, to) => {
    const { imageUri, sourceText, translatedText, status, saved } = get();
    if (saved || status !== 'ready' || !sourceText || !translatedText) return;
    set({ saved: true });
    await useHistoryStore.getState().addEntry({
      mode: 'document',
      sourceLang: from,
      targetLang: to,
      sourceText,
      translatedText,
      imageUri: imageUri ?? undefined,
    });
  },

  // Reopen a saved scan from History into the result view (read-only: already
  // marked saved, with the persisted image).
  loadEntry: (entry) => {
    stopSpeaking();
    set({
      imageUri: entry.imageUri ?? null,
      sourceText: entry.sourceText,
      translatedText: entry.translatedText,
      status: 'ready',
      error: null,
      saved: true,
    });
  },

  // Manual speaker button — toggles play / pause / resume, replaying from the
  // start (instantly, from cache) once a clip has finished. Errors propagate so
  // the screen can tell the user when read-aloud fails (rather than silently
  // showing a spinner that goes nowhere).
  speak: async (to) => {
    const { translatedText } = get();
    if (!translatedText) return;
    const { ttsSpeed } = useSettingsStore.getState();
    await toggleSpeak(translatedText, to, ttsSpeed);
  },
}));

export { isOcrSupported };
