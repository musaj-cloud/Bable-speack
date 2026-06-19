import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HistoryShortcut } from '@/components/HistoryShortcut';
import { HomeHeader } from '@/components/HomeHeader';
import { LanguageBar } from '@/components/LanguageBar';
import { MeetingControls } from '@/components/MeetingControls';
import { MeetingEmptyState } from '@/components/MeetingEmptyState';
import { MeetingTranscript } from '@/components/MeetingTranscript';
import { RecordingStatus } from '@/components/RecordingStatus';
import { useMeetingSession } from '@/hooks/useMeetingSession';
import { useTheme } from '@/hooks/useTheme';
import { formatDuration } from '@/lib/datetime';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useMeetingStore } from '@/store/useMeetingStore';

// Meeting: a live, two-sided conversation on one phone. Each side holds its
// button to speak; their words are transcribed, translated, shown, and spoken
// back to the other person — all on device. Stopping summarizes the whole talk.
export default function Meeting() {
  const colors = useTheme();
  const { talking, begin, finish, talkStart, talkEnd } = useMeetingSession();
  const { status, durationSec, segments, summary, error, saved, busy, reset, save } =
    useMeetingStore();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);

  const resting = status === 'idle';
  // Languages are chosen before a session and locked once it starts.
  const summaryBullets =
    status === 'error' ? [error ?? 'Something went wrong. Please try again.'] : summary;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 gap-3 px-5 pb-4">
        {resting && <HistoryShortcut label="SAVED SESSIONS" filter="meeting" />}
        {resting && <LanguageBar middle="swap" />}

        {resting ? (
          <MeetingEmptyState />
        ) : (
          <>
            <RecordingStatus duration={formatDuration(durationSec)} recording={status === 'live'} />
            <MeetingTranscript segments={segments} />
          </>
        )}

        <MeetingControls
          status={status}
          talking={talking}
          busy={busy}
          youLabel={sourceLang.toUpperCase()}
          themLabel={targetLang.toUpperCase()}
          summary={summaryBullets}
          saved={saved}
          onBegin={begin}
          onFinish={finish}
          onReset={reset}
          onSave={save}
          onTalkStart={talkStart}
          onTalkEnd={talkEnd}
        />
      </View>
    </SafeAreaView>
  );
}
