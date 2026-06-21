import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { PulseRings } from '@/components/PulseRings';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  recording: boolean;
  onPress: () => void;
};

const SIZE = 88;

// Single tap-to-record control for Meeting: blue mic when idle, red (with sound
// rings) while recording. One tap starts the recording, another stops it.
export const MeetingRecordButton = ({ recording, onPress }: Props) => {
  const colors = useTheme();
  const tint = recording ? colors.warningRed : colors.accentBlue;

  return (
    <View className="items-center gap-2">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={recording ? 'Stop recording' : 'Start recording'}
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: tint,
          shadowColor: tint,
          shadowOpacity: 0.4,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
        className="items-center justify-center"
      >
        {recording && <PulseRings size={SIZE} color={colors.warningRed} />}
        <MaterialIcons name={recording ? 'stop' : 'mic'} size={36} color="#ffffff" />
      </Pressable>

      <Text style={{ ...typography.label, color: colors.textSecondary }}>
        {recording ? 'TAP TO STOP' : 'TAP TO RECORD'}
      </Text>
    </View>
  );
};
