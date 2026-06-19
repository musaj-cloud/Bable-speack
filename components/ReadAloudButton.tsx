import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Easing, Text, TouchableOpacity } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  onPress: () => void;
  available?: boolean; // false when the target language has no offline voice
  loading?: boolean; // true while the voice is synthesizing (the wait after a tap)
  speaking?: boolean; // true while the translation is playing aloud
  paused?: boolean; // true while playback is paused mid-clip (tap to resume)
  label?: string;
};

// Prominent full-width "read out loud" action. Triggers on-device TTS playback.
// Shows a spinner while the voice loads and a soft pulse while it speaks, so the
// reader knows the audio is on its way. Disabled when no offline voice exists.
export const ReadAloudButton = ({
  onPress,
  available = true,
  loading = false,
  speaking = false,
  paused = false,
  label = 'Read out loud',
}: Props) => {
  const colors = useTheme();
  const tint = available ? colors.accentBlue : colors.textMuted;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!speaking) {
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [speaking, pulse]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] });

  // The button doubles as a transport control: Pause while playing, Resume while
  // paused, otherwise the read-aloud call to action.
  const text = !available
    ? 'No offline voice for this language'
    : loading
      ? 'Loading voice…'
      : speaking
        ? 'Pause'
        : paused
          ? 'Resume'
          : label;
  const iconName = !available ? 'volume-off' : speaking ? 'pause' : paused ? 'play-arrow' : 'volume-up';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={available && !loading ? onPress : undefined}
        disabled={!available || loading}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={available ? text : 'Voice not available offline'}
        style={{
          minHeight: 52,
          borderRadius: 14,
          backgroundColor: colors.bgCardInner,
          borderWidth: 1,
          borderColor: speaking ? colors.accentBlue : colors.border,
          opacity: available ? 1 : 0.6,
        }}
        className="flex-row items-center justify-center gap-2 px-5 py-3"
      >
        {loading && available ? (
          <ActivityIndicator size="small" color={tint} />
        ) : (
          <MaterialIcons name={iconName} size={22} color={tint} />
        )}
        <Text style={{ ...typography.h4, color: tint }}>{text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
