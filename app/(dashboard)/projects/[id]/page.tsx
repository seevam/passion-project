'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FolderKanban,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  MessageSquare,
  FileText,
  Sparkles,
  Users,
} from 'lucide-react';
import TeamCollaborationSection from '@/components/project/TeamCollaborationSection';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string;
  healthScore: number;
  hoursLogged: number;
  currentStreak: number;
  lastWorkedAt: string | null;
  userId: string;
  openForCollaboration: boolean;
  currentTeamSize: number;
  maxTeamSize: number;
  milestones: Milestone[];
  tasks: Task[];
  checkIns: CheckIn[];
}

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  orderIndex: number;
  targetDate: string | null;
  completedAt: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  completed: boolean;
  estimatedHours: number | null;
  completedAt: string | null;
}

interface CheckIn {
  id: string;
  accomplishments: string;
  challenges: string | null;
  learnings: string | null;
  hoursLogged: number | null;
  moodRating: number | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  IDEATION: 'bg-purple-100 text-purple-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-primary-100 text-primary-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  ABANDONED: 'bg-gray-100 text-gray-700',
};

const STATUS_OPTIONS = [
  'IDEATION',
  'PLANNING',
  'IN_PROGRESS',
  'PAUSED',
  'COMPLETED',
  'ABANDONED',
];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // New milestone form
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' });

  // New task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' });

  // Check-in form
  const [showCheckInForm, setShowCheckInForm] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState({
    accomplishments: '',
    challenges: '',
    learnings: '',
    hoursLogged: 0,
    moodRating: 3,
  });

  // AI plan generation
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data = await response.json();
      if (data.success) {
        setProject(data.project);
        // Get current user ID from the profile
        const userResponse = await fetch('/api/profile');
        const userData = await userResponse.json();
        if (userData.success && userData.profile) {
          setCurrentUserId(userData.profile.userId);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProjectStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadProject();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMilestone.title,
          description: newMilestone.description || null,
          orderIndex: (project?.milestones.length || 0) + 1,
        }),
      });

      if (response.ok) {
        setNewMilestone({ title: '', description: '' });
        setShowMilestoneForm(false);
        loadProject();
      }
    } catch (error) {
      console.error('Error creating milestone:', error);
    }
  };

  const toggleMilestoneStatus = async (milestoneId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED';

    try {
      const response = await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestoneId, status: newStatus }),
      });

      if (response.ok) {
        loadProject();
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const createTask = async () => {
    if (!newTask.title) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        setNewTask({ title: '', description: '', priority: 'medium' });
        setShowTaskForm(false);
        loadProject();
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        loadProject();
      }
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const createCheckIn = async () => {
    if (!newCheckIn.accomplishments) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/check-ins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCheckIn),
      });

      if (response.ok) {
        setNewCheckIn({
          accomplishments: '',
          challenges: '',
          learnings: '',
          hoursLogged: 0,
          moodRating: 3,
        });
        setShowCheckInForm(false);
        loadProject();
      }
    } catch (error) {
      console.error('Error creating check-in:', error);
    }
  };

  const generateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/generate-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (response.ok) {
        // Reload project to show new milestones and tasks
        await loadProject();
        alert(
          `✨ Generated ${data.milestonesCreated} milestones and ${data.tasksCreated} tasks!`
        );
      } else {
        alert('Failed to generate plan. Please try again.');
      }
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please try again.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const getCompletionPercent = () => {
    if (!project || project.milestones.length === 0) return 0;
    const completed = project.milestones.filter((m) => m.status === 'COMPLETED').length;
    return Math.round((completed / project.milestones.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <FolderKanban className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Project not found</p>
          <Button onClick={() => router.push('/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  const completion = getCompletionPercent();
  const completedTasks = project.tasks.filter((t) => t.completed).length;
  const totalTasks = project.tasks.length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-3 flex items-center space-x-3">
            <Badge className={STATUS_COLORS[project.status]}>
              {project.status.replace('_', ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">{project.category}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{project.description}</p>
        </div>

        <Select value={project.status} onValueChange={updateProjectStatus}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-600">{completion}%</div>
            <Progress value={completion} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedTasks}/{totalTasks}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Hours Logged</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{project.hoursLogged}h</div>
            <p className="mt-1 text-xs text-muted-foreground">Total time invested</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Health Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <span className="text-3xl font-bold text-primary-600">
                {project.healthScore}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="team">
            <Users className="mr-2 h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="checkins">Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Milestones Summary */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary-500" />
                  Milestones
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('milestones')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {project.milestones.length === 0 ? (
                  <p className="text-center text-muted-foreground">No milestones yet</p>
                ) : (
                  <div className="space-y-2">
                    {project.milestones.slice(0, 3).map((milestone) => (
                      <div
                        key={milestone.id}
                        className="flex items-center space-x-3 rounded-lg border p-3"
                      >
                        {milestone.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="flex-1 text-sm font-medium">{milestone.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Tasks */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-blue-500" />
                  Recent Tasks
                </CardTitle>
                <Button size="sm" variant="outline" onClick={() => setActiveTab('tasks')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {project.tasks.length === 0 ? (
                  <p className="text-center text-muted-foreground">No tasks yet</p>
                ) : (
                  <div className="space-y-2">
                    {project.tasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center space-x-3 rounded-lg border p-3"
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                          className="h-5 w-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                        />
                        <span
                          className={`flex-1 text-sm ${task.completed ? 'text-muted-foreground line-through' : 'font-medium'}`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="milestones" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Milestones</h3>
            <div className="flex gap-2">
              <Button
                onClick={generateAIPlan}
                disabled={isGeneratingPlan || project.milestones.length > 0}
                variant="outline"
                className="bg-gradient-to-r from-purple-50 to-primary-50 hover:from-purple-100 hover:to-primary-100"
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-600" />
                {isGeneratingPlan ? 'Generating...' : 'AI Generate Plan'}
              </Button>
              <Button onClick={() => setShowMilestoneForm(!showMilestoneForm)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manually
              </Button>
            </div>
          </div>

          {showMilestoneForm && (
            <Card className="border-2 border-primary-200">
              <CardHeader>
                <CardTitle className="text-lg">New Milestone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, title: e.target.value })
                    }
                    placeholder="Milestone title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <textarea
                    value={newMilestone.description}
                    onChange={(e) =>
                      setNewMilestone({ ...newMilestone, description: e.target.value })
                    }
                    placeholder="Describe what needs to be accomplished..."
                    rows={3}
                    className="mt-2 w-full rounded-lg border-2 border-gray-300 p-3 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createMilestone} disabled={!newMilestone.title}>
                    Create Milestone
                  </Button>
                  <Button variant="outline" onClick={() => setShowMilestoneForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {project.milestones.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <Sparkles className="mx-auto h-12 w-12 text-purple-400 opacity-70" />
                <p className="mt-4 text-lg font-semibold text-gray-900">
                  Let AI Create Your Project Plan
                </p>
                <p className="mt-2 text-muted-foreground">
                  Get a comprehensive breakdown of milestones and tasks tailored to your project
                </p>
                <Button
                  onClick={generateAIPlan}
                  disabled={isGeneratingPlan}
                  className="mt-6 bg-gradient-to-r from-purple-500 to-primary-500 hover:from-purple-600 hover:to-primary-600"
                  size="lg"
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  {isGeneratingPlan ? 'Generating Your Plan...' : 'Generate AI Project Plan'}
                </Button>
                <p className="mt-4 text-xs text-muted-foreground">
                  Or{' '}
                  <button
                    onClick={() => setShowMilestoneForm(true)}
                    className="text-primary-600 underline hover:text-primary-700"
                  >
                    add milestones manually
                  </button>
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {project.milestones.map((milestone, index) => (
                <Card
                  key={milestone.id}
                  className={
                    milestone.status === 'COMPLETED'
                      ? 'border-green-200 bg-green-50/30'
                      : ''
                  }
                >
                  <CardContent className="flex items-start space-x-4 py-4">
                    <button
                      onClick={() => toggleMilestoneStatus(milestone.id, milestone.status)}
                      className="mt-1"
                    >
                      {milestone.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <Circle className="h-6 w-6 text-gray-400 hover:text-primary-600" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {index + 1}. {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Badge
                          className={
                            milestone.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }
                        >
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tasks</h3>
            <Button onClick={() => setShowTaskForm(!showTaskForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>

          {showTaskForm && (
            <Card className="border-2 border-primary-200">
              <CardHeader>
                <CardTitle className="text-lg">New Task</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Task title"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createTask} disabled={!newTask.title}>
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {project.tasks.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">
                  No tasks yet. Break down your project into actionable tasks!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {project.tasks.map((task) => (
                <Card
                  key={task.id}
                  className={task.completed ? 'bg-gray-50/50 opacity-70' : ''}
                >
                  <CardContent className="flex items-center space-x-4 py-4">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTask(task.id)}
                      className="h-5 w-5 cursor-pointer rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <h4
                        className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-gray-900'}`}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        task.priority === 'high'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="space-y-4">
          <TeamCollaborationSection
            projectId={projectId}
            isOwner={currentUserId === project?.userId}
            isCoLead={false}
            openForCollaboration={project?.openForCollaboration || false}
            currentTeamSize={project?.currentTeamSize || 1}
            maxTeamSize={project?.maxTeamSize || 1}
          />
        </TabsContent>

        <TabsContent value="checkins" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Project Check-ins</h3>
            <Button onClick={() => setShowCheckInForm(!showCheckInForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Log Check-in
            </Button>
          </div>

          {showCheckInForm && (
            <Card className="border-2 border-primary-200">
              <CardHeader>
                <CardTitle className="text-lg">New Check-in</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>What did you accomplish?</Label>
                  <textarea
                    value={newCheckIn.accomplishments}
                    onChange={(e) =>
                      setNewCheckIn({ ...newCheckIn, accomplishments: e.target.value })
                    }
                    placeholder="Describe what you accomplished..."
                    rows={3}
                    className="mt-2 w-full rounded-lg border-2 border-gray-300 p-3 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                <div>
                  <Label>Hours worked (optional)</Label>
                  <Input
                    type="number"
                    value={newCheckIn.hoursLogged}
                    onChange={(e) =>
                      setNewCheckIn({
                        ...newCheckIn,
                        hoursLogged: parseInt(e.target.value) || 0,
                      })
                    }
                    placeholder="0"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Mood: {newCheckIn.moodRating}/5</Label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={newCheckIn.moodRating}
                    onChange={(e) =>
                      setNewCheckIn({
                        ...newCheckIn,
                        moodRating: parseInt(e.target.value),
                      })
                    }
                    className="mt-2 w-full"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={createCheckIn} disabled={!newCheckIn.accomplishments}>
                    Save Check-in
                  </Button>
                  <Button variant="outline" onClick={() => setShowCheckInForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {project.checkIns.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="py-12 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="mt-4 text-muted-foreground">
                  No check-ins yet. Start logging your progress!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {project.checkIns.map((checkIn) => (
                <Card key={checkIn.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {new Date(checkIn.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </CardTitle>
                      {checkIn.hoursLogged && (
                        <Badge variant="outline">
                          <Clock className="mr-1 h-3 w-3" />
                          {checkIn.hoursLogged}h
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Accomplishments:</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {checkIn.accomplishments}
                        </p>
                      </div>
                      {checkIn.challenges && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Challenges:</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {checkIn.challenges}
                          </p>
                        </div>
                      )}
                      {checkIn.learnings && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700">Learnings:</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {checkIn.learnings}
                          </p>
                        </div>
                      )}
                      {checkIn.moodRating && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-semibold text-gray-700">Mood:</span>
                          <span>{'⭐'.repeat(checkIn.moodRating)}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
