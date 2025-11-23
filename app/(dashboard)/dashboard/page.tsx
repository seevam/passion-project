'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  FolderKanban,
  ArrowRight,
  Sparkles,
  Star,
  Flame,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  profileCompletion: number;
  activeProjects: number;
  totalIdeas: number;
  xp: number;
  level: number;
  currentStreak: number;
  recentProjects: Array<{
    id: string;
    title: string;
    status: string;
    lastWorkedAt: string | null;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">
          Welcome back! 👋
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let's make progress on your passion projects today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Projects
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeProjects}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ideas Generated
            </CardTitle>
            <Lightbulb className="h-4 w-4 text-accent-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalIdeas}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Waiting to explore
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Your Level
            </CardTitle>
            <Star className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              Level {stats.level}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {stats.xp} XP total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Current Streak
            </CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-1">
              <span className="text-3xl font-bold">{stats.currentStreak}</span>
              <span className="text-xl">🔥</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Days in a row
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion CTA */}
      {stats.profileCompletion < 100 && (
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-primary-500" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Finish setting up your profile to unlock personalized project ideas
              and get the most out of ProjectLaunch!
            </p>
            <Progress value={stats.profileCompletion} className="h-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {stats.profileCompletion}% Complete
              </span>
              <Link href="/profile/quick-start">
                <Button variant="default">
                  Continue Setup
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/ideas">
            <Card className="cursor-pointer transition-all hover:shadow-duo-hover">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-100 to-accent-200">
                  <Lightbulb className="h-6 w-6 text-accent-600" />
                </div>
                <CardTitle className="mt-4">Generate Ideas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Use AI to discover personalized passion project ideas
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects/new">
            <Card className="cursor-pointer transition-all hover:shadow-duo-hover">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-100 to-primary-200">
                  <FolderKanban className="h-6 w-6 text-primary-600" />
                </div>
                <CardTitle className="mt-4">Start New Project</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Turn an idea into reality with project planning
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/mentor">
            <Card className="cursor-pointer transition-all hover:shadow-duo-hover">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200">
                  <Sparkles className="h-6 w-6 text-secondary-600" />
                </div>
                <CardTitle className="mt-4">Talk to AI Mentor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get guidance and support from your AI mentor
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Recent Projects
        </h2>
        {stats.recentProjects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No projects yet. Start by exploring project ideas or
                creating your first project!
              </p>
              <div className="mt-4 flex justify-center space-x-4">
                <Link href="/ideas">
                  <Button variant="default">Discover Ideas</Button>
                </Link>
                <Link href="/projects/new">
                  <Button variant="outline">Create Project</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.recentProjects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="transition-all hover:shadow-duo-hover">
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="mb-2">
                      {project.status.replace('_', ' ')}
                    </Badge>
                    {project.lastWorkedAt && (
                      <p className="text-xs text-muted-foreground">
                        Last worked:{' '}
                        {new Date(project.lastWorkedAt).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
