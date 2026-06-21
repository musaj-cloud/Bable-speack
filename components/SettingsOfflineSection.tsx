import { useState } from 'react';
import { OfflineManagerModal } from '@/components/OfflineManagerModal';
import { SettingsRow } from '@/components/SettingsRow';
import { SettingsSection } from '@/components/SettingsSection';
import { useLanguageStore } from '@/store/useLanguageStore';

// OFFLINE LANGUAGES section: shows how many languages are downloaded for offline
// use and opens a manager to download more. Lets users prepare languages ahead
// of time so switching needs no internet — and know which still require it.
export const SettingsOfflineSection = () => {
  const sourceLang = useLanguageStore((s) => s.sourceLang);
  const targetLang = useLanguageStore((s) => s.targetLang);
  const offlineReady = useLanguageStore((s) => s.offlineReady);
  const [open, setOpen] = useState(false);

  // Distinct languages usable with no internet (the pair is always downloaded).
  const count = new Set([sourceLang, targetLang, ...offlineReady]).size;

  return (
    <SettingsSection title="Offline Languages">
      <SettingsRow
        icon="cloud-done"
        title="Manage offline languages"
        subtitle={`${count} ready offline · download more to avoid internet later`}
        onPress={() => setOpen(true)}
      />
      <OfflineManagerModal visible={open} onClose={() => setOpen(false)} />
    </SettingsSection>
  );
};
