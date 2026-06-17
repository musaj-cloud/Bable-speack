import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialIcons.glyphMap;

type SideButton = { icon: IconName; label: string; onPress: () => void };
type CenterButton = SideButton & { active?: boolean };

type Props = {
  left: SideButton;
  center: CenterButton;
  right: SideButton;
};

// Bottom action row: two small chips flanking a large primary action button.
// Reused by Converse (keyboard · mic · camera) and Document (gallery · shutter · flash).
export const ActionBar = ({ left, center, right }: Props) => {
  const colors = useTheme();

  const sideChip = (b: SideButton) => (
    <TouchableOpacity
      onPress={b.onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={b.label}
      style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.bgCardInner }}
      className="items-center justify-center"
    >
      <MaterialIcons name={b.icon} size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <View className="flex-row items-center justify-between px-6">
      {sideChip(left)}

      <TouchableOpacity
        onPress={center.onPress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={center.label}
        style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: center.active ? colors.warningRed : colors.accentBlue,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 4 },
          elevation: 5,
        }}
        className="items-center justify-center"
      >
        <MaterialIcons name={center.icon} size={36} color="#ffffff" />
      </TouchableOpacity>

      {sideChip(right)}
    </View>
  );
};
