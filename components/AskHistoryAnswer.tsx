import { MaterialIcons } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { dayLabel } from '@/lib/datetime';
import type { RagSource } from '@/lib/rag';
import { Mode, TranslationEntry } from '@/types/translation';
import type { AskStatus } from '@/hooks/useAskHistory';

type IconName = keyof typeof MaterialIcons.glyphMap;
const ICONS: Record<Mode, IconName> = {
  converse: 'mic',
  document: 'photo-camera',
  meeting: 'groups',
};

type Props = {
  status: AskStatus;
  answer: string | null;
  sources: RagSource[];
  onOpenSource: (entry: TranslationEntry) => void;
};

// One retrieved entry, tappable to reopen it in its mode.
const SourceRow = ({
  entry,
  onPress,
}: {
  entry: TranslationEntry;
  onPress: () => void;
}) => {
  const colors = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.bgCardInner,
        borderRadius: 12,
        padding: 12,
      }}
      className="flex-row items-start gap-3"
    >
      <MaterialIcons name={ICONS[entry.mode]} size={18} color={colors.textSecondary} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <Text style={{ ...typography.label, color: colors.textSecondary }} numberOfLines={1}>
            {getLanguageName(entry.sourceLang)} → {getLanguageName(entry.targetLang)}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textMuted }}>
            {dayLabel(entry.timestamp)}
          </Text>
        </View>
        <Text style={{ ...typography.bodySm, color: colors.textPrimary }} numberOfLines={1}>
          {entry.sourceText}
        </Text>
        <Text
          style={{ ...typography.bodySm, fontStyle: 'italic', color: colors.textSecondary }}
          numberOfLines={1}
        >
          {entry.translatedText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Renders every state of an "Ask Your History" run: thinking, error, the empty
// "nothing matched" case, and the answer with its source entries.
export const AskHistoryAnswer = ({ status, answer, sources, onOpenSource }: Props) => {
  const colors = useTheme();

  if (status === 'thinking') {
    return (
      <View className="flex-row items-center gap-3 py-6">
        <ActivityIndicator color={colors.accentBlue} />
        <Text style={{ ...typography.bodyMd, color: colors.textSecondary }}>
          Reading your history…
        </Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <Text style={{ ...typography.bodyMd, color: colors.warningRed }} className="py-6">
        Something went wrong. Please try again.
      </Text>
    );
  }

  if (status !== 'done') return null;

  if (sources.length === 0) {
    return (
      <View className="items-center py-8">
        <MaterialIcons name="search-off" size={32} color={colors.textMuted} />
        <Text
          style={{ ...typography.bodyMd, color: colors.textSecondary }}
          className="text-center mt-2"
        >
          Nothing in your history matches that yet.
        </Text>
      </View>
    );
  }

  return (
    <View className="gap-3">
      {answer ? (
        <View
          style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
          }}
        >
          <View className="flex-row items-center gap-2 mb-2">
            <MaterialIcons name="auto-awesome" size={16} color={colors.accentBlue} />
            <Text style={{ ...typography.label, color: colors.accentBlue }}>ANSWER</Text>
          </View>
          <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>{answer}</Text>
        </View>
      ) : (
        <Text style={{ ...typography.bodySm, color: colors.textMuted }}>
          Couldn&apos;t generate an answer offline — here&apos;s what matched:
        </Text>
      )}

      <Text style={{ ...typography.label, color: colors.textMuted }}>
        FROM YOUR HISTORY
      </Text>
      {sources.map(({ entry }) => (
        <SourceRow key={entry.id} entry={entry} onPress={() => onOpenSource(entry)} />
      ))}
    </View>
  );
};
