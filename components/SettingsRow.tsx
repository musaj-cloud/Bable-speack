import { MaterialIcons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  icon: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  right?: ReactNode; // overrides the default chevron (e.g. a Switch)
  destructive?: boolean;
};

// One settings row: leading icon, title, optional subtitle, and a right element.
// Falls back to a chevron when pressable; destructive rows render in the error color.
export const SettingsRow = ({ icon, title, subtitle, onPress, right, destructive }: Props) => {
  const colors = useTheme();
  const tint = destructive ? colors.warningRed : colors.textSecondary;
  const titleColor = destructive ? colors.warningRed : colors.textPrimary;
  const showChevron = !right && !!onPress && !destructive;

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      {...(onPress ? { activeOpacity: 0.7, onPress, accessibilityRole: 'button' as const } : {})}
      style={{ minHeight: 56 }}
      className="flex-row items-center justify-between px-4 py-3"
    >
      <View className="flex-row items-center gap-3 flex-1">
        <MaterialIcons name={icon} size={24} color={tint} />
        <View className="flex-1">
          <Text style={{ ...typography.bodyMd, fontSize: 16, color: titleColor }}>{title}</Text>
          {subtitle ? (
            <Text style={{ ...typography.bodySm, color: colors.textSecondary, marginTop: 1 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {right}
      {showChevron && (
        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
      )}
    </Wrapper>
  );
};
