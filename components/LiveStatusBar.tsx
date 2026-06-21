import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { P2PState } from '@/lib/p2p';

type Props = {
  status: P2PState;
  peers: number;
  error: string | null;
  hosting?: boolean; // this device is hosting and waiting for a peer to scan
};

// Compact connection banner above the transcript: a colored dot + a monospace
// status line. Mirrors the "OFFLINE · ON DEVICE" treatment used elsewhere.
export const LiveStatusBar = ({ status, peers, error, hosting = false }: Props) => {
  const colors = useTheme();

  const dot =
    status === 'connected'
      ? colors.success
      : status === 'error'
        ? colors.warningRed
        : colors.warningAmber;

  const label =
    status === 'connected'
      ? `CONNECTED · ${peers} PEER${peers === 1 ? '' : 'S'} · ON DEVICE`
      : status === 'error'
        ? (error ?? 'CONNECTION FAILED').toUpperCase()
        : hosting
          ? 'HOSTING · WAITING FOR A PHONE TO JOIN'
          : status === 'connecting'
            ? 'CONNECTING · ACCEPT ON OTHER PHONE'
            : status === 'searching'
              ? 'SEARCHING FOR PEER · ON DEVICE'
              : 'NOT CONNECTED';

  return (
    <View
      style={{ backgroundColor: colors.bgCardInner, borderColor: colors.border, borderWidth: 1, borderRadius: 99 }}
      className="flex-row items-center justify-center gap-2 px-4 py-2"
    >
      <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: dot }} />
      <Text style={{ ...typography.caption, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
};
