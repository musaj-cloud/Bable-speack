// lib/liveMic.ts
// Crash-safe, lazy access to expo-stream-audio's native live microphone.
// Importing the package statically evaluates its native binding at app launch,
// which throws ("Cannot find native module 'ExpoStreamAudio'") on any dev build
// produced before the dependency was added. We resolve it lazily and return null
// when it's unavailable, so callers fall back to batch recording instead of
// crashing. After a fresh dev build that includes the module, it just works.
import type { AudioFrameEvent, StreamAudioOptions } from 'expo-stream-audio';

export type LiveMic = {
  start: (options?: StreamAudioOptions) => Promise<void>;
  stop: () => Promise<void>;
  addFrameListener: (l: (e: AudioFrameEvent) => void) => { remove: () => void };
  addErrorListener: (l: (e: { message: string }) => void) => { remove: () => void };
};

let resolved: LiveMic | null | undefined;

// Returns the native live-mic module, or null if it isn't in this build. Result
// is memoized so the (potentially throwing) require runs at most once.
export const getLiveMic = (): LiveMic | null => {
  if (resolved !== undefined) return resolved;
  try {
    // Lazy require: a static import would crash builds without the native module.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    resolved = require('expo-stream-audio') as LiveMic;
  } catch {
    resolved = null;
  }
  return resolved;
};

export const isLiveMicAvailable = (): boolean => getLiveMic() !== null;
