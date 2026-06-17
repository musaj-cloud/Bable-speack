import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  label: string; // "I speak"
  icon: keyof typeof MaterialIcons.glyphMap; // leading accent icon
  value: string; // selected ISO code
  onPress: () => void;
};

// A labeled panel with an inner field showing the chosen language + a chevron.
export const LanguagePickerCard = ({ label, icon, value, onPress }: Props) => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        padding: 12,
      }}
    >
      <Text
        style={{ ...typography.label, color: colors.textSecondary }}
        className="px-1 mb-2"
      >
        {label}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${getLanguageName(value)}`}
        style={{
          backgroundColor: colors.bgPrimary,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: 12,
          minHeight: 52,
        }}
        className="flex-row items-center px-3"
      >
        <MaterialIcons name={icon} size={24} color={colors.accentBlue} />
        <Text
          style={{ ...typography.bodyLg, color: colors.textPrimary }}
          className="flex-1 ml-3"
        >
          {getLanguageName(value)}
        </Text>
        <MaterialIcons name="expand-more" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );
};
