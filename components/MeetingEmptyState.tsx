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
        Record &amp; understand
      </Text>
      <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
        Pick the spoken language and the one you need, then record the whole talk. On stop, BabelSpeak
        transcribes it, translates it, and summarizes it for you — entirely on device.
      </Text>
    </View>
  );
};
