# `bare/` — Phase 7 P2P worklet (Holepunch / Hyperswarm)

This folder holds the **on-device peer-to-peer backend** for BabelSpeak's Live
Conversation feature. It runs inside a **Bare worklet** (`react-native-bare-kit`),
not React Native's Hermes engine, because Hyperswarm and its DHT/crypto stack
are Bare modules.

```
React Native (Hermes)                 Bare worklet (bare-kit)
─────────────────────                 ───────────────────────
hooks/useP2PSession.ts  ◄── bare-rpc ──►  hyperswarm.join(topic)
lib/p2p.ts (RN bridge)     (IPC frames)   p2p-backend.mjs (this folder)
```

## Files

| File | Runs in | What it is |
|------|---------|------------|
| `p2p-backend.mjs` | Bare worklet | Swarm join + newline-JSON framing + RPC to RN |
| `p2p.bundle.js` | required by RN | **Generated** packed worklet (committed as a `null` placeholder) |
| `p2p.bundle.d.ts` | typecheck | Declares the bundle as `string \| null` |

## Building the bundle

```bash
npm run build:p2p
```

This shells out to `bare-pack` (the same packer `@qvac/sdk` uses) and overwrites
`p2p.bundle.js` with `module.exports = "<packed bundle string>"`, which
`Worklet.start()` loads directly.

**Requirements**

- Run on a machine with the Bare **prebuilds** for the target hosts available
  (Hyperswarm pulls in the native addons `udx-native` and `sodium-native`).
- It packs for `android-arm64`, `ios-arm64`, and the iOS simulators.
- After it succeeds, **rebuild the dev client** and test on **two physical
  arm64 devices** — P2P needs the Bare native runtime, so no emulator.

> On Windows you generally **cannot** pack locally (the arm64 prebuilds aren't
> there). Build on EAS instead — see below.

## Building on EAS (cloud)

The bundle is packed automatically on the EAS builder. `package.json` has an
**`eas-build-post-install`** hook that runs `npm run build:p2p` right after deps
install (when the prebuilds are present) and before Metro bundles the JS:

```jsonc
"eas-build-post-install": "node scripts/build-p2p.mjs || echo '… skipped …'"
```

It is intentionally **non-fatal** (`|| echo …`): if packing the worklet fails on
the builder, the EAS build still succeeds, `bare/p2p.bundle.js` stays the null
placeholder, and Live Conversation shows its "not built yet" state. Phases 1–6
are never affected.

```bash
eas build --profile development --platform android   # bundle packs during the build
```

After install, check the EAS build log for `✅ Wrote bare/p2p.bundle.js`. If you
see the skip message instead, P2P didn't pack — read the bare-pack error above it.

### Native addon linking (the one thing to verify on first build)

`react-native-bare-kit`'s native linker is what pulls Bare addons into the app
binary. By default it links **all** addons (so `udx-native`/`sodium-native` come
in for free). `@qvac/sdk`'s Expo plugin patches that linker to be *manifest-aware*
(only the addons QVAC's own bundle needs). QVAC's bundle already pulls in
`@hyperswarm/secret-stream`, so the addons this worklet shares are normally
linked too — but **confirm on the first device build**: if the Live screen
connects but the worklet errors loading a native addon, the addons need to be in
the link set (add a `qvac.config.json` that keeps the relevant plugins, or ship a
dedicated addons manifest for this worklet).

## What crosses the wire

Only a tiny JSON message:

```json
{ "id": "…", "text": "<what the speaker said, in their language>", "sourceLang": "en", "ts": 0 }
```

Each phone runs its **own** Bergamot translation on the received `text` into its
own reading language, then its own TTS. **Raw audio never leaves a device.**

## Graceful failure (why this never breaks the app)

`p2p.bundle.js` is committed as `module.exports = null` so Metro can always
resolve the import. Until you run `npm run build:p2p`, `lib/p2p.ts` reports P2P
as unavailable and the Live screen shows a clear "not built yet" state. Phases
1–6 never import anything here, so a missing or failed P2P bundle cannot break
the build or the rest of the app.

## Pairing & offline note

The swarm topic is derived from a short pairing code typed on both phones
(`hypercore-crypto`-hashed to a 32-byte topic). First discovery may need the
DHT bootstrap nodes reachable once; on the same LAN the local mDNS path works
fully offline. For a true airplane-mode stage demo, keep both phones on the same
local network.
