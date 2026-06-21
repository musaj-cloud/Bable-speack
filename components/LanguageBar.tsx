import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { typography } from '@/constants/typography';
import { getLanguageName } from '@/data/languages';
import { useTheme } from '@/hooks/useTheme';
import { useLanguageStore } from '@/store/useLanguageStore';

type Props = {
  // 'swap' = circular accent swap chip (Converse). 'arrow' = static arrow (Document).
  middle?: 'swap' | 'arrow';
};

// Rounded language-pair pill: tap either side to change the language.
export const LanguageBar = ({ middle = 'swap' }: Props) => {
  const colors = useTheme();
  const { sourceLang, targetLang, setSourceLang, setTargetLang, swap } = useLanguageStore();
  const [picker, setPicker] = useState<'source' | 'target' | null>(null);

  const langButton = (code: string, side: 'source' | 'target') => (
    <TouchableOpacity
      onPress={() => setPicker(side)}
      activeOpacity={0.7}
      accessibilityRole="button"
      style={{ minHeight: 44 }}
      className="flex-row items-center gap-1 px-4 py-2"
    >
      <Text style={{ ...typography.h4, color: colors.textPrimary }}>{getLanguageName(code)}</Text>
      <MaterialIcons name="arrow-drop-down" size={22} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <>
      <View
        style={{
          backgroundColor: colors.bgCard,
          borderRadius: 99,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 3,
        }}
        className="flex-row items-center justify-center self-center px-2 py-1"
      >
        {langButton(sourceLang, 'source')}

        {middle === 'swap' ? (
          <TouchableOpacity
            onPress={swap}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Swap languages"
            style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.bgCardInner }}
            className="items-center justify-center"
          >
            <MaterialIcons name="swap-horiz" size={22} color={colors.accentBlue} />
          </TouchableOpacity>
        ) : (
          <MaterialIcons name="arrow-forward" size={20} color={colors.textMuted} />
        )}

        {langButton(targetLang, 'target')}
      </View>

      <LanguagePickerModal
        visible={picker === 'source'}
        title="I speak"
        selectedCode={sourceLang}
        disabledCode={targetLang}
        side="source"
        onSelect={setSourceLang}
        onClose={() => setPicker(null)}
      />
      <LanguagePickerModal
        visible={picker === 'target'}
        title="Translate to"
        selectedCode={targetLang}
        disabledCode={sourceLang}
        side="target"
        onSelect={setTargetLang}
        onClose={() => setPicker(null)}
      />
    </>
  );
};
