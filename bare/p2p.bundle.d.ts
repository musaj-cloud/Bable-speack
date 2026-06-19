// Types for the generated Bare worklet bundle (bare/p2p.bundle.js).
// The committed placeholder exports `null`; `npm run build:p2p` overwrites the
// .js with `module.exports = "<packed bundle string>"`. Either way the value
// is `string | null`, which lib/p2p.ts narrows before starting the worklet.
declare const p2pBundle: string | null;
export default p2pBundle;
