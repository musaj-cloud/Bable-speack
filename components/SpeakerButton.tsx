import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Easing, TouchableOpacity, View } from 'react-native';

type Props = {
  onPress: () => void;
  loading?: boolean; // true while the voice is synthesizing (the wait after a tap)
  speaking?: boolean; // true while the translation is actually playing aloud
  paused?: boolean; // true while playback is paused mid-clip (tap to resume)
  available?: boolean; // false when the language has no offline voice
  color?: string; // icon tint when available (on the accent card this is white)
  mutedColor?: string; // icon tint when no offline voice exists
};

const SIZE = 32;

// Animated read-aloud speaker. Tapping gives a spring "bounce"; a spinner ring
// turns while the voice loads, then the icon pulses and a sonar ring radiates
// out while it plays. Built on RN Animated (native driver) to match PulseRings.
export const SpeakerButton = ({
  onPress,
  loading = false,
  speaking = false,
  paused = false,
  available = true,
  color = '#ffffff',
  mutedColor = 'rgba(255,255,255,0.45)',
}: Props) => {
  const press = useRef(new Animated.Value(0)).current; // 0 idle → 1 pressed
  const pulse = useRef(new Animated.Value(0)).current; // looping while speaking
  const ring = useRef(new Animated.Value(0)).current; // sonar ring while speaking
  const spin = useRef(new Animated.Value(0)).current; // spinner ring while loading

  const onPressIn = () =>
    Animated.spring(press, { toValue: 1, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(press, { toValue: 0, useNativeDriver: true, friction: 4, tension: 120 }).start();

  useEffect(() => {
    if (!loading) {
      spin.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 800, easing: Easing.linear, useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, [loading, spin]);

  useEffect(() => {
    if (!speaking) {
      pulse.setValue(0);
      ring.setValue(0);
      return;
    }
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    const ringLoop = Animated.loop(
      Animated.timing(ring, { toValue: 1, duration: 1200, easing: Easing.out(Easing.ease), useNativeDriver: true })
    );
    pulseLoop.start();
    ringLoop.start();
    return () => {
      pulseLoop.stop();
      ringLoop.stop();
    };
  }, [speaking, pulse, ring]);

  // Press shrinks toward 0.85; the speaking pulse adds up to +0.12 on top.
  const scale = Animated.add(
    press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] }),
    pulse.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] })
  );
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  // While playing the icon is a pause control; while paused it's a play (resume)
  // control; otherwise the usual speaker.
  const iconName = !available ? 'volume-off' : speaking ? 'pause' : paused ? 'play-arrow' : 'volume-up';
  const actionLabel = !available
    ? 'Voice not available offline'
    : speaking
      ? 'Pause'
      : paused
        ? 'Resume'
        : 'Play translation';

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      accessibilityRole="button"
      accessibilityLabel={actionLabel}
      style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2 }}
      className="items-center justify-center"
    >
      <View pointerEvents="none" className="items-center justify-center">
        {speaking && available && (
          <Animated.View
            style={{
              position: 'absolute',
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              borderWidth: 1.5,
              borderColor: color,
              opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
              transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.9] }) }],
            }}
          />
        )}
        {loading && available && (
          <Animated.View
            style={{
              position: 'absolute',
              width: SIZE,
              height: SIZE,
              borderRadius: SIZE / 2,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.25)',
              borderTopColor: color,
              transform: [{ rotate }],
            }}
          />
        )}
        <Animated.View style={{ transform: [{ scale }], opacity: loading ? 0.6 : 1 }}>
          <MaterialIcons
            name={iconName}
            size={22}
            color={available ? color : mutedColor}
          />
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
};
