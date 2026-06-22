// lib/pairing.ts
// The tiny payload encoded in a Live Conversation QR code (and the shape the
// worklet hands back when hosting). It carries just the swarm pairing code: both
// phones hash the same code to the same Holepunch DHT topic and discover each
// other over the internet (see bare/p2p-backend.mjs).
//
// Wire form is a compact, delimited string (a smaller QR than JSON):
//   BSPK1|<code>
export type Pairing = {
  code: string;
};

const PREFIX = 'BSPK1';

export const encodePairing = ({ code }: Pairing): string => [PREFIX, code].join('|');

// Parse a scanned string. Returns null if it isn't a BabelSpeak pairing code, so
// the scanner can ignore unrelated QR codes the camera happens to see.
export const parsePairing = (text: string): Pairing | null => {
  const parts = text.split('|');
  if (parts[0] !== PREFIX || !parts[1]) return null;
  return { code: parts[1] };
};
