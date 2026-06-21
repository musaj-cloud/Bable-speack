// lib/transcription.ts
// On-device speech-to-text via QVAC Whisper (whisper-tiny, multilingual).
// A model is loaded once per source language, cached, and reused. Everything
// runs locally — the recorded audio never leaves the device.
import {
  loadModel,
  transcribe,
  transcribeStream,
  unloadModel,
  VAD_SILERO_5_1_2,
  WHISPER_TINY,
} from '@qvac/sdk';
import type { ModelProgressFn } from '@/lib/qvac';

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
  vadModelSrc?: typeof VAD_SILERO_5_1_2; // required for streaming VAD events
};

// Same loadModel overload gotcha as Bergamot/embeddings: a model descriptor
// resolved at runtime defeats the literal-based overload inference, so we call
// through a precisely typed alias. Runtime shape matches the QVAC example.
const loadWhisperRaw = loadModel as unknown as (options: {
  modelSrc: typeof WHISPER_TINY;
  modelConfig: WhisperConfig;
  onProgress?: ModelProgressFn;
}) => Promise<string>;

const WHISPER_GEN: WhisperConfig = {
  n_threads: 4,
  translate: false,
  no_timestamps: true,
  suppress_blank: true,
  suppress_nst: true,
  temperature: 0,
  // Live streaming (transcribeStream + emitVadEvents) needs a voice-activity
  // model loaded alongside Whisper to detect end-of-turn — without it the SDK
  // throws "VAD model name is required for Whisper transcription". Loaded once
  // with the model; harmless for the batch transcribe path.
  vadModelSrc: VAD_SILERO_5_1_2,
};

// One loaded whisper model per source language (language is baked in at load).
const cache = new Map<string, Promise<string>>();

const getWhisperModel = (lang: string, onProgress?: ModelProgressFn): Promise<string> => {
  let model = cache.get(lang);
  if (!model) {
    model = loadWhisperRaw({
      modelSrc: WHISPER_TINY,
      modelConfig: { ...WHISPER_GEN, language: lang },
      onProgress,
    }).catch((err) => {
      cache.delete(lang); // drop the failed load so the next call can retry
      throw err;
    });
    cache.set(lang, model);
  }
  return model;
};

// Preload the Whisper (+VAD) model for a language so the first transcription —
// batch or streaming — is instant and never races a download. Cached, so it's
// safe to call repeatedly. Used by the after-onboarding warmup (lib/warmup.ts).
export const warmTranscription = (lang: string, onProgress?: ModelProgressFn): Promise<string> =>
  getWhisperModel(lang, onProgress);

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
