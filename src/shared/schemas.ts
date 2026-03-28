import { z } from 'zod';

export const IntakeMetadataSchema = z.object({
  type: z.enum(['audio', 'video', 'photo']),
  context: z.string().optional(),
});

export const ActionPackOutputSchema = z.object({
  event_id: z.string().uuid(),
  intent: z.string().min(1, 'Intent is required'),
  entities: z.record(z.string(), z.any()),
  verification: z.object({
    status: z.enum(['VERIFIED', 'REQUIRES_REVIEW']),
    ground_truth_source: z.string().nullable(),
  }),
});

export type IntakeMetadata = z.infer<typeof IntakeMetadataSchema>;
export type ActionPackOutput = z.infer<typeof ActionPackOutputSchema>;
