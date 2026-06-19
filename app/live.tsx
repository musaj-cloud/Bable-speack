import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguageBar } from '@/components/LanguageBar';
import { LivePairCard } from '@/components/LivePairCard';
import { LiveStatusBar } from '@/components/LiveStatusBar';
import { LiveTalkBar } from '@/components/LiveTalkBar';
import { LiveTranscript } from '@/components/LiveTranscript';
import { LiveUnavailable } from '@/components/LiveUnavailable';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useP2PSession } from '@/hooks/useP2PSession';
import { useTheme } from '@/hooks/useTheme';
import { useP2PStore } from '@/store/useP2PStore';

// Phase 7 — Live Conversation (P2P over Hyperswarm). Isolated sub-route reached
// from Settings, so a P2P failure never touches the four core tabs. Two phones
// enter the same code, then talk: each translates locally and only text crosses.
export default function Live() {
  const colors = useTheme();
  const { available, talking, connect, disconnect, toggleTalk } = useP2PSession();
  const status = useP2PStore((s) => s.status);
  const peers = useP2PStore((s) => s.peers);
  const error = useP2PStore((s) => s.error);
  const turns = useP2PStore((s) => s.turns);
  const [code, setCode] = useState('');

  const leave = useCallback(() => {
    disconnect();
    router.back();
  }, [disconnect]);

  const idle = status === 'idle';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <ScreenHeader title="Live Conversation" onBack={leave} />

      {!available ? (
        <LiveUnavailable />
      ) : (
        <View className="flex-1 px-5 pt-2 pb-4">
          <LanguageBar middle="swap" />

          {idle ? (
            <View className="flex-1 justify-center">
              <LivePairCard code={code} onChangeCode={setCode} onConnect={() => connect(code)} />
            </View>
          ) : (
            <>
              <View className="mt-4">
                <LiveStatusBar status={status} peers={peers} error={error} />
              </View>

              <LiveTranscript turns={turns} />

              <LiveTalkBar
                talking={talking}
                connected={status === 'connected'}
                onToggle={toggleTalk}
                onLeave={leave}
              />
            </>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}
