'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Check, Briefcase } from 'lucide-react';

// RIASEC Career Interest Types (Holland's Theory)
const RIASEC_TYPES = [
  {
    id: 'realistic',
    label: 'Realistic',
    icon: '🔧',
    description: 'Working with tools, machines, and hands-on projects',
    examples: 'Engineering, athletics, technology, building things',
  },
  {
    id: 'investigative',
    label: 'Investigative',
    icon: '🔬',
    description: 'Researching, analyzing, and solving complex problems',
    examples: 'Science, research, data analysis, medicine',
  },
  {
    id: 'artistic',
    label: 'Artistic',
    icon: '🎨',
    description: 'Creating, designing, and expressing original ideas',
    examples: 'Art, music, writing, design, performance',
  },
  {
    id: 'social',
    label: 'Social',
    icon: '🤝',
    description: 'Helping, teaching, and supporting others',
    examples: 'Education, counseling, healthcare, social work',
  },
  {
    id: 'enterprising',
    label: 'Enterprising',
    icon: '💼',
    description: 'Leading, persuading, and managing business ventures',
    examples: 'Business, sales, leadership, entrepreneurship',
  },
  {
    id: 'conventional',
    label: 'Conventional',
    icon: '📊',
    description: 'Organizing, managing data, and maintaining systems',
    examples: 'Accounting, administration, finance, operations',
  },
];

const PROBLEM_AREAS = [
  { id: 'education', label: 'Education Access', icon: '📚' },
  { id: 'climate', label: 'Climate Change', icon: '🌍' },
  { id: 'health', label: 'Health & Wellness', icon: '🏥' },
  { id: 'mental-health', label: 'Mental Health', icon: '🧠' },
  { id: 'poverty', label: 'Poverty & Inequality', icon: '🤝' },
  { id: 'technology', label: 'Technology & Innovation', icon: '💻' },
  { id: 'arts', label: 'Arts & Culture', icon: '🎭' },
  { id: 'justice', label: 'Social Justice', icon: '⚖️' },
  { id: 'community', label: 'Community Development', icon: '🏘️' },
  { id: 'environment', label: 'Environmental Protection', icon: '🌳' },
  { id: 'elderly', label: 'Elderly Care', icon: '👴' },
  { id: 'youth', label: 'Youth Empowerment', icon: '👶' },
  { id: 'diversity', label: 'Diversity & Inclusion', icon: '🌈' },
  { id: 'animals', label: 'Animal Welfare', icon: '🐾' },
  { id: 'food', label: 'Food Security', icon: '🍎' },
];

export default function InterestsPage() {
  const router = useRouter();
  const [selectedProblems, setSelectedProblems] = useState<string[]>([]);
  const [dreamCareer, setDreamCareer] = useState('');
  const [riasecRatings, setRiasecRatings] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleProblem = (problemId: string) => {
    if (selectedProblems.includes(problemId)) {
      setSelectedProblems(selectedProblems.filter((p) => p !== problemId));
    } else if (selectedProblems.length < 5) {
      setSelectedProblems([...selectedProblems, problemId]);
    }
  };

  const handleRiasecRating = (typeId: string, rating: number) => {
    setRiasecRatings(prev => ({ ...prev, [typeId]: rating }));
  };

  const isComplete = () => {
    const problemsSelected = selectedProblems.length > 0;
    const allRiasecRated = RIASEC_TYPES.every(type => riasecRatings[type.id]);
    return problemsSelected && allRiasecRated;
  };

  const calculateCareerClusters = () => {
    // Identify top 2-3 RIASEC types
    const sortedTypes = Object.entries(riasecRatings)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .filter(([, score]) => score >= 6)
      .map(([type]) => type);

    return sortedTypes;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const careerClusters = calculateCareerClusters();

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemFocus: selectedProblems,
          dreamCareer: dreamCareer || null,
          riasecScores: riasecRatings,
          careerClusters,
          completionPercent: 100, // Profile complete!
          completedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Redirect to dashboard or ideas page
        router.push('/ideas');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Sparkles className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step 6 of 6 - Final Step!
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Your Interests & Career Profile
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Understanding your interests helps us match you with perfect projects
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={100} className="h-3" />

      {/* Problem Areas */}
      <Card>
        <CardHeader>
          <CardTitle>
            Choose Your Focus Areas ({selectedProblems.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {PROBLEM_AREAS.map((problem) => {
              const isSelected = selectedProblems.includes(problem.id);
              const isDisabled = !isSelected && selectedProblems.length >= 5;

              return (
                <button
                  key={problem.id}
                  onClick={() => toggleProblem(problem.id)}
                  disabled={isDisabled}
                  className={`relative rounded-2xl border-2 p-4 text-center transition-all disabled:opacity-30 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-duo'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary-500 shadow-lg">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="mb-2 text-3xl">{problem.icon}</div>
                  <div
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {problem.label}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* RIASEC Career Interest Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary-600" />
            Career Interest Profile (Rate 1-10)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            How interested are you in each type of work? (1 = Not interested, 10 = Very interested)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {RIASEC_TYPES.map((type) => (
            <div key={type.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-3xl">{type.icon}</span>
                <div className="flex-1">
                  <Label className="text-base font-semibold">
                    {type.label}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {type.description}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Examples: {type.examples}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRiasecRating(type.id, rating)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition-all ${
                      riasecRatings[type.id] === rating
                        ? 'border-primary-500 bg-primary-500 text-white shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dream Career (Optional) */}
      <Card className="border-2 border-secondary-200 bg-gradient-to-br from-secondary-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="mr-2">🚀</span>
            Dream Career (Optional)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            This helps us suggest projects that align with your aspirations
          </p>
        </CardHeader>
        <CardContent>
          <textarea
            value={dreamCareer}
            onChange={(e) => setDreamCareer(e.target.value)}
            placeholder="e.g., Environmental Scientist, Software Engineer, Social Entrepreneur, Doctor..."
            maxLength={500}
            rows={4}
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 font-medium transition-colors focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            {dreamCareer.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Selected Summary */}
      {selectedProblems.length > 0 && (
        <Card className="border-2 border-primary-200 bg-primary-50/50">
          <CardHeader>
            <CardTitle className="text-lg">Your Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {selectedProblems.map((problemId) => {
                const problem = PROBLEM_AREAS.find((p) => p.id === problemId);
                return (
                  <div
                    key={problemId}
                    className="flex items-center space-x-2 rounded-full bg-primary-500 px-4 py-2 text-white shadow-duo"
                  >
                    <span className="text-lg">{problem?.icon}</span>
                    <span className="font-semibold">{problem?.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completion Message */}
      <Card className="border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white">
        <CardContent className="py-6">
          <div className="text-center">
            <div className="mb-3 text-5xl">🎉</div>
            <h3 className="text-xl font-bold text-gray-900">
              You're All Set!
            </h3>
            <p className="mt-2 text-muted-foreground">
              Click "Complete Profile" to start discovering personalized project ideas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/profile/grit')}
          className="w-32"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!isComplete() || isSubmitting}
          size="lg"
          className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 text-lg shadow-xl hover:from-primary-600 hover:to-secondary-600"
        >
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
