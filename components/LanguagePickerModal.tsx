import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { LANGUAGES } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { isTtsSupported } from '@/lib/tts';

// Cap the sheet at ~70% of the screen so the long language list scrolls
// inside it instead of overflowing past the bottom edge.
const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.7;

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

// Languages split into two groups: ones with an offline read-aloud voice show
// first, then the translate-only ones. Each group is sorted alphabetically.
const SPEAK_LANGS = LANGUAGES.filter((l) => isTtsSupported(l.code)).sort(byName);
const TRANSLATE_LANGS = LANGUAGES.filter((l) => !isTtsSupported(l.code)).sort(byName);

type Props = {
  visible: boolean;
  title: string;
  selectedCode: string;
  disabledCode?: string; // prevent picking the same language as the other side
  onSelect: (code: string) => void;
  onClose: () => void;
};

// Bottom-sheet style language list. Custom-built to avoid new dependencies.
export const LanguagePickerModal = ({
  visible,
  title,
  selectedCode,
  disabledCode,
  onSelect,
  onClose,
}: Props) => {
  const colors = useTheme();

  const renderRow = (lang: { code: string; name: string }, canSpeak: boolean) => {
    const selected = lang.code === selectedCode;
    const disabled = lang.code === disabledCode;
    return (
      <TouchableOpacity
        key={lang.code}
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => {
          onSelect(lang.code);
          onClose();
        }}
        style={{ minHeight: 52, opacity: disabled ? 0.35 : 1 }}
        className="flex-row items-center justify-between px-2"
      >
        <View className="flex-row items-center gap-2">
          <Text
            style={{
              ...typography.bodyLg,
              color: selected ? colors.accentBlue : colors.textPrimary,
            }}
          >
            {lang.name}
          </Text>
          {canSpeak && (
            <MaterialIcons name="volume-up" size={16} color={colors.textMuted} />
          )}
        </View>
        {selected && <MaterialIcons name="check" size={22} color={colors.accentBlue} />}
      </TouchableOpacity>
    );
  };

  const sectionHeader = (label: string) => (
    <Text
      style={{ ...typography.label, color: colors.textMuted }}
      className="mb-1 mt-3 px-2"
    >
      {label}
    </Text>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.bgPrimary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 28,
            borderColor: colors.border,
            borderWidth: 1,
            maxHeight: MAX_SHEET_HEIGHT,
          }}
          className="px-5 pt-4"
        >
          <View
            style={{ backgroundColor: colors.border }}
            className="self-center w-10 h-1 rounded-full mb-4"
          />
          <Text style={{ ...typography.h4, color: colors.textPrimary }} className="mb-3">
            {title}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sectionHeader('READ ALOUD + TRANSLATE')}
            {SPEAK_LANGS.map((lang) => renderRow(lang, true))}
            {sectionHeader('TRANSLATE ONLY')}
            {TRANSLATE_LANGS.map((lang) => renderRow(lang, false))}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
