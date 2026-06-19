import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SpeakerButton } from '@/components/SpeakerButton';
import { typography } from '@/constants/typography';
import { useSpeakState } from '@/hooks/useSpeakState';
import { useTheme } from '@/hooks/useTheme';
import { isTtsSupported } from '@/lib/tts';
import { useMeetingStore, type MeetingSegment } from '@/store/useMeetingStore';

type Props = {
  segments: MeetingSegment[];
};

// One chat bubble. The phone owner ("you") sits on the right in a filled blue
// bubble; the other speaker ("them") sits on the left in a light bubble. When
// this turn's translation is playing aloud it shows a live speaking indicator.
const Bubble = ({ seg, loading, speaking }: { seg: MeetingSegment; loading: boolean; speaking: boolean }) => {
  const colors = useTheme();
  const speak = useMeetingStore((s) => s.speak);
  const isYou = seg.side === 'you';
  // White content reads on the fixed blue fill (same pattern as RecordButton).
  const onYou = '#ffffff';
  const bg = isYou ? colors.accentBlue : colors.bgCardInner;
  const primary = isYou ? onYou : colors.accentBlue;
  const secondary = isYou ? 'rgba(255,255,255,0.8)' : colors.textSecondary;
  const meta = isYou ? 'rgba(255,255,255,0.75)' : colors.textSecondary;
  const canSpeak = isTtsSupported(seg.toLang) && !!seg.translatedText;

  return (
    <View className={isYou ? 'items-end' : 'items-start'}>
      <View
        style={{
          maxWidth: '80%',
          backgroundColor: bg,
          borderRadius: 16,
          borderTopRightRadius: isYou ? 6 : 16,
          borderTopLeftRadius: isYou ? 16 : 6,
        }}
        className="px-3.5 py-2.5"
      >
        <View className="mb-1.5 flex-row items-center justify-between gap-3">
          <Text style={{ ...typography.label, color: meta }}>
            {isYou ? 'YOU' : 'THEM'} · {seg.fromLang.toUpperCase()}
          </Text>
          {canSpeak && (
            <SpeakerButton
              onPress={() => speak(seg)}
              loading={loading}
              speaking={speaking}
              color={isYou ? onYou : colors.accentBlue}
            />
          )}
        </View>

        <Text style={{ fontFamily: 'Georgia', fontSize: 15, lineHeight: 21, fontWeight: '500', color: primary }}>
          {seg.sourceText}
        </Text>
        {!!seg.translatedText && (
          <Text style={{ ...typography.bodySm, color: secondary }} className="mt-1">
            {seg.translatedText}
          </Text>
        )}
        {(loading || speaking) && (
          <Text style={{ ...typography.caption, color: meta }} className="mt-1.5">
            {loading ? 'PREPARING VOICE…' : 'SPEAKING…'}
          </Text>
        )}
      </View>
    </View>
  );
};

// Scrollable, auto-following conversation: alternating bubbles per speaker,
// each with its original text large and the translation beneath.
export const MeetingTranscript = ({ segments }: Props) => {
  const scroller = useRef<ScrollView>(null);
  const speakState = useSpeakState();
  const speakingId = useMeetingStore((s) => s.speakingId);

  return (
    <ScrollView
      ref={scroller}
      className="mt-2 flex-1"
      contentContainerStyle={{ gap: 12, paddingVertical: 12 }}
      showsVerticalScrollIndicator={false}
      onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: true })}
    >
      {segments.map((seg) => {
        const active = speakingId === seg.id;
        return (
          <Bubble
            key={seg.id}
            seg={seg}
            loading={active && speakState === 'loading'}
            speaking={active && speakState === 'speaking'}
          />
        );
      })}
    </ScrollView>
  );
};
