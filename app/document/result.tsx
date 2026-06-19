import { router } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DocumentResult } from '@/components/DocumentResult';
import { ScreenHeader } from '@/components/ScreenHeader';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { useDocumentStore } from '@/store/useDocumentStore';
import { useLanguageStore } from '@/store/useLanguageStore';

// Document result sub-route: captured image, the text OCR read from it, and its
// translation. Reads the current scan from useDocumentStore (no route params).
export default function DocumentResultScreen() {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const { imageUri, sourceText, translatedText, status, error, reset, speak } =
    useDocumentStore();

  // Retake clears the scan and returns to the camera tab.
  const onNewScan = () => {
    reset();
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <ScreenHeader title="Document" onBack={() => router.back()} />

      <View className="flex-1 px-5 pt-2 pb-5">
        {imageUri ? (
          <DocumentResult
            imageUri={imageUri}
            sourceLangName={getLanguageName(sourceLang)}
            targetLangName={getLanguageName(targetLang)}
            targetLang={targetLang}
            sourceText={sourceText}
            translatedText={translatedText}
            status={status}
            error={error}
            onSpeak={() => speak(targetLang)}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text style={{ ...typography.bodyMd, color: colors.textMuted }}>
              No document scanned yet.
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onNewScan}
          activeOpacity={0.85}
          style={{ backgroundColor: colors.accentBlue, borderRadius: 14 }}
          className="mt-4 h-14 items-center justify-center"
        >
          <Text style={{ ...typography.label, color: '#ffffff' }}>SCAN ANOTHER</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
