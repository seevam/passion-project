'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, TrendingUp, Award } from 'lucide-react';

interface Achievement {
  id: string;
  achievementId: string;
  achievementType: string;
  name: string;
  description: string;
  iconUrl: string;
  xpAwarded: number;
  unlockedAt: string;
}

interface GamificationStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  xpToNextLevel: number;
  levelProgress: number;
}

export default function AchievementsPage() {
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/gamification/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load achievements</div>;
  }

  const achievementsByType = {
    BADGE: stats.achievements.filter((a) => a.achievementType === 'BADGE'),
    LEVEL_UP: stats.achievements.filter((a) => a.achievementType === 'LEVEL_UP'),
    STREAK_MILESTONE: stats.achievements.filter((a) => a.achievementType === 'STREAK_MILESTONE'),
    PROJECT_MILESTONE: stats.achievements.filter((a) => a.achievementType === 'PROJECT_MILESTONE'),
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Achievements & Progress</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Track your journey and celebrate your wins!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Level Card */}
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm text-muted-foreground">
              <Star className="mr-2 h-4 w-4 text-primary-500" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary-600">
              Level {stats.level}
            </div>
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress to Level {stats.level + 1}</span>
                <span className="font-semibold text-primary-600">{stats.levelProgress}%</span>
              </div>
              <Progress value={stats.levelProgress} className="h-2" />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.xpToNextLevel} XP to next level
            </p>
          </CardContent>
        </Card>

        {/* Total XP */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm text-muted-foreground">
              <Zap className="mr-2 h-4 w-4 text-accent-500" />
              Total XP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-accent-600">{stats.xp}</div>
            <p className="mt-2 text-xs text-muted-foreground">Experience Points Earned</p>
          </CardContent>
        </Card>

        {/* Current Streak */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm text-muted-foreground">
              <TrendingUp className="mr-2 h-4 w-4 text-orange-500" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-bold text-orange-600">
                {stats.currentStreak}
              </span>
              <span className="text-2xl">🔥</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Days in a row</p>
          </CardContent>
        </Card>

        {/* Achievements Count */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-sm text-muted-foreground">
              <Trophy className="mr-2 h-4 w-4 text-secondary-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary-600">
              {stats.achievements.length}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Streak Info */}
      {stats.currentStreak > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2 text-3xl">🔥</span>
              Keep Your Streak Going!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You're on a <strong>{stats.currentStreak}-day streak</strong>! Keep logging
              check-ins and working on your projects to maintain it.
            </p>
            {stats.longestStreak > stats.currentStreak && (
              <p className="mt-2 text-sm text-muted-foreground">
                Your longest streak: {stats.longestStreak} days
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Achievements by Type */}
      <div className="space-y-8">
        {/* Project Milestones */}
        {achievementsByType.PROJECT_MILESTONE.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900">
              <Target className="mr-2 h-6 w-6 text-primary-500" />
              Project Milestones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsByType.PROJECT_MILESTONE.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="border-2 border-primary-200 bg-gradient-to-br from-primary-50/30 to-white"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mb-3 text-5xl">{achievement.iconUrl}</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <Badge className="bg-primary-100 text-primary-700">
                        +{achievement.xpAwarded} XP
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Badges */}
        {achievementsByType.BADGE.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900">
              <Award className="mr-2 h-6 w-6 text-secondary-500" />
              Badges
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsByType.BADGE.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="border-2 border-secondary-200 bg-gradient-to-br from-secondary-50/30 to-white"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mb-3 text-5xl">{achievement.iconUrl}</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <Badge className="bg-secondary-100 text-secondary-700">
                        +{achievement.xpAwarded} XP
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Streak Milestones */}
        {achievementsByType.STREAK_MILESTONE.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900">
              <TrendingUp className="mr-2 h-6 w-6 text-orange-500" />
              Streak Milestones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsByType.STREAK_MILESTONE.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="border-2 border-orange-200 bg-gradient-to-br from-orange-50/30 to-white"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mb-3 text-5xl">{achievement.iconUrl}</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <Badge className="bg-orange-100 text-orange-700">
                        +{achievement.xpAwarded} XP
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Level Up Achievements */}
        {achievementsByType.LEVEL_UP.length > 0 && (
          <div>
            <h2 className="mb-4 flex items-center text-2xl font-bold text-gray-900">
              <Star className="mr-2 h-6 w-6 text-accent-500" />
              Level Up Milestones
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {achievementsByType.LEVEL_UP.map((achievement) => (
                <Card
                  key={achievement.id}
                  className="border-2 border-accent-200 bg-gradient-to-br from-accent-50/30 to-white"
                >
                  <CardContent className="pt-6 text-center">
                    <div className="mb-3 text-5xl">{achievement.iconUrl}</div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {achievement.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                      <Badge className="bg-accent-100 text-accent-700">
                        +{achievement.xpAwarded} XP
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No achievements yet */}
        {stats.achievements.length === 0 && (
          <Card className="border-2 border-dashed">
            <CardContent className="py-16 text-center">
              <Trophy className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-xl font-bold text-gray-900">
                No Achievements Yet
              </h3>
              <p className="mt-2 text-muted-foreground">
                Start working on projects to unlock achievements and earn XP!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
