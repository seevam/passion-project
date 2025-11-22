import { z } from 'zod';

export const QuickStartSchema = z.object({
  gradeLevel: z.number().int().min(6).max(12),
  collegeTimeline: z.string().regex(/^applying-\d{4}$/),
  timeCommitment: z.number().int().min(2).max(20),
  currentActivities: z.array(z.string()).max(10),
  favoriteSubjects: z.array(z.string()).min(1).max(10),
  skillsConfidence: z.record(z.string(), z.number().int().min(1).max(10)),
  workStyle: z.enum(['solo', 'small-team', 'large-team']),
  impactPreference: z.enum(['friends', 'school', 'community', 'world']),
  challengeLevel: z.number().int().min(1).max(10),
});

export const ValuesSchema = z.object({
  topValues: z.array(z.string()).min(3).max(5),
});

export const StrengthsSchema = z.object({
  strengthsRadar: z.record(z.string(), z.number().int().min(1).max(10)),
});

export const InterestsSchema = z.object({
  problemFocus: z.array(z.string()).min(1).max(5),
  dreamCareer: z.string().max(500).optional(),
});
