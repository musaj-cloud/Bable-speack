import { ScrollView, Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { Mode } from '@/types/translation';

export type HistoryFilter = 'all' | Mode;

const CHIPS: { key: HistoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'converse', label: 'Converse' },
  { key: 'document', label: 'Document' },
  { key: 'meeting', label: 'Meeting' },
];

type Props = { value: HistoryFilter; onChange: (value: HistoryFilter) => void };

// Mode filter chips above the History list: All · Converse · Document · Meeting.
export const HistoryFilterChips = ({ value, onChange }: Props) => {
  const colors = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 8 }}
    >
      {CHIPS.map((chip) => {
        const active = chip.key === value;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => onChange(chip.key)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              backgroundColor: active ? colors.accentBlue : colors.bgCard,
              borderColor: active ? colors.accentBlue : colors.border,
              borderWidth: 1,
              borderRadius: 99,
              paddingHorizontal: 16,
              height: 36,
            }}
            className="items-center justify-center"
          >
            <Text
              style={{
                ...typography.label,
                color: active ? '#ffffff' : colors.textSecondary,
              }}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};
