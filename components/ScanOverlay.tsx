import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  active: boolean; // sweep only while OCR is reading/translating
};

const DURATION = 1600; // ms for one top->bottom pass
const BAND = 72; // height of the trailing gradient band + line

// Faded rows behind the bright line, building up to it — fakes a gradient
// trail without a gradient library. Last row is the bright scan line itself.
const TRAIL = [0.04, 0.08, 0.16, 0.26];

// Document-scanner sweep: a bright line with a soft trailing band that travels
// top -> bottom then bottom -> top continuously while text is read off the
// image. Mimics handheld scan-to-speech devices. Pure RN Animated (native
// driver), no extra library — same approach as PulseRings.
export const ScanOverlay = ({ active }: Props) => {
  const colors = useTheme();
  const [height, setHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active || height === 0) return;
    const sweep = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    sweep.start();
    return () => sweep.stop();
  }, [active, height, progress]);

  if (!active) return null;

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.max(0, height - BAND)],
  });

  return (
    <View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { borderRadius: 20, overflow: 'hidden' }]}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
    >
      <Animated.View style={{ height: BAND, transform: [{ translateY }] }}>
        {TRAIL.map((opacity, i) => (
          <View
            key={i}
            style={{ flex: 1, backgroundColor: colors.accentLight, opacity }}
          />
        ))}
        <View
          style={{
            height: 2.5,
            backgroundColor: colors.accentLight,
            shadowColor: colors.accentLight,
            shadowOpacity: 0.9,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          }}
        />
      </Animated.View>
    </View>
  );
};
