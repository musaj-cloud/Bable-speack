import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  icon: keyof typeof MaterialIcons.glyphMap;
  chipBg: string;
  chipText: string;
  label: string;
};

// A single feature row: colored icon chip + label.
export const FeatureRow = ({ icon, chipBg, chipText, label }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-row items-center gap-3">
      <View
        style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: chipBg }}
        className="items-center justify-center"
      >
        <MaterialIcons name={icon} size={24} color={chipText} />
      </View>
      <Text style={{ ...typography.h4, color: colors.textPrimary }} className="flex-1">
        {label}
      </Text>
    </View>
  );
};
