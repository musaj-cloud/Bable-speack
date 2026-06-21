import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/ActionBar';
import { ConverseEmptyState } from '@/components/ConverseEmptyState';
import { ConverseNotice } from '@/components/ConverseNotice';
import { ConverseProcessing } from '@/components/ConverseProcessing';
import { ConverseStatus } from '@/components/ConverseStatus';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { TranslationCard } from '@/components/TranslationCard';
import { TypeToTranslateSheet } from '@/components/TypeToTranslateSheet';
import { getLanguageName } from '@/data/languages';
import { useConverseMic } from '@/hooks/useConverseMic';
import { useRetranslateOnLangChange } from '@/hooks/useRetranslateOnLangChange';
import { useSpeakState } from '@/hooks/useSpeakState';
import { useTheme } from '@/hooks/useTheme';
import { isTtsSupported } from '@/lib/tts';
import { ConverseStatus as Status, useConverseStore } from '@/store/useConverseStore';
import { useLanguageStore } from '@/store/useLanguageStore';

// Monospace status line under the language bar, per Converse status.
const STATUS_LABEL: Record<Status, string> = {
  idle: 'TYPE OR SPEAK · ON DEVICE',
  recording: 'LISTENING · ON DEVICE',
  transcribing: 'TRANSCRIBING · ON DEVICE',
  translating: 'TRANSLATING · ON DEVICE',
  ready: 'OFFLINE · ON DEVICE',
  error: 'TRANSLATION FAILED',
};

// Converse: real-time voice translation (default tab). Hold the mic to speak.
export default function Converse() {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const { sourceText, translatedText, status, error, setSourceText, runTranslation, speak, reset } =
    useConverseStore();
  const [typing, setTyping] = useState(false);

  // Tap-to-record: first tap records, second tap stops → transcribe → translate.
  const { onMicTap } = useConverseMic(sourceLang, targetLang);

  // Re-translate the current text when the user changes either language.
  useRetranslateOnLangChange(sourceLang, targetLang);
  const speakState = useSpeakState();

  const handleSubmit = (text: string) => {
    setTyping(false);
    setSourceText(text);
    runTranslation(sourceLang, targetLang);
  };

  const recording = status === 'recording';
  const transcribing = status === 'transcribing';
  const targetText = status === 'error' ? (error ?? 'Something went wrong') : translatedText;
  const showTarget = status === 'translating' || status === 'ready' || status === 'error';
  const ttsOk = isTtsSupported(targetLang);

  const handleSpeak = () => {
    if (ttsOk) return speak(targetLang);
    Alert.alert(
      'No offline voice yet',
      `${getLanguageName(targetLang)} can be translated on device, but doesn't have an offline voice for read-aloud. The translation is shown above.`,
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 px-5 pt-2 pb-4">
        <LanguageBar middle="swap" />

        <View className="mt-5">
          <ConverseStatus label={STATUS_LABEL[status]} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: 16, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {status === 'error' && !sourceText ? (
            <ConverseNotice
              message={error ?? 'Something went wrong. Tap the mic to try again.'}
              onRetry={() => {
                reset();
                onMicTap();
              }}
            />
          ) : (recording || transcribing) && !sourceText ? (
            <ConverseProcessing
              icon="mic"
              label={transcribing ? 'Transcribing…' : 'Listening…'}
              listening={recording}
            />
          ) : sourceText ? (
            <>
              <TranslationCard
                variant="source"
                langName={getLanguageName(sourceLang)}
                text={sourceText}
              />
              {showTarget && (
                <TranslationCard
                  variant="target"
                  langName={getLanguageName(targetLang)}
                  text={status === 'translating' ? 'Translating…' : targetText}
                  onSpeak={handleSpeak}
                  speakAvailable={ttsOk}
                  speaking={speakState === 'speaking'}
                  speakLoading={speakState === 'loading'}
                  speakPaused={speakState === 'paused'}
                />
              )}
            </>
          ) : (
            <ConverseEmptyState onType={() => setTyping(true)} />
          )}
        </ScrollView>

        <ActionBar
          left={{ icon: 'keyboard', label: 'Type instead', onPress: () => setTyping(true) }}
          center={{
            icon: 'mic',
            label: recording ? 'Tap to stop' : 'Tap to record',
            active: recording,
            onPress: onMicTap,
          }}
          right={{ icon: 'photo-camera', label: 'Use camera', onPress: () => router.push('/document') }}
        />
      </View>

      <TypeToTranslateSheet
        visible={typing}
        sourceLangName={getLanguageName(sourceLang)}
        onClose={() => setTyping(false)}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}
