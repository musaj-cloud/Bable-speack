// store/useSettingsStore.ts
// App preferences (TTS speed, auto-play). Persisted to AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type SettingsState = {
  autoPlay: boolean;
  ttsSpeed: number;
  setAutoPlay: (autoPlay: boolean) => void;
  setTtsSpeed: (ttsSpeed: number) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      autoPlay: false, // default OFF — tap the speaker to listen
      ttsSpeed: 1,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setTtsSpeed: (ttsSpeed) => set({ ttsSpeed }),
    }),
    {
      name: 'app_settings',
      version: 1,
      // v0 shipped with auto-play defaulting ON. v1 makes tap-to-listen the
      // default, so flip any previously-persisted ON to OFF on upgrade — existing
      // installs match the new behavior (users can re-enable it in Settings).
      migrate: (persisted) => ({ ...(persisted as SettingsState), autoPlay: false }),
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
