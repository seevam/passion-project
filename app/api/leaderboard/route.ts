import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'all-time'; // 'all-time', 'monthly', 'weekly'
    const limit = parseInt(searchParams.get('limit') || '50');

    let leaderboardData;

    if (period === 'all-time') {
      // Get top users by total XP
      // Note: Showing all users for now. Add publicProfile: true filter if you want privacy controls
      leaderboardData = await db.user.findMany({
        select: {
          id: true,
          name: true,
          avatar: true,
          xp: true,
          level: true,
          currentStreak: true,
          projects: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          xp: 'desc',
        },
        take: limit,
      });

      // Transform data and add rank
      const transformedData = leaderboardData.map((userData, index) => ({
        rank: index + 1,
        userId: userData.id,
        name: userData.name,
        avatar: userData.avatar,
        xp: userData.xp,
        level: userData.level,
        streak: userData.currentStreak,
        projectsCompleted: userData.projects.length,
      }));

      // Find current user's position if not in top
      const dbUser = await db.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          xp: true,
          level: true,
          currentStreak: true,
          projects: {
            where: {
              status: 'COMPLETED',
            },
            select: {
              id: true,
            },
          },
        },
      });

      let currentUserRank = null;
      if (dbUser) {
        // Count how many users have more XP
        const usersAhead = await db.user.count({
          where: {
            xp: {
              gt: dbUser.xp,
            },
          },
        });

        currentUserRank = {
          rank: usersAhead + 1,
          userId: dbUser.id,
          name: dbUser.name,
          avatar: dbUser.avatar,
          xp: dbUser.xp,
          level: dbUser.level,
          streak: dbUser.currentStreak,
          projectsCompleted: dbUser.projects.length,
        };
      }

      return NextResponse.json({
        success: true,
        period,
        leaderboard: transformedData,
        currentUser: currentUserRank,
        totalParticipants: await db.user.count(),
      });
    } else {
      // For weekly/monthly, use the Leaderboard table
      const periodString = getPeriodString(period);

      const leaderboardEntries = await db.leaderboard.findMany({
        where: {
          period: periodString,
        },
        orderBy: {
          rank: 'asc',
        },
        take: limit,
      });

      // Get user details for each entry
      const leaderboardWithDetails = await Promise.all(
        leaderboardEntries.map(async (entry) => {
          const user = await db.user.findUnique({
            where: {
              id: entry.userId,
            },
            select: {
              name: true,
              avatar: true,
              level: true,
            },
          });

          return {
            rank: entry.rank,
            userId: entry.userId,
            name: user?.name || 'Unknown',
            avatar: user?.avatar,
            level: user?.level || 1,
            xp: entry.xpEarned,
            streak: entry.streakDays,
            projectsCompleted: entry.projectsCompleted,
          };
        })
      );

      // Find current user in this period
      const dbUser = await db.user.findUnique({
        where: {
          clerkId: user.id,
        },
      });

      let currentUserRank = null;
      if (dbUser) {
        const userEntry = await db.leaderboard.findUnique({
          where: {
            userId_period: {
              userId: dbUser.id,
              period: periodString,
            },
          },
        });

        if (userEntry) {
          currentUserRank = {
            rank: userEntry.rank,
            userId: dbUser.id,
            name: dbUser.name,
            avatar: dbUser.avatar,
            level: dbUser.level,
            xp: userEntry.xpEarned,
            streak: userEntry.streakDays,
            projectsCompleted: userEntry.projectsCompleted,
          };
        }
      }

      return NextResponse.json({
        success: true,
        period,
        leaderboard: leaderboardWithDetails,
        currentUser: currentUserRank,
        totalParticipants: leaderboardEntries.length,
      });
    }
  } catch (error) {
    console.error('Leaderboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

function getPeriodString(period: string): string {
  const now = new Date();

  if (period === 'weekly') {
    // Get week number (ISO week)
    const weekNumber = getWeekNumber(now);
    return `${now.getFullYear()}-W${weekNumber}`;
  } else if (period === 'monthly') {
    // Get month
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${now.getFullYear()}-${month}`;
  }

  return 'all-time';
}

function getWeekNumber(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return String(weekNo).padStart(2, '0');
}
