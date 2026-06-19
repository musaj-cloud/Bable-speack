// lib/qvac.ts
// QVAC SDK model loading for Bergamot neural machine translation.
// A model is loaded once per language pair, cached, and reused.
// Everything runs on-device — no network, no API keys.
//
// Bergamot ships only English↔X models, so we keep two maps: English→X and
// X→English. Cross-language pairs (e.g. fr→ja) pivot through English via
// modelConfig.pivotModel. Every code below is fully bidirectional and matches
// the languages exposed in data/languages.ts.
import {
  loadModel,
  unloadModel,
  BERGAMOT_EN_AR, BERGAMOT_AR_EN,
  BERGAMOT_EN_AZ, BERGAMOT_AZ_EN,
  BERGAMOT_EN_BG, BERGAMOT_BG_EN,
  BERGAMOT_EN_BN, BERGAMOT_BN_EN,
  BERGAMOT_EN_BS, BERGAMOT_BS_EN,
  BERGAMOT_EN_CA, BERGAMOT_CA_EN,
  BERGAMOT_EN_CS, BERGAMOT_CS_EN,
  BERGAMOT_EN_DA, BERGAMOT_DA_EN,
  BERGAMOT_EN_DE, BERGAMOT_DE_EN,
  BERGAMOT_EN_EL, BERGAMOT_EL_EN,
  BERGAMOT_EN_ES, BERGAMOT_ES_EN,
  BERGAMOT_EN_ET, BERGAMOT_ET_EN,
  BERGAMOT_EN_FA, BERGAMOT_FA_EN,
  BERGAMOT_EN_FI, BERGAMOT_FI_EN,
  BERGAMOT_EN_FR, BERGAMOT_FR_EN,
  BERGAMOT_EN_GU, BERGAMOT_GU_EN,
  BERGAMOT_EN_HE, BERGAMOT_HE_EN,
  BERGAMOT_EN_HI, BERGAMOT_HI_EN,
  BERGAMOT_EN_HR, BERGAMOT_HR_EN,
  BERGAMOT_EN_HU, BERGAMOT_HU_EN,
  BERGAMOT_EN_ID, BERGAMOT_ID_EN,
  BERGAMOT_EN_IS, BERGAMOT_IS_EN,
  BERGAMOT_EN_IT, BERGAMOT_IT_EN,
  BERGAMOT_EN_JA, BERGAMOT_JA_EN,
  BERGAMOT_EN_KN, BERGAMOT_KN_EN,
  BERGAMOT_EN_KO, BERGAMOT_KO_EN,
  BERGAMOT_EN_LT, BERGAMOT_LT_EN,
  BERGAMOT_EN_LV, BERGAMOT_LV_EN,
  BERGAMOT_EN_ML, BERGAMOT_ML_EN,
  BERGAMOT_EN_MS, BERGAMOT_MS_EN,
  BERGAMOT_EN_NL, BERGAMOT_NL_EN,
  BERGAMOT_EN_NO, BERGAMOT_NO_EN,
  BERGAMOT_EN_PL, BERGAMOT_PL_EN,
  BERGAMOT_EN_PT, BERGAMOT_PT_EN,
  BERGAMOT_EN_RO, BERGAMOT_RO_EN,
  BERGAMOT_EN_RU, BERGAMOT_RU_EN,
  BERGAMOT_EN_SK, BERGAMOT_SK_EN,
  BERGAMOT_EN_SL, BERGAMOT_SL_EN,
  BERGAMOT_EN_SQ, BERGAMOT_SQ_EN,
  BERGAMOT_EN_SR, BERGAMOT_SR_EN,
  BERGAMOT_EN_SV, BERGAMOT_SV_EN,
  BERGAMOT_EN_TA, BERGAMOT_TA_EN,
  BERGAMOT_EN_TE, BERGAMOT_TE_EN,
  BERGAMOT_EN_TH, BERGAMOT_TH_EN,
  BERGAMOT_EN_TR, BERGAMOT_TR_EN,
  BERGAMOT_EN_UK, BERGAMOT_UK_EN,
  BERGAMOT_EN_VI, BERGAMOT_VI_EN,
  BERGAMOT_EN_ZH, BERGAMOT_ZH_EN,
} from '@qvac/sdk';

// English → X (used directly and as the second hop of a pivot).
const FROM_EN = {
  ar: BERGAMOT_EN_AR,
  az: BERGAMOT_EN_AZ,
  bg: BERGAMOT_EN_BG,
  bn: BERGAMOT_EN_BN,
  bs: BERGAMOT_EN_BS,
  ca: BERGAMOT_EN_CA,
  cs: BERGAMOT_EN_CS,
  da: BERGAMOT_EN_DA,
  de: BERGAMOT_EN_DE,
  el: BERGAMOT_EN_EL,
  es: BERGAMOT_EN_ES,
  et: BERGAMOT_EN_ET,
  fa: BERGAMOT_EN_FA,
  fi: BERGAMOT_EN_FI,
  fr: BERGAMOT_EN_FR,
  gu: BERGAMOT_EN_GU,
  he: BERGAMOT_EN_HE,
  hi: BERGAMOT_EN_HI,
  hr: BERGAMOT_EN_HR,
  hu: BERGAMOT_EN_HU,
  id: BERGAMOT_EN_ID,
  is: BERGAMOT_EN_IS,
  it: BERGAMOT_EN_IT,
  ja: BERGAMOT_EN_JA,
  kn: BERGAMOT_EN_KN,
  ko: BERGAMOT_EN_KO,
  lt: BERGAMOT_EN_LT,
  lv: BERGAMOT_EN_LV,
  ml: BERGAMOT_EN_ML,
  ms: BERGAMOT_EN_MS,
  nl: BERGAMOT_EN_NL,
  no: BERGAMOT_EN_NO,
  pl: BERGAMOT_EN_PL,
  pt: BERGAMOT_EN_PT,
  ro: BERGAMOT_EN_RO,
  ru: BERGAMOT_EN_RU,
  sk: BERGAMOT_EN_SK,
  sl: BERGAMOT_EN_SL,
  sq: BERGAMOT_EN_SQ,
  sr: BERGAMOT_EN_SR,
  sv: BERGAMOT_EN_SV,
  ta: BERGAMOT_EN_TA,
  te: BERGAMOT_EN_TE,
  th: BERGAMOT_EN_TH,
  tr: BERGAMOT_EN_TR,
  uk: BERGAMOT_EN_UK,
  vi: BERGAMOT_EN_VI,
  zh: BERGAMOT_EN_ZH,
} as const;

// X → English (used directly and as the first hop of a pivot).
const TO_EN = {
  ar: BERGAMOT_AR_EN,
  az: BERGAMOT_AZ_EN,
  bg: BERGAMOT_BG_EN,
  bn: BERGAMOT_BN_EN,
  bs: BERGAMOT_BS_EN,
  ca: BERGAMOT_CA_EN,
  cs: BERGAMOT_CS_EN,
  da: BERGAMOT_DA_EN,
  de: BERGAMOT_DE_EN,
  el: BERGAMOT_EL_EN,
  es: BERGAMOT_ES_EN,
  et: BERGAMOT_ET_EN,
  fa: BERGAMOT_FA_EN,
  fi: BERGAMOT_FI_EN,
  fr: BERGAMOT_FR_EN,
  gu: BERGAMOT_GU_EN,
  he: BERGAMOT_HE_EN,
  hi: BERGAMOT_HI_EN,
  hr: BERGAMOT_HR_EN,
  hu: BERGAMOT_HU_EN,
  id: BERGAMOT_ID_EN,
  is: BERGAMOT_IS_EN,
  it: BERGAMOT_IT_EN,
  ja: BERGAMOT_JA_EN,
  kn: BERGAMOT_KN_EN,
  ko: BERGAMOT_KO_EN,
  lt: BERGAMOT_LT_EN,
  lv: BERGAMOT_LV_EN,
  ml: BERGAMOT_ML_EN,
  ms: BERGAMOT_MS_EN,
  nl: BERGAMOT_NL_EN,
  no: BERGAMOT_NO_EN,
  pl: BERGAMOT_PL_EN,
  pt: BERGAMOT_PT_EN,
  ro: BERGAMOT_RO_EN,
  ru: BERGAMOT_RU_EN,
  sk: BERGAMOT_SK_EN,
  sl: BERGAMOT_SL_EN,
  sq: BERGAMOT_SQ_EN,
  sr: BERGAMOT_SR_EN,
  sv: BERGAMOT_SV_EN,
  ta: BERGAMOT_TA_EN,
  te: BERGAMOT_TE_EN,
  th: BERGAMOT_TH_EN,
  tr: BERGAMOT_TR_EN,
  uk: BERGAMOT_UK_EN,
  vi: BERGAMOT_VI_EN,
  zh: BERGAMOT_ZH_EN,
} as const;

// A loadable Bergamot model descriptor (union derived from the maps above, so
// it stays in sync automatically as languages are added or removed).
type LangCode = keyof typeof FROM_EN;
type ModelSrc = (typeof FROM_EN)[LangCode] | (typeof TO_EN)[LangCode];

// Typed lookups — codes are validated by isPairSupported before use.
const fromEn = (code: string): ModelSrc => FROM_EN[code as LangCode];
const toEn = (code: string): ModelSrc => TO_EN[code as LangCode];

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
      modelSrc: fromEn(to),
      modelConfig: { engine: 'Bergamot', from, to, ...GEN },
    });
  }
  // Direct X → English
  if (to === 'en') {
    return loadTranslationModelRaw({
      modelSrc: toEn(from),
      modelConfig: { engine: 'Bergamot', from, to, ...GEN },
    });
  }
  // Pivot X → English → Y (SDK chains the two models internally)
  return loadTranslationModelRaw({
    modelSrc: toEn(from),
    modelConfig: {
      engine: 'Bergamot',
      from,
      to,
      ...GEN,
      pivotModel: { modelSrc: fromEn(to), ...GEN },
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
