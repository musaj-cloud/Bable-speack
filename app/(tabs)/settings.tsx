import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '@/components/HomeHeader';
import { SettingsAboutCard } from '@/components/SettingsAboutCard';
import { SettingsAppearanceSection } from '@/components/SettingsAppearanceSection';
import { SettingsAudioSection } from '@/components/SettingsAudioSection';
import { SettingsDataSection } from '@/components/SettingsDataSection';
import { SettingsLanguageSection } from '@/components/SettingsLanguageSection';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Settings: manage default languages, audio, theme, on-device data, and about.
export default function Settings() {
  const colors = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6">
          <Text style={{ ...typography.h2, color: colors.textPrimary }} className="mb-1">
            Settings
          </Text>
          <Text style={{ ...typography.bodyMd, fontSize: 16, color: colors.textSecondary }}>
            Manage your translation preferences and application data.
          </Text>
        </View>

        <View className="gap-5">
          <SettingsLanguageSection />
          <SettingsAudioSection />
          <SettingsAppearanceSection />
          <SettingsDataSection />
          <SettingsAboutCard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
