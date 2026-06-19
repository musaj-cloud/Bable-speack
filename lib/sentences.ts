// lib/sentences.ts
// Split a transcript into individual sentences for per-segment translation.
// Breaks on Latin (. ! ? …) and CJK (。！？) terminators followed by whitespace
// or end of text. Best-effort — if no terminators are found the whole transcript
// is returned as a single segment so nothing is lost.

export const splitSentences = (text: string): string[] => {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const parts = trimmed
    .split(/(?<=[.!?。！？…])\s+/u)
    .map((s) => s.trim())
    .filter(Boolean);

  return parts.length ? parts : [trimmed];
};
