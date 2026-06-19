// store/useP2PStore.ts
// UI state for the Phase 7 Live Conversation (P2P). Holds the connection status
// and the running transcript of both sides. The device work (worklet, swarm,
// translation, TTS) is driven by hooks/useP2PSession.ts — this store is just the
// observable state the screen renders.
import { create } from 'zustand';
import type { P2PState } from '@/lib/p2p';

export type P2PTurnSide = 'you' | 'them';

// One line in the live transcript. `text` is the original (speaker's language);
// `translated` is rendered into the reader's language on this device.
export type P2PTurn = {
  id: string;
  side: P2PTurnSide;
  text: string;
  lang: string; // speaker's language (ISO code)
  translated: string; // '' until the local translation resolves
  translatedLang: string;
  pending: boolean; // true while the local translation is in flight
};

type P2PStore = {
  status: P2PState;
  peers: number;
  error: string | null;
  turns: P2PTurn[];
  setStatus: (status: P2PState, peers: number) => void;
  setError: (message: string) => void;
  addTurn: (turn: P2PTurn) => void;
  resolveTurn: (id: string, translated: string) => void;
  reset: () => void;
};

export const useP2PStore = create<P2PStore>((set) => ({
  status: 'idle',
  peers: 0,
  error: null,
  turns: [],
  setStatus: (status, peers) =>
    set((s) => ({ status, peers, error: status === 'error' ? s.error : null })),
  setError: (message) => set({ status: 'error', error: message }),
  addTurn: (turn) => set((s) => ({ turns: [...s.turns, turn] })),
  resolveTurn: (id, translated) =>
    set((s) => ({
      turns: s.turns.map((t) =>
        t.id === id ? { ...t, translated, pending: false } : t
      ),
    })),
  reset: () => set({ status: 'idle', peers: 0, error: null, turns: [] }),
}));
