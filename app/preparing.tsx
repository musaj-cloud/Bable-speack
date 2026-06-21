import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PreparingModels } from '@/components/PreparingModels';
import { useTheme } from '@/hooks/useTheme';
import { prepareConverseModels, type WarmupStep } from '@/lib/warmup';
import { useLanguageStore } from '@/store/useLanguageStore';

type Progress = { step: WarmupStep | 'done'; percentage: number };

// Shown once, right after onboarding: preloads the on-device models for the
// chosen language pair (download happens here so the first real use is instant
// and never races a mid-use download). Then hands off to the app. Returning
// users skip this entirely — they go straight to the tabs.
export default function Preparing() {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const [progress, setProgress] = useState<Progress>({ step: 'speech', percentage: 0 });
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // run the warmup exactly once
    started.current = true;
    let cancelled = false;
    void (async () => {
      await prepareConverseModels(sourceLang, targetLang, (p) => {
        if (!cancelled) setProgress(p);
      });
      if (!cancelled) router.replace('/(tabs)');
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceLang, targetLang]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <PreparingModels
        step={progress.step}
        percentage={progress.percentage}
        onSkip={() => router.replace('/(tabs)')}
      />
    </SafeAreaView>
  );
}
