// lib/tts.ts
// On-device text-to-speech via QVAC Supertonic 2 (multilingual GGML).
// Synthesizes the translation to PCM, wraps it in a WAV file, and plays it
// through expo-audio. Fully offline — nothing leaves the device.
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
} from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { loadModel, textToSpeech, unloadModel, TTS_MULTILINGUAL_SUPERTONIC2_Q8_0 } from '@qvac/sdk';
import { splitSentences } from '@/lib/sentences';
import { pcm16ToWav } from '@/lib/wav';

// Supertonic 2 multilingual covers these languages only. Other targets show
// the translated text but the speaker is disabled (see isTtsSupported).
const TTS_LANGS = new Set(['en', 'ko', 'es', 'pt', 'fr']);
const SAMPLE_RATE = 44100;

export const isTtsSupported = (lang: string): boolean => TTS_LANGS.has(lang);

// Supertonic can return an empty buffer (silent failure) for very long input —
// fine for a short Converse phrase, but Document mode feeds it a whole OCR'd
// sign/menu. Break long text into ~sentence-sized chunks and speak them in
// sequence so any length reads aloud reliably.
const MAX_CHUNK_CHARS = 200;

const chunkText = (text: string): string[] => {
  const chunks: string[] = [];
  let buf = '';
  const flush = () => {
    if (buf) chunks.push(buf);
    buf = '';
  };
  for (const sentence of splitSentences(text)) {
    let s = sentence;
    // A single sentence longer than the budget: hard-split it.
    while (s.length > MAX_CHUNK_CHARS) {
      flush();
      chunks.push(s.slice(0, MAX_CHUNK_CHARS));
      s = s.slice(MAX_CHUNK_CHARS);
    }
    if (!s) continue;
    if (buf && buf.length + 1 + s.length > MAX_CHUNK_CHARS) flush();
    buf = buf ? `${buf} ${s}` : s;
  }
  flush();
  const trimmed = text.trim();
  return chunks.length ? chunks : trimmed ? [trimmed] : [];
};

type TtsConfig = {
  ttsEngine: 'supertonic';
  language: string;
  voice?: string;
  ttsSpeed?: number;
  ttsNumInferenceSteps?: number;
};

// Same loadModel overload gotcha as the other QVAC models — call through a
// precisely typed alias so TS keeps the literal modelConfig shape.
const loadTtsRaw = loadModel as unknown as (options: {
  modelSrc: typeof TTS_MULTILINGUAL_SUPERTONIC2_Q8_0;
  modelConfig: TtsConfig;
}) => Promise<string>;

// One loaded voice per language+speed (speed is baked in at load time).
const cache = new Map<string, Promise<string>>();

const getTtsModel = (lang: string, speed: number): Promise<string> => {
  const k = `${lang}:${speed}`;
  let model = cache.get(k);
  if (!model) {
    model = loadTtsRaw({
      modelSrc: TTS_MULTILINGUAL_SUPERTONIC2_Q8_0,
      modelConfig: {
        ttsEngine: 'supertonic',
        language: lang,
        voice: 'F1',
        ttsSpeed: speed,
        ttsNumInferenceSteps: 5,
      },
    }).catch((err) => {
      cache.delete(k);
      throw err;
    });
    cache.set(k, model);
  }
  return model;
};

// Playback lifecycle the UI animates against:
//   'loading'  — synthesizing the voice (the brief wait after a tap)
//   'speaking' — audio is actually playing
//   'paused'   — playback paused mid-clip (tap again to resume)
//   'idle'     — nothing playing
export type SpeakState = 'idle' | 'loading' | 'speaking' | 'paused';

const listeners = new Set<(state: SpeakState) => void>();
// Mirror the latest state so toggleSpeak/pause/resume know what a tap should do.
let speakState: SpeakState = 'idle';
const emit = (state: SpeakState) => {
  speakState = state;
  listeners.forEach((l) => l(state));
};

// Subscribe to playback state changes. Returns an unsubscribe function.
export const onSpeakStateChange = (cb: (state: SpeakState) => void): (() => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

// Only one clip plays at a time — release the previous player before the next.
let current: AudioPlayer | null = null;
let clipSeq = 0;
// Bumped on every new speakText/stopSpeaking call so an in-flight chunk chain
// can tell it has been superseded and stop queuing the next chunk.
let speakGen = 0;

// Synthesized-clip cache. The slow part of read-aloud is the on-device synthesis
// (QVAC textToSpeech), not playback — so the first tap renders the WAV(s) and the
// second tap of the same text replays them instantly instead of re-synthesizing.
// Keyed by language+speed+text; the value is the ordered WAV file(s) for the
// whole utterance. Bounded (LRU) so the cache dir can't grow without limit.
const clipCache = new Map<string, File[]>();
const MAX_CACHED_CLIPS = 12;
const clipKey = (lang: string, speed: number, text: string) => `${lang}:${speed}:${text}`;

const deleteFiles = (files: File[]) =>
  files.forEach((f) => {
    try {
      if (f.exists) f.delete();
    } catch {
      // already gone or still locked — safe to ignore
    }
  });

// Insert a finished clip, evicting the oldest entries (and their files) past cap.
const cacheClip = (key: string, files: File[]) => {
  clipCache.delete(key);
  clipCache.set(key, files);
  while (clipCache.size > MAX_CACHED_CLIPS) {
    const oldest = clipCache.keys().next().value as string;
    const stale = clipCache.get(oldest);
    clipCache.delete(oldest);
    if (stale) deleteFiles(stale);
  }
};

// Release just the audio player. Files now belong to the clip cache (replayed on
// the next tap), so they are NOT deleted here — only cache eviction deletes them.
const releasePlayer = () => {
  if (current) {
    try {
      current.remove();
    } catch {
      // already released
    }
    current = null;
    emit('idle');
  }
};

// Synthesize one chunk to a fresh WAV file. Returns the file, or null if the
// model produced no audio for this chunk.
const synthChunk = async (modelId: string, chunk: string): Promise<File | null> => {
  const result = textToSpeech({ modelId, text: chunk, inputType: 'text', stream: false });
  const samples = await result.buffer;
  if (!samples.length) return null;
  const wav = pcm16ToWav(samples, SAMPLE_RATE);
  const file = new File(Paths.cache, `babelspeak-tts-${clipSeq++}.wav`);
  file.write(wav);
  return file;
};

// Play an already-rendered clip (the cached WAV files) end to end. Resolves
// immediately; chunks chain on each finish. This is the instant-replay path.
const playClip = (files: File[], gen: number): void => {
  let i = 0;
  const playNext = (): void => {
    if (gen !== speakGen) return; // superseded by a newer call
    if (i >= files.length) {
      releasePlayer();
      return;
    }
    const file = files[i++];
    releasePlayer();
    const player = createAudioPlayer(file.uri);
    current = player;
    player.addListener('playbackStatusUpdate', (status) => {
      if (status.didJustFinish) playNext();
    });
    player.play();
    emit('speaking');
  };
  playNext();
};

// Synthesize `text` in `lang` and play it aloud, one chunk at a time. Resolves
// once the first chunk starts playing; later chunks queue as each finishes. The
// finished clip is cached so a second tap of the same text replays instantly.
// Throws if the language is unsupported or no audio could be produced at all
// (caller decides UX — Document surfaces this as an alert).
export const speakText = async (text: string, lang: string, speed = 1): Promise<void> => {
  const trimmed = text.trim();
  if (!trimmed || !isTtsSupported(lang)) return;

  // Voice synthesis takes a moment — signal "loading" so the UI can show it.
  emit('loading');
  const gen = ++speakGen;
  const key = clipKey(lang, speed, trimmed);
  try {
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: false });

    // Instant replay: this text was synthesized before and its WAV(s) survive.
    const cached = clipCache.get(key);
    if (cached?.length && cached.every((f) => f.exists)) {
      cacheClip(key, cached); // refresh LRU order
      if (gen !== speakGen) return; // superseded while awaiting audio mode
      playClip(cached, gen);
      return;
    }
    if (cached) clipCache.delete(key); // files were cleared by the OS — re-render

    const modelId = await getTtsModel(lang, speed);
    const chunks = chunkText(trimmed);

    let index = 0;
    let playedAny = false;
    // Files rendered so far this run. Cached as one clip on success; deleted if a
    // newer call supersedes us mid-render (they were never handed to the cache).
    const built: File[] = [];

    // Synthesize the next non-empty chunk and play it; chain the rest on finish.
    const playNext = async (): Promise<void> => {
      if (gen !== speakGen) {
        deleteFiles(built);
        return;
      }
      let file: File | null = null;
      while (index < chunks.length && !file) {
        file = await synthChunk(modelId, chunks[index++]);
      }
      if (gen !== speakGen) {
        if (file) built.push(file);
        deleteFiles(built);
        return;
      }
      if (!file) {
        // Nothing left to synthesize. If we never played anything, the whole
        // text failed — let the caller know; otherwise cache what we rendered.
        if (!playedAny) throw new Error('No audio could be generated for this text.');
        cacheClip(key, built);
        releasePlayer();
        return;
      }
      built.push(file);

      // Release the previous player before swapping in the next clip's player.
      releasePlayer();
      const player = createAudioPlayer(file.uri);
      current = player;
      player.addListener('playbackStatusUpdate', (status) => {
        if (!status.didJustFinish) return;
        if (index < chunks.length) {
          // Fire-and-forget continuation: it must handle its own rejection or
          // it surfaces as an uncaught promise. A newer speakText/stopSpeaking
          // supersedes this chain and the QVAC engine rejects our in-flight
          // synth job with "Stale job replaced by new run" — expected, so we
          // swallow it. For any other failure mid-chain, recover the UI to idle
          // (only if we still own playback; otherwise the new run controls it).
          void playNext().catch(() => {
            if (gen === speakGen) releasePlayer();
          });
        } else {
          // Last chunk finished — keep the whole clip for instant replay.
          cacheClip(key, built);
          releasePlayer();
        }
      });
      player.play();
      playedAny = true;
      emit('speaking');
    };

    await playNext();
  } catch (e) {
    if (gen === speakGen) emit('idle');
    throw e;
  }
};

// Pause the clip mid-playback (tap again to resume). No-op unless audio is
// actively playing — the paused player and its position are kept intact.
export const pauseSpeaking = (): void => {
  if (current && speakState === 'speaking') {
    try {
      current.pause();
    } catch {
      // player already gone — nothing to pause
    }
    emit('paused');
  }
};

// Resume a paused clip from where it stopped. No-op unless currently paused.
export const resumeSpeaking = (): void => {
  if (current && speakState === 'paused') {
    try {
      current.play();
    } catch {
      // player already gone — nothing to resume
    }
    emit('speaking');
  }
};

// What one tap on a speaker button does: pause while playing, resume while
// paused, or (re)play from the start when idle. Replaying a previously-spoken
// text is instant thanks to the clip cache. Ignored while a fresh clip is still
// synthesizing (the button shows a spinner then).
export const toggleSpeak = async (text: string, lang: string, speed = 1): Promise<void> => {
  if (speakState === 'speaking') return pauseSpeaking();
  if (speakState === 'paused') return resumeSpeaking();
  if (speakState === 'loading') return;
  await speakText(text, lang, speed);
};

// Stop any in-progress playback (e.g. when starting a new recording). Bumps the
// generation so a pending chunk chain stops queuing the next clip. The clip cache
// is kept so a later tap can still replay instantly.
export const stopSpeaking = (): void => {
  speakGen++;
  releasePlayer();
};

// Free TTS memory — call when the app goes to the background. Also drops the clip
// cache and its WAV files so nothing lingers on disk.
export const unloadTtsModels = async (): Promise<void> => {
  stopSpeaking();
  for (const files of clipCache.values()) deleteFiles(files);
  clipCache.clear();
  const loads = [...cache.values()];
  cache.clear();
  for (const load of loads) {
    try {
      await unloadModel({ modelId: await load });
    } catch {
      // never finished loading — nothing to unload
    }
  }
};
