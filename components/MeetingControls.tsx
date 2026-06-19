import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { LiveSummaryPanel } from '@/components/LiveSummaryPanel';
import { MeetingTalkButtons } from '@/components/MeetingTalkButtons';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { MeetingStatus, TurnSide } from '@/store/useMeetingStore';

type Props = {
  status: MeetingStatus;
  talking: TurnSide | null;
  busy: boolean;
  youLabel: string;
  themLabel: string;
  summary: string[];
  saved: boolean;
  onBegin: () => void;
  onFinish: () => void;
  onReset: () => void;
  onSave: () => void;
  onTalkStart: (side: TurnSide) => void;
  onTalkEnd: () => void;
};

// A pill action button (Start / End / New session).
const Pill = ({
  label, icon, tint, onPress,
}: {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  tint: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={{ backgroundColor: tint, borderRadius: 14 }}
    className="h-14 flex-row items-center justify-center gap-2"
  >
    <MaterialIcons name={icon} size={22} color="#ffffff" />
    <Text style={{ ...typography.h4, color: '#ffffff' }}>{label}</Text>
  </TouchableOpacity>
);

// The phase-dependent bottom control area for Meeting mode.
export const MeetingControls = ({
  status, talking, busy, youLabel, themLabel, summary, saved,
  onBegin, onFinish, onReset, onSave, onTalkStart, onTalkEnd,
}: Props) => {
  const colors = useTheme();

  if (status === 'idle') {
    return <Pill label="Start session" icon="play-arrow" tint={colors.accentBlue} onPress={onBegin} />;
  }

  if (status === 'live') {
    return (
      <View className="gap-4">
        <MeetingTalkButtons
          youLabel={youLabel}
          themLabel={themLabel}
          talking={talking}
          busy={busy}
          onTalkStart={onTalkStart}
          onTalkEnd={onTalkEnd}
        />
        <Pill label="End session" icon="stop" tint={colors.warningRed} onPress={onFinish} />
      </View>
    );
  }

  if (status === 'summarizing') {
    return (
      <View
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, borderRadius: 20 }}
        className="flex-row items-center justify-center gap-3 p-5"
      >
        <ActivityIndicator size="small" color={colors.accentBlue} />
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>Summarizing on device…</Text>
      </View>
    );
  }

  // ready | error
  return (
    <View className="gap-3">
      <LiveSummaryPanel summary={summary} canSave={status === 'ready'} saved={saved} onSave={onSave} />
      <Pill label="New session" icon="refresh" tint={colors.accentBlue} onPress={onReset} />
    </View>
  );
};
