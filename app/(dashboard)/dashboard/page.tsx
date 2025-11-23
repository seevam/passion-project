import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Lightbulb,
  FolderKanban,
  Target,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Mock data - will be replaced with real database queries
  const stats = {
    profileCompletion: 60,
    activeProjects: 2,
    totalIdeas: 8,
    xpThisWeek: 350,
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          Welcome back! 👋
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Let's make progress on your passion projects today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
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
              Profile Progress
            </CardTitle>
            <Target className="h-4 w-4 text-secondary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.profileCompletion}%
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Keep building!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              XP This Week
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">+{stats.xpThisWeek}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Great progress!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion CTA */}
      {stats.profileCompletion < 100 && (
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <Sparkles className="mr-2 h-5 w-5 text-primary-500" />
              Complete Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground sm:text-base">
              Finish setting up your profile to unlock personalized project ideas
              and get the most out of ProjectLaunch!
            </p>
            <Progress value={stats.profileCompletion} className="h-3" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-medium text-gray-700">
                {stats.profileCompletion}% Complete
              </span>
              <Link href="/profile">
                <Button variant="default" className="min-h-[44px] w-full sm:w-auto">
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
        <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-gray-900 sm:text-2xl">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-sm text-muted-foreground sm:text-base">
              No recent activity yet. Start by exploring project ideas or
              creating your first project!
            </p>
            <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/ideas">
                <Button variant="default" className="min-h-[44px] w-full sm:w-auto">
                  Discover Ideas
                </Button>
              </Link>
              <Link href="/projects/new">
                <Button variant="outline" className="min-h-[44px] w-full sm:w-auto">
                  Create Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
