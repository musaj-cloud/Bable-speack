import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
};

// Friendly empty placeholder for tabs not yet built (Phases 3–5).
export const ScreenPlaceholder = ({ icon, title, subtitle }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <View
        style={{ width: 88, height: 88, borderRadius: 99, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons name={icon} size={40} color={colors.textSecondary} />
      </View>
      <Text style={{ ...typography.h2, color: colors.textPrimary }} className="text-center">
        {title}
      </Text>
      <Text style={{ ...typography.bodyLg, color: colors.textSecondary }} className="text-center">
        {subtitle}
      </Text>
    </View>
  );
};
