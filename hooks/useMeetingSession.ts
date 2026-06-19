// hooks/useMeetingSession.ts
// Drives a live meeting: a session timer plus push-to-talk capture per side.
// Each side holds its button to speak; on release the recording is handed to
// the store, which transcribes, translates, shows it, and speaks it back.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { stopSpeaking } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useMeetingStore, type TurnSide } from '@/store/useMeetingStore';

export const useMeetingSession = () => {
  const { start, stop } = useVoiceRecorder();
  const startSession = useMeetingStore((s) => s.startSession);
  const setDuration = useMeetingStore((s) => s.setDuration);
  const addTurn = useMeetingStore((s) => s.addTurn);
  const endSession = useMeetingStore((s) => s.endSession);

  // Which side currently holds the mic (drives the button's recording state).
  const [talking, setTalking] = useState<TurnSide | null>(null);
  const talkingRef = useRef<TurnSide | null>(null); // read inside async handlers
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const seconds = useRef(0);

  const stopTimer = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  // Tidy up the interval if the screen unmounts mid-session.
  useEffect(() => stopTimer, [stopTimer]);

  // Begin a session: snapshot the language pair and start the elapsed clock.
  const begin = useCallback(() => {
    const { sourceLang, targetLang } = useLanguageStore.getState();
    seconds.current = 0;
    startSession(sourceLang, targetLang);
    timer.current = setInterval(() => {
      seconds.current += 1;
      setDuration(seconds.current);
    }, 1000);
  }, [startSession, setDuration]);

  // End the session: stop the clock, close any open mic, then summarize.
  const finish = useCallback(async () => {
    stopTimer();
    if (talkingRef.current) {
      talkingRef.current = null;
      setTalking(null);
      await stop();
    }
    await endSession();
  }, [stopTimer, stop, endSession]);

  // Hold-to-talk press-in for one side. Ignored if the session is busy with a
  // previous turn or the other side is already speaking (turns are sequential).
  const talkStart = useCallback(
    async (side: TurnSide) => {
      const { status, busy } = useMeetingStore.getState();
      if (status !== 'live' || busy || talkingRef.current) return;
      stopSpeaking(); // cut any playback before opening the mic
      const granted = await start();
      if (!granted) return; // mic permission denied
      talkingRef.current = side;
      setTalking(side);
    },
    [start]
  );

  // Hold-to-talk release: stop the mic and process the captured turn.
  const talkEnd = useCallback(async () => {
    const side = talkingRef.current;
    if (!side) return;
    talkingRef.current = null;
    setTalking(null);
    const uri = await stop();
    if (uri) await addTurn(uri, side);
  }, [stop, addTurn]);

  return { talking, begin, finish, talkStart, talkEnd };
};
