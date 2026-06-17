import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// Centered "all set" badge: blue oval with a filled check (Ready screen).
export const ReadyBadge = () => {
  const colors = useTheme();

  return (
    <View
      style={{
        width: 128,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.accentLight,
        shadowColor: colors.accentBlue,
        shadowOpacity: 0.2,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 5,
      }}
      className="items-center justify-center"
    >
      <MaterialIcons name="check-circle" size={44} color={colors.accentBlue} />
    </View>
  );
};
