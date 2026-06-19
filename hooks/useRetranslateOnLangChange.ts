// hooks/useRetranslateOnLangChange.ts
// Keeps the Converse translation in sync with the language pair. When the user
// changes the source or target language while a translation is on screen, the
// existing source text is re-translated into the new pair — so you never see a
// stale Arabic result sitting under a freshly-picked Korean label.
//
// A swap is special: the current translation already holds the reverse
// direction, so we just flip the two cards instead of re-running the model.
import { useEffect, useRef } from 'react';
import { useConverseStore } from '@/store/useConverseStore';

export const useRetranslateOnLangChange = (sourceLang: string, targetLang: string) => {
  const prev = useRef({ sourceLang, targetLang });

  useEffect(() => {
    const before = prev.current;
    prev.current = { sourceLang, targetLang };

    // Nothing changed (first run), or the pair is unchanged.
    if (before.sourceLang === sourceLang && before.targetLang === targetLang) return;

    // Only act when there's a finished result to keep consistent.
    const { sourceText, status, swapText, runTranslation } = useConverseStore.getState();
    if (!sourceText || (status !== 'ready' && status !== 'error')) return;

    // Swap (the two sides traded places): reuse the existing translation.
    if (before.sourceLang === targetLang && before.targetLang === sourceLang) {
      swapText();
      return;
    }

    // Single-side change: re-translate the current source text into the new
    // pair. autoSave: false — this only keeps the on-screen result consistent,
    // it shouldn't write a new history entry on every language tweak.
    void runTranslation(sourceLang, targetLang, { autoSave: false });
  }, [sourceLang, targetLang]);
};
