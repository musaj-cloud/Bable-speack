// lib/warmup.ts
// One-time, after-onboarding model preload. Downloads + loads the on-device
// models the Converse flow needs — translation (Bergamot), speech-to-text
// (Whisper + VAD), and the voice (Supertonic) — up front, so the first real use
// is instant and never races a mid-use download (which can crash the shared
// QVAC worklet). Each step is best-effort: a single failure (e.g. an
// unsupported TTS language) is swallowed so it can never block entering the app.
// Models cache to disk, so this truly downloads only once; later loads are fast
// and fully offline.
import { getTranslationModel, isPairSupported, prefetchTranslationModel } from '@/lib/qvac';
import { warmTranscription } from '@/lib/transcription';
import { warmAllVoices } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useSettingsStore } from '@/store/useSettingsStore';

export type WarmupStep = 'speech' | 'translation' | 'languages' | 'voice';

// Progress for the active step: which model is loading and how far its download
// is (0–100). Already-downloaded models emit no events, so the runner brackets
// each step with 0 → 100 itself.
export type WarmupProgress = { step: WarmupStep; percentage: number };

// The ordered steps a caller can render as a checklist. Kept here so the screen
// and the runner agree on the sequence.
export const WARMUP_STEPS: WarmupStep[] = ['speech', 'translation', 'languages', 'voice'];

// The languages to guarantee offline: the live pair plus the user's shortlist.
// Every cross-language pair routes through English, so making each language X
// fully offline means downloading both EN→X and X→EN. English is the pivot, so
// it needs no model of its own.
const offlineLanguageSet = (source: string, target: string, extras: string[]): string[] =>
  [...new Set([source, target, ...extras])].filter((c) => c !== 'en');

const run = async (fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch {
    // Best-effort: a failed preload must never block the user from the app —
    // the model simply loads lazily on first use instead.
  }
};

const clampPct = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

// Preload everything Converse needs for the given language pair. Each step is
// bracketed 0% → (live download %) → 100% and reported via onProgress so the UI
// can show a percentage. A model already cached on disk jumps straight to 100%.
export const prepareConverseModels = async (
  source: string,
  target: string,
  onProgress?: (p: WarmupProgress) => void
): Promise<void> => {
  const step = async (s: WarmupStep, load: (cb: (pct: number) => void) => Promise<unknown>) => {
    onProgress?.({ step: s, percentage: 0 });
    await run(() => load((pct) => onProgress?.({ step: s, percentage: clampPct(pct) })));
    onProgress?.({ step: s, percentage: 100 });
  };

  // Speech-to-text (Whisper + Silero VAD) for the spoken source language.
  await step('speech', (cb) => warmTranscription(source, (p) => cb(p.percentage)));

  // Translation model for the chosen pair (a pivot loads both hops at once).
  await step('translation', (cb) =>
    isPairSupported(source, target)
      ? getTranslationModel(source, target, (p) => cb(p.percentage))
      : Promise.resolve()
  );

  // Make every offline language (the live pair + the user's shortlist) fully
  // downloaded both ways, so switching to any of them later — and swapping — is
  // fully offline. Download-only (freed from RAM after); each that lands on disk
  // both ways is marked offline-ready so the pickers can badge it. Progress is
  // the share of directions done plus the active download.
  await step('languages', async (cb) => {
    const { offlineLangs, markOfflineReady } = useLanguageStore.getState();
    const langs = offlineLanguageSet(source, target, offlineLangs);
    const total = Math.max(langs.length * 2, 1);
    let done = 0;
    const tick = (p: number) => cb(((done + p / 100) / total) * 100);
    for (const x of langs) {
      const ok1 = await prefetchTranslationModel('en', x, (p) => tick(p.percentage));
      done++;
      const ok2 = await prefetchTranslationModel(x, 'en', (p) => tick(p.percentage));
      done++;
      if (ok1 && ok2) markOfflineReady(x);
    }
  });

  // The on-device voices. Download every supported voice now (one shared model
  // file), not just the current target's — so switching languages later never
  // needs internet again to read a translation aloud.
  await step('voice', (cb) => {
    const { ttsSpeed } = useSettingsStore.getState();
    return warmAllVoices(ttsSpeed, (p) => cb(p.percentage));
  });
};
