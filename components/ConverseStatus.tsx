import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label?: string;
};

// On-device status row: accent dot + monospace label.
export const ConverseStatus = ({ label = 'TRANSLATING · ON DEVICE' }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-row items-center justify-center gap-2">
      <View
        style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accentBlue }}
      />
      <Text style={{ ...typography.label, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
};
