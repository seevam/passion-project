import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const user = await requireAuth();

    // Get profile completion
    const profile = await db.userProfile.findUnique({
      where: { userId: user.id },
    });

    const profileCompletion = profile?.completionPercent || 0;

    // Get active projects count
    const activeProjects = await db.project.count({
      where: {
        userId: user.id,
        status: 'IN_PROGRESS',
        archivedAt: null,
      },
    });

    // Get total ideas
    const totalIdeas = await db.projectIdea.count({
      where: {
        userId: user.id,
        status: {
          in: ['suggested', 'saved'],
        },
      },
    });

    // Get recent projects
    const recentProjects = await db.project.findMany({
      where: {
        userId: user.id,
        archivedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        lastWorkedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 3,
    });

    return NextResponse.json({
      success: true,
      stats: {
        profileCompletion,
        activeProjects,
        totalIdeas,
        xp: user.xp,
        level: user.level,
        currentStreak: user.currentStreak,
        recentProjects,
      },
    });
  } catch (error) {
    console.error('[DASHBOARD]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
