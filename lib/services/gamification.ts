import { db } from '@/lib/db';
import { AchievementType } from '@prisma/client';

// XP thresholds for each level
const LEVEL_THRESHOLDS = [
  0,     // Level 1
  100,   // Level 2
  250,   // Level 3
  500,   // Level 4
  850,   // Level 5
  1300,  // Level 6
  1850,  // Level 7
  2500,  // Level 8
  3250,  // Level 9
  4100,  // Level 10
  5050,  // Level 11
  6100,  // Level 12
  7250,  // Level 13
  8500,  // Level 14
  9850,  // Level 15
  11300, // Level 16
  12850, // Level 17
  14500, // Level 18
  16250, // Level 19
  18100, // Level 20
];

// Achievement definitions
const ACHIEVEMENT_DEFINITIONS = {
  'first-project': {
    name: 'First Steps',
    description: 'Created your first project',
    iconUrl: '🚀',
    xpAwarded: 50,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
  'first-milestone': {
    name: 'Milestone Master',
    description: 'Completed your first milestone',
    iconUrl: '🎯',
    xpAwarded: 30,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
  'first-checkin': {
    name: 'Consistent Worker',
    description: 'Logged your first check-in',
    iconUrl: '✅',
    xpAwarded: 20,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
  'profile-complete': {
    name: 'Know Thyself',
    description: 'Completed your profile',
    iconUrl: '👤',
    xpAwarded: 100,
    type: 'BADGE' as AchievementType,
  },
  'level-5': {
    name: 'Rising Star',
    description: 'Reached level 5',
    iconUrl: '⭐',
    xpAwarded: 50,
    type: 'LEVEL_UP' as AchievementType,
  },
  'level-10': {
    name: 'Expert',
    description: 'Reached level 10',
    iconUrl: '💫',
    xpAwarded: 100,
    type: 'LEVEL_UP' as AchievementType,
  },
  '7-day-streak': {
    name: 'Week Warrior',
    description: 'Maintained a 7-day streak',
    iconUrl: '🔥',
    xpAwarded: 75,
    type: 'STREAK_MILESTONE' as AchievementType,
  },
  '30-day-streak': {
    name: 'Month Master',
    description: 'Maintained a 30-day streak',
    iconUrl: '🔥🔥',
    xpAwarded: 200,
    type: 'STREAK_MILESTONE' as AchievementType,
  },
  'project-complete': {
    name: 'Project Champion',
    description: 'Completed a project',
    iconUrl: '🏆',
    xpAwarded: 150,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
  '10-tasks': {
    name: 'Task Tackler',
    description: 'Completed 10 tasks',
    iconUrl: '✔️',
    xpAwarded: 40,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
  '50-hours': {
    name: 'Dedicated',
    description: 'Logged 50 hours of work',
    iconUrl: '⏰',
    xpAwarded: 100,
    type: 'PROJECT_MILESTONE' as AchievementType,
  },
};

export class GamificationService {
  /**
   * Calculate level from XP
   */
  static calculateLevel(xp: number): number {
    let level = 1;
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) {
        level = i + 1;
        break;
      }
    }
    return Math.min(level, 20); // Max level 20
  }

  /**
   * Get XP needed for next level
   */
  static getXPForNextLevel(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP);
    if (currentLevel >= 20) return 0; // Max level reached

    return LEVEL_THRESHOLDS[currentLevel];
  }

  /**
   * Get progress to next level (0-100)
   */
  static getLevelProgress(currentXP: number): number {
    const currentLevel = this.calculateLevel(currentXP);
    if (currentLevel >= 20) return 100;

    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1];
    const nextThreshold = LEVEL_THRESHOLDS[currentLevel];
    const xpInLevel = currentXP - currentThreshold;
    const xpNeeded = nextThreshold - currentThreshold;

    return Math.round((xpInLevel / xpNeeded) * 100);
  }

  /**
   * Award XP to a user and check for level up
   */
  static async awardXP(
    userId: string,
    amount: number,
    reason?: string
  ): Promise<{ leveledUp: boolean; newLevel?: number; oldLevel?: number }> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true },
    });

    if (!user) throw new Error('User not found');

    const oldLevel = user.level;
    const newXP = user.xp + amount;
    const newLevel = this.calculateLevel(newXP);
    const leveledUp = newLevel > oldLevel;

    // Update user XP and level
    await db.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        level: newLevel,
        lastActiveAt: new Date(),
      },
    });

    // If leveled up, create achievement
    if (leveledUp) {
      // Check for level milestones (5, 10, 15, 20)
      if ([5, 10, 15, 20].includes(newLevel)) {
        const achievementId = `level-${newLevel}`;
        const definition = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS];

        if (definition) {
          await this.unlockAchievement(userId, achievementId, {
            level: newLevel,
          });
        }
      }
    }

    return {
      leveledUp,
      newLevel: leveledUp ? newLevel : undefined,
      oldLevel: leveledUp ? oldLevel : undefined,
    };
  }

  /**
   * Unlock an achievement for a user
   */
  static async unlockAchievement(
    userId: string,
    achievementId: string,
    metadata?: any
  ): Promise<boolean> {
    const definition = ACHIEVEMENT_DEFINITIONS[achievementId as keyof typeof ACHIEVEMENT_DEFINITIONS];
    if (!definition) return false;

    // Check if already unlocked
    const existing = await db.achievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId,
        },
      },
    });

    if (existing) return false; // Already unlocked

    // Create achievement
    await db.achievement.create({
      data: {
        userId,
        achievementId,
        achievementType: definition.type,
        name: definition.name,
        description: definition.description,
        iconUrl: definition.iconUrl,
        xpAwarded: definition.xpAwarded,
        metadata: metadata || {},
      },
    });

    // Award XP
    await this.awardXP(userId, definition.xpAwarded, `Achievement: ${definition.name}`);

    // Create notification
    await db.notification.create({
      data: {
        userId,
        type: 'ACHIEVEMENT_UNLOCKED',
        title: '🎉 Achievement Unlocked!',
        message: `You earned "${definition.name}" - ${definition.description}`,
        metadata: {
          achievementId,
          xpAwarded: definition.xpAwarded,
        },
      },
    });

    return true;
  }

  /**
   * Update user streak
   */
  static async updateStreak(userId: string): Promise<void> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        currentStreak: true,
        longestStreak: true,
        lastActiveAt: true,
      },
    });

    if (!user) throw new Error('User not found');

    const now = new Date();
    const lastActive = user.lastActiveAt;
    const daysSinceActive = lastActive
      ? Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    let newStreak = user.currentStreak;

    if (daysSinceActive === 0) {
      // Same day, no change
      return;
    } else if (daysSinceActive === 1) {
      // Consecutive day
      newStreak += 1;
    } else {
      // Streak broken
      newStreak = 1;
    }

    const newLongestStreak = Math.max(newStreak, user.longestStreak);

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastActiveAt: now,
      },
    });

    // Check for streak achievements
    if (newStreak === 7) {
      await this.unlockAchievement(userId, '7-day-streak');
    } else if (newStreak === 30) {
      await this.unlockAchievement(userId, '30-day-streak');
    }

    // Streak warning notification if about to break
    if (daysSinceActive === 0 && newStreak >= 3) {
      // Check if notification already sent today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingNotification = await db.notification.findFirst({
        where: {
          userId,
          type: 'STREAK_WARNING',
          createdAt: {
            gte: today,
          },
        },
      });

      if (!existingNotification) {
        await db.notification.create({
          data: {
            userId,
            type: 'STREAK_WARNING',
            title: '🔥 Keep Your Streak Alive!',
            message: `You're on a ${newStreak}-day streak! Log a check-in today to keep it going.`,
          },
        });
      }
    }
  }

  /**
   * Check and unlock achievements based on user activity
   */
  static async checkAchievements(userId: string): Promise<void> {
    // Get user stats
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          where: { archivedAt: null },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    if (!user) return;

    // First project
    if (user._count.projects === 1) {
      await this.unlockAchievement(userId, 'first-project');
    }

    // Completed project
    const completedProjects = user.projects.filter(
      (p) => p.status === 'COMPLETED'
    );
    if (completedProjects.length >= 1) {
      await this.unlockAchievement(userId, 'project-complete');
    }

    // Total hours logged
    const totalHours = user.projects.reduce(
      (sum, p) => sum + p.hoursLogged,
      0
    );
    if (totalHours >= 50) {
      await this.unlockAchievement(userId, '50-hours');
    }

    // Total tasks completed
    const completedTasks = await db.task.count({
      where: {
        project: {
          userId,
        },
        completed: true,
      },
    });

    if (completedTasks >= 10) {
      await this.unlockAchievement(userId, '10-tasks');
    }
  }
}
