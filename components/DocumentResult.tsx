import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, View } from 'react-native';
import { ImagePreviewModal } from '@/components/ImagePreviewModal';
import { ReadAloudButton } from '@/components/ReadAloudButton';
import { ScanOverlay } from '@/components/ScanOverlay';
import { TranslationCard } from '@/components/TranslationCard';
import { useSpeakState } from '@/hooks/useSpeakState';
import { useTheme } from '@/hooks/useTheme';
import { isTtsSupported } from '@/lib/tts';
import type { DocumentStatus } from '@/store/useDocumentStore';

type Props = {
  imageUri: string;
  sourceLangName: string;
  targetLangName: string;
  targetLang: string;
  sourceText: string;
  translatedText: string;
  status: DocumentStatus;
  error: string | null;
  onSpeak: () => Promise<void> | void;
};

// Captured photo followed by the extracted text and its translation. Shown once
// a photo has been taken/picked; scrolls when the document text is long.
export const DocumentResult = ({
  imageUri, sourceLangName, targetLangName, targetLang,
  sourceText, translatedText, status, error, onSpeak,
}: Props) => {
  const colors = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);
  const speakState = useSpeakState();
  const speaking = speakState === 'speaking';
  const loading = speakState === 'loading';
  const paused = speakState === 'paused';

  const sourceBody =
    status === 'reading' ? 'Reading text…' : sourceText || '—';
  const targetBody =
    status === 'error' ? (error ?? 'Something went wrong')
      : status === 'translating' ? 'Translating…'
      : translatedText;

  // Sweep the scan line while text is being read off the image and translated.
  const scanning = status === 'reading' || status === 'translating';
  const canSpeak = isTtsSupported(targetLang);

  // Speak the translation, or explain when this language has no offline voice.
  // If synthesis fails, surface it instead of leaving the spinner hanging.
  const handleSpeak = async () => {
    if (!canSpeak) {
      Alert.alert(
        'No offline voice yet',
        `${targetLangName} can be translated on device, but doesn't have an offline voice for read-aloud. The translation is shown above.`,
      );
      return;
    }
    try {
      await onSpeak();
    } catch {
      Alert.alert(
        'Could not read aloud',
        'The offline voice could not generate audio for this text. Please try again.',
      );
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 16, paddingBottom: 8 }}
    >
      <Pressable
        onPress={() => setPreviewOpen(true)}
        disabled={scanning}
        accessibilityRole="imagebutton"
        accessibilityLabel="Tap to view full image"
        style={{ width: '100%', height: 180 }}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: 180, borderRadius: 20, backgroundColor: colors.bgCardInner }}
          resizeMode="cover"
        />
        <ScanOverlay active={scanning} />
      </Pressable>

      <ImagePreviewModal
        uri={imageUri}
        visible={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      <TranslationCard variant="source" langName={sourceLangName} text={sourceBody} />

      {(translatedText || status === 'translating' || status === 'error') && (
        <TranslationCard
          variant="target"
          langName={targetLangName}
          text={targetBody}
          onSpeak={handleSpeak}
          speakAvailable={canSpeak}
          speaking={speaking}
          speakLoading={loading}
          speakPaused={paused}
        />
      )}

      {status === 'ready' && !!translatedText && (
        <ReadAloudButton
          available={canSpeak}
          onPress={handleSpeak}
          loading={loading}
          speaking={speaking}
          paused={paused}
        />
      )}
    </ScrollView>
  );
};
