// hooks/useP2PSession.ts
// Drives a Phase 7 Live Conversation over Hyperswarm: my voice -> transcribe ->
// send text; peer text -> translate locally -> show + speak. Only
// { id, text, sourceLang, ts } crosses the wire, so each phone reads/hears in its
// own language and no audio ever leaves a device. Translation/TTS run locally, so
// the experience is as fast as Converse.
//
// Pairing is QR/code over Hyperswarm (lib/p2p.ts -> bare worklet): the host runs a
// local DHT bootstrap node and shows a QR; the joiner scans it (or types the code)
// and they meet on the same DHT topic. Fully offline on a shared LAN/hotspot.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useVoiceCapture } from '@/hooks/useVoiceCapture';
import {
  disconnectP2P,
  hostP2P,
  isP2PAvailable,
  joinP2P,
  sendP2P,
  type P2PHandlers,
  type P2PWireMessage,
} from '@/lib/p2p';
import type { Pairing } from '@/lib/pairing';
import { translateText } from '@/lib/translation';
import { isTtsSupported, speakText, stopSpeaking } from '@/lib/tts';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useP2PStore } from '@/store/useP2PStore';
import { useSettingsStore } from '@/store/useSettingsStore';

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// A short, readable code used when the host doesn't type one (e.g. "talk-4821").
const randomCode = () => `talk-${Math.floor(1000 + Math.random() * 9000)}`;

export const useP2PSession = () => {
  const capture = useVoiceCapture();
  const setStatus = useP2PStore((s) => s.setStatus);
  const setError = useP2PStore((s) => s.setError);
  const setPairInfo = useP2PStore((s) => s.setPairInfo);
  const addTurn = useP2PStore((s) => s.addTurn);
  const resolveTurn = useP2PStore((s) => s.resolveTurn);
  const reset = useP2PStore((s) => s.reset);

  const [talking, setTalking] = useState(false);
  const listening = useRef(false);

  // A peer's line arrived: show it, translate into MY OWN language, speak it.
  // My language is `sourceLang` — the "I speak" side that toggleTalk transcribes
  // and sendMine puts on the wire. Each phone translates locally into its owner's
  // language, so the two phones run a mirrored pair (e.g. en→fr and fr→en) and a
  // peer's text always lands in the language this device's owner reads and hears.
  const handleIncoming = useCallback(
    async (wire: P2PWireMessage) => {
      const { sourceLang: myLang } = useLanguageStore.getState();
      const id = makeId();
      addTurn({
        id,
        side: 'them',
        text: wire.text,
        lang: wire.sourceLang,
        translated: '',
        translatedLang: myLang,
        pending: true,
      });
      try {
        const translated = await translateText(wire.text, wire.sourceLang, myLang);
        resolveTurn(id, translated);
        // Reading the peer aloud is the whole point of a live conversation.
        if (isTtsSupported(myLang)) {
          const { ttsSpeed } = useSettingsStore.getState();
          void speakText(translated, myLang, ttsSpeed).catch(() => {});
        }
      } catch {
        resolveTurn(id, '—');
      }
    },
    [addTurn, resolveTurn]
  );

  // Status + message handlers shared by host and join. Hosting also receives the
  // LAN pairing info (onPairInfo) to render as a QR.
  const handlers = useCallback(
    (): P2PHandlers => ({
      onStatus: (state, peers, message) =>
        state === 'error' ? setError(message ?? 'Connection failed') : setStatus(state, peers),
      onMessage: handleIncoming,
      onPairInfo: setPairInfo,
    }),
    [setStatus, setError, setPairInfo, handleIncoming]
  );

  // Host a session: the worklet runs a local DHT bootstrap node and reports its
  // LAN address (onPairInfo) for the QR. Fully offline — no internet required.
  const host = useCallback(
    (preferred?: string) => {
      reset();
      const code = (preferred ?? '').trim() || randomCode();
      try {
        hostP2P(code, handlers());
      } catch (e) {
        setError(e instanceof Error ? e.message : 'P2P is unavailable');
      }
    },
    [reset, setError, handlers]
  );

  // Join a session — from a scanned QR (direct LAN) or a typed code (public DHT).
  const join = useCallback(
    (target: Pairing) => {
      reset();
      try {
        joinP2P(target, handlers());
        setStatus('searching', 0);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'P2P is unavailable');
      }
    },
    [reset, setStatus, setError, handlers]
  );

  // Convenience for the typed-code fallback (no host/port → public DHT).
  const connect = useCallback((code: string) => join({ code }), [join]);

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
      const wire: P2PWireMessage = { id, text: trimmed, sourceLang, ts: Date.now() };
      sendP2P(wire);
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

  // Stop the mic if the screen unmounts mid-session.
  useEffect(
    () => () => {
      if (listening.current) void capture.stop();
    },
    [capture]
  );

  return {
    available: isP2PAvailable(), // Hyperswarm worklet bundle present
    talking,
    host,
    join,
    connect,
    disconnect,
    toggleTalk,
  };
};
