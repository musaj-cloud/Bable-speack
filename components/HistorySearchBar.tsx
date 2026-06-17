import { MaterialIcons } from '@expo/vector-icons';
import { TextInput, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = { value: string; onChangeText: (text: string) => void };

// Semantic-search input for History: search icon · field · filter (tune) button.
export const HistorySearchBar = ({ value, onChangeText }: Props) => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 52,
      }}
      className="flex-row items-center gap-2"
    >
      <MaterialIcons name="search" size={22} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search history..."
        placeholderTextColor={colors.textMuted}
        style={{ ...typography.bodyMd, flex: 1, color: colors.textPrimary, paddingVertical: 0 }}
      />
      <TouchableOpacity accessibilityLabel="Filters" accessibilityRole="button" className="p-1">
        <MaterialIcons name="tune" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};
