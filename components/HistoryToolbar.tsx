import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  selecting: boolean;
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onToggleSelecting: () => void;
  onSelectAll: () => void;
  onDelete: () => void;
};

// Row above the History list. Resting: a right-aligned "Select" action. In
// selection mode: Cancel · Select all/Deselect · Delete (n).
export const HistoryToolbar = ({
  selecting, selectedCount, totalCount, allSelected,
  onToggleSelecting, onSelectAll, onDelete,
}: Props) => {
  const colors = useTheme();

  if (!selecting) {
    if (totalCount === 0) return null;
    return (
      <View className="flex-row justify-end py-1">
        <TouchableOpacity
          onPress={onToggleSelecting}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="flex-row items-center gap-1 px-2 py-1"
        >
          <MaterialIcons name="checklist" size={18} color={colors.accentBlue} />
          <Text style={{ ...typography.label, color: colors.accentBlue }}>SELECT</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-row items-center justify-between py-1">
      <TouchableOpacity
        onPress={onToggleSelecting}
        activeOpacity={0.7}
        accessibilityRole="button"
        className="px-2 py-1"
      >
        <Text style={{ ...typography.label, color: colors.textSecondary }}>CANCEL</Text>
      </TouchableOpacity>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          onPress={onSelectAll}
          activeOpacity={0.7}
          accessibilityRole="button"
          className="px-2 py-1"
        >
          <Text style={{ ...typography.label, color: colors.accentBlue }}>
            {allSelected ? 'DESELECT ALL' : 'SELECT ALL'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onDelete}
          disabled={selectedCount === 0}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${selectedCount} selected`}
          style={{
            backgroundColor: colors.warningRed,
            borderRadius: 99,
            opacity: selectedCount === 0 ? 0.4 : 1,
          }}
          className="flex-row items-center gap-1 px-3 py-1.5"
        >
          <MaterialIcons name="delete-outline" size={16} color="#ffffff" />
          <Text style={{ ...typography.label, color: '#ffffff' }}>
            {selectedCount > 0 ? `DELETE (${selectedCount})` : 'DELETE'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
