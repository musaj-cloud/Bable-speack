import { useState } from 'react';
import { Switch } from 'react-native';
import { OptionPickerModal, PickerOption } from '@/components/OptionPickerModal';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';

const SPEED_OPTIONS: PickerOption<number>[] = [
  { label: 'Slow (0.75x)', value: 0.75 },
  { label: 'Normal (1.0x)', value: 1 },
  { label: 'Fast (1.25x)', value: 1.25 },
  { label: 'Faster (1.5x)', value: 1.5 },
];

const speedLabel = (value: number) =>
  SPEED_OPTIONS.find((o) => o.value === value)?.label ?? `${value}x`;

// AUDIO section: speech speed picker + auto-play toggle.
export const SettingsAudioSection = () => {
  const colors = useTheme();
  const { ttsSpeed, setTtsSpeed, autoPlay, setAutoPlay } = useSettingsStore();
  const [speedOpen, setSpeedOpen] = useState(false);

  return (
    <SettingsSection title="Audio">
      <SettingsRow
        icon="speed"
        title="Speech Speed"
        subtitle={speedLabel(ttsSpeed)}
        onPress={() => setSpeedOpen(true)}
      />
      <SettingsRow
        icon="volume-up"
        title="Auto-play Translations"
        subtitle="Speak results automatically"
        right={
          <Switch
            value={autoPlay}
            onValueChange={setAutoPlay}
            trackColor={{ false: colors.border, true: colors.accentBlue }}
            thumbColor="#ffffff"
            ios_backgroundColor={colors.border}
          />
        }
      />

      <OptionPickerModal
        visible={speedOpen}
        title="Speech speed"
        options={SPEED_OPTIONS}
        selected={ttsSpeed}
        onSelect={setTtsSpeed}
        onClose={() => setSpeedOpen(false)}
      />
    </SettingsSection>
  );
};
