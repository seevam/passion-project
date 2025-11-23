'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleProblem = (problemId: string) => {
    if (selectedProblems.includes(problemId)) {
      setSelectedProblems(selectedProblems.filter((p) => p !== problemId));
    } else if (selectedProblems.length < 5) {
      setSelectedProblems([...selectedProblems, problemId]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemFocus: selectedProblems,
          dreamCareer: dreamCareer || null,
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
    <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Sparkles className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step 4 of 4 - Almost Done!
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
          What Problems Do You Care About?
        </h1>
        <p className="mt-2 text-base text-muted-foreground sm:text-lg">
          Select up to 5 areas where you'd like to make an impact
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={100} className="h-3" />

      {/* Problem Areas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">
            Choose Your Focus Areas ({selectedProblems.length}/5)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {PROBLEM_AREAS.map((problem) => {
              const isSelected = selectedProblems.includes(problem.id);
              const isDisabled = !isSelected && selectedProblems.length >= 5;

              return (
                <button
                  key={problem.id}
                  onClick={() => toggleProblem(problem.id)}
                  disabled={isDisabled}
                  className={`relative min-h-[80px] rounded-2xl border-2 p-3 text-center transition-all disabled:opacity-30 sm:min-h-[100px] sm:p-4 ${
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
                  <div className="mb-1 text-2xl sm:mb-2 sm:text-3xl">{problem.icon}</div>
                  <div
                    className={`text-xs font-semibold sm:text-sm ${
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

      {/* Dream Career (Optional) */}
      <Card className="border-2 border-secondary-200 bg-gradient-to-br from-secondary-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
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
            className="w-full rounded-xl border-2 border-gray-300 bg-white p-3 text-sm font-medium transition-colors focus:border-secondary-500 focus:outline-none focus:ring-2 focus:ring-secondary-200 sm:p-4 sm:text-base"
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
            <div className="mb-3 text-4xl sm:text-5xl">🎉</div>
            <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
              You're All Set!
            </h3>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Click "Complete Profile" to start discovering personalized project ideas
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/profile/strengths')}
          className="min-h-[44px] w-full sm:w-32"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={selectedProblems.length === 0 || isSubmitting}
          size="lg"
          className="min-h-[44px] w-full bg-gradient-to-r from-primary-500 to-secondary-500 px-8 text-base shadow-xl hover:from-primary-600 hover:to-secondary-600 sm:w-auto sm:text-lg"
        >
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
