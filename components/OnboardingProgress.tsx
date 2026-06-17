import { View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  current: number; // 0-based active step
  total?: number;
  variant?: 'bars' | 'dots';
};

// Step indicator. 'bars' = pill bars (languages/ready, top of screen).
// 'dots' = small circles (welcome, above the CTA), active one filled accent.
export const OnboardingProgress = ({ current, total = 3, variant = 'bars' }: Props) => {
  const colors = useTheme();

  return (
    <View className="flex-row justify-center items-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;

        if (variant === 'dots') {
          return (
            <View
              key={i}
              style={{
                height: active ? 10 : 8,
                width: active ? 10 : 8,
                borderRadius: 99,
                backgroundColor: active ? colors.accentBlue : colors.border,
              }}
            />
          );
        }

        return (
          <View
            key={i}
            style={{
              height: 8,
              width: active ? 32 : 24,
              borderRadius: 99,
              backgroundColor: active ? colors.accentBlue : colors.border,
            }}
          />
        );
      })}
    </View>
  );
};
