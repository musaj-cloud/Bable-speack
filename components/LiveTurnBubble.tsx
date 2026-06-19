import { Text, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import type { P2PTurn } from '@/store/useP2PStore';

// One line in the live transcript. My own turns sit on the right (accent), the
// peer's on the left (card) showing both what they said and its local
// translation into my reading language.
export const LiveTurnBubble = ({ turn }: { turn: P2PTurn }) => {
  const colors = useTheme();
  const mine = turn.side === 'you';

  const bg = mine ? colors.accentBlue : colors.bgCard;
  const labelColor = mine ? 'rgba(255,255,255,0.7)' : colors.textMuted;
  const primary = mine ? '#ffffff' : colors.textPrimary;

  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '88%',
        backgroundColor: bg,
        borderColor: colors.border,
        borderWidth: mine ? 0 : 1,
        borderRadius: 18,
        padding: 14,
      }}
    >
      <Text style={{ ...typography.label, color: labelColor }} className="mb-1.5">
        {mine ? 'YOU' : getLanguageName(turn.lang).toUpperCase()}
      </Text>

      <Text style={{ ...typography.bodyLg, color: primary }}>{turn.text}</Text>

      {!mine && (
        <View
          style={{ borderTopColor: colors.border, borderTopWidth: 1 }}
          className="mt-3 pt-3 gap-1"
        >
          <Text style={{ ...typography.label, color: colors.accentBlue }}>
            {getLanguageName(turn.translatedLang).toUpperCase()}
          </Text>
          <Text
            style={{
              ...typography.bodyLg,
              color: turn.pending ? colors.textMuted : colors.textPrimary,
            }}
          >
            {turn.pending ? 'Translating…' : turn.translated || '—'}
          </Text>
        </View>
      )}
    </View>
  );
};
