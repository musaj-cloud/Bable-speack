import { useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { LanguagePickerRow } from '@/components/LanguagePickerRow';
import { typography } from '@/constants/typography';
import { LANGUAGES } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { getTranslationModel, isPairSupported } from '@/lib/qvac';
import { isTtsSupported } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';

// Cap the sheet at ~70% of the screen so the long language list scrolls
// inside it instead of overflowing past the bottom edge.
const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.7;

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

// Languages split into two groups: ones with an offline read-aloud voice show
// first, then the translate-only ones. Each group is sorted alphabetically.
const SPEAK_LANGS = LANGUAGES.filter((l) => isTtsSupported(l.code)).sort(byName);
const TRANSLATE_LANGS = LANGUAGES.filter((l) => !isTtsSupported(l.code)).sort(byName);

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

type Props = {
  visible: boolean;
  title: string;
  selectedCode: string;
  disabledCode?: string; // prevent picking the same language as the other side
  side?: 'source' | 'target'; // which half of the pair this picker changes
  onSelect: (code: string) => void;
  onClose: () => void;
};

// Bottom-sheet style language list. Custom-built to avoid new dependencies.
// Picking a language first downloads that pair's translation model (showing
// progress on the row), then applies the selection — so by the time the sheet
// closes the language is ready to use offline.
export const LanguagePickerModal = ({
  visible,
  title,
  selectedCode,
  disabledCode,
  side,
  onSelect,
  onClose,
}: Props) => {
  const colors = useTheme();
  const offlineReady = useLanguageStore((s) => s.offlineReady);
  const markOfflineReady = useLanguageStore((s) => s.markOfflineReady);
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [pct, setPct] = useState(0);

  // A language is usable with no internet when English (the pivot) or already
  // downloaded. Only shown on the in-app pickers (side set) where picking it
  // actually triggers a download — onboarding handles offline langs separately.
  const isOffline = (code: string) => code === 'en' || offlineReady.includes(code);
  // Bumped on each pick / close so a superseded or cancelled download can't
  // apply its selection after the fact.
  const reqId = useRef(0);

  // Resolve the language pair this pick would form, so we can preload it.
  const pairFor = (code: string): [string, string] | null => {
    if (!side || !disabledCode) return null;
    return side === 'source' ? [code, disabledCode] : [disabledCode, code];
  };

  const finish = (id: number, code: string) => {
    if (reqId.current !== id) return; // cancelled or superseded
    setBusyCode(null);
    onSelect(code);
    onClose();
  };

  const handlePick = async (code: string) => {
    if (busyCode) return; // a download is already in flight
    const pair = pairFor(code);
    // Already-selected, or nothing to preload → apply immediately.
    if (code === selectedCode || !pair || !isPairSupported(pair[0], pair[1])) {
      onSelect(code);
      onClose();
      return;
    }
    const id = ++reqId.current;
    setBusyCode(code);
    setPct(0);
    try {
      await getTranslationModel(pair[0], pair[1], (p) => {
        if (reqId.current === id) setPct(clampPct(p.percentage));
      });
      // On disk now — remember it so the badge flips to "offline".
      markOfflineReady(code);
    } catch {
      // Download failed — apply anyway; it retries lazily on first use.
    }
    finish(id, code);
  };

  const handleClose = () => {
    reqId.current++; // invalidate any in-flight download's selection
    setBusyCode(null);
    onClose();
  };

  const renderRow = (lang: { code: string; name: string }, canSpeak: boolean) => (
    <LanguagePickerRow
      key={lang.code}
      name={lang.name}
      canSpeak={canSpeak}
      selected={lang.code === selectedCode}
      disabled={lang.code === disabledCode || (busyCode !== null && busyCode !== lang.code)}
      loading={busyCode === lang.code}
      pct={pct}
      // Hint only on download-on-pick pickers (side set), for languages not yet
      // downloaded — so the user knows it'll need internet.
      needsInternet={!!side && !isOffline(lang.code)}
      onPress={() => handlePick(lang.code)}
    />
  );

  const sectionHeader = (label: string) => (
    <Text style={{ ...typography.label, color: colors.textMuted }} className="mb-1 mt-3 px-2">
      {label}
    </Text>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <Pressable
        onPress={handleClose}
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
          <Text style={{ ...typography.h4, color: colors.textPrimary }} className="mb-1">
            {title}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textMuted }} className="mb-3">
            {busyCode
              ? pct > 0
                ? 'DOWNLOADING · ON DEVICE'
                : 'PREPARING · ON DEVICE'
              : 'DOWNLOADS ONCE · THEN OFFLINE'}
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
