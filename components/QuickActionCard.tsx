import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  highlighted?: boolean; // accent chip + tinted surface
  onPress?: () => void;
};

// Small horizontal quick-action card (Offline Languages / Saved Phrases).
export const QuickActionCard = ({ icon, title, subtitle, highlighted, onPress }: Props) => {
  const colors = useTheme();

  const chipBg = highlighted ? colors.accentBlue : colors.bgCardInner;
  const chipIcon = highlighted ? '#ffffff' : colors.textSecondary;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={{
        backgroundColor: highlighted ? colors.bgCardInner : colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 20,
        padding: 16,
      }}
      className="flex-row items-center gap-4"
    >
      <View
        style={{ width: 48, height: 48, borderRadius: 99, backgroundColor: chipBg }}
        className="items-center justify-center"
      >
        <MaterialIcons name={icon} size={24} color={chipIcon} />
      </View>

      <View className="flex-1 gap-0.5">
        <Text style={{ ...typography.h4, color: colors.textPrimary }}>{title}</Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};
