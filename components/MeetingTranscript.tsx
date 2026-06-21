import { useRef } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SpeakerButton } from '@/components/SpeakerButton';
import { typography } from '@/constants/typography';
import { useSpeakState } from '@/hooks/useSpeakState';
import { useTheme } from '@/hooks/useTheme';
import { getLanguageName } from '@/data/languages';
import { isTtsSupported } from '@/lib/tts';
import { useMeetingStore, type MeetingSegment } from '@/store/useMeetingStore';

type Props = {
  segments: MeetingSegment[];
};

// One line of the recorded talk: the sentence as spoken (large), its translation
// beneath, and a speaker button to read it aloud. A same-language talk has no
// translation, so only the original line shows.
const Line = ({ seg, loading, speaking }: { seg: MeetingSegment; loading: boolean; speaking: boolean }) => {
  const colors = useTheme();
  const speak = useMeetingStore((s) => s.speak);
  const hasTranslation = !!seg.translatedText;
  const speakLang = hasTranslation ? seg.toLang : seg.fromLang;
  const canSpeak = isTtsSupported(speakLang);

  return (
    <View
      style={{
        backgroundColor: colors.bgCardInner,
        borderRadius: 16,
        borderTopLeftRadius: 6,
      }}
      className="px-3.5 py-2.5"
    >
      <View className="mb-1.5 flex-row items-center justify-between gap-3">
        <Text style={{ ...typography.label, color: colors.textSecondary }}>
          {getLanguageName(seg.fromLang).toUpperCase()}
          {hasTranslation ? ` → ${getLanguageName(seg.toLang).toUpperCase()}` : ''}
        </Text>
        {canSpeak && (
          <SpeakerButton onPress={() => speak(seg)} loading={loading} speaking={speaking} color={colors.accentBlue} />
        )}
      </View>

      {hasTranslation ? (
        <>
          <Text style={{ fontFamily: 'Georgia', fontSize: 15, lineHeight: 21, fontWeight: '500', color: colors.accentBlue }}>
            {seg.translatedText}
          </Text>
          <Text style={{ ...typography.bodySm, color: colors.textSecondary }} className="mt-1">
            {seg.sourceText}
          </Text>
        </>
      ) : (
        <Text style={{ fontFamily: 'Georgia', fontSize: 15, lineHeight: 21, fontWeight: '500', color: colors.textPrimary }}>
          {seg.sourceText}
        </Text>
      )}

      {(loading || speaking) && (
        <Text style={{ ...typography.caption, color: colors.textSecondary }} className="mt-1.5">
          {loading ? 'PREPARING VOICE…' : 'SPEAKING…'}
        </Text>
      )}
    </View>
  );
};

// Scrollable, auto-following transcript of the recorded talk.
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
          <Line
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
