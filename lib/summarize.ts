// lib/summarize.ts
// On-device meeting summarization via QVAC completion (Qwen3 0.6B instruct,
// llama.cpp). Turns a translated transcript into a few concise bullet points.
// Fully offline — the transcript never leaves the device. The model lives in
// lib/llm.ts so it is shared with "Ask Your History"; reasoning is disabled for
// a fast, deterministic pass.
import { completion } from '@qvac/sdk';
import { getLlm, unloadLlm } from '@/lib/llm';

const SYSTEM_PROMPT =
  'You are a meeting assistant. Summarize the transcript into 2 to 4 short bullet ' +
  'points capturing the key decisions and action items. Reply with only the bullet ' +
  'points, each on its own line starting with "- ". Use the same language as the transcript.';

// Strip list markers ("- ", "• ", "1. ") and drop empty lines.
const parseBullets = (text: string): string[] =>
  text
    .split('\n')
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/u, '').trim())
    .filter((line) => line.length > 0)
    .slice(0, 5);

// Summarize a meeting transcript into a few short bullet points, in the same
// language as the transcript. Returns [] if the model produced nothing usable.
export const summarizeMeeting = async (transcript: string): Promise<string[]> => {
  const text = transcript.trim();
  if (!text) return [];

  const modelId = await getLlm();
  const run = completion({
    modelId,
    stream: false,
    captureThinking: true, // keeps contentText free of Qwen <think> blocks
    generationParams: { temp: 0.3, predict: 256, reasoning_budget: 0 },
    history: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: text },
    ],
  });

  const final = await run.final;
  const bullets = parseBullets(final.contentText);
  return bullets.length ? bullets : [final.contentText.trim()].filter(Boolean);
};

// Free the LLM — call when the app goes to the background. Delegates to the
// shared loader (lib/llm.ts) so both summaries and history Q&A release together.
export const unloadSummarizationModel = unloadLlm;
