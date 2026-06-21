import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { unloadOcrModels } from '@/lib/ocr';
import { disconnectP2P } from '@/lib/p2p';
import { unloadAllModels } from '@/lib/qvac';
import { unloadSummarizationModel } from '@/lib/summarize';
import { unloadTranscriptionModels } from '@/lib/transcription';
import { unloadTtsModels } from '@/lib/tts';

// How long the app must stay backgrounded before we free model memory. The
// mic/camera permission dialog backgrounds us for under a second; this delay
// keeps models loaded across that round-trip (see the crash note below).
const UNLOAD_DELAY_MS = 20000;

export default function RootLayout() {
  // Free on-device model memory when the app is GENUINELY backgrounded — but not
  // for the brief background the mic/camera permission dialog causes.
  //
  // Unloading on that transient background tears down QVAC's RPC connection
  // ("no models active → closing"). The very next model use re-initializes the
  // QVAC logger, whose releaseJsRefs frees JS references from the destroyed
  // session and segfaults (SIGSEGV in libqvac__llm-llamacpp / libbare-kit on the
  // mqt_v_js thread). Debouncing the unload — and cancelling it the instant we
  // return to the foreground — keeps models warm across the permission round-trip
  // so QVAC is never torn down and re-initialized mid-flow.
  useEffect(() => {
    let unloadTimer: ReturnType<typeof setTimeout> | null = null;
    const cancelPending = () => {
      if (unloadTimer) clearTimeout(unloadTimer);
      unloadTimer = null;
    };
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        cancelPending();
        unloadTimer = setTimeout(() => {
          unloadTimer = null;
          unloadAllModels();
          unloadTranscriptionModels();
          unloadTtsModels();
          unloadOcrModels();
          unloadSummarizationModel();
          disconnectP2P(); // leave any P2P swarm (worklet stays warm for resume)
        }, UNLOAD_DELAY_MS);
      } else if (state === 'active') {
        cancelPending(); // returned quickly (e.g. permission dialog) — keep models warm
      }
    });
    return () => {
      cancelPending();
      sub.remove();
    };
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
