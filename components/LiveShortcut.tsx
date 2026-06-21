import { MaterialIcons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Small pill that jumps to the Phase 7 Live Conversation (peer-to-peer) screen.
// Surfaced on Meeting so users can reach the P2P flow without digging through
// Settings — the live route still lives outside the tab bar to stay isolated.
export const LiveShortcut = () => {
  const colors = useTheme();

  return (
    <TouchableOpacity
      // '/live' is a real route (app/live.tsx); typed-routes only regenerates
      // its union when Metro runs, so bridge the stale type with Href.
      onPress={() => router.push('/live' as Href)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Live Conversation"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 99,
        paddingHorizontal: 12,
        height: 36,
      }}
      className="flex-row items-center gap-1.5 self-start"
    >
      <MaterialIcons name="wifi-tethering" size={16} color={colors.accentBlue} />
      <Text style={{ ...typography.label, color: colors.accentBlue }}>LIVE P2P</Text>
    </TouchableOpacity>
  );
};
