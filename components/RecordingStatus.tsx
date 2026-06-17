import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  duration: string;
};

// "● RECORDING SESSION" pill + large elapsed-time readout.
export const RecordingStatus = ({ duration }: Props) => {
  const colors = useTheme();

  return (
    <View className="items-center pt-2">
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
          style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.warningRed }}
        />
        <Text style={{ ...typography.label, color: colors.textSecondary }}>RECORDING SESSION</Text>
      </View>

      <Text
        style={{
          fontFamily: 'Georgia',
          fontSize: 48,
          fontWeight: '300',
          lineHeight: 56,
          color: colors.textPrimary,
          fontVariant: ['tabular-nums'],
        }}
        className="mt-3"
      >
        {duration}
      </Text>
    </View>
  );
};
