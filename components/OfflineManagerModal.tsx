import { MaterialIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { typography } from '@/constants/typography';
import { LANGUAGES } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { prefetchTranslationModel } from '@/lib/qvac';
import { isTtsSupported } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';

const MAX_SHEET_HEIGHT = Dimensions.get('window').height * 0.7;
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
const SPEAK_LANGS = LANGUAGES.filter((l) => isTtsSupported(l.code)).sort(byName);
const TRANSLATE_LANGS = LANGUAGES.filter((l) => !isTtsSupported(l.code)).sort(byName);
const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

type Props = { visible: boolean; onClose: () => void };

// Settings sheet to download languages for offline use, on demand. Tapping a
// not-yet-downloaded language fetches both EN↔X directions (so it works as
// source or target with no internet), shows progress, then marks it offline.
export const OfflineManagerModal = ({ visible, onClose }: Props) => {
  const colors = useTheme();
  const { sourceLang, targetLang, offlineReady, offlineLangs, markOfflineReady, toggleOfflineLang } =
    useLanguageStore();
  const [busyCode, setBusyCode] = useState<string | null>(null);
  const [pct, setPct] = useState(0);
  const reqId = useRef(0);

  const alwaysOn = [sourceLang, targetLang];
  const isReady = (code: string) => alwaysOn.includes(code) || offlineReady.includes(code);

  const download = async (code: string) => {
    if (busyCode) return; // one download at a time
    const id = ++reqId.current;
    setBusyCode(code);
    setPct(0);
    // Both directions, each half of the bar.
    const tick = (half: number, p: number) => {
      if (reqId.current === id) setPct(clampPct((half + p / 100) * 50));
    };
    const ok1 = await prefetchTranslationModel('en', code, (p) => tick(0, p.percentage));
    const ok2 = await prefetchTranslationModel(code, 'en', (p) => tick(1, p.percentage));
    if (reqId.current !== id) return; // superseded / closed
    if (ok1 && ok2) {
      markOfflineReady(code);
      if (!offlineLangs.includes(code)) toggleOfflineLang(code);
    }
    setBusyCode(null);
  };

  const handleClose = () => {
    reqId.current++;
    setBusyCode(null);
    onClose();
  };

  const renderRow = (lang: { code: string; name: string }, canSpeak: boolean) => {
    const ready = isReady(lang.code);
    const locked = alwaysOn.includes(lang.code);
    const loading = busyCode === lang.code;
    const dim = busyCode !== null && !loading;
    return (
      <TouchableOpacity
        key={lang.code}
        activeOpacity={0.7}
        disabled={ready || loading || dim}
        onPress={() => download(lang.code)}
        style={{ minHeight: 52, opacity: dim ? 0.35 : 1 }}
        className="flex-row items-center justify-between px-2"
      >
        <View className="flex-row items-center gap-2 flex-1">
          <Text style={{ ...typography.bodyLg, color: colors.textPrimary }}>{lang.name}</Text>
          {canSpeak && <MaterialIcons name="volume-up" size={16} color={colors.textMuted} />}
        </View>
        {loading ? (
          <View className="flex-row items-center gap-2">
            <Text style={{ ...typography.mono, color: colors.accentBlue }}>{pct}%</Text>
            <ActivityIndicator size="small" color={colors.accentBlue} />
          </View>
        ) : ready ? (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="cloud-done" size={16} color={colors.success} />
            <Text style={{ ...typography.caption, color: colors.success }}>
              {locked ? 'IN USE' : 'OFFLINE'}
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center gap-1">
            <MaterialIcons name="cloud-download" size={16} color={colors.accentBlue} />
            <Text style={{ ...typography.caption, color: colors.accentBlue }}>DOWNLOAD</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

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
          <View style={{ backgroundColor: colors.border }} className="self-center w-10 h-1 rounded-full mb-4" />
          <Text style={{ ...typography.h4, color: colors.textPrimary }} className="mb-1">
            Offline languages
          </Text>
          <Text style={{ ...typography.caption, color: colors.textMuted }} className="mb-3">
            {busyCode ? 'DOWNLOADING · ON DEVICE' : 'DOWNLOAD ONCE · THEN NO INTERNET NEEDED'}
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
