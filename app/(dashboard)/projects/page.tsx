'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  FolderKanban,
  Plus,
  Clock,
  CheckCircle2,
  Target,
  TrendingUp,
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  healthScore: number;
  hoursLogged: number;
  lastWorkedAt: string | null;
  _count: {
    milestones: number;
    tasks: number;
    checkIns: number;
    documents: number;
  };
  milestones: any[];
}

const STATUS_COLORS: Record<string, string> = {
  IDEATION: 'bg-purple-100 text-purple-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-primary-100 text-primary-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ABANDONED: 'bg-gray-100 text-gray-700',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCompletionPercent = (project: Project) => {
    if (project.milestones.length === 0) return 0;
    const completed = project.milestones.filter(
      (m: any) => m.status === 'COMPLETED'
    ).length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FolderKanban className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Projects</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Track and manage your passion projects
          </p>
        </div>

        <Link href="/projects/new">
          <Button size="lg" className="shadow-xl">
            <Plus className="mr-2 h-5 w-5" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      {projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {
                  projects.filter((p) => p.status === 'IN_PROGRESS').length
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {projects.filter((p) => p.status === 'COMPLETED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Total Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {projects.reduce((sum, p) => sum + p.hoursLogged, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <FolderKanban className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No projects yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              Create your first passion project to get started!
            </p>
            <div className="mt-6">
              <Link href="/projects/new">
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  Create Project
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const completion = getCompletionPercent(project);

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-all hover:shadow-duo-hover">
                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <Badge className={STATUS_COLORS[project.status]}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="mr-1 h-4 w-4" />
                        {project.healthScore}%
                      </div>
                    </div>
                    <CardTitle className="line-clamp-2">
                      {project.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>

                    {/* Progress */}
                    <div>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">
                          Progress
                        </span>
                        <span className="text-primary-600">
                          {completion}%
                        </span>
                      </div>
                      <Progress value={completion} className="h-2" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-gray-50 p-2">
                        <div className="flex items-center justify-center">
                          <Target className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="mt-1 text-xs font-semibold text-gray-700">
                          {project._count.milestones} milestones
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-2">
                        <div className="flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="mt-1 text-xs font-semibold text-gray-700">
                          {project._count.tasks} tasks
                        </div>
                      </div>

                      <div className="rounded-lg bg-gray-50 p-2">
                        <div className="flex items-center justify-center">
                          <Clock className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="mt-1 text-xs font-semibold text-gray-700">
                          {project.hoursLogged}h
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
