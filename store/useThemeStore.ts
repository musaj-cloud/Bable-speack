// store/useThemeStore.ts
// Theme preference ('light' | 'dark' | 'system'), persisted to AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { ThemePreference } from '@/types/theme';

type ThemeState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      preference: 'light',
      setPreference: (preference) => set({ preference }),
    }),
    {
      name: 'theme_preference',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
