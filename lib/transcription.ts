// lib/transcription.ts
// On-device speech-to-text via QVAC Whisper (whisper-tiny, multilingual).
// A model is loaded once per source language, cached, and reused. Everything
// runs locally — the recorded audio never leaves the device.
import { loadModel, transcribe, transcribeStream, unloadModel, WHISPER_TINY } from '@qvac/sdk';

// Whisper generation config (mobile-friendly subset of the QVAC reference
// example — no GPU flags, single fast greedy pass).
type WhisperConfig = {
  language?: string;
  n_threads?: number;
  translate?: boolean;
  no_timestamps?: boolean;
  suppress_blank?: boolean;
  suppress_nst?: boolean;
  temperature?: number;
};

// Same loadModel overload gotcha as Bergamot/embeddings: a model descriptor
// resolved at runtime defeats the literal-based overload inference, so we call
// through a precisely typed alias. Runtime shape matches the QVAC example.
const loadWhisperRaw = loadModel as unknown as (options: {
  modelSrc: typeof WHISPER_TINY;
  modelConfig: WhisperConfig;
}) => Promise<string>;

const WHISPER_GEN: WhisperConfig = {
  n_threads: 4,
  translate: false,
  no_timestamps: true,
  suppress_blank: true,
  suppress_nst: true,
  temperature: 0,
};

// One loaded whisper model per source language (language is baked in at load).
const cache = new Map<string, Promise<string>>();

const getWhisperModel = (lang: string): Promise<string> => {
  let model = cache.get(lang);
  if (!model) {
    model = loadWhisperRaw({
      modelSrc: WHISPER_TINY,
      modelConfig: { ...WHISPER_GEN, language: lang },
    }).catch((err) => {
      cache.delete(lang); // drop the failed load so the next call can retry
      throw err;
    });
    cache.set(lang, model);
  }
  return model;
};

// whisper.cpp opens a real filesystem path — strip the file:// URI scheme.
const toPath = (uri: string): string => uri.replace(/^file:\/\//, '');

// Transcribe a recorded audio file into text, spoken in `lang`.
export const transcribeFile = async (uri: string, lang: string): Promise<string> => {
  const modelId = await getWhisperModel(lang);
  const text = await transcribe({ modelId, audioChunk: toPath(uri) });
  return text.trim();
};

// Open a live, bidirectional transcription session for real-time Converse.
// Reuses the same per-language Whisper model as transcribeFile. Feed it mic PCM
// via session.write(Uint8Array) and iterate it for events; emitVadEvents makes
// the model emit its own end-of-turn signal (smarter than a volume threshold).
// endOfTurnSilenceMs is how long a pause must last before the turn is "done".
export const createTranscribeSession = async (lang: string) => {
  const modelId = await getWhisperModel(lang);
  return transcribeStream({ modelId, emitVadEvents: true, endOfTurnSilenceMs: 800 });
};

// Free whisper memory — call when the app goes to the background.
export const unloadTranscriptionModels = async (): Promise<void> => {
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
