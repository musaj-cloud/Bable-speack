import { MaterialIcons } from '@expo/vector-icons';
import { Dimensions, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { LANGUAGES } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { isTtsSupported } from '@/lib/tts';

const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.7;
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const SPEAK_LANGS = LANGUAGES.filter((l) => isTtsSupported(l.code)).sort(byName);
const TRANSLATE_LANGS = LANGUAGES.filter((l) => !isTtsSupported(l.code)).sort(byName);

type Props = {
  visible: boolean;
  selected: string[]; // extra languages the user has toggled on
  alwaysOn: string[]; // source + target — included automatically, can't be removed
  onToggle: (code: string) => void;
  onClose: () => void;
};

// Multi-select bottom sheet for choosing which languages to download for offline
// use. Source + target are always included (shown locked). No download happens
// here — the picks are pre-downloaded once on the "Getting things ready" screen.
export const OfflineLanguagesModal = ({ visible, selected, alwaysOn, onToggle, onClose }: Props) => {
  const colors = useTheme();

  const renderRow = (lang: { code: string; name: string }, canSpeak: boolean) => {
    const locked = alwaysOn.includes(lang.code);
    const checked = locked || selected.includes(lang.code);
    return (
      <TouchableOpacity
        key={lang.code}
        activeOpacity={0.7}
        disabled={locked}
        onPress={() => onToggle(lang.code)}
        style={{ minHeight: 52, opacity: locked ? 0.55 : 1 }}
        className="flex-row items-center justify-between px-2"
      >
        <View className="flex-row items-center gap-2">
          <Text style={{ ...typography.bodyLg, color: checked ? colors.accentBlue : colors.textPrimary }}>
            {lang.name}
          </Text>
          {canSpeak && <MaterialIcons name="volume-up" size={16} color={colors.textMuted} />}
          {locked && (
            <Text style={{ ...typography.caption, color: colors.textMuted }}>IN USE</Text>
          )}
        </View>
        <MaterialIcons
          name={checked ? 'check-box' : 'check-box-outline-blank'}
          size={22}
          color={checked ? colors.accentBlue : colors.textMuted}
        />
      </TouchableOpacity>
    );
  };

  const sectionHeader = (label: string) => (
    <Text style={{ ...typography.label, color: colors.textMuted }} className="mb-1 mt-3 px-2">
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
          <View style={{ backgroundColor: colors.border }} className="self-center w-10 h-1 rounded-full mb-4" />
          <Text style={{ ...typography.h4, color: colors.textPrimary }} className="mb-1">
            Available offline
          </Text>
          <Text style={{ ...typography.caption, color: colors.textMuted }} className="mb-3">
            DOWNLOADS ONCE · THEN NO INTERNET NEEDED
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {sectionHeader('READ ALOUD + TRANSLATE')}
            {SPEAK_LANGS.map((lang) => renderRow(lang, true))}
            {sectionHeader('TRANSLATE ONLY')}
            {TRANSLATE_LANGS.map((lang) => renderRow(lang, false))}
          </ScrollView>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{ backgroundColor: colors.accentBlue, borderRadius: 14, height: 50 }}
            className="items-center justify-center mt-4"
          >
            <Text style={{ ...typography.h4, color: '#ffffff' }}>Done</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
