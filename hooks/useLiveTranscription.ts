// hooks/useLiveTranscription.ts
// Real-time, word-by-word Converse transcription. Captures live microphone PCM
// (expo-stream-audio, loaded lazily) and streams it into a QVAC Whisper session
// (transcribeStream). Partial text grows as the user speaks; the model's own
// end-of-turn signal finalizes the utterance. Fully on-device — no network.
// `available` is false on builds without the native mic module — callers should
// fall back to batch recording (see useVoiceCapture).
import { useCallback, useMemo, useRef } from 'react';
import { requestRecordingPermissionsAsync, setAudioModeAsync } from 'expo-audio';
import { getLiveMic } from '@/lib/liveMic';
import { createTranscribeSession } from '@/lib/transcription';

// Decode base64 PCM frames to bytes without pulling in a Buffer polyfill.
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < B64.length; i++) t[B64.charCodeAt(i)] = i;
  return t;
})();

const base64ToBytes = (b64: string): Uint8Array => {
  let len = b64.length;
  if (len === 0) return new Uint8Array(0);
  if (b64[len - 1] === '=') len--;
  if (b64[len - 1] === '=') len--;
  const out = new Uint8Array((len * 3) >> 2);
  let p = 0;
  for (let i = 0; i + 3 < b64.length || i < len; i += 4) {
    const a = LOOKUP[b64.charCodeAt(i)];
    const b = LOOKUP[b64.charCodeAt(i + 1)];
    const c = LOOKUP[b64.charCodeAt(i + 2)];
    const d = LOOKUP[b64.charCodeAt(i + 3)];
    if (p < out.length) out[p++] = (a << 2) | (b >> 4);
    if (p < out.length) out[p++] = ((b & 15) << 4) | (c >> 2);
    if (p < out.length) out[p++] = ((c & 3) << 6) | d;
  }
  return out;
};

export type LiveHandlers = {
  onPartial: (text: string) => void; // live transcript as it grows
  onFinal: (text: string) => void; // end-of-turn, or user stopped early
  onError?: (e: unknown) => void;
};

type Session = Awaited<ReturnType<typeof createTranscribeSession>>;

export const useLiveTranscription = () => {
  const available = useMemo(() => getLiveMic() !== null, []);
  const session = useRef<Session | null>(null);
  const frameSub = useRef<{ remove: () => void } | null>(null);
  const errSub = useRef<{ remove: () => void } | null>(null);
  const active = useRef(false);
  const ended = useRef(false); // user signalled end-of-audio (session.end called)
  const lastPartial = useRef('');
  const finalized = useRef(false);
  const handlers = useRef<LiveHandlers | null>(null);

  // Tear down the mic stream and the transcription session. Idempotent. Called
  // only from finalize — i.e. AFTER the read loop has exited — so we never
  // destroy the session out from under an in-flight native read (that race
  // crashed the QVAC worklet with a SIGSEGV on stop).
  const teardown = useCallback(async () => {
    active.current = false;
    frameSub.current?.remove();
    frameSub.current = null;
    errSub.current?.remove();
    errSub.current = null;
    const mic = getLiveMic();
    try {
      await mic?.stop();
    } catch {
      // mic already stopped
    }
    try {
      // The user-stop path already called end() before the loop drained, so the
      // stream is closing itself — calling it again would double-close. Only the
      // auto end-of-turn / error paths (which never called end()) close here.
      if (!ended.current) session.current?.end();
    } catch {
      // session already ended
    }
    session.current = null;
  }, []);

  // Fire onFinal exactly once (from end-of-turn or an early stop), then clean up.
  // Runs only after the read loop has finished, so the downstream translation it
  // triggers never overlaps a live transcription session on the shared worklet.
  const finalize = useCallback(
    async (text: string) => {
      if (finalized.current) return;
      finalized.current = true;
      await teardown();
      handlers.current?.onFinal(text);
    },
    [teardown]
  );

  // Begin live transcription in `lang`. Returns false if mic unavailable or
  // permission denied.
  const start = useCallback(
    async (lang: string, h: LiveHandlers): Promise<boolean> => {
      const mic = getLiveMic();
      if (!mic) return false;
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return false;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });

      handlers.current = h;
      lastPartial.current = '';
      finalized.current = false;
      ended.current = false;
      const s = await createTranscribeSession(lang);
      session.current = s;
      active.current = true;

      // Pipe each live mic frame's PCM straight into the session. Stop feeding
      // once end() has been signalled so writes never race the model's flush.
      frameSub.current = mic.addFrameListener((frame) => {
        if (!active.current || ended.current) return;
        try {
          s.write(base64ToBytes(frame.pcmBase64));
        } catch {
          // session closed mid-write — ignore
        }
      });
      errSub.current = mic.addErrorListener(({ message }) => {
        // Ignore errors once we're intentionally stopping or already done:
        // stopping the native mic makes its in-flight read return 0 bytes, which
        // surfaces here as "AudioRecord read returned 0 bytes" — that's the
        // normal end of capture, not a failure. The drain path finalizes.
        if (finalized.current || ended.current) return;
        // Mic genuinely died mid-capture. If we already have a transcript,
        // salvage it (translate what the user said) rather than throwing it
        // away; only surface an error when there's nothing to keep.
        if (lastPartial.current.trim()) {
          void finalize(lastPartial.current);
        } else {
          finalized.current = true;
          void teardown().finally(() => h.onError?.(new Error(message)));
        }
      });

      await mic.start({ sampleRate: 16000, frameDurationMs: 20 });

      // Consume transcription events: grow the partial transcript from segments
      // (or plain text). The loop ends on the model's end-of-turn signal, or when
      // the iterator completes after end() flushes the final result — finalize
      // once, from here, after the loop has fully exited (no teardown mid-read).
      void (async () => {
        const segments = new Map<number, string>();
        let plain = '';
        const assemble = () =>
          (segments.size ? [...segments.values()].join(' ') : plain).replace(/\s+/g, ' ').trim();
        try {
          for await (const ev of s) {
            if (ev.type === 'segment') {
              segments.set(ev.segment.id, ev.segment.text);
              lastPartial.current = assemble();
              h.onPartial(lastPartial.current);
            } else if (ev.type === 'text') {
              plain = ev.text;
              lastPartial.current = assemble();
              h.onPartial(lastPartial.current);
            } else if (ev.type === 'endOfTurn') {
              break;
            }
          }
          await finalize(assemble());
        } catch (e) {
          if (!finalized.current) {
            finalized.current = true;
            await teardown();
            h.onError?.(e);
          }
        }
      })();

      return true;
    },
    [teardown, finalize]
  );

  // Stop early (user tapped the mic again). Signal end-of-audio and let the read
  // loop drain the model's final flush, then finalize itself — rather than
  // tearing the session down here while that loop is still mid-read. A safety
  // timer forces finalize with the last partial if the flush never completes.
  const stop = useCallback(async () => {
    if (finalized.current || ended.current) return;
    ended.current = true;
    const mic = getLiveMic();
    try {
      await mic?.stop(); // stop producing PCM before the model flushes
    } catch {
      // mic already stopped
    }
    try {
      session.current?.end(); // flush: the loop receives the final result, then exits
    } catch {
      // session already ended — the loop will finalize on its own
    }
    setTimeout(() => {
      if (!finalized.current) void finalize(lastPartial.current);
    }, 4000);
  }, [finalize]);

  return { available, start, stop };
};
