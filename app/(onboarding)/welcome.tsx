import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppLogoBadge } from '@/components/AppLogoBadge';
import { OnboardingFooter } from '@/components/OnboardingFooter';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { WelcomeFeatureList } from '@/components/WelcomeFeatureList';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

export default function Welcome() {
  const colors = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }}>
      <View className="flex-1 px-5 pt-6 pb-2 justify-between">
        {/* Brand + intro */}
        <View className="items-center mt-8 gap-2">
          <AppLogoBadge />
          <Text style={{ ...typography.h1, color: colors.textPrimary }} className="mt-4 text-center">
            BabelSpeak
          </Text>
          <Text style={{ ...typography.h3, color: colors.accentBlue }} className="text-center">
            {'The universal translator that\nworks offline'}
          </Text>
          <Text
            style={{ ...typography.bodyLg, color: colors.textSecondary }}
            className="text-center"
          >
            {'Speak, photograph, or record.\nTranslate anything, anywhere,\nwith no internet.'}
          </Text>
        </View>

        {/* Feature card */}
        <WelcomeFeatureList />

        {/* Progress + CTA */}
        <View className="gap-5">
          <OnboardingProgress current={0} variant="dots" />
          <OnboardingFooter
            onContinue={() => router.push('/(onboarding)/languages')}
            continueLabel="Get Started"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
