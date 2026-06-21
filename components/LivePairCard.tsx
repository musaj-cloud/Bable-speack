import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  code: string;
  onChangeCode: (code: string) => void;
  onConnect: () => void;
};

// Compact "enter a code instead" fallback for pairing, shown under the scan/host
// actions on the Live start screen. Typing a code (no scan) connects via the
// public DHT, so it needs the internet reachable once — scanning a QR is the
// fully-offline path. Both phones must use the same code.
export const LivePairCard = ({ code, onChangeCode, onConnect }: Props) => {
  const colors = useTheme();
  const ready = code.trim().length >= 3;

  return (
    <View className="gap-2 mt-1">
      <Text style={{ ...typography.label, color: colors.textMuted }}>OR ENTER A CODE</Text>
      <View className="flex-row items-center gap-2">
        <TextInput
          value={code}
          onChangeText={onChangeCode}
          placeholder="e.g. paris-2026"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            ...typography.bodyLg,
            flex: 1,
            color: colors.textPrimary,
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 16,
            height: 52,
          }}
        />
        <TouchableOpacity
          onPress={onConnect}
          disabled={!ready}
          activeOpacity={0.85}
          style={{
            backgroundColor: ready ? colors.accentBlue : colors.bgCardInner,
            borderRadius: 14,
            opacity: ready ? 1 : 0.7,
            height: 52,
            paddingHorizontal: 20,
          }}
          className="items-center justify-center"
        >
          <Text style={{ ...typography.label, color: ready ? '#ffffff' : colors.textMuted }}>JOIN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
