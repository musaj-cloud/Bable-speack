// lib/translation.ts
// Bergamot neural machine translation. Loads/reuses the on-device model for
// the language pair, then translates a single string. Runs fully offline.
import { translate } from '@qvac/sdk';
import { getTranslationModel } from '@/lib/qvac';

export const translateText = async (
  text: string,
  from: string,
  to: string
): Promise<string> => {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (from === to) return trimmed;

  const modelId = await getTranslationModel(from, to);
  const result = translate({
    modelId,
    text: trimmed,
    modelType: 'nmtcpp-translation',
    stream: false,
  });
  return (await result.text).trim();
};
