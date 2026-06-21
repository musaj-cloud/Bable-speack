// lib/pairing.ts
// The tiny payload encoded in a Live Conversation QR code (and the shape the
// worklet hands back when hosting). It carries the swarm pairing code plus — for
// offline direct connection — the host phone's LAN address, so the joiner reaches
// it over the local network with no internet (the host runs a local DHT
// bootstrap node; see bare/p2p-backend.mjs).
//
// Wire form is a compact, delimited string (a smaller QR than JSON):
//   BSPK1|<code>|<host>|<port>
// host/port are empty for a code-only pairing, which falls back to the public DHT.
export type Pairing = {
  code: string;
  host?: string; // host phone's LAN IPv4, e.g. 192.168.43.1
  port?: number; // host phone's local DHT bootstrap port
};

const PREFIX = 'BSPK1';

export const encodePairing = ({ code, host, port }: Pairing): string =>
  [PREFIX, code, host ?? '', port ?? ''].join('|');

// Parse a scanned string. Returns null if it isn't a BabelSpeak pairing code, so
// the scanner can ignore unrelated QR codes the camera happens to see.
export const parsePairing = (text: string): Pairing | null => {
  const parts = text.split('|');
  if (parts[0] !== PREFIX || !parts[1]) return null;
  const port = parts[3] ? Number(parts[3]) : undefined;
  if (port !== undefined && !Number.isFinite(port)) return null;
  return { code: parts[1], host: parts[2] || undefined, port };
};
