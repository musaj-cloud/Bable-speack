import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onType: () => void;
};

// Friendly Converse empty state shown before the first translation.
export const ConverseEmptyState = ({ onType }: Props) => {
  const colors = useTheme();

  return (
    <View className="items-center justify-center gap-4 px-6">
      <View
        style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons name="translate" size={32} color={colors.accentBlue} />
      </View>

      <Text style={{ ...typography.h3, color: colors.textPrimary }} className="text-center">
        Translate anything, offline
      </Text>

      <Text
        style={{ ...typography.bodyMd, color: colors.textSecondary }}
        className="text-center"
      >
        Type a phrase and BabelSpeak translates it right on your device — no internet needed.
      </Text>

      <TouchableOpacity
        onPress={onType}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Type to translate"
        style={{ backgroundColor: colors.accentBlue, borderRadius: 14 }}
        className="mt-2 h-12 flex-row items-center justify-center gap-2 px-6"
      >
        <MaterialIcons name="keyboard" size={18} color="#ffffff" />
        <Text style={{ ...typography.h4, color: '#ffffff' }}>Type to translate</Text>
      </TouchableOpacity>
    </View>
  );
};
