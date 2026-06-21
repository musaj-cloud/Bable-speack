import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { LiveSummaryPanel } from '@/components/LiveSummaryPanel';
import { MeetingRecordButton } from '@/components/MeetingRecordButton';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';
import type { MeetingStatus } from '@/store/useMeetingStore';

type Props = {
  status: MeetingStatus;
  recording: boolean;
  summary: string[];
  saved: boolean;
  onToggleRecord: () => void;
  onReset: () => void;
  onSave: () => void;
};

// Per-phase status label shown while the recording is being processed on device.
const PROCESSING_LABEL: Partial<Record<MeetingStatus, string>> = {
  transcribing: 'Transcribing on device…',
  translating: 'Translating on device…',
  summarizing: 'Summarizing on device…',
};

// A pill action button (New session).
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
  status, recording, summary, saved, onToggleRecord, onReset, onSave,
}: Props) => {
  const colors = useTheme();

  if (status === 'idle' || status === 'recording') {
    return (
      <View className="items-center">
        <MeetingRecordButton recording={recording} onPress={onToggleRecord} />
      </View>
    );
  }

  if (status === 'transcribing' || status === 'translating' || status === 'summarizing') {
    return (
      <View
        style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, borderRadius: 20 }}
        className="flex-row items-center justify-center gap-3 p-5"
      >
        <ActivityIndicator size="small" color={colors.accentBlue} />
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          {PROCESSING_LABEL[status]}
        </Text>
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
