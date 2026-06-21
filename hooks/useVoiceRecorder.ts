// hooks/useVoiceRecorder.ts
// Thin wrapper over expo-audio's recorder for tap-to-speak capture with
// voice-activity auto-stop. Records mono 16 kHz audio (ideal for Whisper) and
// returns the file uri. While recording, it polls the metering level and ends
// the capture on its own once the user stops talking — hands-free, on-device.
import { useCallback, useRef } from 'react';
import {
  useAudioRecorder,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  RecordingPresets,
  type RecordingOptions,
} from 'expo-audio';

// Whisper works best on 16 kHz mono — start from the high-quality preset (so
// every platform key is present) and downsize to keep the file and
// transcription small and fast. Metering must be on for voice-activity detection.
const RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.HIGH_QUALITY,
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 64000,
  isMeteringEnabled: true,
};

// Voice-activity tuning. Metering is dBFS (0 = loudest, more negative = quieter).
// We wait for speech to start, then auto-stop once the level stays quiet for
// SILENCE_HANG_MS. These are conservative defaults — tune on device if needed.
const POLL_MS = 100;
const SPEECH_DB = -40; // metering above this counts as the user speaking
const SILENCE_HANG_MS = 1100; // quiet-after-speech before we auto-stop
const MIN_SPEECH_MS = 300; // need this much speech before trusting "spoke"
const MAX_MS = 20000; // hard safety cap so it can never run forever

// vad: when true (default) the recorder ends itself after a quiet pause; when
// false it only ever auto-stops at the MAX_MS safety cap, so the user controls
// start and stop with explicit taps (pure tap-to-record for Converse).
type StartOpts = { onAutoStop?: () => void; vad?: boolean };

export const useVoiceRecorder = () => {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopped = useRef(false);

  const clearTimer = () => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  };

  // Begin recording. Returns false if mic permission was denied. When onAutoStop
  // is provided, voice-activity detection ends the capture for the caller.
  const start = useCallback(
    async (opts?: StartOpts): Promise<boolean> => {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) return false;
      // shouldPlayInBackground: true is required here. expo-audio auto-pauses the
      // recorder when the activity backgrounds and calls MediaRecorder.resume() on
      // foreground. The mic-permission dialog (and any focus change) triggers that
      // background/foreground cycle, which races with our stop() — resume() then
      // fires on an already-stopped recorder ("resume failed: -38"), throwing an
      // uncaught IllegalStateException that crashes the whole app. This flag sets
      // expo-audio's staysActiveInBackground, gating off the auto pause/resume.
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });
      await recorder.prepareToRecordAsync();
      recorder.record();

      // Voice-activity auto-stop: poll the metering level and fire onAutoStop once
      // the user has spoken and then gone quiet (or the safety cap is hit). The
      // metering value lives on getStatus() — the status event doesn't carry it.
      if (opts?.onAutoStop) {
        const vad = opts.vad ?? true;
        stopped.current = false;
        let spokeMs = 0; // consecutive speech accumulated
        let everSpoke = false;
        let lastLoud = Date.now();
        clearTimer();
        timer.current = setInterval(() => {
          const { metering, durationMillis } = recorder.getStatus();
          const now = Date.now();
          if ((metering ?? -160) > SPEECH_DB) {
            spokeMs += POLL_MS;
            lastLoud = now;
            if (spokeMs >= MIN_SPEECH_MS) everSpoke = true;
          } else {
            spokeMs = 0;
          }
          // With vad off, only the hard safety cap can end the capture — the user
          // stops by tapping the mic again.
          const wentQuiet = vad && everSpoke && now - lastLoud >= SILENCE_HANG_MS;
          if ((wentQuiet || durationMillis >= MAX_MS) && !stopped.current) {
            stopped.current = true;
            clearTimer();
            opts.onAutoStop?.();
          }
        }, POLL_MS);
      }
      return true;
    },
    [recorder]
  );

  // Stop recording and return the recorded file uri (or null if none).
  const stop = useCallback(async (): Promise<string | null> => {
    clearTimer();
    await recorder.stop();
    return recorder.uri ?? null;
  }, [recorder]);

  return { start, stop };
};
