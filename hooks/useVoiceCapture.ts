// hooks/useVoiceCapture.ts
// Unified voice capture for Converse. Prefers live, word-by-word streaming
// transcription (expo-stream-audio + transcribeStream) when the native mic
// module is in the build; otherwise falls back to batch recording (record a
// file, then transcribe it). Either way the caller gets the same interface:
// start(lang, handlers) and stop(). onPartial only fires in streaming mode.
import { useCallback, useRef } from 'react';
import { useLiveTranscription, type LiveHandlers } from '@/hooks/useLiveTranscription';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { transcribeFile } from '@/lib/transcription';

export const useVoiceCapture = () => {
  const live = useLiveTranscription();
  const recorder = useVoiceRecorder();
  const lang = useRef('en');
  const handlers = useRef<LiveHandlers | null>(null);
  const mode = useRef<'live' | 'batch' | null>(null);
  const finishing = useRef(false); // guard so batch finalizes once

  // Batch fallback: stop the file recording, transcribe it, then finalize once.
  const finishBatch = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    const h = handlers.current;
    try {
      const uri = await recorder.stop();
      const text = uri ? await transcribeFile(uri, lang.current) : '';
      h?.onFinal(text);
    } catch (e) {
      h?.onError?.(e);
    }
  }, [recorder]);

  const start = useCallback(
    async (l: string, h: LiveHandlers): Promise<boolean> => {
      lang.current = l;
      handlers.current = h;
      if (live.available) {
        mode.current = 'live';
        return live.start(l, h);
      }
      // Batch: auto-stop on silence, then transcribe + finalize.
      mode.current = 'batch';
      finishing.current = false;
      return recorder.start({ onAutoStop: () => void finishBatch() });
    },
    [live, recorder, finishBatch]
  );

  // Stop early (user tapped the mic again). Live finalizes from the last partial;
  // batch transcribes the captured file. Both end via the caller's onFinal.
  const stop = useCallback(async () => {
    if (mode.current === 'live') await live.stop();
    else if (mode.current === 'batch') await finishBatch();
    mode.current = null;
  }, [live, finishBatch]);

  return { start, stop, streaming: live.available };
};
