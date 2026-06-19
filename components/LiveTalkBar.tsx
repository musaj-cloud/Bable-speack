import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  talking: boolean;
  connected: boolean;
  onToggle: () => void;
  onLeave: () => void;
};

// Bottom controls for an active session: leave on the left, a big tap-to-talk
// mic in the centre. Speaking is disabled until a peer is connected.
export const LiveTalkBar = ({ talking, connected, onToggle, onLeave }: Props) => {
  const colors = useTheme();
  const micBg = talking ? colors.warningRed : connected ? colors.accentBlue : colors.bgCardInner;

  return (
    <View className="flex-row items-center justify-between px-4">
      <TouchableOpacity
        onPress={onLeave}
        activeOpacity={0.85}
        className="items-center gap-1"
        style={{ width: 72 }}
      >
        <View
          style={{ width: 52, height: 52, borderRadius: 99, backgroundColor: colors.bgCardInner }}
          className="items-center justify-center"
        >
          <MaterialIcons name="call-end" size={24} color={colors.warningRed} />
        </View>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>LEAVE</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggle}
        disabled={!connected}
        activeOpacity={0.85}
        className="items-center gap-1.5"
      >
        <View
          style={{ width: 84, height: 84, borderRadius: 99, backgroundColor: micBg, opacity: connected ? 1 : 0.6 }}
          className="items-center justify-center"
        >
          <MaterialIcons name={talking ? 'stop' : 'mic'} size={36} color="#ffffff" />
        </View>
        <Text style={{ ...typography.caption, color: colors.textSecondary }}>
          {talking ? 'TAP TO STOP' : connected ? 'TAP TO SPEAK' : 'WAITING…'}
        </Text>
      </TouchableOpacity>

      {/* Spacer to keep the mic centred against the leave button. */}
      <View style={{ width: 72 }} />
    </View>
  );
};
