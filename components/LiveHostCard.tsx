import { Text, View } from 'react-native';
import { QRCodeView } from '@/components/QRCodeView';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  qr: string; // encoded pairing payload (see lib/pairing.ts)
  code: string; // human-readable code, shown as a type-it-in fallback
};

// Shown on the HOST phone while waiting for a peer: a QR for the other phone to
// scan, plus the code to type if scanning isn't possible. Pairing is fully
// offline — the host runs a local DHT bootstrap node on the LAN.
export const LiveHostCard = ({ qr, code }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-1 items-center justify-center gap-5 px-4">
      <Text style={{ ...typography.h3, color: colors.textPrimary }} className="text-center">
        Scan to connect
      </Text>

      <View style={{ backgroundColor: '#ffffff', borderRadius: 20, padding: 16 }}>
        <QRCodeView value={qr} size={220} />
      </View>

      <View className="items-center gap-1">
        <Text style={{ ...typography.label, color: colors.textMuted }}>OR ENTER CODE</Text>
        <Text style={{ ...typography.h3, color: colors.accentBlue }}>{code}</Text>
      </View>

      <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
        Point the other phone’s camera here. No internet needed — you’re connecting
        directly over the local network.
      </Text>
    </View>
  );
};
