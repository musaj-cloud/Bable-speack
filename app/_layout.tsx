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

export default function RootLayout() {
  // Free on-device model memory whenever the app is backgrounded.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') {
        unloadAllModels();
        unloadTranscriptionModels();
        unloadTtsModels();
        unloadOcrModels();
        unloadSummarizationModel();
        disconnectP2P(); // leave any P2P swarm (worklet stays warm for resume)
      }
    });
    return () => sub.remove();
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
