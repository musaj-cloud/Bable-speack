import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/ActionBar';
import { CameraPreview } from '@/components/CameraPreview';
import { ConverseStatus } from '@/components/ConverseStatus';
import { HistoryShortcut } from '@/components/HistoryShortcut';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { useDocumentCamera } from '@/hooks/useDocumentCamera';
import { useTheme } from '@/hooks/useTheme';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useLanguageStore } from '@/store/useLanguageStore';

// Document: photograph a sign/menu, then read + translate it on the result
// sub-route. This tab owns the camera; OCR + translation happen on /document/result.
export default function Document() {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const process = useDocumentStore((s) => s.process);
  const { ref, permission, requestPermission, torch, toggleTorch, capture, pick } =
    useDocumentCamera();

  // Kick off the pipeline and hand off to the result screen, which shows the
  // image immediately and updates as OCR + translation complete.
  const scan = (uri: string) => {
    process(uri, sourceLang, targetLang);
    router.push('/document/result');
  };

  const onCapture = async () => {
    const uri = await capture();
    if (uri) scan(uri);
  };

  const onPick = async () => {
    const uri = await pick();
    if (uri) scan(uri);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 px-5 pt-2 pb-4">
        <View className="mb-2">
          <HistoryShortcut label="SAVED SCANS" filter="document" />
        </View>

        <LanguageBar middle="arrow" />

        <View className="mt-5">
          <ConverseStatus label="POINT AT TEXT · ON DEVICE" />
        </View>

        <View className="flex-1 mt-4 mb-6">
          <CameraPreview
            camRef={ref}
            torch={torch}
            permission={permission}
            onRequestPermission={requestPermission}
          />
        </View>

        <ActionBar
          left={{ icon: 'photo-library', label: 'Choose from gallery', onPress: onPick }}
          center={{ icon: 'camera', label: 'Capture document', onPress: onCapture }}
          right={{
            icon: torch ? 'flash-on' : 'flash-off',
            label: 'Toggle flash',
            onPress: toggleTorch,
          }}
        />
      </View>
    </SafeAreaView>
  );
}
