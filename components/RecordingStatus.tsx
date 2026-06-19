import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  duration: string;
  recording?: boolean;
};

// "● RECORDING SESSION" pill + large elapsed-time readout. When not recording
// (showing a finished session) the dot/label switch to a neutral length label.
export const RecordingStatus = ({ duration, recording = true }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-row items-center justify-center gap-3 pt-1">
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: 99,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }}
        className="flex-row items-center gap-2 px-3 py-1.5"
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: recording ? colors.warningRed : colors.textMuted,
          }}
        />
        <Text style={{ ...typography.label, color: colors.textSecondary }}>
          {recording ? 'RECORDING SESSION' : 'SESSION LENGTH'}
        </Text>
      </View>

      <Text
        style={{
          fontFamily: 'Georgia',
          fontSize: 24,
          fontWeight: '400',
          lineHeight: 28,
          color: colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}
      >
        {duration}
      </Text>
    </View>
  );
};
