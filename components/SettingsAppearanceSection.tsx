import { useState } from 'react';
import { OptionPickerModal, PickerOption } from '@/components/OptionPickerModal';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { useThemeStore } from '@/store/useThemeStore';
import { ThemePreference } from '@/types/theme';

const THEME_OPTIONS: PickerOption<ThemePreference>[] = [
  { label: 'System Default', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

const themeLabel = (value: ThemePreference) =>
  THEME_OPTIONS.find((o) => o.value === value)?.label ?? 'System Default';

// APPEARANCE section: theme preference picker (light / dark / system).
export const SettingsAppearanceSection = () => {
  const { preference, setPreference } = useThemeStore();
  const [open, setOpen] = useState(false);

  return (
    <SettingsSection title="Appearance">
      <SettingsRow
        icon="palette"
        title="Theme"
        subtitle={themeLabel(preference)}
        onPress={() => setOpen(true)}
      />

      <OptionPickerModal
        visible={open}
        title="Theme"
        options={THEME_OPTIONS}
        selected={preference}
        onSelect={setPreference}
        onClose={() => setOpen(false)}
      />
    </SettingsSection>
  );
};
