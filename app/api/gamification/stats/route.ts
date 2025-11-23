import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';
import { GamificationService } from '@/lib/services/gamification';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get user with achievements
    const userData = await db.user.findUnique({
      where: { id: user.id },
      include: {
        achievements: {
          orderBy: { unlockedAt: 'desc' },
        },
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const xpToNextLevel = GamificationService.getXPForNextLevel(userData.xp) - userData.xp;
    const levelProgress = GamificationService.getLevelProgress(userData.xp);

    return NextResponse.json({
      success: true,
      stats: {
        xp: userData.xp,
        level: userData.level,
        currentStreak: userData.currentStreak,
        longestStreak: userData.longestStreak,
        achievements: userData.achievements,
        xpToNextLevel,
        levelProgress,
      },
    });
  } catch (error) {
    console.error('[GAMIFICATION_STATS]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
