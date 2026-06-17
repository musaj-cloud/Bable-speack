// store/useOnboardingStore.ts
// Tracks whether onboarding is complete. Persisted to AsyncStorage.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type OnboardingState = {
  completed: boolean;
  homeSeen: boolean; // one-time "Explore freely" mode hub shown after first login
  hydrated: boolean;
  setCompleted: (completed: boolean) => void;
  setHomeSeen: (homeSeen: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      completed: false,
      homeSeen: false,
      hydrated: false,
      setCompleted: (completed) => set({ completed }),
      setHomeSeen: (homeSeen) => set({ homeSeen }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: 'onboarding_complete',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completed: state.completed, homeSeen: state.homeSeen }),
      onRehydrateStorage: () => (state) => state?.setHydrated(true),
    }
  )
);
