// lib/llm.ts
// Shared on-device LLM (Qwen3 0.6B instruct, llama.cpp). Both Meeting summaries
// (lib/summarize.ts) and "Ask Your History" (lib/rag.ts) generate text with the
// same model, so it is loaded once, cached, and reused — the model only ever
// occupies device memory a single time. Fully offline.
import { loadModel, unloadModel, QWEN3_600M_INST_Q4 } from '@qvac/sdk';

// Same loadModel overload gotcha as the other QVAC models — call through a
// precisely typed alias so TS keeps the literal modelConfig shape.
const loadLlmRaw = loadModel as unknown as (options: {
  modelSrc: typeof QWEN3_600M_INST_Q4;
  modelConfig: { ctx_size?: number };
}) => Promise<string>;

let modelPromise: Promise<string> | null = null;

// Returns a loaded modelId for the shared LLM, loading + caching on first use.
export const getLlm = (): Promise<string> => {
  if (!modelPromise) {
    modelPromise = loadLlmRaw({
      modelSrc: QWEN3_600M_INST_Q4,
      modelConfig: { ctx_size: 4096 },
    }).catch((err) => {
      modelPromise = null; // drop the failed load so the next call can retry
      throw err;
    });
  }
  return modelPromise;
};

// Free the LLM — call when the app goes to the background.
export const unloadLlm = async (): Promise<void> => {
  const load = modelPromise;
  modelPromise = null;
  if (!load) return;
  try {
    await unloadModel({ modelId: await load });
  } catch {
    // never finished loading — nothing to unload
  }
};
