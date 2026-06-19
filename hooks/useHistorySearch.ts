// hooks/useHistorySearch.ts
// Filters + groups history entries for the History screen.
// - No query: every entry, grouped by day (Today / Yesterday / date).
// - Query: instant keyword matches, re-ranked by on-device semantic similarity
//   when embeddings are available. Falls back to keyword-only if not.
import { useEffect, useMemo, useState } from 'react';
import { dayLabel } from '@/lib/datetime';
import { cosineSimilarity, embedText } from '@/lib/embeddings';
import { TranslationEntry } from '@/types/translation';

export type HistoryGroup = { label: string; items: TranslationEntry[] };

const MIN_SIMILARITY = 0.35;

// Group an ordered list into day buckets, preserving the incoming order.
const groupByDay = (entries: TranslationEntry[]): HistoryGroup[] => {
  const groups: HistoryGroup[] = [];
  for (const entry of entries) {
    const label = dayLabel(entry.timestamp);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(entry);
    else groups.push({ label, items: [entry] });
  }
  return groups;
};

export const useHistorySearch = (
  entries: TranslationEntry[],
  query: string
): HistoryGroup[] => {
  const trimmed = query.trim().toLowerCase();
  const [ranked, setRanked] = useState<TranslationEntry[] | null>(null);

  // Instant substring match on both sides of the translation.
  const keyword = useMemo(() => {
    if (!trimmed) return entries;
    return entries.filter(
      (e) =>
        e.sourceText.toLowerCase().includes(trimmed) ||
        e.translatedText.toLowerCase().includes(trimmed)
    );
  }, [entries, trimmed]);

  // Debounced semantic re-rank. Best-effort: clears back to keyword on failure.
  useEffect(() => {
    if (!trimmed) {
      setRanked(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      const queryVec = await embedText(query);
      if (cancelled || !queryVec) {
        if (!cancelled) setRanked(null);
        return;
      }
      const scored = entries
        .filter((e) => e.embedding?.length === queryVec.length)
        .map((e) => ({ e, score: cosineSimilarity(queryVec, e.embedding!) }))
        .filter((x) => x.score >= MIN_SIMILARITY)
        .sort((a, b) => b.score - a.score)
        .map((x) => x.e);
      if (!cancelled) setRanked(scored);
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [entries, query, trimmed]);

  return useMemo(() => {
    if (!trimmed) return groupByDay(entries);

    // Semantic matches first, then any keyword matches they missed.
    let results = keyword;
    if (ranked) {
      const seen = new Set(ranked.map((e) => e.id));
      results = [...ranked, ...keyword.filter((e) => !seen.has(e.id))];
    }
    return results.length ? [{ label: `${results.length} result${results.length === 1 ? '' : 's'}`, items: results }] : [];
  }, [trimmed, entries, keyword, ranked]);
};
