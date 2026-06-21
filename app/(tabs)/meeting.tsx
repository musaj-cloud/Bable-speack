import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryShortcut } from '@/components/HistoryShortcut';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { LiveShortcut } from '@/components/LiveShortcut';
import { MeetingControls } from '@/components/MeetingControls';
import { MeetingEmptyState } from '@/components/MeetingEmptyState';
import { MeetingTranscript } from '@/components/MeetingTranscript';
import { RecordingStatus } from '@/components/RecordingStatus';
import { useMeetingSession } from '@/hooks/useMeetingSession';
import { useTheme } from '@/hooks/useTheme';
import { formatDuration } from '@/lib/datetime';
import { useMeetingStore } from '@/store/useMeetingStore';

// Meeting: record a whole talk on one phone, then translate + summarize it. Pick
// the spoken language and the language you need, tap to record, tap to stop —
// BabelSpeak transcribes, translates each line, and summarizes, all on device.
export default function Meeting() {
  const colors = useTheme();
  const { recording, toggle } = useMeetingSession();
  const { status, durationSec, segments, summary, error, saved, reset, save } = useMeetingStore();

  const resting = status === 'idle';
  // Languages are chosen before a session and locked once it starts.
  const summaryBullets =
    status === 'error' ? [error ?? 'Something went wrong. Please try again.'] : summary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 gap-3 px-5 pb-4">
        {resting && (
          <View className="flex-row items-center justify-between">
            <LiveShortcut />
            <HistoryShortcut label="SAVED SESSIONS" filter="meeting" />
          </View>
        )}
        {resting && <LanguageBar middle="swap" />}

        {resting ? (
          <MeetingEmptyState />
        ) : (
          <>
            <RecordingStatus duration={formatDuration(durationSec)} recording={status === 'recording'} />
            <MeetingTranscript segments={segments} />
          </>
        )}

        <MeetingControls
          status={status}
          recording={recording}
          summary={summaryBullets}
          saved={saved}
          onToggleRecord={toggle}
          onReset={reset}
          onSave={save}
        />
      </View>
    </SafeAreaView>
  );
}
