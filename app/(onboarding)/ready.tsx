import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AutoPlayToggleCard } from '@/components/AutoPlayToggleCard';
import { OfflinePrivacyCard } from '@/components/OfflinePrivacyCard';
import { OnboardingFooter } from '@/components/OnboardingFooter';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { ReadyBadge } from '@/components/ReadyBadge';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/useOnboardingStore';

export default function Ready() {
  const colors = useTheme();
  const setCompleted = useOnboardingStore((s) => s.setCompleted);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <View className="flex-1 px-5 pt-6 pb-2">
        <OnboardingProgress current={2} />

        {/* Badge + heading */}
        <View className="items-center mt-10 gap-5">
          <ReadyBadge />
          <Text style={{ ...typography.h1, color: colors.textPrimary }} className="text-center">
            You are ready to go
          </Text>
        </View>

        {/* Cards */}
        <View className="flex-1 justify-center gap-4">
          <OfflinePrivacyCard />
          <AutoPlayToggleCard />
        </View>

        {/* CTA */}
        <OnboardingFooter
          layout="stacked"
          onBack={() => router.back()}
          onContinue={() => {
            setCompleted(true);
            router.replace('/(tabs)');
          }}
          continueLabel="Start Translating"
        />
      </View>
    </SafeAreaView>
  );
}
