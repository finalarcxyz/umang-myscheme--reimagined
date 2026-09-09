import { analyzeVocabulary } from '../schemes/vocabulary';
import { intentResolutionSchema, type IntentResolution } from './schema';

export async function resolveIntent(text: string, locale?: string): Promise<IntentResolution> {
  // 1. Deterministic Local Cache
  const vocabulary = analyzeVocabulary(text);

  // If we have high confidence matches from the vocabulary
  if (vocabulary.concepts.size > 0) {
    const conceptsArray = Array.from(vocabulary.concepts);
    return {
      query: text,
      detectedLanguage: (locale as 'en' | 'or' | 'hi') || 'en',
      primaryNeed: conceptsArray[0],
      tags: conceptsArray,
      confidence: 0.9,
      suggestedSchemeIds: [], // We can leave this empty or populate if needed
    };
  }

  // 2. Server-Side LLM Fallback (mocked if no env variables, or real if env exists)
  const llmEndpoint = process.env.LLM_ENDPOINT;
  const llmApiKey = process.env.LLM_API_KEY;

  if (llmEndpoint && llmApiKey) {
    try {
      const response = await fetch(llmEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmApiKey}`
        },
        body: JSON.stringify({
          prompt: text,
          locale: locale || 'en'
        })
      });

      if (!response.ok) {
        throw new Error(`LLM API returned ${response.status}`);
      }

      const data = await response.json();

      // Strict parsing and validation against Zod schema
      return intentResolutionSchema.parse(data);
    } catch (error) {
      console.error('LLM Intent Resolution failed:', error);
      // Fallback in case of LLM error
      return {
        query: text,
        detectedLanguage: 'en',
        primaryNeed: 'unknown',
        tags: [],
        confidence: 0,
        suggestedSchemeIds: [],
      };
    }
  }

  // Mock Fallback if no LLM configured
  return intentResolutionSchema.parse({
    query: text,
    detectedLanguage: 'en',
    primaryNeed: 'unresolved',
    tags: [],
    confidence: 0.1,
    suggestedSchemeIds: []
  });
}
