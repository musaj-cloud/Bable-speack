import { Href, router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '@/components/HomeHeader';
import { ModeCard } from '@/components/ModeCard';
import { QuickActionCard } from '@/components/QuickActionCard';
import { TabBarView } from '@/components/TabBarView';
import { typography } from '@/constants/typography';
import { MODE_CARDS } from '@/data/modeCards';
import { useTheme } from '@/hooks/useTheme';
import { useOnboardingStore } from '@/store/useOnboardingStore';

// Bottom-bar destinations, in tab order (Converse is shown active on the hub).
// Settings lives in the header gear, not the bottom bar, so 4 tabs remain.
const TAB_ROUTES: { name: string; route: Href }[] = [
  { name: 'index', route: '/(tabs)' },
  { name: 'document', route: '/(tabs)/document' },
  { name: 'meeting', route: '/(tabs)/meeting' },
  { name: 'history', route: '/(tabs)/history' },
];

// One-time "Explore freely" hub. Shown only on first login to give quick access
// to every translation mode; once the user picks one it is never shown again.
export default function Home() {
  const colors = useTheme();
  const setHomeSeen = useOnboardingStore((s) => s.setHomeSeen);

  // Mark the hub as seen and open the chosen destination.
  const go = (route: Href) => {
    setHomeSeen(true);
    router.replace(route);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-2">
          <Text style={{ ...typography.h1, color: colors.textPrimary }}>Explore freely.</Text>
          <Text style={{ ...typography.bodyLg, color: colors.textSecondary }}>
            Choose a translation mode to bridge the gap and connect with the world around you.
          </Text>
        </View>

        {MODE_CARDS.map((card) => (
          <ModeCard key={card.mode} card={card} onPress={() => go(card.route)} />
        ))}

        <QuickActionCard
          icon="download"
          title="Offline Languages"
          subtitle="Download language packs for use without internet."
          highlighted
          onPress={() => go('/(tabs)/settings')}
        />
        <QuickActionCard
          icon="star-border"
          title="Saved Phrases"
          subtitle="Access your commonly used translations quickly."
          onPress={() => go('/(tabs)/history')}
        />
      </ScrollView>

      <TabBarView
        items={TAB_ROUTES.map((t) => ({
          key: t.name,
          name: t.name,
          focused: t.name === 'index',
          onPress: () => go(t.route),
        }))}
      />
    </SafeAreaView>
  );
}
