import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Offline + privacy reassurance card (Ready screen): shield chip + copy.
export const OfflinePrivacyCard = () => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 24,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 15,
        shadowOffset: { width: 0, height: 4 },
        elevation: 2,
      }}
      className="flex-row gap-3 items-start"
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 99,
          backgroundColor: colors.iconChipBlue,
          marginTop: 2,
        }}
        className="items-center justify-center"
      >
        <MaterialIcons name="security" size={22} color={colors.iconChipBlueText} />
      </View>

      <View className="flex-1 gap-1">
        <Text style={{ ...typography.h4, color: colors.textPrimary }}>Offline Privacy</Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          BabelSpeak works fully offline. Translation models are downloaded to your phone. No
          internet needed, no data shared.
        </Text>
      </View>
    </View>
  );
};
