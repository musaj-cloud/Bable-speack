import { Text, View } from 'react-native';
import { HistoryEntryCard } from '@/components/HistoryEntryCard';
import { typography } from '@/constants/typography';
import type { HistoryGroup } from '@/hooks/useHistorySearch';
import { useTheme } from '@/hooks/useTheme';
import { TranslationEntry } from '@/types/translation';

type Props = {
  groups: HistoryGroup[];
  selecting: boolean;
  selectedIds: Set<string>;
  onPressEntry: (entry: TranslationEntry) => void;
  onLongPressEntry: (entry: TranslationEntry) => void;
};

// Day-grouped list of history rows. Each group has a label heading (Today /
// Yesterday / date, or an "N results" heading while searching).
export const HistoryList = ({
  groups, selecting, selectedIds, onPressEntry, onLongPressEntry,
}: Props) => {
  const colors = useTheme();

  return (
    <>
      {groups.map((group) => (
        <View key={group.label} className="mb-1">
          <Text
            style={{ ...typography.label, color: colors.textSecondary }}
            className="uppercase mt-4 mb-2"
          >
            {group.label}
          </Text>
          <View className="gap-3">
            {group.items.map((entry) => (
              <HistoryEntryCard
                key={entry.id}
                entry={entry}
                selecting={selecting}
                selected={selectedIds.has(entry.id)}
                onPress={onPressEntry}
                onLongPress={onLongPressEntry}
              />
            ))}
          </View>
        </View>
      ))}
    </>
  );
};
