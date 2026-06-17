// lib/qvac.ts
// QVAC SDK model loading for Bergamot neural machine translation.
// A model is loaded once per language pair, cached, and reused.
// Everything runs on-device — no network, no API keys.
import {
  BERGAMOT_DE_EN,
  BERGAMOT_EN_DE,
  BERGAMOT_EN_ES,
  BERGAMOT_EN_FR,
  BERGAMOT_EN_JA,
  BERGAMOT_EN_KO,
  BERGAMOT_EN_ZH,
  BERGAMOT_ES_EN,
  BERGAMOT_FR_EN,
  BERGAMOT_JA_EN,
  BERGAMOT_KO_EN,
  BERGAMOT_ZH_EN,
  loadModel,
  unloadModel,
} from '@qvac/sdk';

// Bergamot ships only English↔X models. Cross-language pairs (e.g. fr→ja)
// pivot through English automatically via modelConfig.pivotModel.
type ModelSrc =
  | typeof BERGAMOT_EN_DE
  | typeof BERGAMOT_EN_ES
  | typeof BERGAMOT_EN_FR
  | typeof BERGAMOT_EN_JA
  | typeof BERGAMOT_EN_KO
  | typeof BERGAMOT_EN_ZH
  | typeof BERGAMOT_DE_EN
  | typeof BERGAMOT_ES_EN
  | typeof BERGAMOT_FR_EN
  | typeof BERGAMOT_JA_EN
  | typeof BERGAMOT_KO_EN
  | typeof BERGAMOT_ZH_EN;

// Bergamot generation parameters (shared by a model and its optional pivot).
type BergamotGen = {
  beamsize?: number;
  normalize?: number;
  temperature?: number;
  norepeatngramsize?: number;
  lengthpenalty?: number;
};

// modelConfig for an on-device Bergamot translation model.
type BergamotConfig = BergamotGen & {
  engine: 'Bergamot';
  from: string;
  to: string;
  pivotModel?: BergamotGen & { modelSrc: ModelSrc };
};

// loadModel's overloads infer modelConfig from a single literal descriptor; our
// language pair is resolved dynamically (a looked-up ModelSrc union), which the
// overloads can't narrow. We call through a precisely typed alias instead — the
// runtime shape matches the official QVAC Bergamot example exactly.
const loadTranslationModelRaw = loadModel as unknown as (options: {
  modelSrc: ModelSrc;
  modelConfig: BergamotConfig;
}) => Promise<string>;

// English → X
const FROM_EN: Record<string, ModelSrc> = {
  de: BERGAMOT_EN_DE,
  es: BERGAMOT_EN_ES,
  fr: BERGAMOT_EN_FR,
  ja: BERGAMOT_EN_JA,
  ko: BERGAMOT_EN_KO,
  zh: BERGAMOT_EN_ZH,
};

// X → English
const TO_EN: Record<string, ModelSrc> = {
  de: BERGAMOT_DE_EN,
  es: BERGAMOT_ES_EN,
  fr: BERGAMOT_FR_EN,
  ja: BERGAMOT_JA_EN,
  ko: BERGAMOT_KO_EN,
  zh: BERGAMOT_ZH_EN,
};

// True when we can translate the pair directly or via an English pivot.
export const isPairSupported = (from: string, to: string): boolean =>
  from === to ||
  (from === 'en' && to in FROM_EN) ||
  (to === 'en' && from in TO_EN) ||
  (from in TO_EN && to in FROM_EN);

// Bergamot generation tuning (mirrors the QVAC reference example).
const GEN = {
  beamsize: 1,
  normalize: 1,
  temperature: 0.2,
  norepeatngramsize: 3,
  lengthpenalty: 1.2,
} as const;

const loadPair = (from: string, to: string): Promise<string> => {
  // Direct English → X
  if (from === 'en') {
    return loadTranslationModelRaw({
      modelSrc: FROM_EN[to],
      modelConfig: { engine: 'Bergamot', from, to, ...GEN },
    });
  }
  // Direct X → English
  if (to === 'en') {
    return loadTranslationModelRaw({
      modelSrc: TO_EN[from],
      modelConfig: { engine: 'Bergamot', from, to, ...GEN },
    });
  }
  // Pivot X → English → Y (SDK chains the two models internally)
  return loadTranslationModelRaw({
    modelSrc: TO_EN[from],
    modelConfig: {
      engine: 'Bergamot',
      from,
      to,
      ...GEN,
      pivotModel: { modelSrc: FROM_EN[to], ...GEN },
    },
  });
};

// One in-flight/loaded promise per pair so concurrent callers share the load.
const cache = new Map<string, Promise<string>>();
const key = (from: string, to: string) => `${from}-${to}`;

// Returns a loaded modelId for the pair, loading + caching on first use.
export const getTranslationModel = (from: string, to: string): Promise<string> => {
  const k = key(from, to);
  let model = cache.get(k);
  if (!model) {
    model = loadPair(from, to).catch((err) => {
      cache.delete(k); // drop the failed promise so the next call can retry
      throw err;
    });
    cache.set(k, model);
  }
  return model;
};

// Free device memory — call when the app goes to the background.
export const unloadAllModels = async (): Promise<void> => {
  const loads = [...cache.values()];
  cache.clear();
  for (const load of loads) {
    try {
      const modelId = await load;
      await unloadModel({ modelId });
    } catch {
      // Model never finished loading — nothing to unload.
    }
  }
};
