// lib/rag.ts
// "Ask Your History" — fully offline retrieval-augmented Q&A over saved
// translations. Two stages, both on device:
//   1. Retrieve: embed the question, cosine-rank stored entries (keyword
//      fallback when embeddings are unavailable), keep the top matches.
//   2. Generate: feed only those entries to the shared LLM as grounded context.
// The answer is constrained to the retrieved entries — it never invents facts.
// If the LLM is unavailable, we still return the ranked sources (no answer).
import { completion } from '@qvac/sdk';
import { dayLabel } from '@/lib/datetime';
import { cosineSimilarity, embedText } from '@/lib/embeddings';
import { getLlm } from '@/lib/llm';
import { TranslationEntry } from '@/types/translation';

const TOP_K = 4; // entries handed to the model as context
const MIN_SIMILARITY = 0.25; // floor for a semantic match to count

export type RagSource = { entry: TranslationEntry; score: number };
export type RagAnswer = {
  answer: string | null; // null when the LLM is unavailable / produced nothing
  sources: RagSource[]; // ranked entries the answer draws from (may be empty)
};

// Rank entries by relevance to the question. Semantic when the embedding model
// and stored vectors are available; otherwise a plain keyword fallback so the
// feature still works offline on the very first run.
const retrieve = async (
  question: string,
  entries: TranslationEntry[]
): Promise<RagSource[]> => {
  const queryVec = await embedText(question);
  if (queryVec) {
    const scored = entries
      .filter((e) => e.embedding?.length === queryVec.length)
      .map((e) => ({ entry: e, score: cosineSimilarity(queryVec, e.embedding!) }))
      .filter((x) => x.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score)
      .slice(0, TOP_K);
    if (scored.length) return scored;
  }

  const q = question.trim().toLowerCase();
  return entries
    .filter(
      (e) =>
        e.sourceText.toLowerCase().includes(q) ||
        e.translatedText.toLowerCase().includes(q)
    )
    .slice(0, TOP_K)
    .map((e) => ({ entry: e, score: 0 }));
};

// Render the retrieved entries as numbered context the model can cite.
const buildContext = (sources: RagSource[]): string =>
  sources
    .map(({ entry: e }, i) => {
      const when = `${dayLabel(e.timestamp)}, ${e.mode}`;
      return (
        `[${i + 1}] (${when}) ${e.sourceLang} → ${e.targetLang}\n` +
        `Original: ${e.sourceText}\nTranslation: ${e.translatedText}`
      );
    })
    .join('\n\n');

const SYSTEM_PROMPT =
  "You are BabelSpeak's history assistant. The user is asking about their own " +
  'past translations, provided below as numbered entries. Answer the question ' +
  'using ONLY those entries. If the entries do not contain the answer, say you ' +
  "don't see that in their saved history. Be concise — 1 to 3 sentences. Never " +
  'invent details that are not in the entries.';

// Answer a natural-language question about the user's saved history. Always
// resolves (never throws) so the UI can render a friendly state for every case.
export const askHistory = async (
  question: string,
  entries: TranslationEntry[]
): Promise<RagAnswer> => {
  const text = question.trim();
  if (!text) return { answer: null, sources: [] };

  const sources = await retrieve(text, entries);
  if (sources.length === 0) return { answer: null, sources: [] };

  try {
    const modelId = await getLlm();
    const run = completion({
      modelId,
      stream: false,
      captureThinking: true, // keep contentText free of Qwen <think> blocks
      generationParams: { temp: 0.2, predict: 220, reasoning_budget: 0 },
      history: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Question: ${text}\n\nSaved entries:\n${buildContext(sources)}`,
        },
      ],
    });
    const final = await run.final;
    const answer = final.contentText.trim();
    return { answer: answer || null, sources };
  } catch {
    // LLM unavailable (offline first run, load failure) — still surface the
    // retrieved entries so the user gets their sources.
    return { answer: null, sources };
  }
};
