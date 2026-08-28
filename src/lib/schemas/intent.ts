
import { z } from 'zod';

export const intentRequestSchema = z.object({
  language: z.string().optional(),
  script: z.string().optional(),
  intent: z.string().optional(),
  goal: z.string().optional(),
  activity: z.string().optional(),
  needs: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(1).optional(),
  missing_context: z.array(z.string()).optional(),
  next_question: z.string().optional(),
});

export type IntentRequest = z.infer<typeof intentRequestSchema>;

