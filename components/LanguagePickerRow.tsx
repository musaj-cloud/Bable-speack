import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  name: string;
  canSpeak: boolean;
  selected: boolean;
  disabled: boolean;
  loading: boolean;
  pct: number;
  // Show the "needs internet" hint — language isn't downloaded yet.
  needsInternet: boolean;
  onPress: () => void;
};

// One language row in the picker sheet: name (+ speaker icon), a "needs internet"
// hint when not downloaded, and a right-side state (download %, or selected check).
export const LanguagePickerRow = ({
  name,
  canSpeak,
  selected,
  disabled,
  loading,
  pct,
  needsInternet,
  onPress,
}: Props) => {
  const colors = useTheme();
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      style={{ minHeight: 52, opacity: disabled ? 0.35 : 1 }}
      className="flex-row items-center justify-between px-2"
    >
      <View className="flex-row items-center gap-2 flex-1">
        <Text style={{ ...typography.bodyLg, color: selected ? colors.accentBlue : colors.textPrimary }}>
          {name}
        </Text>
        {canSpeak && <MaterialIcons name="volume-up" size={16} color={colors.textMuted} />}
        {!loading && !selected && needsInternet && (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="cloud-download" size={13} color={colors.warningAmber} />
            <Text style={{ ...typography.caption, color: colors.warningAmber }}>NEEDS INTERNET</Text>
          </View>
        )}
      </View>
      {loading ? (
        <View className="flex-row items-center gap-2">
          {/* No percentage for an already-downloaded language — it's just a quick
              offline load from disk, not a download. */}
          {pct > 0 && <Text style={{ ...typography.mono, color: colors.accentBlue }}>{pct}%</Text>}
          <ActivityIndicator size="small" color={colors.accentBlue} />
        </View>
      ) : (
        selected && <MaterialIcons name="check" size={22} color={colors.accentBlue} />
      )}
    </TouchableOpacity>
  );
};
