import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const BAR_COUNT = 40;

// Static recording waveform — tapered bars in the brand blue (alternating accent).
export const MeetingWaveform = () => {
  const colors = useTheme();

  return (
    <View className="h-12 flex-row items-center justify-center" style={{ gap: 3 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        // Taper heights towards the edges, vary by index for an organic look.
        const distance = Math.abs(BAR_COUNT / 2 - i) / (BAR_COUNT / 2);
        const height = Math.max(4, 30 * (1 - distance * 0.7) * (0.45 + ((i * 7) % 6) / 10));
        return (
          <View
            key={i}
            style={{
              width: 4,
              height,
              borderRadius: 2,
              opacity: 0.6,
              backgroundColor: i % 2 ? colors.accentLight : colors.accentBlue,
            }}
          />
        );
      })}
    </View>
  );
};
