import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = { searching: boolean };

// Shown when History has no entries, or a search returns nothing.
export const HistoryEmptyState = ({ searching }: Props) => {
  const colors = useTheme();

  return (
    <View className="items-center px-8" style={{ marginTop: 80 }}>
      <View
        style={{ width: 72, height: 72, borderRadius: 99, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons
          name={searching ? 'search-off' : 'history'}
          size={34}
          color={colors.textMuted}
        />
      </View>
      <Text style={{ ...typography.h4, color: colors.textPrimary, marginTop: 16 }}>
        {searching ? 'No matches' : 'No translations yet'}
      </Text>
      <Text
        style={{ ...typography.bodyMd, color: colors.textSecondary, textAlign: 'center', marginTop: 6 }}
      >
        {searching
          ? 'Try a different word or phrase.'
          : 'Your translations will appear here, saved privately on this device.'}
      </Text>
    </View>
  );
};
