import { MaterialIcons } from '@expo/vector-icons';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  code: string;
  onChangeCode: (code: string) => void;
  onConnect: () => void;
};

// Idle pairing card: both phones type the SAME short code to meet on the DHT.
// The code seeds the swarm topic — no account, no server, no QR needed.
export const LivePairCard = ({ code, onChangeCode, onConnect }: Props) => {
  const colors = useTheme();
  const ready = code.trim().length >= 3;

  return (
    <View className="gap-5">
      <View className="items-center gap-3 px-4">
        <View
          style={{ width: 64, height: 64, borderRadius: 99, backgroundColor: colors.iconChipLavender }}
          className="items-center justify-center"
        >
          <MaterialIcons name="wifi-tethering" size={30} color={colors.iconChipLavenderText} />
        </View>
        <Text style={{ ...typography.h3, color: colors.textPrimary }} className="text-center">
          Talk across phones
        </Text>
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
          Both phones enter the same code to connect directly — peer to peer, no
          internet needed. Each phone reads and hears in its own language.
        </Text>
      </View>

      <View className="gap-2">
        <Text style={{ ...typography.label, color: colors.textMuted }}>SHARED CODE</Text>
        <TextInput
          value={code}
          onChangeText={onChangeCode}
          placeholder="e.g. paris-2026"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            ...typography.bodyLg,
            color: colors.textPrimary,
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 16,
            height: 56,
          }}
        />
      </View>

      <TouchableOpacity
        onPress={onConnect}
        disabled={!ready}
        activeOpacity={0.85}
        style={{ backgroundColor: ready ? colors.accentBlue : colors.bgCardInner, borderRadius: 14, opacity: ready ? 1 : 0.7 }}
        className="h-14 items-center justify-center"
      >
        <Text style={{ ...typography.label, color: ready ? '#ffffff' : colors.textMuted }}>
          CONNECT
        </Text>
      </TouchableOpacity>
    </View>
  );
};
