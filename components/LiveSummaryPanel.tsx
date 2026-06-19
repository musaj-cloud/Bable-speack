import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { SaveToHistoryButton } from '@/components/SaveToHistoryButton';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  summary: string[];
  onExport?: () => void;
  canSave?: boolean; // true once a finished session can be saved to history
  saved?: boolean;
  onSave?: () => void;
};

// Bottom panel: the on-device AI summary bullets, an Export action, and the
// save-to-history control. Shown once a session has finished.
export const LiveSummaryPanel = ({ summary, onExport, canSave, saved, onSave }: Props) => {
  const colors = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 28,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
      className="gap-3 p-5"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="auto-awesome" size={20} color={colors.textPrimary} />
          <Text style={{ ...typography.h4, color: colors.textPrimary }}>Live Summary</Text>
        </View>
        {onExport && (
          <TouchableOpacity
            onPress={onExport}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Export summary"
            style={{ backgroundColor: colors.bgCardInner, borderRadius: 99 }}
            className="flex-row items-center gap-1 px-3 py-1.5"
          >
            <Text style={{ ...typography.label, color: colors.accentBlue }}>Export</Text>
            <MaterialIcons name="ios-share" size={14} color={colors.accentBlue} />
          </TouchableOpacity>
        )}
      </View>

      <View className="gap-2">
        {summary.length === 0 ? (
          <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
            No summary available for this session.
          </Text>
        ) : (
          summary.map((item, i) => (
            <View key={i} className="flex-row gap-2">
              <Text style={{ ...typography.bodySm, color: colors.accentBlue }}>•</Text>
              <Text style={{ ...typography.bodySm, color: colors.textSecondary, flex: 1 }}>{item}</Text>
            </View>
          ))
        )}
      </View>

      {canSave && onSave && <SaveToHistoryButton saved={!!saved} onSave={onSave} />}
    </View>
  );
};
