// store/useLanguageStore.ts
// Source + target language pair, persisted to AsyncStorage. swap() flips them.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type LanguageState = {
  sourceLang: string; // ISO code
  targetLang: string; // ISO code
  // Extra languages (beyond source + target) the user wants fully downloaded for
  // offline use, chosen during onboarding. The warmup pre-downloads these so
  // switching to any of them later needs no internet (see lib/warmup.ts).
  offlineLangs: string[];
  // Languages whose translation models are confirmed downloaded to disk (both
  // EN↔X directions). Drives the "available offline" vs "needs internet" badge
  // in the language pickers. Updated by the warmup and on-demand downloads.
  offlineReady: string[];
  setSourceLang: (code: string) => void;
  setTargetLang: (code: string) => void;
  toggleOfflineLang: (code: string) => void;
  markOfflineReady: (code: string) => void;
  swap: () => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      sourceLang: 'en',
      targetLang: 'fr',
      offlineLangs: [],
      offlineReady: [],
      setSourceLang: (code) => set({ sourceLang: code }),
      setTargetLang: (code) => set({ targetLang: code }),
      toggleOfflineLang: (code) =>
        set((state) => ({
          offlineLangs: state.offlineLangs.includes(code)
            ? state.offlineLangs.filter((c) => c !== code)
            : [...state.offlineLangs, code],
        })),
      markOfflineReady: (code) =>
        set((state) =>
          state.offlineReady.includes(code)
            ? state
            : { offlineReady: [...state.offlineReady, code] }
        ),
      swap: () =>
        set((state) => ({
          sourceLang: state.targetLang,
          targetLang: state.sourceLang,
        })),
    }),
    {
      name: 'language_pair',
      version: 2,
      // v0 had no offline shortlist; v1 added it but no readiness set. On upgrade,
      // default both — and seed offlineReady from the existing pair, since the
      // after-onboarding warmup already downloaded those models.
      migrate: (persisted) => {
        const s = persisted as LanguageState;
        const seed = [s.sourceLang, s.targetLang].filter((c) => c && c !== 'en');
        return {
          ...s,
          offlineLangs: s.offlineLangs ?? [],
          offlineReady: s.offlineReady ?? [...new Set(seed)],
        };
      },
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
