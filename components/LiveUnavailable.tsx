import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

// Shown when the P2P worklet bundle has not been built yet (bare/p2p.bundle.js
// is still the null placeholder). Phase 7 ships its worklet separately, so this
// is the expected state until `npm run build:p2p` + a fresh dev build are run —
// the rest of the app is unaffected.
export const LiveUnavailable = () => {
  const colors = useTheme();

  return (
    <View className="flex-1 items-center justify-center px-8 gap-4">
      <View
        style={{ width: 72, height: 72, borderRadius: 99, backgroundColor: colors.bgCardInner }}
        className="items-center justify-center"
      >
        <MaterialIcons name="wifi-tethering-off" size={34} color={colors.textMuted} />
      </View>
      <Text style={{ ...typography.h3, color: colors.textPrimary }} className="text-center">
        Live Conversation isn’t built yet
      </Text>
      <Text style={{ ...typography.bodyMd, color: colors.textSecondary }} className="text-center">
        This peer-to-peer feature ships as a separate on-device worklet. Run{' '}
        <Text style={{ ...typography.mono, color: colors.accentBlue }}>npm run build:p2p</Text> and
        rebuild the dev client to enable it. The rest of BabelSpeak works without it.
      </Text>
    </View>
  );
};
