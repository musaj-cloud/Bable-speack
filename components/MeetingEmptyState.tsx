import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Resting state for Meeting mode: invites the user to record a conversation.
export const MeetingEmptyState = () => {
  const colors = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-4 px-6">
      <View
        style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: colors.iconChipLavender }}
        className="items-center justify-center"
      >
        <MaterialIcons name="graphic-eq" size={40} color={colors.iconChipLavenderText} />
      </View>

      <Text style={{ ...typography.h3, color: colors.textPrimary }} className="text-center">
        Talk across languages
      </Text>
      <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
        Start a session, then hold your side to speak. BabelSpeak translates each turn aloud for the
        other person — live, and entirely on device.
      </Text>
    </View>
  );
};
