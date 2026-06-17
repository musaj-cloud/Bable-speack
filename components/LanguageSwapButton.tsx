import { MaterialIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onPress: () => void;
};

// Circular accent button that swaps the source and target languages.
export const LanguageSwapButton = ({ onPress }: Props) => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Swap languages"
      style={{
        backgroundColor: colors.accentBlue,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
      }}
    >
      <MaterialIcons name="swap-vert" size={26} color="#ffffff" />
    </TouchableOpacity>
  );
};
