'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Users,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string | null;
  author: {
    id: string;
    name: string;
    avatar: string | null;
  };
  completedAt: string | null;
  createdAt: string;
  matchScore: number | null;
}

interface PaginationData {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

const CATEGORIES = [
  { value: 'all', label: 'All Projects' },
  { value: 'CREATIVE', label: 'Creative' },
  { value: 'SOCIAL_IMPACT', label: 'Social Impact' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial' },
  { value: 'RESEARCH', label: 'Research' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'LEADERSHIP', label: 'Leadership' },
];

const CATEGORY_COLORS = {
  CREATIVE: 'bg-purple-100 text-purple-700 border-purple-300',
  SOCIAL_IMPACT: 'bg-green-100 text-green-700 border-green-300',
  ENTREPRENEURIAL: 'bg-orange-100 text-orange-700 border-orange-300',
  RESEARCH: 'bg-blue-100 text-blue-700 border-blue-300',
  TECHNICAL: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  LEADERSHIP: 'bg-pink-100 text-pink-700 border-pink-300',
};

export default function GalleryPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('recommended');
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    loadProjects();
  }, [currentPage, selectedCategory, sortBy]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        sortBy,
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/gallery?${params}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects);
        setPagination(data.pagination);
        setIsPersonalized(data.isPersonalized);
        setHasProfile(data.hasProfile);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadProjects();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  if (isLoading && !projects.length) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">🎨 Project Gallery</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">
          Explore amazing projects from high school students around the world
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-2">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
              <Grid3x3 className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {pagination?.totalCount.toLocaleString() || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Projects</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100">
              <Users className="h-5 w-5 text-secondary-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Math.floor((pagination?.totalCount || 0) / 2).toLocaleString()}+
              </p>
              <p className="text-sm text-muted-foreground">Students</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-100">
              <Calendar className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {new Date().getFullYear()}
              </p>
              <p className="text-sm text-muted-foreground">Latest Projects</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Personalization Banner */}
      {isPersonalized && hasProfile && (
        <Card className="border-2 border-primary-300 bg-gradient-to-r from-primary-50 via-secondary-50 to-accent-50">
          <CardContent className="flex items-center gap-3 p-4">
            <Sparkles className="h-6 w-6 shrink-0 text-primary-600" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">✨ Personalized for You</p>
              <p className="text-sm text-muted-foreground">
                Showing projects that match your interests and profile
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSortChange('recent')}
              className="shrink-0"
            >
              Show All
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Sort Options */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={sortBy === 'recommended' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSortChange('recommended')}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          Recommended
        </Button>
        <Button
          variant={sortBy === 'recent' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSortChange('recent')}
        >
          Recent
        </Button>
        <Button
          variant={sortBy === 'popular' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleSortChange('popular')}
        >
          Popular
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-2">
        <CardContent className="space-y-4 p-4">
          {/* Search Bar */}
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="border-2 pl-10"
              />
            </div>
            <Button onClick={handleSearch} className="gap-2">
              <Search className="h-4 w-4" />
              Search
            </Button>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <Grid3x3 className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <List className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(cat.value)}
                className="gap-2"
              >
                <Filter className="h-3 w-3" />
                {cat.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid/List */}
      {projects.length === 0 ? (
        <Card className="border-2">
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              No projects found. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div
            className={cn(
              'grid gap-6',
              viewMode === 'grid' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
            )}
          >
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group overflow-hidden border-2 transition-all hover:border-primary-300 hover:shadow-duo"
              >
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Sparkles className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  {/* Badges */}
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      className={cn(
                        'border',
                        CATEGORY_COLORS[project.category as keyof typeof CATEGORY_COLORS] ||
                          'bg-gray-100 text-gray-700'
                      )}
                    >
                      {project.category.replace('_', ' ')}
                    </Badge>
                    {project.matchScore !== null && project.matchScore >= 70 && (
                      <Badge
                        variant="default"
                        className="gap-1 bg-gradient-to-r from-primary-500 to-secondary-500"
                      >
                        <Sparkles className="h-3 w-3" />
                        {project.matchScore}% Match
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-primary-600">
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                    {project.description}
                  </p>

                  {/* Author */}
                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-sm font-bold text-white">
                      {project.author.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {project.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {project.completedAt
                          ? new Date(project.completedAt).toLocaleDateString()
                          : 'Recently completed'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <Card className="border-2">
              <CardContent className="flex items-center justify-between p-4">
                <p className="text-sm text-muted-foreground">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} -{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                  {pagination.totalCount.toLocaleString()} projects
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!pagination.hasPrev || isLoading}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={isLoading}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!pagination.hasNext || isLoading}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
