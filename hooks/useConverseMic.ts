// hooks/useConverseMic.ts
// Tap-to-record control for Converse. First tap starts capture; second tap
// stops it. On stop the captured speech is transcribed, translated into the
// target language, and spoken — all on-device (see useConverseStore). Prefers
// live streaming when that native module is in the build, otherwise records a
// file and transcribes it once. Either way the user fully controls start/stop.
import { useRef } from 'react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import { useConverseStore } from '@/store/useConverseStore';

// Explicit states so a tap is always interpreted correctly, even while the
// first model load is still in flight (that load can take seconds — without a
// 'starting' state a stop tap during it gets mistaken for a fresh start).
type MicState = 'idle' | 'starting' | 'recording' | 'stopping';

export const useConverseMic = (sourceLang: string, targetLang: string) => {
  const capture = useVoiceCapture();
  const { beginRecording, markTranscribing, setLiveText, finalizeVoice, failVoice, reset } =
    useConverseStore();
  const state = useRef<MicState>('idle');
  const stopRequested = useRef(false); // user tapped stop before start finished

  const stop = async () => {
    state.current = 'stopping';
    markTranscribing();
    await capture.stop();
  };

  const onMicTap = async () => {
    // Recording → stop and transcribe.
    if (state.current === 'recording') {
      await stop();
      return;
    }
    // Still spinning up (model loading): remember the stop, honor it once
    // start() resolves below. Prevents the "can't tap to stop" dead zone.
    if (state.current === 'starting') {
      stopRequested.current = true;
      return;
    }
    // Already finishing — ignore extra taps so we don't double-process.
    if (state.current === 'stopping') return;

    // First tap: start capturing in the source language.
    state.current = 'starting';
    stopRequested.current = false;
    beginRecording();
    let ok = false;
    try {
      ok = await capture.start(sourceLang, {
        onPartial: setLiveText,
        onFinal: (text) => {
          state.current = 'idle';
          finalizeVoice(text, sourceLang, targetLang);
        },
        onError: (e) => {
          state.current = 'idle';
          failVoice(e); // surface the failure instead of silently blanking
        },
      });
    } catch (e) {
      // start() threw (e.g. model/session failed to open). Surface it and clear
      // state so the mic button isn't stuck looking like it's still recording.
      state.current = 'idle';
      failVoice(e);
      return;
    }

    if (!ok) {
      state.current = 'idle';
      reset(); // mic unavailable or permission denied
      return;
    }

    // Capture is live. If the user already tapped stop while we were starting,
    // honor it now; otherwise we're recording.
    if (stopRequested.current) {
      await stop();
      return;
    }
    state.current = 'recording';
  };

  return { onMicTap };
};
