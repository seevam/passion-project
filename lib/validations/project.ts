import { z } from 'zod';

export const CreateProjectSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-_,.'!]+$/, 'Title contains invalid characters'),

  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be less than 5000 characters'),

  category: z.enum([
    'CREATIVE',
    'SOCIAL_IMPACT',
    'ENTREPRENEURIAL',
    'RESEARCH',
    'TECHNICAL',
    'LEADERSHIP',
  ]),

  ideaSourceId: z.string().cuid().optional(),

  // Team & Collaboration
  idealTeamSize: z.enum(['SOLO', 'DUO', 'SMALL_TEAM', 'LARGE_TEAM']).default('SOLO'),
  openForCollaboration: z.boolean().default(false),
  maxTeamSize: z.number().int().min(1).max(20).default(1),
  skillsNeeded: z.array(z.string()).default([]),
  collaborationDesc: z.string().max(1000).optional(),
});

export const UpdateProjectSchema = CreateProjectSchema.partial();

export const CreateMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.string().datetime().optional(),
  orderIndex: z.number().int().min(0),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  estimatedHours: z.number().int().min(0).max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedToId: z.string().cuid().optional(),
});

export const AssignTaskSchema = z.object({
  assignedToId: z.string().cuid().nullable(),
});

export const ProjectCheckInSchema = z.object({
  accomplishments: z.string().min(10),
  challenges: z.string().optional(),
  learnings: z.string().optional(),
  nextSteps: z.string().optional(),
  hoursLogged: z.number().int().min(0).max(24).optional(),
  moodRating: z.number().int().min(1).max(5).optional(),
  energyLevel: z.number().int().min(1).max(5).optional(),
});
