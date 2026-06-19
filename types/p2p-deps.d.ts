// Minimal ambient types for the buffer helper used by the RN-side P2P bridge.
// `b4a` ships no .d.ts but is a hard dependency of bare-rpc/hyperswarm and works
// in Hermes (pure-JS Uint8Array path), so lib/p2p.ts uses it to UTF-8 decode the
// bytes a worklet event carries (req.data is a plain Uint8Array at runtime).
declare module 'b4a' {
  const b4a: {
    toString(buf: Uint8Array, encoding?: string): string;
    from(input: string | Uint8Array | ArrayBuffer, encoding?: string): Uint8Array;
  };
  export default b4a;
}
