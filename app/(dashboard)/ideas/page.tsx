'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Lightbulb,
  Sparkles,
  Heart,
  X,
  Rocket,
  TrendingUp,
  Clock,
} from 'lucide-react';

interface ProjectIdea {
  id: string;
  title: string;
  description: string;
  category: string;
  feasibilityScore: number;
  matchingPercent: number;
  timeEstimate: string;
  uniqueness: string;
  impactMetrics: string[];
  status: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  CREATIVE: 'bg-purple-100 text-purple-700',
  SOCIAL_IMPACT: 'bg-green-100 text-green-700',
  ENTREPRENEURIAL: 'bg-blue-100 text-blue-700',
  RESEARCH: 'bg-indigo-100 text-indigo-700',
  TECHNICAL: 'bg-cyan-100 text-cyan-700',
  LEADERSHIP: 'bg-orange-100 text-orange-700',
};

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadIdeas();
  }, []);

  const loadIdeas = async () => {
    try {
      const response = await fetch('/api/ideas');
      const data = await response.json();
      if (data.success) {
        setIdeas(data.ideas);
      }
    } catch (error) {
      console.error('Error loading ideas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewIdeas = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
      });

      if (response.ok) {
        await loadIdeas();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to generate ideas');
      }
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const updateIdeaStatus = async (ideaId: string, status: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === ideaId ? { ...idea, status } : idea
          )
        );

        // If started, redirect to project creation
        if (status === 'started') {
          router.push(`/projects/new?ideaId=${ideaId}`);
        }
      }
    } catch (error) {
      console.error('Error updating idea:', error);
    }
  };

  const filteredIdeas = ideas.filter((idea) => {
    if (filter === 'all') return idea.status === 'suggested';
    if (filter === 'saved') return idea.status === 'saved';
    if (filter === 'rejected') return idea.status === 'rejected';
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Discover Your Project
          </h1>
          <p className="mt-2 text-base text-muted-foreground sm:text-lg">
            AI-generated ideas personalized just for you
          </p>
        </div>

        <Button
          onClick={generateNewIdeas}
          disabled={isGenerating}
          size="lg"
          className="min-h-[44px] w-full shadow-xl sm:w-auto"
        >
          {isGenerating ? (
            <>
              <Sparkles className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Generate New Ideas
            </>
          )}
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col gap-2 sm:flex-row sm:space-x-2">
        {[
          { id: 'all', label: 'New Ideas', count: ideas.filter(i => i.status === 'suggested').length },
          { id: 'saved', label: 'Saved', count: ideas.filter(i => i.status === 'saved').length },
          { id: 'rejected', label: 'Passed', count: ideas.filter(i => i.status === 'rejected').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`min-h-[44px] rounded-xl px-4 py-3 font-semibold transition-all sm:px-6 ${
              filter === tab.id
                ? 'bg-primary-500 text-white shadow-duo'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center sm:py-16">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground opacity-50 sm:h-16 sm:w-16" />
            <h3 className="mt-4 text-lg font-bold text-gray-900 sm:text-xl">
              No {filter === 'all' ? 'new' : filter} ideas yet
            </h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {filter === 'all'
                ? 'Click "Generate New Ideas" to get started!'
                : `You haven't ${filter} any ideas yet.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
          {filteredIdeas.map((idea) => (
            <Card
              key={idea.id}
              className="overflow-hidden transition-all hover:shadow-duo-hover"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center space-x-2">
                      <Badge
                        className={CATEGORY_COLORS[idea.category] || 'bg-gray-100 text-gray-700'}
                      >
                        {idea.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">
                        {idea.uniqueness} Uniqueness
                      </Badge>
                    </div>
                    <CardTitle className="text-lg sm:text-xl lg:text-2xl">{idea.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground sm:text-base">{idea.description}</p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 rounded-xl bg-gray-50 p-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-primary-600" />
                      <span className="text-2xl font-bold text-primary-600">
                        {idea.matchingPercent}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Match</p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Rocket className="h-4 w-4 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-600">
                        {idea.feasibilityScore}%
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Feasible
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-bold text-orange-600">
                        {idea.timeEstimate}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Timeline
                    </p>
                  </div>
                </div>

                {/* Impact Metrics */}
                {idea.impactMetrics && idea.impactMetrics.length > 0 && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-gray-700">
                      Potential Impact:
                    </p>
                    <ul className="space-y-1">
                      {idea.impactMetrics.map((metric, i) => (
                        <li key={i} className="flex items-start text-sm text-muted-foreground">
                          <span className="mr-2">•</span>
                          {metric}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                {idea.status === 'suggested' && (
                  <div className="flex flex-col gap-2 sm:grid sm:grid-cols-3">
                    <Button
                      variant="outline"
                      onClick={() => updateIdeaStatus(idea.id, 'rejected')}
                      className="min-h-[44px] w-full"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Pass
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => updateIdeaStatus(idea.id, 'saved')}
                      className="min-h-[44px] w-full"
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => updateIdeaStatus(idea.id, 'started')}
                      className="min-h-[44px] w-full"
                    >
                      <Rocket className="mr-1 h-4 w-4" />
                      Start
                    </Button>
                  </div>
                )}

                {idea.status === 'saved' && (
                  <Button
                    variant="default"
                    onClick={() => updateIdeaStatus(idea.id, 'started')}
                    className="min-h-[44px] w-full"
                  >
                    <Rocket className="mr-2 h-4 w-4" />
                    Start This Project
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
