// hooks/useP2PSession.ts
// Drives a Phase 7 Live Conversation. Bridges the P2P worklet (lib/p2p.ts) to
// the on-device pipeline: my voice -> transcribe -> send text; peer text ->
// translate locally -> show + speak. Only { id, text, sourceLang, ts } crosses
// the wire (lib/p2p.ts), so each phone reads/hears in its own language and no
// audio ever leaves a device.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import {
  connectP2P,
  disconnectP2P,
  isP2PAvailable,
  sendP2P,
  type P2PWireMessage,
} from '@/lib/p2p';
import { translateText } from '@/lib/translation';
import { isTtsSupported, speakText, stopSpeaking } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useP2PStore } from '@/store/useP2PStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useP2PSession = () => {
  const capture = useVoiceCapture();
  const setStatus = useP2PStore((s) => s.setStatus);
  const setError = useP2PStore((s) => s.setError);
  const addTurn = useP2PStore((s) => s.addTurn);
  const resolveTurn = useP2PStore((s) => s.resolveTurn);
  const reset = useP2PStore((s) => s.reset);

  const [talking, setTalking] = useState(false);
  const listening = useRef(false);

  // A peer's line arrived: show it, translate into MY reading language, speak it.
  const handleIncoming = useCallback(
    async (wire: P2PWireMessage) => {
      const { targetLang } = useLanguageStore.getState();
      const id = makeId();
      addTurn({
        id,
        side: 'them',
        text: wire.text,
        lang: wire.sourceLang,
        translated: '',
        translatedLang: targetLang,
        pending: true,
      });
      try {
        const translated = await translateText(wire.text, wire.sourceLang, targetLang);
        resolveTurn(id, translated);
        // Reading the peer aloud is the whole point of a live conversation.
        if (isTtsSupported(targetLang)) {
          const { ttsSpeed } = useSettingsStore.getState();
          void speakText(translated, targetLang, ttsSpeed).catch(() => {});
        }
      } catch {
        resolveTurn(id, '—');
      }
    },
    [addTurn, resolveTurn]
  );

  // Join the swarm for `code` and wire status + incoming messages to the store.
  const connect = useCallback(
    (code: string) => {
      reset();
      try {
        connectP2P(code, {
          onStatus: (state, peers, message) =>
            state === 'error' ? setError(message ?? 'Connection failed') : setStatus(state, peers),
          onMessage: handleIncoming,
        });
        setStatus('searching', 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'P2P is unavailable');
      }
    },
    [reset, setStatus, setError, handleIncoming]
  );

  const disconnect = useCallback(() => {
    if (listening.current) {
      listening.current = false;
      setTalking(false);
      void capture.stop();
    }
    stopSpeaking();
    disconnectP2P();
    reset();
  }, [capture, reset]);

  // My finished utterance: show my own line and broadcast the source text. The
  // peer translates it on their device, so nothing is translated here.
  const sendMine = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      const { sourceLang } = useLanguageStore.getState();
      const id = makeId();
      addTurn({
        id,
        side: 'you',
        text: trimmed,
        lang: sourceLang,
        translated: '',
        translatedLang: sourceLang,
        pending: false,
      });
      sendP2P({ id, text: trimmed, sourceLang, ts: Date.now() });
    },
    [addTurn]
  );

  // Tap to start speaking, tap again to stop early (mirrors Converse).
  const toggleTalk = useCallback(async () => {
    if (listening.current) {
      listening.current = false;
      setTalking(false);
      await capture.stop();
      return;
    }
    stopSpeaking();
    const { sourceLang } = useLanguageStore.getState();
    listening.current = await capture.start(sourceLang, {
      onPartial: () => {},
      onFinal: (text) => {
        listening.current = false;
        setTalking(false);
        sendMine(text);
      },
      onError: () => {
        listening.current = false;
        setTalking(false);
      },
    });
    setTalking(listening.current);
  }, [capture, sendMine]);

  // Stop the mic if the screen unmounts mid-turn.
  useEffect(
    () => () => {
      if (listening.current) void capture.stop();
    },
    [capture]
  );

  return { available: isP2PAvailable(), talking, connect, disconnect, toggleTalk };
};
