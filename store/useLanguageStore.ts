// store/useLanguageStore.ts
// Source + target language pair, persisted to AsyncStorage. swap() flips them.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LanguageState = {
  sourceLang: string; // ISO code
  targetLang: string; // ISO code
  setSourceLang: (code: string) => void;
  setTargetLang: (code: string) => void;
  swap: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      sourceLang: 'en',
      targetLang: 'fr',
      setSourceLang: (code) => set({ sourceLang: code }),
      setTargetLang: (code) => set({ targetLang: code }),
      swap: () =>
        set((state) => ({
          sourceLang: state.targetLang,
          targetLang: state.sourceLang,
        })),
    }),
    {
      name: 'language_pair',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
