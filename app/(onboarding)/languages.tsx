import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguagePairPreview } from '@/components/LanguagePairPreview';
import { LanguagePickerCard } from '@/components/LanguagePickerCard';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { LanguageSwapButton } from '@/components/LanguageSwapButton';
import { OnboardingFooter } from '@/components/OnboardingFooter';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { useLanguageStore } from '@/store/useLanguageStore';

type OpenPicker = 'source' | 'target' | null;

export default function Languages() {
  const colors = useTheme();
  const { sourceLang, targetLang, setSourceLang, setTargetLang, swap } = useLanguageStore();
  const [open, setOpen] = useState<OpenPicker>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 24, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <OnboardingProgress current={1} />

        <View className="items-center mt-10 gap-3">
          <Text style={{ ...typography.h1, color: colors.textPrimary }} className="text-center">
            Which languages do you use?
          </Text>
          <Text
            style={{ ...typography.bodyLg, color: colors.textSecondary }}
            className="text-center"
          >
            You can change these anytime.
          </Text>
        </View>

        <View className="mt-10">
          <LanguagePickerCard
            label="I speak"
            icon="record-voice-over"
            value={sourceLang}
            onPress={() => setOpen('source')}
          />

          <View className="items-center" style={{ marginVertical: -18, zIndex: 10 }}>
            <LanguageSwapButton onPress={swap} />
          </View>

          <LanguagePickerCard
            label="I want to translate to"
            icon="translate"
            value={targetLang}
            onPress={() => setOpen('target')}
          />
        </View>

        <View className="mt-8">
          <LanguagePairPreview sourceCode={sourceLang} targetCode={targetLang} />
        </View>

        <View className="flex-1" />

        <View className="mt-8">
          <OnboardingFooter
            onBack={() => router.back()}
            onContinue={() => router.push('/(onboarding)/ready')}
          />
        </View>
      </ScrollView>

      <LanguagePickerModal
        visible={open === 'source'}
        title="I speak"
        selectedCode={sourceLang}
        disabledCode={targetLang}
        onSelect={setSourceLang}
        onClose={() => setOpen(null)}
      />
      <LanguagePickerModal
        visible={open === 'target'}
        title="I want to translate to"
        selectedCode={targetLang}
        disabledCode={sourceLang}
        onSelect={setTargetLang}
        onClose={() => setOpen(null)}
      />
    </SafeAreaView>
  );
}
