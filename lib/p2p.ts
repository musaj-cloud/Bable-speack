// lib/p2p.ts
// React-Native (Hermes) side of the Phase 7 P2P bridge. It hosts the Bare
// worklet (bare/p2p-backend.mjs) via react-native-bare-kit and talks to it over
// bare-rpc. The worklet does the actual Hyperswarm DHT work; this module only
// starts it, forwards connect/send/disconnect, and surfaces status + incoming
// messages back to the React layer.
//
// PRIVACY: only { id, text, sourceLang, ts } crosses the wire. Translation and
// TTS of received text happen locally (see hooks/useP2PSession.ts). No audio,
// no logging of message content, no relay server.
import RPC from 'bare-rpc';
import b4a from 'b4a';
import { Worklet } from 'react-native-bare-kit';
import p2pBundle from '@/bare/p2p.bundle.js';

// RPC command ids — MUST stay in sync with bare/p2p-backend.mjs.
const CMD_CONNECT = 1;
const CMD_SEND = 2;
const CMD_DISCONNECT = 3;
const CMD_STATUS = 10;
const CMD_MESSAGE = 11;

export type P2PState = 'idle' | 'searching' | 'connected' | 'error';

// The single small JSON payload that crosses the DHT between paired phones.
export type P2PWireMessage = {
  id: string;
  text: string; // what the speaker said, in their own language
  sourceLang: string; // ISO code of `text`
  ts: number;
};

export type P2PHandlers = {
  onStatus: (state: P2PState, peers: number, message?: string) => void;
  onMessage: (msg: P2PWireMessage) => void;
};

// True only once `npm run build:p2p` has packed the worklet (placeholder is null).
export const isP2PAvailable = (): boolean =>
  typeof p2pBundle === 'string' && p2pBundle.length > 0;

// bare-rpc is typed against bare-stream's Duplex; the worklet's IPC is a streamx
// Duplex with the same runtime contract. The RPC incoming callback receives both
// requests and fire-and-forget events — we only read .command/.data.
type IncomingEvent = { command: number; data: Uint8Array | null };

let worklet: Worklet | null = null;
let rpc: InstanceType<typeof RPC> | null = null;
let handlers: P2PHandlers | null = null;

const decode = (data: Uint8Array | null): string => (data ? b4a.toString(data) : '');

const onIncoming = (req: IncomingEvent) => {
  if (!handlers) return;
  if (req.command === CMD_STATUS) {
    try {
      const { state, peers, message } = JSON.parse(decode(req.data));
      handlers.onStatus(state as P2PState, peers ?? 0, message);
    } catch {
      // malformed status frame — ignore
    }
  } else if (req.command === CMD_MESSAGE) {
    try {
      handlers.onMessage(JSON.parse(decode(req.data)) as P2PWireMessage);
    } catch {
      // malformed peer message — ignore rather than crash the session
    }
  }
};

// Start the worklet + RPC once, then reuse it across connect/disconnect cycles.
// (We never call worklet.terminate(): like QVAC's client, terminating a worklet
// that loaded native addons can crash on Android, so we tear down the swarm
// instead and keep the worklet idle.)
const ensureWorklet = () => {
  if (worklet) return;
  if (!isP2PAvailable()) throw new Error('P2P worklet bundle not built. Run `npm run build:p2p`.');
  worklet = new Worklet();
  worklet.start('p2p.bundle', p2pBundle as string, ['p2p']);
  rpc = new RPC(worklet.IPC as never, onIncoming as never);
};

// Join the DHT topic for `code` and stream status + messages to `h`.
export const connectP2P = (code: string, h: P2PHandlers): void => {
  handlers = h;
  ensureWorklet();
  rpc!.event(CMD_CONNECT).send(code, 'utf8');
};

// Broadcast one message to the paired peer(s).
export const sendP2P = (msg: P2PWireMessage): void => {
  if (!rpc) return;
  rpc.event(CMD_SEND).send(JSON.stringify(msg), 'utf8');
};

// Leave the swarm but keep the worklet warm for the next connect.
export const disconnectP2P = (): void => {
  if (rpc) {
    try {
      rpc.event(CMD_DISCONNECT).send('', 'utf8');
    } catch {
      // worklet already gone
    }
  }
  handlers = null;
};
