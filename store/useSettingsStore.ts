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
      autoPlay: true, // default ON
      ttsSpeed: 1,
      setAutoPlay: (autoPlay) => set({ autoPlay }),
      setTtsSpeed: (ttsSpeed) => set({ ttsSpeed }),
    }),
    {
      name: 'app_settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
