// lib/wav.ts
// Wrap raw 16-bit PCM samples (as returned by QVAC TTS) into a minimal WAV
// byte buffer so the audio can be written to a file and played back. Mono.
// No platform/Node APIs — pure typed-array math, safe in React Native.

const HEADER_BYTES = 44;

// Build a mono 16-bit PCM WAV file from int16 samples.
export const pcm16ToWav = (samples: number[], sampleRate: number): Uint8Array => {
  const dataBytes = samples.length * 2;
  const buffer = new Uint8Array(HEADER_BYTES + dataBytes);
  const view = new DataView(buffer.buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  // RIFF / WAVE container
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');

  // fmt chunk (PCM, mono, 16-bit)
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true); // chunk size
  view.setUint16(20, 1, true); // audio format = PCM
  view.setUint16(22, 1, true); // channels = mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate (sampleRate * blockAlign)
  view.setUint16(32, 2, true); // block align (channels * bytesPerSample)
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-32768, Math.min(32767, Math.round(samples[i] ?? 0)));
    view.setInt16(HEADER_BYTES + i * 2, s, true);
  }

  return buffer;
};
