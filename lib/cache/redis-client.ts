import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Cache keys namespace
export const CacheKeys = {
  userProfile: (userId: string) => `profile:${userId}`,
  userProjects: (userId: string) => `projects:${userId}`,
  projectDetail: (projectId: string) => `project:${projectId}`,
  leaderboard: (period: string) => `leaderboard:${period}`,
  aiResponse: (hash: string) => `ai:${hash}`,
  rateLimit: (userId: string, action: string) => `ratelimit:${userId}:${action}`,
} as const;

// Cache TTLs (seconds)
export const CacheTTL = {
  userProfile: 3600,     // 1 hour
  userProjects: 1800,    // 30 minutes
  projectDetail: 900,    // 15 minutes
  leaderboard: 300,      // 5 minutes
  aiResponse: 86400,     // 24 hours
  rateLimit: 60,         // 1 minute
} as const;
