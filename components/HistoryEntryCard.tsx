import { MaterialIcons } from '@expo/vector-icons';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { formatTime } from '@/lib/datetime';
import { Mode, TranslationEntry } from '@/types/translation';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Mode drives the icon chip; meetings render a ⇄ between languages.
const ICONS: Record<Mode, IconName> = {
  converse: 'mic',
  document: 'photo-camera',
  meeting: 'groups',
};

type Props = {
  entry: TranslationEntry;
  selecting: boolean;
  selected: boolean;
  onPress: (entry: TranslationEntry) => void;
  onLongPress: (entry: TranslationEntry) => void;
};

// A single history row: mode chip (or scan thumbnail) + language pair + time +
// snippet. Tap to reopen the entry in its mode; in selection mode tap toggles a
// checkbox instead, and long-press enters selection mode.
export const HistoryEntryCard = ({ entry, selecting, selected, onPress, onLongPress }: Props) => {
  const colors = useTheme();

  const chips: Record<Mode, { bg: string; fg: string }> = {
    converse: { bg: colors.iconChipBlue, fg: colors.iconChipBlueText },
    document: { bg: colors.iconChipGray, fg: colors.iconChipGrayText },
    meeting: { bg: colors.iconChipLavender, fg: colors.iconChipLavenderText },
  };
  const chip = chips[entry.mode];
  // Document scans show their captured image as a preview inside the card body
  // (the camera chip on the left stays, matching the reference layout).
  const thumb = entry.mode === 'document' ? entry.imageUri : undefined;

  // Meeting rows show a duration + exchange count instead of raw text.
  const meetingMeta =
    entry.detail &&
    `${Math.max(1, Math.round(entry.detail.durationSec / 60))} min · ${entry.detail.segments.length} exchanges`;

  return (
    <TouchableOpacity
      onPress={() => onPress(entry)}
      onLongPress={() => onLongPress(entry)}
      delayLongPress={250}
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: selected ? colors.accentBlue : colors.border,
        borderWidth: 1,
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      }}
      className="flex-row items-start gap-3"
    >
      {selecting && (
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 99,
            borderWidth: 2,
            borderColor: selected ? colors.accentBlue : colors.textMuted,
            backgroundColor: selected ? colors.accentBlue : 'transparent',
            marginTop: 8,
          }}
          className="items-center justify-center"
        >
          {selected && <MaterialIcons name="check" size={16} color={colors.bgCard} />}
        </View>
      )}

      <View
        style={{ width: 40, height: 40, borderRadius: 99, backgroundColor: chip.bg }}
        className="items-center justify-center"
      >
        <MaterialIcons name={ICONS[entry.mode]} size={20} color={chip.fg} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1 flex-1 mr-2">
            <Text style={{ ...typography.label, color: colors.textSecondary }} numberOfLines={1}>
              {getLanguageName(entry.sourceLang)}
            </Text>
            <MaterialIcons
              name={entry.mode === 'meeting' ? 'swap-horiz' : 'arrow-right-alt'}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={{ ...typography.label, color: colors.textSecondary }} numberOfLines={1}>
              {getLanguageName(entry.targetLang)}
            </Text>
          </View>
          <Text style={{ ...typography.caption, color: colors.textMuted }}>
            {formatTime(entry.timestamp)}
          </Text>
        </View>

        <View className={thumb ? 'flex-row items-start gap-3' : ''}>
          {thumb && (
            <Image
              source={{ uri: thumb }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                backgroundColor: colors.bgCardInner,
              }}
              resizeMode="cover"
            />
          )}
          <View className="flex-1">
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary }} numberOfLines={2}>
              {entry.sourceText}
            </Text>
            {meetingMeta ? (
              <Text style={{ ...typography.caption, color: colors.textMuted, marginTop: 4 }}>
                {meetingMeta}
              </Text>
            ) : entry.translatedText ? (
              <Text
                style={{
                  ...typography.bodyMd,
                  fontStyle: 'italic',
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {entry.translatedText}
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};
