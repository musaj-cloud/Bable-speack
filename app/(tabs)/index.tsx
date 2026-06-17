import { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionBar } from '@/components/ActionBar';
import { ConverseEmptyState } from '@/components/ConverseEmptyState';
import { ConverseStatus } from '@/components/ConverseStatus';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { TranslationCard } from '@/components/TranslationCard';
import { TypeToTranslateSheet } from '@/components/TypeToTranslateSheet';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { ConverseStatus as Status, useConverseStore } from '@/store/useConverseStore';
import { useLanguageStore } from '@/store/useLanguageStore';

// Monospace status line under the language bar, per Converse status.
const STATUS_LABEL: Record<Status, string> = {
  idle: 'TYPE OR SPEAK · ON DEVICE',
  translating: 'TRANSLATING · ON DEVICE',
  ready: 'OFFLINE · ON DEVICE',
  error: 'TRANSLATION FAILED',
};

// Converse: real-time voice translation (default tab). Phase 1 = typed input.
export default function Converse() {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const { sourceText, translatedText, status, error, setSourceText, runTranslation } =
    useConverseStore();
  const [typing, setTyping] = useState(false);

  const handleSubmit = (text: string) => {
    setTyping(false);
    setSourceText(text);
    runTranslation(sourceLang, targetLang);
  };

  const targetText =
    status === 'translating'
      ? 'Translating…'
      : status === 'error'
        ? (error ?? 'Something went wrong')
        : translatedText;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 px-5 pt-2 pb-4">
        <LanguageBar middle="swap" />

        <View className="mt-5">
          <ConverseStatus label={STATUS_LABEL[status]} />
        </View>

        <View className="flex-1 justify-center gap-4">
          {sourceText ? (
            <>
              <TranslationCard
                variant="source"
                langName={getLanguageName(sourceLang)}
                text={sourceText}
              />
              <TranslationCard
                variant="target"
                langName={getLanguageName(targetLang)}
                text={targetText}
                onSpeak={() => {}}
              />
            </>
          ) : (
            <ConverseEmptyState onType={() => setTyping(true)} />
          )}
        </View>

        <ActionBar
          left={{ icon: 'keyboard', label: 'Type instead', onPress: () => setTyping(true) }}
          center={{ icon: 'mic', label: 'Hold to speak', onPress: () => setTyping(true) }}
          right={{ icon: 'photo-camera', label: 'Use camera', onPress: () => {} }}
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
