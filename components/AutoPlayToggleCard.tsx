import { MaterialIcons } from '@expo/vector-icons';
import { Switch, Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';

// "Auto-play translations aloud" toggle card (Ready + Settings).
export const AutoPlayToggleCard = () => {
  const colors = useTheme();
  const autoPlay = useSettingsStore((s) => s.autoPlay);
  const setAutoPlay = useSettingsStore((s) => s.setAutoPlay);

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
      className="flex-row items-center justify-between gap-3"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <MaterialIcons name="volume-up" size={24} color={colors.textSecondary} />
        <Text style={{ ...typography.bodyMd, color: colors.textPrimary }} className="flex-1">
          Auto-play translations aloud
        </Text>
      </View>

      <Switch
        value={autoPlay}
        onValueChange={setAutoPlay}
        trackColor={{ false: colors.border, true: colors.accentBlue }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.border}
      />
    </View>
  );
};
