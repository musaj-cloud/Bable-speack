import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  message: string;
  onRetry: () => void;
};

// Shown when a voice attempt fails or no speech was caught — gives the user a
// clear reason and a way to try again, instead of silently returning to a blank
// screen (which reads as "nothing works").
export const ConverseNotice = ({ message, onRetry }: Props) => {
  const colors = useTheme();

  return (
    <View className="items-center justify-center gap-4 px-6">
      <View
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons name="mic-off" size={32} color={colors.warningAmber} />
      </View>

      <Text
        style={{ ...typography.bodyMd, color: colors.textSecondary }}
        className="text-center"
      >
        {message}
      </Text>

      <TouchableOpacity
        onPress={onRetry}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Try again"
        style={{ backgroundColor: colors.accentBlue, borderRadius: 14 }}
        className="mt-2 h-12 flex-row items-center justify-center gap-2 px-6"
      >
        <MaterialIcons name="mic" size={18} color="#ffffff" />
        <Text style={{ ...typography.h4, color: '#ffffff' }}>Try again</Text>
      </TouchableOpacity>
    </View>
  );
};
