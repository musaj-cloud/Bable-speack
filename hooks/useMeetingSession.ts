// hooks/useMeetingSession.ts
// Drives a single-recording meeting: tap to start one continuous recording, tap
// again to stop. On stop the audio is handed to the store, which transcribes,
// translates, and summarizes it. The recorder runs without voice-activity
// auto-stop so a long talk records until the user stops it.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { stopSpeaking } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useMeetingStore } from '@/store/useMeetingStore';

// Hard cap on a single meeting recording. A talk records continuously until the
// user taps stop, but we auto-stop at this point so it can never run forever
// (huge file, slow transcription, or a forgotten recording draining the battery).
const MAX_SECONDS = 120; // 2 minutes

export const useMeetingSession = () => {
  const { start, stop } = useVoiceRecorder();
  const startSession = useMeetingStore((s) => s.startSession);
  const setDuration = useMeetingStore((s) => s.setDuration);
  const process = useMeetingStore((s) => s.process);
  const setError = useMeetingStore((s) => s.setError);

  const [recording, setRecording] = useState(false);
  const recordingRef = useRef(false); // read inside async handlers
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const seconds = useRef(0);
  // Lets the elapsed-clock interval auto-stop at the cap without a forward ref.
  const stopRef = useRef<() => void>(() => {});

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  // Tidy up the interval if the screen unmounts mid-session.
  useEffect(() => stopTimer, [stopTimer]);

  // Stop the recording and hand it to the store for transcribe → translate →
  // summarize.
  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setRecording(false);
    stopTimer();
    try {
      const uri = await stop();
      await process(uri);
    } catch (e) {
      console.warn('[meeting] stop failed:', e);
    }
  }, [stop, process, stopTimer]);
  stopRef.current = () => void stopRecording();

  // Begin one continuous recording (no auto-stop) and start the elapsed clock.
  // The recorder can throw on the native side (mic busy, prepare failure); catch
  // it and surface an error instead of letting it crash the app.
  const beginRecording = useCallback(async () => {
    stopSpeaking();
    let granted = false;
    try {
      granted = await start(); // omit onAutoStop → records until stopped/capped
    } catch (e) {
      console.warn('[meeting] start failed:', e);
      setError('Could not start recording. Please try again.');
      return;
    }
    if (!granted) return; // mic permission denied
    const { sourceLang, targetLang } = useLanguageStore.getState();
    seconds.current = 0;
    startSession(sourceLang, targetLang);
    recordingRef.current = true;
    setRecording(true);
    timer.current = setInterval(() => {
      seconds.current += 1;
      setDuration(seconds.current);
      if (seconds.current >= MAX_SECONDS) stopRef.current(); // auto-stop at the cap
    }, 1000);
  }, [start, startSession, setDuration, setError]);

  // One control toggles between start and stop.
  const toggle = useCallback(() => {
    if (recordingRef.current) void stopRecording();
    else void beginRecording();
  }, [beginRecording, stopRecording]);

  return { recording, toggle };
};
