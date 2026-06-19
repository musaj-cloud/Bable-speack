import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = { onPress: () => void };

// Pill that opens the "Ask your history" sheet — the RAG Q&A entry point that
// sits above the History search bar.
export const AskHistoryButton = ({ onPress }: Props) => {
  const colors = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Ask your history"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.accentBlue,
        borderWidth: 1,
        borderRadius: 99,
        paddingHorizontal: 16,
        height: 48,
      }}
      className="flex-row items-center justify-center gap-2"
    >
      <MaterialIcons name="auto-awesome" size={18} color={colors.accentBlue} />
      <Text style={{ ...typography.h4, color: colors.accentBlue }}>Ask your history</Text>
    </TouchableOpacity>
  );
};
