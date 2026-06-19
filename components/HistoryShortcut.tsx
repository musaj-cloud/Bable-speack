import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { Mode } from '@/types/translation';

type Props = { label: string; filter: Mode };

// Small pill that jumps to the History tab pre-filtered to one mode — e.g.
// "Saved sessions" on Meeting, "Saved scans" on Document.
export const HistoryShortcut = ({ label, filter }: Props) => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/history', params: { filter } })}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 99,
        paddingHorizontal: 12,
        height: 36,
      }}
      className="flex-row items-center gap-1.5 self-end"
    >
      <MaterialIcons name="history" size={16} color={colors.accentBlue} />
      <Text style={{ ...typography.label, color: colors.accentBlue }}>{label}</Text>
    </TouchableOpacity>
  );
};
