import { useState } from 'react';
import { LanguagePickerModal } from '@/components/LanguagePickerModal';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { getLanguageName } from '@/data/languages';
import { useLanguageStore } from '@/store/useLanguageStore';

type Open = 'source' | 'target' | null;

// LANGUAGE section: default source + target language, each opening a picker.
export const SettingsLanguageSection = () => {
  const { sourceLang, targetLang, setSourceLang, setTargetLang } = useLanguageStore();
  const [open, setOpen] = useState<Open>(null);

  return (
    <SettingsSection title="Language">
      <SettingsRow
        icon="translate"
        title="Default Source"
        subtitle={getLanguageName(sourceLang)}
        onPress={() => setOpen('source')}
      />
      <SettingsRow
        icon="g-translate"
        title="Default Target"
        subtitle={getLanguageName(targetLang)}
        onPress={() => setOpen('target')}
      />

      <LanguagePickerModal
        visible={open === 'source'}
        title="Default source language"
        selectedCode={sourceLang}
        disabledCode={targetLang}
        side="source"
        onSelect={setSourceLang}
        onClose={() => setOpen(null)}
      />
      <LanguagePickerModal
        visible={open === 'target'}
        title="Default target language"
        selectedCode={targetLang}
        disabledCode={sourceLang}
        side="target"
        onSelect={setTargetLang}
        onClose={() => setOpen(null)}
      />
    </SettingsSection>
  );
};
