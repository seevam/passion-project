'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Mail,
  Calendar,
  Award,
  Zap,
  Flame,
  Trophy,
  Target,
  Edit2,
  Check,
  X,
  Sparkles,
  TrendingUp,
  BookOpen,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserStats {
  xp: number;
  level: number;
  currentStreak: number;
  totalProjects: number;
  completedProjects: number;
  totalIdeas: number;
  joinedDate: string;
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bio, setBio] = useState('High school student passionate about making a difference through creative projects.');
  const [tempBio, setTempBio] = useState(bio);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      // Mock data for now - replace with actual API call
      setStats({
        xp: 2500,
        level: 3,
        currentStreak: 7,
        totalProjects: 12,
        completedProjects: 5,
        totalIdeas: 28,
        joinedDate: '2024-01-15',
        achievements: [
          {
            id: '1',
            name: 'First Steps',
            description: 'Created your first project',
            icon: '🎯',
            unlockedAt: '2024-01-16',
          },
          {
            id: '2',
            name: 'Idea Machine',
            description: 'Generated 10+ project ideas',
            icon: '💡',
            unlockedAt: '2024-02-01',
          },
          {
            id: '3',
            name: 'Week Warrior',
            description: 'Maintained a 7-day streak',
            icon: '🔥',
            unlockedAt: '2024-03-10',
          },
        ],
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBio = () => {
    setBio(tempBio);
    setIsEditingBio(false);
  };

  const handleCancelBio = () => {
    setTempBio(bio);
    setIsEditingBio(false);
  };

  const nextLevelXP = (stats?.level || 1) * 1000;
  const xpProgress = stats ? (stats.xp % 1000) / 10 : 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">My Profile</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Manage your account and track your progress
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - User Info */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile Card */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2 bg-gradient-to-r from-primary-50 to-secondary-50">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your personal information and bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Avatar and Name */}
              <div className="flex items-start gap-6">
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-3xl font-bold text-white shadow-duo ring-4 ring-primary-100">
                    {user?.firstName?.charAt(0) || user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-400 to-accent-500 text-white shadow-lg ring-2 ring-white">
                    <span className="text-sm font-bold">{stats?.level}</span>
                  </div>
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user?.emailAddresses[0]?.emailAddress}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {new Date(stats?.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-base font-semibold">About Me</Label>
                  {!isEditingBio && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingBio(true)}
                      className="gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                </div>
                {isEditingBio ? (
                  <div className="space-y-3">
                    <textarea
                      value={tempBio}
                      onChange={(e) => setTempBio(e.target.value)}
                      className="w-full rounded-xl border-2 border-gray-200 p-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                      rows={4}
                      maxLength={200}
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {tempBio.length}/200 characters
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelBio}
                          className="gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSaveBio}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                    {bio}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary-600" />
                Activity Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-500 shadow-md">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalProjects}</p>
                    <p className="text-sm text-gray-600">Total Projects</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 shadow-md">
                    <Check className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.completedProjects}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-secondary-50 to-secondary-100/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary-500 shadow-md">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.totalIdeas}</p>
                    <p className="text-sm text-gray-600">Ideas Generated</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-xl bg-gradient-to-br from-accent-50 to-accent-100/50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-500 shadow-md">
                    <Flame className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats?.currentStreak}</p>
                    <p className="text-sm text-gray-600">Day Streak</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent-600" />
                Achievements
              </CardTitle>
              <CardDescription>Your earned badges and milestones</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {stats?.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-start gap-3 rounded-xl border-2 border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-100 to-accent-200 text-2xl shadow-sm">
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900">{achievement.name}</h4>
                      <p className="mt-1 text-sm text-gray-600">{achievement.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Level & Progress */}
        <div className="space-y-6">
          {/* Level Card */}
          <Card className="border-2 shadow-duo">
            <CardHeader className="border-b-2 bg-gradient-to-br from-primary-50 via-secondary-50 to-accent-50">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary-600" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Level Badge */}
              <div className="text-center">
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 shadow-duo ring-4 ring-primary-100">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
                    <span className="text-4xl font-bold text-primary-600">{stats?.level}</span>
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-bold text-gray-900">Level {stats?.level}</h3>
                <p className="mt-1 text-sm text-muted-foreground">Keep going!</p>
              </div>

              {/* XP Progress */}
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{(stats?.xp || 0) % 1000} XP</span>
                  <span className="text-muted-foreground">{nextLevelXP} XP</span>
                </div>
                <Progress value={xpProgress} className="h-3" />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {nextLevelXP - (stats?.xp || 0) % 1000} XP until Level {(stats?.level || 1) + 1}
                </p>
              </div>

              {/* Total XP */}
              <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-semibold text-gray-600">Total XP</span>
                </div>
                <p className="mt-2 text-3xl font-bold text-primary-600">{(stats?.xp || 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-primary-600" />
                Keep Growing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start gap-2" variant="outline">
                <Target className="h-4 w-4" />
                Start New Project
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Sparkles className="h-4 w-4" />
                Talk to AI Mentor
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Trophy className="h-4 w-4" />
                View Leaderboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
