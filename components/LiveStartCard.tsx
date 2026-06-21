import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { LivePairCard } from '@/components/LivePairCard';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type IconName = keyof typeof MaterialIcons.glyphMap;

type Props = {
  code: string;
  onChangeCode: (code: string) => void;
  onHost: () => void; // show a QR for the other phone to scan
  onScan: () => void; // open the camera to scan the other phone's QR
  onJoinCode: () => void; // join using the typed code (DHT fallback)
};

// Idle entry for Live Conversation. Pairing is QR/code over Hyperswarm: host a
// session to show a QR, scan the other phone's QR, or type a shared code. Each
// phone translates locally — only text crosses the wire.
export const LiveStartCard = ({ code, onChangeCode, onHost, onScan, onJoinCode }: Props) => {
  const colors = useTheme();

  const action = (icon: IconName, title: string, subtitle: string, onPress: () => void, primary: boolean) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        backgroundColor: primary ? colors.accentBlue : colors.bgCard,
        borderColor: colors.border,
        borderWidth: primary ? 0 : 1,
        borderRadius: 16,
      }}
      className="flex-row items-center gap-4 p-4"
    >
      <View
        style={{ width: 48, height: 48, borderRadius: 99, backgroundColor: primary ? 'rgba(255,255,255,0.18)' : colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons name={icon} size={24} color={primary ? '#ffffff' : colors.accentBlue} />
      </View>
      <View className="flex-1">
        <Text style={{ ...typography.h4, color: primary ? '#ffffff' : colors.textPrimary }}>{title}</Text>
        <Text style={{ ...typography.bodySm, color: primary ? 'rgba(255,255,255,0.8)' : colors.textSecondary }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="gap-3">
      <View className="items-center gap-2 px-4 mb-1">
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
          Connect directly to another phone — peer to peer, no internet. Each phone
          reads and hears in its own language.
        </Text>
      </View>

      {action('qr-code-2', 'Start with a code', 'Show a QR for the other phone to scan', onHost, true)}
      {action('qr-code-scanner', 'Scan a code', 'Point your camera at the other phone', onScan, false)}
      <LivePairCard code={code} onChangeCode={onChangeCode} onConnect={onJoinCode} />
    </View>
  );
};
