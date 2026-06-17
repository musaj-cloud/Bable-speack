import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';
import { useOnboardingStore } from '@/store/useOnboardingStore';

// Bottom tab navigation: Converse · Document · Meeting · History · Settings.
// Gated behind onboarding — first-run users are sent to the welcome flow.
export default function TabsLayout() {
  const completed = useOnboardingStore((s) => s.completed);
  const homeSeen = useOnboardingStore((s) => s.homeSeen);
  const hydrated = useOnboardingStore((s) => s.hydrated);

  if (!hydrated) return null;
  if (!completed) return <Redirect href="/(onboarding)/welcome" />;
  if (!homeSeen) return <Redirect href="/home" />;

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="document" />
      <Tabs.Screen name="meeting" />
      <Tabs.Screen name="history" />
      {/* Settings is reached from the header gear, not the bottom bar (4 tabs). */}
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
