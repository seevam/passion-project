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

interface SampleIdea {
  title: string;
  description: string;
  category: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  CREATIVE: 'bg-purple-100 text-purple-700',
  SOCIAL_IMPACT: 'bg-green-100 text-green-700',
  ENTREPRENEURIAL: 'bg-blue-100 text-blue-700',
  RESEARCH: 'bg-indigo-100 text-indigo-700',
  TECHNICAL: 'bg-cyan-100 text-cyan-700',
  LEADERSHIP: 'bg-orange-100 text-orange-700',
};

const SAMPLE_IDEAS_FOR_RATING: SampleIdea[] = [
  {
    title: 'Local Environmental Impact Study',
    description: 'Research and document the environmental health of your local community, including air quality, water sources, and green spaces.',
    category: 'RESEARCH',
  },
  {
    title: 'Mobile App for Student Mental Health',
    description: 'Build a mobile app that provides mental health resources, mood tracking, and peer support for high school students.',
    category: 'TECHNICAL',
  },
  {
    title: 'Community Art Installation Project',
    description: 'Create a collaborative public art installation that brings your community together and addresses a social theme.',
    category: 'CREATIVE',
  },
  {
    title: 'Youth-Led Social Enterprise',
    description: 'Start a small business or social enterprise that solves a local problem while teaching entrepreneurial skills to peers.',
    category: 'ENTREPRENEURIAL',
  },
  {
    title: 'Tutoring Program for Underserved Students',
    description: 'Organize and lead a free tutoring program for younger students in subjects you excel at, focusing on underserved communities.',
    category: 'SOCIAL_IMPACT',
  },
];

export default function IdeasPage() {
  const router = useRouter();
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [sampleIdeas, setSampleIdeas] = useState<SampleIdea[]>([]);
  const [ratings, setRatings] = useState<Record<number, number>>({});

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

  const handleGenerateClick = () => {
    // Show rating modal first
    setSampleIdeas(SAMPLE_IDEAS_FOR_RATING);
    setRatings({});
    setShowRatingModal(true);
  };

  const generateNewIdeas = async () => {
    setIsGenerating(true);
    setShowRatingModal(false);
    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ratings }),
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

  const setRating = (ideaIndex: number, rating: number) => {
    setRatings((prev) => ({ ...prev, [ideaIndex]: rating }));
  };

  const allIdeasRated = () => {
    return sampleIdeas.every((_, index) => ratings[index] !== undefined);
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
    // Status filter
    let statusMatch = false;
    if (filter === 'all') statusMatch = idea.status === 'suggested';
    else if (filter === 'saved') statusMatch = idea.status === 'saved';
    else if (filter === 'rejected') statusMatch = idea.status === 'rejected';

    // Category filter
    const categoryMatch = categoryFilter === 'all' || idea.category === categoryFilter;

    return statusMatch && categoryMatch;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Discover Your Project
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            AI-generated ideas personalized just for you
          </p>
        </div>

        <Button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          size="lg"
          className="shadow-xl"
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

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader>
              <CardTitle className="text-2xl">Rate Your Interest</CardTitle>
              <p className="text-muted-foreground">
                To help us generate ideas you'll love, please rate how interested you are in each of these project ideas on a scale of 1-10.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {sampleIdeas.map((idea, index) => (
                <div key={index} className="space-y-3 rounded-xl border-2 border-gray-200 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={CATEGORY_COLORS[idea.category] || 'bg-gray-100 text-gray-700'}>
                        {idea.category.replace('_', ' ')}
                      </Badge>
                      <h3 className="mt-2 font-semibold text-lg">{idea.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{idea.description}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold">How interested are you? (1 = Not interested, 10 = Very interested)</p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => setRating(index, rating)}
                          className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition-all ${
                            ratings[index] === rating
                              ? 'border-primary-500 bg-primary-500 text-white'
                              : 'border-gray-300 hover:border-primary-300 hover:bg-primary-50'
                          }`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateNewIdeas}
                  disabled={!allIdeasRated()}
                  className="flex-1"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Personalized Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="space-y-4">
        {/* Status Filter */}
        <div className="flex space-x-2">
          {[
            { id: 'all', label: 'New Ideas', count: ideas.filter(i => i.status === 'suggested').length },
            { id: 'saved', label: 'Saved', count: ideas.filter(i => i.status === 'saved').length },
            { id: 'rejected', label: 'Passed', count: ideas.filter(i => i.status === 'rejected').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`rounded-xl px-6 py-3 font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-primary-500 text-white shadow-duo'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div>
          <p className="mb-2 text-sm font-semibold text-gray-600">Filter by category:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Categories' },
              { id: 'CREATIVE', label: 'Creative' },
              { id: 'SOCIAL_IMPACT', label: 'Social Impact' },
              { id: 'ENTREPRENEURIAL', label: 'Entrepreneurial' },
              { id: 'RESEARCH', label: 'Research' },
              { id: 'TECHNICAL', label: 'Technical' },
              { id: 'LEADERSHIP', label: 'Leadership' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  categoryFilter === cat.id
                    ? cat.id === 'all'
                      ? 'bg-gray-800 text-white'
                      : `${CATEGORY_COLORS[cat.id]} ring-2 ring-offset-2`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="py-16 text-center">
            <Lightbulb className="mx-auto h-16 w-16 text-muted-foreground opacity-50" />
            <h3 className="mt-4 text-xl font-bold text-gray-900">
              No {filter === 'all' ? 'new' : filter} ideas yet
            </h3>
            <p className="mt-2 text-muted-foreground">
              {filter === 'all'
                ? 'Click "Generate New Ideas" to get started!'
                : `You haven't ${filter} any ideas yet.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
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
                    <CardTitle className="text-2xl">{idea.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{idea.description}</p>

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
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => updateIdeaStatus(idea.id, 'rejected')}
                      className="w-full"
                    >
                      <X className="mr-1 h-4 w-4" />
                      Pass
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => updateIdeaStatus(idea.id, 'saved')}
                      className="w-full"
                    >
                      <Heart className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      variant="default"
                      onClick={() => updateIdeaStatus(idea.id, 'started')}
                      className="w-full"
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
                    className="w-full"
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
