import { z } from 'zod';

export const intentResolutionSchema = z.object({
  query: z.string(),
  detectedLanguage: z.enum(['en', 'or', 'hi']),
  primaryNeed: z.string(),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  suggestedSchemeIds: z.array(z.string()),
});

export type IntentResolution = z.infer<typeof intentResolutionSchema>;
