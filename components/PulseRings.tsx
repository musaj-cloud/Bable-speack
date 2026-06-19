import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

type Props = {
  size: number; // diameter of the source (the mic circle) the rings start from
  color: string; // ring color (recording = warningRed)
  count?: number; // how many rings emanate at once
};

const PERIOD = 1800; // ms for one ring to fully expand and fade

// Concentric "sound wave" rings that expand outward from the mic and fade,
// staggered so a new wave keeps coming out — shown while actively recording.
// Pure RN Animated (native driver), no extra library.
export const PulseRings = ({ size, color, count = 3 }: Props) => {
  const rings = useRef(
    Array.from({ length: count }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Each ring loops with the same PERIOD but starts at an even phase offset,
    // so they stay evenly spaced and emanate continuously.
    const anims = rings.map((value, i) =>
      Animated.sequence([
        Animated.delay((PERIOD / count) * i),
        Animated.loop(
          Animated.timing(value, {
            toValue: 1,
            duration: PERIOD,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        ),
      ])
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [rings, count]);

  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      className="items-center justify-center"
    >
      {rings.map((value, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
            opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] }),
            transform: [
              { scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 2.6] }) },
            ],
          }}
        />
      ))}
    </View>
  );
};
