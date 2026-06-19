import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  saved: boolean;
  onSave: () => void;
};

// Explicit "save to history" control. Translations are never saved automatically
// — the user opts in per result, so private translations stay off the device's
// history. Turns into a non-interactive "saved" confirmation once tapped.
export const SaveToHistoryButton = ({ saved, onSave }: Props) => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onSave}
      disabled={saved}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: saved }}
      accessibilityLabel={saved ? 'Saved to history' : 'Save to history'}
      style={{
        height: 48,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bgCard,
        opacity: saved ? 0.6 : 1,
      }}
      className="flex-row items-center justify-center gap-2"
    >
      <MaterialIcons
        name={saved ? 'check' : 'bookmark-border'}
        size={20}
        color={colors.accentBlue}
      />
      <Text style={{ ...typography.label, color: colors.accentBlue }}>
        {saved ? 'SAVED TO HISTORY' : 'SAVE TO HISTORY'}
      </Text>
    </TouchableOpacity>
  );
};
