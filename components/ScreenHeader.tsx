import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  title: string;
  onBack: () => void;
};

// Simple sub-screen top bar: back chevron + centered title. Used by result
// sub-routes (Document, Meeting) that are pushed over the tabs.
export const ScreenHeader = ({ title, onBack }: Props) => {
  const colors = useTheme();

  return (
    <View
      style={{ backgroundColor: colors.bgPrimary }}
      className="h-16 px-5 flex-row items-center justify-between"
    >
      <TouchableOpacity
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={{ width: 40, height: 40, borderRadius: 99 }}
        className="items-center justify-center"
      >
        <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={{ ...typography.h3, color: colors.textPrimary }}>{title}</Text>

      {/* Spacer to keep the title centered against the back button. */}
      <View style={{ width: 40, height: 40 }} />
    </View>
  );
};
