import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { useLanguageStore } from '@/store/useLanguageStore';
import { OfflineLanguagesModal } from './OfflineLanguagesModal';

// Onboarding card: choose extra languages to download for offline use. Source +
// target are always included (shown as locked chips); anything added here is
// pre-downloaded on the "Getting things ready" screen so switching to it later
// needs no internet. Manages its own modal so the screen stays thin.
export const OfflineLanguagesPicker = () => {
  const colors = useTheme();
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const offlineLangs = useLanguageStore((s) => s.offlineLangs);
  const toggleOfflineLang = useLanguageStore((s) => s.toggleOfflineLang);
  const [open, setOpen] = useState(false);

  // Always-on languages (the pair), de-duplicated. Extras exclude these so a
  // language never shows as both locked and removable.
  const alwaysOn = sourceLang === targetLang ? [sourceLang] : [sourceLang, targetLang];
  const extras = offlineLangs.filter((c) => !alwaysOn.includes(c));

  const chip = (code: string, locked: boolean) => (
    <View
      key={code}
      style={{
        backgroundColor: locked ? colors.bgCardInner : colors.accentLight,
        borderRadius: 99,
      }}
      className="flex-row items-center gap-1.5 px-3 py-1.5"
    >
      <Text style={{ ...typography.bodySm, color: locked ? colors.textSecondary : colors.accentBlue }}>
        {getLanguageName(code)}
      </Text>
      {locked ? (
        <MaterialIcons name="lock" size={13} color={colors.textMuted} />
      ) : (
        <TouchableOpacity onPress={() => toggleOfflineLang(code)} hitSlop={8}>
          <MaterialIcons name="close" size={14} color={colors.accentBlue} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1, borderRadius: 20 }}
      className="p-4 gap-3"
    >
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="cloud-done" size={18} color={colors.success} />
        <Text style={{ ...typography.h4, color: colors.textPrimary }} className="flex-1">
          Available offline
        </Text>
      </View>
      <Text style={{ ...typography.bodySm, color: colors.textSecondary }}>
        Downloaded once now, then switch between these with no internet.
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {alwaysOn.map((c) => chip(c, true))}
        {extras.map((c) => chip(c, false))}
      </View>

      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        style={{ borderColor: colors.accentBlue, borderWidth: 1, borderRadius: 12, minHeight: 44 }}
        className="flex-row items-center justify-center gap-1.5"
      >
        <MaterialIcons name="add" size={18} color={colors.accentBlue} />
        <Text style={{ ...typography.label, color: colors.accentBlue }}>ADD LANGUAGES</Text>
      </TouchableOpacity>

      <OfflineLanguagesModal
        visible={open}
        selected={extras}
        alwaysOn={alwaysOn}
        onToggle={toggleOfflineLang}
        onClose={() => setOpen(false)}
      />
    </View>
  );
};
