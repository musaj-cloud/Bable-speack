import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  speaker: string;
  langLabel: string;
  side: 'left' | 'right';
  sourceText: string;
  translatedText?: string;
};

// One conversation turn. Right = own language (filled blue). Left = foreign
// (light card with the original text large + its translation beneath).
export const TranscriptBubble = ({ speaker, langLabel, side, sourceText, translatedText }: Props) => {
  const colors = useTheme();
  const right = side === 'right';

  // Speaker meta row — order flips so the language code sits inside the bubble edge.
  const meta = right ? [speaker, langLabel] : [langLabel, speaker];

  return (
    <View className={`max-w-[85%] gap-1 ${right ? 'self-end' : 'self-start'}`}>
      <View className={`flex-row items-center gap-1.5 px-1 ${right ? 'justify-end' : ''}`}>
        <Text style={{ ...typography.label, color: colors.textSecondary }}>{meta[0]}</Text>
        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textMuted }} />
        <Text style={{ ...typography.label, color: colors.textSecondary }}>{meta[1]}</Text>
      </View>

      {right ? (
        <View
          style={{ backgroundColor: colors.accentBlue, borderRadius: 18, borderTopRightRadius: 6 }}
          className="px-4 py-3"
        >
          <Text style={{ ...typography.bodyLg, color: '#ffffff' }}>{sourceText}</Text>
        </View>
      ) : (
        <View
          style={{ backgroundColor: colors.bgCardInner, borderRadius: 18, borderTopLeftRadius: 6 }}
          className="px-4 py-3"
        >
          <Text
            style={{
              fontFamily: 'Georgia',
              fontSize: 20,
              lineHeight: 28,
              fontWeight: '500',
              color: colors.accentBlue,
            }}
            className="mb-1"
          >
            {sourceText}
          </Text>
          {translatedText && (
            <Text style={{ ...typography.bodySm, color: colors.textSecondary }}>
              {translatedText}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};
