// store/useConverseStore.ts
// Converse mode state: the current source text, its translation, and status.
// In Phase 1 the source is typed; Phase 2 will feed it from voice.
import { create } from 'zustand';
import { translateText } from '@/lib/translation';

export type ConverseStatus = 'idle' | 'translating' | 'ready' | 'error';

type ConverseState = {
  sourceText: string;
  translatedText: string;
  status: ConverseStatus;
  error: string | null;
  setSourceText: (text: string) => void;
  reset: () => void;
  runTranslation: (from: string, to: string) => Promise<void>;
};

export const useConverseStore = create<ConverseState>((set, get) => ({
  sourceText: '',
  translatedText: '',
  status: 'idle',
  error: null,
  setSourceText: (text) => set({ sourceText: text }),
  reset: () => set({ sourceText: '', translatedText: '', status: 'idle', error: null }),
  runTranslation: async (from, to) => {
    const text = get().sourceText.trim();
    if (!text) return;
    set({ status: 'translating', error: null, translatedText: '' });
    try {
      const translatedText = await translateText(text, from, to);
      set({ translatedText, status: 'ready' });
    } catch (e) {
      set({
        status: 'error',
        error: e instanceof Error ? e.message : 'Translation failed. Please try again.',
      });
    }
  },
}));
