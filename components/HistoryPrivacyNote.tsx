import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Footer reassurance shown below the history list: nothing leaves the device.
export const HistoryPrivacyNote = () => {
  const colors = useTheme();

  return (
    <View className="items-center px-8 mt-10 mb-4">
      <MaterialIcons name="lock" size={28} color={colors.textMuted} />
      <Text style={{ ...typography.bodyMd, color: colors.textSecondary, marginTop: 8 }}>
        All data is stored locally.
      </Text>
      <Text
        style={{ ...typography.bodySm, color: colors.textMuted, textAlign: 'center', marginTop: 4 }}
      >
        Your translations are private and never leave your device.
      </Text>
    </View>
  );
};
