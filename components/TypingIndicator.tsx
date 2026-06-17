import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

// "Listening…" dots shown while the next turn is being transcribed.
export const TypingIndicator = () => {
  const colors = useTheme();
  const d0 = useRef(new Animated.Value(0)).current;
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dots = [d0, d1, d2];
    const anims = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: -5, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay((2 - i) * 150),
        ]),
      ),
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [d0, d1, d2]);

  return (
    <View className="self-start max-w-[85%]" style={{ opacity: 0.7 }}>
      <View
        style={{ backgroundColor: colors.bgCardInner, borderRadius: 18, borderTopLeftRadius: 6 }}
        className="flex-row items-center gap-1.5 px-4 py-3"
      >
        {[d0, d1, d2].map((dot, i) => (
          <Animated.View
            key={i}
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.textMuted,
              transform: [{ translateY: dot }],
            }}
          />
        ))}
      </View>
    </View>
  );
};
