import { type Href, router } from 'expo-router';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';

// LIVE section: entry point to the Phase 7 peer-to-peer conversation. Kept in
// Settings (not the four-tab bar) so the feature stays isolated — a P2P failure
// can never affect the core translation tabs.
export const SettingsLiveSection = () => (
  <SettingsSection title="Live">
    <SettingsRow
      icon="wifi-tethering"
      title="Live Conversation"
      subtitle="Talk to another phone, peer to peer · no internet"
      // '/live' is a real route (app/live.tsx); typed-routes only regenerates
      // its union when Metro runs, so bridge the stale type with Href.
      onPress={() => router.push('/live' as Href)}
    />
  </SettingsSection>
);
