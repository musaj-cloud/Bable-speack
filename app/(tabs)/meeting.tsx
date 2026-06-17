import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeHeader } from '@/components/HomeHeader';
import { LiveSummaryPanel } from '@/components/LiveSummaryPanel';
import { MeetingWaveform } from '@/components/MeetingWaveform';
import { RecordingStatus } from '@/components/RecordingStatus';
import { TranscriptBubble } from '@/components/TranscriptBubble';
import { TypingIndicator } from '@/components/TypingIndicator';
import { DEMO_DURATION, DEMO_SEGMENTS, DEMO_SUMMARY } from '@/data/meetingDemo';
import { useTheme } from '@/hooks/useTheme';

// Meeting: record a multilingual conversation → live translated transcript + summary.
// The record → transcribe → translate → summarize pipeline is Phase 5; this screen
// renders the demo conversation and a working record/pause toggle.
export default function Meeting() {
  const colors = useTheme();
  const [recording, setRecording] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgPrimary }} edges={['top']}>
      <HomeHeader />

      <View className="flex-1 px-5 pb-4">
        <RecordingStatus duration={DEMO_DURATION} />
        {recording && <MeetingWaveform />}

        <ScrollView
          className="mt-2 flex-1"
          contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {DEMO_SEGMENTS.map((segment) => (
            <TranscriptBubble key={segment.id} {...segment} />
          ))}
          {recording && <TypingIndicator />}
        </ScrollView>

        <LiveSummaryPanel
          summary={DEMO_SUMMARY}
          recording={recording}
          onToggle={() => setRecording((v) => !v)}
        />
      </View>
    </SafeAreaView>
  );
}
