import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { PulseRings } from '@/components/PulseRings';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { TurnSide } from '@/store/useMeetingStore';

type Props = {
  youLabel: string; // display code for the phone owner, e.g. "EN"
  themLabel: string; // display code for the other speaker, e.g. "FR"
  talking: TurnSide | null;
  busy: boolean; // a previous turn is still processing
  onTalkStart: (side: TurnSide) => void;
  onTalkEnd: () => void;
};

const CIRCLE = 76;

// One hold-to-talk side: a round mic the speaker presses and holds while
// talking. Turns red with sound-wave rings while recording.
const TalkSide = ({
  side, name, lang, active, disabled, onStart, onEnd,
}: {
  side: TurnSide;
  name: string;
  lang: string;
  active: boolean;
  disabled: boolean;
  onStart: (side: TurnSide) => void;
  onEnd: () => void;
}) => {
  const colors = useTheme();
  const tint = active ? colors.warningRed : colors.accentBlue;

  return (
    <View className="flex-1 items-center gap-2">
      <Pressable
        onPressIn={() => onStart(side)}
        onPressOut={onEnd}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Hold to speak — ${name}, ${lang}`}
        style={{
          width: CIRCLE,
          height: CIRCLE,
          borderRadius: CIRCLE / 2,
          backgroundColor: tint,
          opacity: disabled ? 0.4 : 1,
          shadowColor: tint,
          shadowOpacity: 0.4,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
        className="items-center justify-center"
      >
        {active && <PulseRings size={CIRCLE} color={colors.warningRed} />}
        <MaterialIcons name="mic" size={32} color="#ffffff" />
      </Pressable>

      <Text style={{ ...typography.h4, color: colors.textPrimary }}>{name}</Text>
      <Text style={{ ...typography.label, color: colors.textSecondary }}>{lang}</Text>
    </View>
  );
};

// The two-sided push-to-talk control. Whoever's turn it is holds their side and
// speaks; releasing processes the turn. Turns are sequential — while one side
// records (or a turn is processing) the other side is disabled.
export const MeetingTalkButtons = ({
  youLabel, themLabel, talking, busy, onTalkStart, onTalkEnd,
}: Props) => {
  const colors = useTheme();
  const lockOther = busy || talking !== null;

  return (
    <View className="gap-3">
      <View className="flex-row items-start justify-around">
        <TalkSide
          side="you"
          name="You"
          lang={youLabel}
          active={talking === 'you'}
          disabled={lockOther && talking !== 'you'}
          onStart={onTalkStart}
          onEnd={onTalkEnd}
        />
        <TalkSide
          side="them"
          name="Them"
          lang={themLabel}
          active={talking === 'them'}
          disabled={lockOther && talking !== 'them'}
          onStart={onTalkStart}
          onEnd={onTalkEnd}
        />
      </View>

      <Text
        style={{ ...typography.caption, color: colors.textMuted }}
        className="text-center"
      >
        {busy
          ? 'TRANSLATING · ON DEVICE'
          : talking
            ? 'LISTENING…'
            : 'HOLD A SIDE TO SPEAK'}
      </Text>
    </View>
  );
};
