'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Trophy,
  Medal,
  Crown,
  Zap,
  Flame,
  Target,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string | null;
  xp: number;
  level: number;
  streak: number;
  projectsCompleted: number;
}

interface LeaderboardData {
  success: boolean;
  period: string;
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  totalParticipants: number;
}

export default function LeaderboardPage() {
  const { user } = useUser();
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [period]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadLeaderboard(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [period, autoRefresh]);

  const loadLeaderboard = async (silent = false) => {
    if (!silent) setIsLoading(true);

    try {
      const response = await fetch(`/api/leaderboard?period=${period}&limit=50`);
      const result = await response.json();

      if (result.success) {
        setData(result);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-primary-400 to-primary-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Trophy className="mx-auto h-12 w-12 animate-bounce text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">🏆 Leaderboard</h1>
          <p className="mt-2 text-base text-muted-foreground md:text-lg">
            See how you rank against other students
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLeaderboard()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {autoRefresh ? 'Live' : 'Auto-refresh Off'}
          </Button>
        </div>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
        <TabsList className="grid w-full grid-cols-3 md:w-auto">
          <TabsTrigger value="all-time" className="gap-2">
            <Trophy className="h-4 w-4" />
            <span className="hidden md:inline">All Time</span>
            <span className="md:hidden">All</span>
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden md:inline">This Month</span>
            <span className="md:hidden">Month</span>
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <Flame className="h-4 w-4" />
            <span className="hidden md:inline">This Week</span>
            <span className="md:hidden">Week</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={period} className="mt-6 space-y-6">
          {/* Current User Card (if not in top 10) */}
          {data?.currentUser && data.currentUser.rank > 10 && (
            <Card className="border-2 border-primary-300 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-duo">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Target className="h-5 w-5 text-primary-600" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full font-bold shadow-md',
                    getRankBadgeColor(data.currentUser.rank)
                  )}>
                    #{data.currentUser.rank}
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-lg font-bold text-white shadow-lg ring-4 ring-primary-100">
                    {user?.firstName?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">{data.currentUser.name}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Zap className="h-4 w-4 text-primary-600" />
                        {data.currentUser.xp.toLocaleString()} XP
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="h-4 w-4 text-accent-500" />
                        {data.currentUser.streak} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-secondary-500" />
                        {data.currentUser.projectsCompleted} projects
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top 3 Podium */}
          {data && data.leaderboard.length >= 3 && (
            <div className="grid gap-4 md:grid-cols-3">
              {/* 2nd Place */}
              <Card className="border-2 border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg md:order-1">
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gray-300 to-gray-500 text-2xl font-bold text-white shadow-xl ring-4 ring-gray-200">
                      {data.leaderboard[1].name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{data.leaderboard[1].name}</h3>
                  <Badge variant="secondary" className="mt-2">2nd Place</Badge>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold">{data.leaderboard[1].xp.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>🔥 {data.leaderboard[1].streak}d</span>
                      <span>🎯 {data.leaderboard[1].projectsCompleted}p</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 1st Place */}
              <Card className="border-2 border-yellow-400 bg-gradient-to-br from-yellow-50 to-yellow-100 shadow-2xl md:order-2 md:-mt-6">
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-3xl font-bold text-white shadow-2xl ring-4 ring-yellow-200">
                      {data.leaderboard[0].name.charAt(0)}
                    </div>
                    <div className="absolute -top-3 -right-3 animate-pulse">
                      <Crown className="h-10 w-10 text-yellow-500" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{data.leaderboard[0].name}</h3>
                  <Badge className="mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600">👑 Champion</Badge>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="h-5 w-5 text-primary-600" />
                      <span className="text-lg font-bold text-primary-600">{data.leaderboard[0].xp.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>🔥 {data.leaderboard[0].streak}d</span>
                      <span>🎯 {data.leaderboard[0].projectsCompleted}p</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 3rd Place */}
              <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 shadow-lg md:order-3">
                <CardContent className="flex flex-col items-center pt-6 text-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-2xl font-bold text-white shadow-xl ring-4 ring-amber-200">
                      {data.leaderboard[2].name.charAt(0)}
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <Medal className="h-8 w-8 text-amber-600" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">{data.leaderboard[2].name}</h3>
                  <Badge variant="secondary" className="mt-2">3rd Place</Badge>
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-center gap-1.5">
                      <Zap className="h-4 w-4 text-primary-600" />
                      <span className="font-semibold">{data.leaderboard[2].xp.toLocaleString()} XP</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>🔥 {data.leaderboard[2].streak}d</span>
                      <span>🎯 {data.leaderboard[2].projectsCompleted}p</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-primary-600" />
                    Full Rankings
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {data?.totalParticipants.toLocaleString()} total participants
                  </CardDescription>
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {lastUpdated.toLocaleTimeString()}
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y-2 divide-gray-100">
                {data?.leaderboard.map((entry, index) => {
                  const isCurrentUser = entry.userId === user?.id;

                  return (
                    <div
                      key={entry.userId}
                      className={cn(
                        'flex items-center gap-4 p-4 transition-colors hover:bg-gray-50',
                        isCurrentUser && 'bg-primary-50/50 hover:bg-primary-50',
                        index < 3 && 'bg-gradient-to-r from-gray-50 to-transparent'
                      )}
                    >
                      {/* Rank */}
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm',
                        getRankBadgeColor(entry.rank)
                      )}>
                        {getRankIcon(entry.rank) || `#${entry.rank}`}
                      </div>

                      {/* Avatar */}
                      <div className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white shadow-md',
                        isCurrentUser
                          ? 'bg-gradient-to-br from-primary-500 to-primary-600 ring-2 ring-primary-300'
                          : 'bg-gradient-to-br from-gray-400 to-gray-600'
                      )}>
                        {entry.name.charAt(0)}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className={cn(
                          'truncate font-semibold',
                          isCurrentUser && 'text-primary-700'
                        )}>
                          {entry.name}
                          {isCurrentUser && <span className="ml-2 text-xs">(You)</span>}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {entry.xp.toLocaleString()} XP
                          </span>
                          <span>Level {entry.level}</span>
                          <span className="flex items-center gap-1">
                            <Flame className="h-3 w-3 text-accent-500" />
                            {entry.streak}d
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {entry.projectsCompleted}p
                          </span>
                        </div>
                      </div>

                      {/* Badge for top 10 */}
                      {entry.rank <= 10 && !isCurrentUser && (
                        <Badge variant="secondary" className="hidden md:block">
                          Top 10
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
