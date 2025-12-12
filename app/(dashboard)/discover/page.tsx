'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Users, Search, Sparkles, Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'CREATIVE', label: 'Creative', icon: '🎨' },
  { value: 'SOCIAL_IMPACT', label: 'Social Impact', icon: '🌍' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial', icon: '💼' },
  { value: 'RESEARCH', label: 'Research', icon: '🔬' },
  { value: 'TECHNICAL', label: 'Technical', icon: '💻' },
  { value: 'LEADERSHIP', label: 'Leadership', icon: '👑' },
];

const TEAM_SIZES = [
  { value: 'all', label: 'Any Size' },
  { value: 'DUO', label: 'Duo', icon: '👥' },
  { value: 'SMALL_TEAM', label: 'Small Team', icon: '👨‍👩‍👦' },
  { value: 'LARGE_TEAM', label: 'Large Team', icon: '👨‍👩‍👦‍👦' },
];

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  idealTeamSize: string;
  currentTeamSize: number;
  maxTeamSize: number;
  skillsNeeded: string[];
  collaborationDesc?: string;
  matchScore: number;
  user: {
    id: string;
    name: string;
    avatar?: string;
    level: number;
  };
  members: Array<{
    user: {
      id: string;
      name: string;
      avatar?: string;
    };
  }>;
  _count: {
    tasks: number;
    milestones: number;
  };
}

export default function DiscoverPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    teamSize: 'all',
    search: '',
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.teamSize !== 'all') params.append('teamSize', filters.teamSize);

      const response = await fetch(`/api/discover?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        let filtered = data.projects;

        // Apply search filter
        if (filters.search) {
          const search = filters.search.toLowerCase();
          filtered = filtered.filter(
            (p: Project) =>
              p.title.toLowerCase().includes(search) ||
              p.description.toLowerCase().includes(search) ||
              p.skillsNeeded.some((s) => s.toLowerCase().includes(search))
          );
        }

        setProjects(filtered);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestJoin = async (projectId: string) => {
    try {
      const response = await fetch('/api/collaboration-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      if (response.ok) {
        alert('Request sent! The project owner will review your request.');
        fetchProjects(); // Refresh to remove project from list
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Failed to send request');
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Users className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Discover Collaborations
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Find Projects to Join
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Connect with other students and collaborate on passion projects
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search projects or skills..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>
              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters({ ...filters, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon && <span className="mr-2">{cat.icon}</span>}
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Team Size
              </label>
              <Select
                value={filters.teamSize}
                onValueChange={(value) =>
                  setFilters({ ...filters, teamSize: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.icon && <span className="mr-2">{size.icon}</span>}
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <div className="text-center">
            <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
            <p className="mt-4 text-lg text-muted-foreground">
              Finding projects...
            </p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-semibold">No projects found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your filters or check back later
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-2xl">
                        {
                          CATEGORIES.find((c) => c.value === project.category)
                            ?.icon
                        }
                      </span>
                      <span className="text-sm font-medium text-primary-600">
                        {
                          CATEGORIES.find((c) => c.value === project.category)
                            ?.label
                        }
                      </span>
                    </div>
                    <CardTitle className="text-xl">{project.title}</CardTitle>
                  </div>
                  {project.matchScore > 70 && (
                    <div className="rounded-full bg-green-100 px-3 py-1">
                      <span className="text-sm font-semibold text-green-700">
                        {project.matchScore}% Match
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {project.description}
                </p>

                {project.collaborationDesc && (
                  <div className="rounded-lg bg-primary-50 p-3">
                    <p className="text-xs font-medium text-primary-900">
                      Looking for:
                    </p>
                    <p className="mt-1 text-sm text-primary-800">
                      {project.collaborationDesc}
                    </p>
                  </div>
                )}

                {project.skillsNeeded.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Skills Needed:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {project.skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between border-t pt-4">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {project.currentTeamSize}/{project.maxTeamSize}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Level</span>
                      <span className="font-semibold">
                        {project.user.level}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleRequestJoin(project.id)}
                    size="sm"
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    Request to Join
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
