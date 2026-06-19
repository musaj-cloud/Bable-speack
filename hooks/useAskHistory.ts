// hooks/useAskHistory.ts
// Drives the "Ask Your History" flow: holds the question, runs the on-device
// RAG pipeline (lib/rag.ts) against the loaded history, and exposes a simple
// status the sheet renders. Keeps the History screen thin.
import { useState } from 'react';
import { askHistory, type RagAnswer } from '@/lib/rag';
import { useHistoryStore } from '@/store/useHistoryStore';

export type AskStatus = 'idle' | 'thinking' | 'done' | 'error';

export const useAskHistory = () => {
  const entries = useHistoryStore((s) => s.entries);
  const [status, setStatus] = useState<AskStatus>('idle');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<RagAnswer | null>(null);

  const ask = async (input: string) => {
    const text = input.trim();
    if (!text) return;
    setQuestion(text);
    setResult(null);
    setStatus('thinking');
    try {
      setResult(await askHistory(text, entries));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setQuestion('');
    setResult(null);
  };

  return { status, question, result, ask, reset };
};
