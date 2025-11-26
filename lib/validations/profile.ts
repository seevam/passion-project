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

// Scientific Assessment Schemas

export const IntrinsicMotivationSchema = z.object({
  autonomyScore: z.number().int().min(1).max(10),
  competenceScore: z.number().int().min(1).max(10),
  relatednessScore: z.number().int().min(1).max(10),
  motivationProfile: z.record(z.string(), z.union([z.number(), z.string()])),
});

export const PassionDepthSchema = z.object({
  interestDepth: z.record(z.string(), z.number().int().min(1).max(10)),
  passionIndicators: z.record(z.string(), z.union([z.number(), z.boolean(), z.string()])),
  passionType: z.enum(['harmonious', 'obsessive', 'emerging', 'undeveloped']),
  flowFrequency: z.number().int().min(1).max(10),
});

export const GritSchema = z.object({
  gritScore: z.number().int().min(1).max(10),
  perseveranceScore: z.number().int().min(1).max(10),
  consistencyScore: z.number().int().min(1).max(10),
  pastCompletions: z.array(z.object({
    type: z.string(),
    completed: z.boolean(),
    duration: z.string().optional(),
  })),
});

export const GrowthMindsetSchema = z.object({
  growthMindsetScore: z.number().int().min(1).max(10),
  challengeResponse: z.enum(['embrace', 'neutral', 'avoid']),
  failureAttribution: z.record(z.string(), z.string()),
});

export const RIASECSchema = z.object({
  riasecScores: z.object({
    realistic: z.number().int().min(1).max(10),
    investigative: z.number().int().min(1).max(10),
    artistic: z.number().int().min(1).max(10),
    social: z.number().int().min(1).max(10),
    enterprising: z.number().int().min(1).max(10),
    conventional: z.number().int().min(1).max(10),
  }),
  careerClusters: z.array(z.string()).optional(),
});
