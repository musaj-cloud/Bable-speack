// lib/embeddings.ts
// On-device text embeddings (EmbeddingGemma 300M) for semantic history search.
// Best-effort: the model is large and loads lazily on first search. If it ever
// fails to load, callers fall back to plain keyword matching — search still works.
import { EMBEDDINGGEMMA_300M_Q4_0, embed, loadModel } from '@qvac/sdk';

// loadModel's overloads infer modelConfig from the descriptor's engine; an
// embedding model defeats the Bergamot/Whisper inference, so we call through a
// precisely typed alias (same pattern as lib/qvac.ts). CPU keeps it portable
// across devices that lack a usable GPU backend.
const loadEmbeddingModelRaw = loadModel as unknown as (options: {
  modelSrc: typeof EMBEDDINGGEMMA_300M_Q4_0;
  modelConfig?: { device?: string; gpuLayers?: number };
}) => Promise<string>;

let modelPromise: Promise<string> | null = null;

const getEmbeddingModel = (): Promise<string> => {
  if (!modelPromise) {
    modelPromise = loadEmbeddingModelRaw({
      modelSrc: EMBEDDINGGEMMA_300M_Q4_0,
      modelConfig: { device: 'cpu' },
    }).catch((err) => {
      modelPromise = null; // allow a retry on the next call
      throw err;
    });
  }
  return modelPromise;
};

// Embed one string. Returns null if the model is unavailable (offline first run,
// load failure) so semantic search degrades to keyword search rather than crashing.
export const embedText = async (text: string): Promise<number[] | null> => {
  const trimmed = text.trim();
  if (!trimmed) return null;
  try {
    const modelId = await getEmbeddingModel();
    const { embedding } = await embed({ modelId, text: trimmed });
    return embedding;
  } catch {
    return null;
  }
};

// Cosine similarity in [-1, 1]; higher means closer in meaning.
export const cosineSimilarity = (a: number[], b: number[]): number => {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
};
