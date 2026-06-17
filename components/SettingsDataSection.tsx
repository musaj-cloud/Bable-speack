import { Alert } from 'react-native';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { useOnboardingStore } from '@/store/useOnboardingStore';

// DATA section: on-device storage usage + destructive clear-history action.
// History lives in SQLite (Phase 4); for now the clear action confirms intent.
export const SettingsDataSection = () => {
  const setCompleted = useOnboardingStore((s) => s.setCompleted);
  const setHomeSeen = useOnboardingStore((s) => s.setHomeSeen);

  const confirmClear = () =>
    Alert.alert(
      'Clear translation history?',
      'This permanently deletes every saved translation from this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {} },
      ]
    );

  // Resets the persisted onboarding flags so the app redirects to the welcome flow.
  const confirmResetOnboarding = () =>
    Alert.alert(
      'Reset onboarding?',
      'This takes you back to the welcome screens so you can set up the app from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setHomeSeen(false);
            setCompleted(false);
          },
        },
      ]
    );

  return (
    <SettingsSection title="Data">
      <SettingsRow icon="storage" title="Storage Used" subtitle="14.2 MB (Offline packs)" />
      <SettingsRow icon="delete" title="Clear Translation History" destructive onPress={confirmClear} />
      <SettingsRow icon="restart-alt" title="Reset Onboarding" onPress={confirmResetOnboarding} />
    </SettingsSection>
  );
};
