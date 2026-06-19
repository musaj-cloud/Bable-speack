// scripts/build-p2p.mjs
// Packs the Phase 7 P2P worklet (bare/p2p-backend.mjs) into the Bare worklet
// bundle that ships with the app (bare/p2p.bundle.js). Run with:
//
//   npm run build:p2p
//
// This mirrors how @qvac/sdk packs its own worker bundle (see
// node_modules/@qvac/sdk/dist/commands/bundle): it shells out to the `bare-pack`
// binary with `--linked` so the native addons Hyperswarm depends on (udx-native,
// sodium-native) are resolved from their per-host prebuilds.
//
// REQUIREMENTS: this must run on a machine that has the Bare prebuilds for the
// target hosts available (the same toolchain a native dev build uses). bare-pack
// writes a CJS module that does `module.exports = "<bundle string>"`, which
// react-native-bare-kit's Worklet.start() loads directly.
//
// After it succeeds, rebuild the dev client and test on two physical arm64
// devices (P2P needs the QVAC/Bare native runtime — no emulator). If you do not
// run this step, bare/p2p.bundle.js stays a null placeholder and the Live
// Conversation screen shows a clear "not built" state instead of crashing.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { execPath, platform } from 'node:process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ENTRY = path.join(root, 'bare', 'p2p-backend.mjs');
const OUT = path.join(root, 'bare', 'p2p.bundle.js');

// Same mobile hosts QVAC's Expo plugin packs for (android + iOS device/sim).
const HOSTS = ['android-arm64', 'ios-arm64', 'ios-arm64-simulator', 'ios-x64-simulator'];

const barePackBin = path.join(path.dirname(require.resolve('bare-pack/package.json')), 'bin.js');

const args = [
  ...HOSTS.flatMap((h) => ['--host', h]),
  '--linked', // resolve linked native addon prebuilds (udx-native, sodium-native)
  '--out',
  OUT,
  ENTRY,
];

// On Windows the bin is not directly executable — run it through node.
const isWindows = platform === 'win32';
const command = isWindows ? execPath : barePackBin;
const spawnArgs = isWindows ? [barePackBin, ...args] : args;

console.log(`📦 Packing P2P worklet:\n   ${command} ${spawnArgs.join(' ')}\n`);

const proc = spawn(command, spawnArgs, { stdio: 'inherit' });
proc.on('error', (err) => {
  console.error(`\n❌ bare-pack failed to start: ${err.message}`);
  process.exit(1);
});
proc.on('close', (code) => {
  if (code === 0) {
    console.log(`\n✅ Wrote ${path.relative(root, OUT)} — rebuild the dev client and test on two devices.`);
  } else {
    console.error(`\n❌ bare-pack exited with code ${code}. The committed null placeholder is unchanged.`);
    process.exit(code ?? 1);
  }
});
