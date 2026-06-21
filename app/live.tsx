import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageBar } from '@/components/LanguageBar';
import { LiveHostCard } from '@/components/LiveHostCard';
import { LiveStartCard } from '@/components/LiveStartCard';
import { LiveStatusBar } from '@/components/LiveStatusBar';
import { LiveTalkBar } from '@/components/LiveTalkBar';
import { LiveTranscript } from '@/components/LiveTranscript';
import { LiveUnavailable } from '@/components/LiveUnavailable';
import { QRScanner } from '@/components/QRScanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useP2PSession } from '@/hooks/useP2PSession';
import { useTheme } from '@/hooks/useTheme';
import { encodePairing, parsePairing } from '@/lib/pairing';
import { useP2PStore } from '@/store/useP2PStore';

// Phase 7 — Live Conversation (two phones, 1:1). Pairing is QR/code over
// Hyperswarm: one phone shows a QR, the other scans it (or types the code), and
// they meet on the same DHT topic over the shared LAN/hotspot. Each phone
// translates locally — only text crosses the wire, never audio.
export default function Live() {
  const colors = useTheme();
  const { available, talking, host, join, connect, disconnect, toggleTalk } = useP2PSession();
  const status = useP2PStore((s) => s.status);
  const peers = useP2PStore((s) => s.peers);
  const error = useP2PStore((s) => s.error);
  const turns = useP2PStore((s) => s.turns);
  const pairInfo = useP2PStore((s) => s.pairInfo);
  const connectedOnce = useP2PStore((s) => s.connectedOnce);
  const [code, setCode] = useState('');
  const [scanning, setScanning] = useState(false);

  // Header back: end any session and exit the Live screen entirely.
  const leave = useCallback(() => {
    disconnect();
    setScanning(false);
    router.back();
  }, [disconnect]);

  // In-session button: disconnect but stay on the Live screen (back to start),
  // so the user can hang up anytime and immediately host/scan again.
  const hangUp = useCallback(() => {
    disconnect();
    setScanning(false);
  }, [disconnect]);

  // A QR was scanned: pair directly if it's one of ours, otherwise ignore it.
  const onScanned = useCallback(
    (data: string) => {
      setScanning(false);
      const pairing = parsePairing(data);
      if (pairing) join(pairing);
    },
    [join]
  );

  const idle = status === 'idle';
  // Host shows the QR only until the first peer connects; once connected (latched)
  // it moves to the conversation page and stays there through any peer-count blip.
  const hosting = !!pairInfo && !connectedOnce; // host waiting for a peer to scan

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <ScreenHeader title="Live Conversation" onBack={leave} />

      {!available ? (
        <LiveUnavailable />
      ) : scanning ? (
        <QRScanner onScanned={onScanned} onCancel={() => setScanning(false)} />
      ) : (
        <View className="flex-1 px-5 pt-2 pb-4">
          <LanguageBar middle="swap" />

          {idle ? (
            <View className="flex-1 justify-center">
              <LiveStartCard
                code={code}
                onChangeCode={setCode}
                onHost={() => host(code)}
                onScan={() => setScanning(true)}
                onJoinCode={() => connect(code)}
              />
            </View>
          ) : (
            <>
              <View className="mt-4">
                <LiveStatusBar status={status} peers={peers} error={error} hosting={hosting} />
              </View>

              {hosting && pairInfo ? (
                <LiveHostCard qr={encodePairing(pairInfo)} code={pairInfo.code} />
              ) : (
                <LiveTranscript turns={turns} />
              )}

              <LiveTalkBar
                talking={talking}
                connected={status === 'connected'}
                onToggle={toggleTalk}
                onLeave={hangUp}
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
