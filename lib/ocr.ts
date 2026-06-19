// lib/ocr.ts
// On-device optical character recognition via QVAC (Phase 3 / Document mode).
// A script-specific recognizer (Latin, Cyrillic, CJK, …) is loaded once per
// source language, cached, and reused. The photographed image is read locally
// — it never leaves the device.
import {
  loadModel,
  ocr,
  unloadModel,
  OCR_LATIN_RECOGNIZER_1,
  OCR_CYRILLIC_RECOGNIZER,
  OCR_ARABIC_RECOGNIZER,
  OCR_DEVANAGARI_RECOGNIZER,
  OCR_BENGALI_RECOGNIZER,
  OCR_JAPANESE_RECOGNIZER,
  OCR_KOREAN_RECOGNIZER,
  OCR_ZH_SIM_RECOGNIZER,
  OCR_KANNADA_RECOGNIZER,
  OCR_TAMIL_RECOGNIZER,
  OCR_TELUGU_RECOGNIZER,
  OCR_THAI_RECOGNIZER,
} from '@qvac/sdk';

// A recognizer + the EasyOCR language hint baked into it at load time. Codes
// are EasyOCR's (mostly ISO, but a few differ — e.g. zh -> ch_sim).
type Recognizer = { modelSrc: object; langList: string[] };

// Latin-script languages all share one recognizer (charset selected by langList).
const latin = (code: string): Recognizer => ({ modelSrc: OCR_LATIN_RECOGNIZER_1, langList: [code] });

// Source language code -> the recognizer that can read its script. Only scripts
// QVAC ships a recognizer for are listed; anything else is unsupported (the UI
// shows the photo but cannot extract text — see isOcrSupported).
const RECOGNIZERS: Record<string, Recognizer> = {
  // Latin
  en: latin('en'), sq: latin('sq'), az: latin('az'), bs: latin('bs'),
  ca: latin('ca'), hr: latin('hr'), cs: latin('cs'), da: latin('da'),
  nl: latin('nl'), et: latin('et'), fi: latin('fi'), fr: latin('fr'),
  de: latin('de'), hu: latin('hu'), is: latin('is'), id: latin('id'),
  it: latin('it'), lv: latin('lv'), lt: latin('lt'), ms: latin('ms'),
  no: latin('no'), pl: latin('pl'), pt: latin('pt'), ro: latin('ro'),
  sk: latin('sk'), sl: latin('sl'), es: latin('es'), sv: latin('sv'),
  tr: latin('tr'), vi: latin('vi'),
  // Cyrillic
  bg: { modelSrc: OCR_CYRILLIC_RECOGNIZER, langList: ['bg'] },
  ru: { modelSrc: OCR_CYRILLIC_RECOGNIZER, langList: ['ru'] },
  sr: { modelSrc: OCR_CYRILLIC_RECOGNIZER, langList: ['rs_cyrillic'] },
  uk: { modelSrc: OCR_CYRILLIC_RECOGNIZER, langList: ['uk'] },
  // Arabic script
  ar: { modelSrc: OCR_ARABIC_RECOGNIZER, langList: ['ar'] },
  fa: { modelSrc: OCR_ARABIC_RECOGNIZER, langList: ['fa'] },
  // Brahmic / South Asian
  hi: { modelSrc: OCR_DEVANAGARI_RECOGNIZER, langList: ['hi'] },
  bn: { modelSrc: OCR_BENGALI_RECOGNIZER, langList: ['bn'] },
  kn: { modelSrc: OCR_KANNADA_RECOGNIZER, langList: ['kn'] },
  ta: { modelSrc: OCR_TAMIL_RECOGNIZER, langList: ['ta'] },
  te: { modelSrc: OCR_TELUGU_RECOGNIZER, langList: ['te'] },
  th: { modelSrc: OCR_THAI_RECOGNIZER, langList: ['th'] },
  // CJK
  zh: { modelSrc: OCR_ZH_SIM_RECOGNIZER, langList: ['ch_sim'] },
  ja: { modelSrc: OCR_JAPANESE_RECOGNIZER, langList: ['ja'] },
  ko: { modelSrc: OCR_KOREAN_RECOGNIZER, langList: ['ko'] },
};

// True when we ship a recognizer for the language's script.
export const isOcrSupported = (lang: string): boolean => lang in RECOGNIZERS;

// OCR model load config (subset of the QVAC reference example). No GPU flags —
// the on-device runtime runs these models on CPU.
type OcrConfig = {
  langList?: string[];
  useGPU?: boolean;
  magRatio?: number;
  lowConfidenceThreshold?: number;
  recognizerBatchSize?: number;
};

// Same loadModel overload gotcha as the other QVAC models — a model descriptor
// resolved at runtime defeats the literal-based overload inference, so we call
// through a precisely typed alias. Runtime shape matches the QVAC OCR example.
const loadOcrRaw = loadModel as unknown as (options: {
  modelSrc: object;
  modelConfig: OcrConfig;
}) => Promise<string>;

const OCR_GEN: OcrConfig = {
  useGPU: false,
  magRatio: 1.5,
  lowConfidenceThreshold: 0.4,
  recognizerBatchSize: 1,
};

// One loaded recognizer per source language (langList is baked in at load).
const cache = new Map<string, Promise<string>>();

const getOcrModel = (lang: string): Promise<string> => {
  const recognizer = RECOGNIZERS[lang];
  if (!recognizer) throw new Error('Text recognition is not available for this language yet.');

  let model = cache.get(lang);
  if (!model) {
    model = loadOcrRaw({
      modelSrc: recognizer.modelSrc,
      modelConfig: { ...OCR_GEN, langList: recognizer.langList },
    }).catch((err) => {
      cache.delete(lang); // drop the failed load so the next call can retry
      throw err;
    });
    cache.set(lang, model);
  }
  return model;
};

// The recognizer opens a real filesystem path — strip the file:// URI scheme.
const toPath = (uri: string): string => uri.replace(/^file:\/\//, '');

// Read all text from an image, treating it as written in `lang`. Blocks are
// joined top-to-bottom into a single readable string.
export const recognizeText = async (uri: string, lang: string): Promise<string> => {
  const modelId = await getOcrModel(lang);
  const { blocks } = ocr({ modelId, image: toPath(uri), options: { paragraph: true } });
  const result = await blocks;
  return result
    .map((b) => b.text.trim())
    .filter(Boolean)
    .join('\n')
    .trim();
};

// Free OCR memory — call when the app goes to the background.
export const unloadOcrModels = async (): Promise<void> => {
  const loads = [...cache.values()];
  cache.clear();
  for (const load of loads) {
    try {
      await unloadModel({ modelId: await load });
    } catch {
      // Model never finished loading — nothing to unload.
    }
  }
};
