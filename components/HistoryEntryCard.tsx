import { MaterialIcons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { HistoryItem } from '@/data/historyDemo';
import { useTheme } from '@/hooks/useTheme';
import { Mode } from '@/types/translation';

type IconName = keyof typeof MaterialIcons.glyphMap;

// Mode drives the icon chip; layout is driven by the entry's content fields.
const ICONS: Record<Mode, IconName> = {
  converse: 'mic',
  document: 'photo-camera',
  meeting: 'groups',
};

// A single history row: mode chip + language pair + time + content snippet.
export const HistoryEntryCard = ({ item }: { item: HistoryItem }) => {
  const colors = useTheme();

  const chips: Record<Mode, { bg: string; fg: string }> = {
    converse: { bg: colors.iconChipBlue, fg: colors.iconChipBlueText },
    document: { bg: colors.iconChipGray, fg: colors.iconChipGrayText },
    meeting: { bg: colors.iconChipLavender, fg: colors.iconChipLavenderText },
  };
  const chip = chips[item.mode];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.bgCard,
        borderColor: colors.border,
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
      <View
        style={{ width: 40, height: 40, borderRadius: 99, backgroundColor: chip.bg }}
        className="items-center justify-center"
      >
        <MaterialIcons name={ICONS[item.mode]} size={20} color={chip.fg} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1 flex-1 mr-2">
            <Text style={{ ...typography.label, color: colors.textSecondary }} numberOfLines={1}>
              {getLanguageName(item.sourceLang)}
            </Text>
            <MaterialIcons
              name={item.bidirectional ? 'swap-horiz' : 'arrow-right-alt'}
              size={16}
              color={colors.textSecondary}
            />
            <Text style={{ ...typography.label, color: colors.textSecondary }} numberOfLines={1}>
              {getLanguageName(item.targetLang)}
            </Text>
          </View>
          <Text style={{ ...typography.caption, color: colors.textMuted }}>{item.time}</Text>
        </View>

        {item.thumbnail ? (
          <View className="flex-row items-center gap-3 mt-1">
            <View
              style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: colors.bgCardInner }}
              className="items-center justify-center"
            >
              <MaterialIcons name="image" size={22} color={colors.textMuted} />
            </View>
            <View className="flex-1">
              <Text style={{ ...typography.h4, color: colors.textPrimary }}>{item.title}</Text>
              <Text style={{ ...typography.bodySm, color: colors.textSecondary, marginTop: 2 }}>
                {item.subtitle}
              </Text>
            </View>
          </View>
        ) : item.title ? (
          <View>
            <Text style={{ ...typography.h4, color: colors.textPrimary }}>{item.title}</Text>
            <Text style={{ ...typography.bodySm, color: colors.textSecondary, marginTop: 2 }}>
              {item.subtitle}
            </Text>
          </View>
        ) : (
          <View>
            <Text style={{ ...typography.bodyMd, color: colors.textPrimary }} numberOfLines={2}>
              {item.sourceText}
            </Text>
            {item.translatedText ? (
              <Text
                style={{
                  ...typography.bodyMd,
                  fontStyle: 'italic',
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
                numberOfLines={2}
              >
                {item.translatedText}
              </Text>
            ) : null}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};
