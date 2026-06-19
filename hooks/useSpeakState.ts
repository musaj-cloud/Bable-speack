// hooks/useSpeaking.ts
// Reactive TTS playback state ('idle' | 'loading' | 'speaking') so the speaker
// buttons can show a loading spinner while the voice synthesizes and a pulse
// while it actually plays — all in sync with real on-device audio.
import { useEffect, useState } from 'react';
import { onSpeakStateChange, type SpeakState } from '@/lib/tts';

export const useSpeakState = (): SpeakState => {
  const [state, setState] = useState<SpeakState>('idle');
  useEffect(() => onSpeakStateChange(setState), []);
  return state;
};
