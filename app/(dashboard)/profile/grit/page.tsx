'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, ArrowRight, Flame, Target, Clock } from 'lucide-react';

// Grit questions based on Duckworth's Grit Scale
const GRIT_QUESTIONS = [
  {
    id: 'perseverance1',
    dimension: 'perseverance',
    question: 'I finish whatever I begin, even if it takes longer than expected',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'perseverance2',
    dimension: 'perseverance',
    question: 'Setbacks don\'t discourage me - I bounce back from disappointments',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'perseverance3',
    dimension: 'perseverance',
    question: 'I work hard even when things are difficult or frustrating',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'consistency1',
    dimension: 'consistency',
    question: 'I often set a goal but later choose to pursue a different one (reverse scored)',
    icon: <Clock className="h-5 w-5" />,
    reverse: true,
  },
  {
    id: 'consistency2',
    dimension: 'consistency',
    question: 'I have been obsessed with a certain idea or project for a short time but later lost interest (reverse scored)',
    icon: <Clock className="h-5 w-5" />,
    reverse: true,
  },
  {
    id: 'consistency3',
    dimension: 'consistency',
    question: 'I stay focused on the same top-level goals for months or years at a time',
    icon: <Clock className="h-5 w-5" />,
  },
];

// Passion depth indicators (Interest Development Theory)
const PASSION_QUESTIONS = [
  {
    id: 'flow1',
    question: 'How often do you lose track of time when working on things you\'re interested in?',
    dimension: 'flow',
  },
  {
    id: 'reengagement1',
    question: 'When you learn something new in an area you care about, how likely are you to seek out more information?',
    dimension: 'reengagement',
  },
  {
    id: 'depth1',
    question: 'How deeply do you explore topics that interest you? (surface level → expert level)',
    dimension: 'depth',
  },
];

// Past project tracking
const PROJECT_TYPES = [
  { id: 'extracurricular', label: 'Extracurricular activity (6+ months)', icon: '🎯' },
  { id: 'personal-project', label: 'Personal project (coding, art, writing)', icon: '💻' },
  { id: 'volunteer', label: 'Volunteer commitment (3+ months)', icon: '❤️' },
  { id: 'sport-instrument', label: 'Sport or musical instrument (1+ year)', icon: '🎸' },
  { id: 'club-leadership', label: 'Club or team leadership role', icon: '👑' },
];

export default function GritPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grit ratings (1-10 scale)
  const [gritRatings, setGritRatings] = useState<Record<string, number>>({});

  // Passion depth ratings (1-10 scale)
  const [passionRatings, setPassionRatings] = useState<Record<string, number>>({});

  // Past completions
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);

  const handleGritRating = (questionId: string, rating: number) => {
    setGritRatings(prev => ({ ...prev, [questionId]: rating }));
  };

  const handlePassionRating = (questionId: string, rating: number) => {
    setPassionRatings(prev => ({ ...prev, [questionId]: rating }));
  };

  const toggleProject = (projectId: string) => {
    setCompletedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const calculateScores = () => {
    // Calculate perseverance score
    const perseveranceQuestions = GRIT_QUESTIONS.filter(q => q.dimension === 'perseverance');
    const perseveranceScore = Math.round(
      perseveranceQuestions.reduce((sum, q) => sum + (gritRatings[q.id] || 0), 0) / perseveranceQuestions.length
    );

    // Calculate consistency score (accounting for reverse scoring)
    const consistencyQuestions = GRIT_QUESTIONS.filter(q => q.dimension === 'consistency');
    const consistencyScore = Math.round(
      consistencyQuestions.reduce((sum, q) => {
        const rawScore = gritRatings[q.id] || 0;
        const score = q.reverse ? (11 - rawScore) : rawScore;
        return sum + score;
      }, 0) / consistencyQuestions.length
    );

    // Overall grit score
    const gritScore = Math.round((perseveranceScore + consistencyScore) / 2);

    // Calculate passion type based on ratings
    const flowFrequency = passionRatings['flow1'] || 5;
    const reengagementLevel = passionRatings['reengagement1'] || 5;
    const depthLevel = passionRatings['depth1'] || 5;

    let passionType = 'emerging';
    const avgPassion = (flowFrequency + reengagementLevel + depthLevel) / 3;
    if (avgPassion >= 8) {
      passionType = 'harmonious';
    } else if (avgPassion >= 6) {
      passionType = 'emerging';
    } else {
      passionType = 'undeveloped';
    }

    // Format past completions
    const pastCompletions = completedProjects.map(id => ({
      type: PROJECT_TYPES.find(p => p.id === id)?.label || id,
      completed: true,
      duration: 'varies',
    }));

    return {
      gritScore,
      perseveranceScore,
      consistencyScore,
      flowFrequency,
      passionType,
      passionIndicators: {
        flow: flowFrequency,
        reengagement: reengagementLevel,
        depth: depthLevel,
      },
      interestDepth: passionRatings,
      pastCompletions,
    };
  };

  const isComplete = () => {
    const allGritAnswered = GRIT_QUESTIONS.every(q => gritRatings[q.id]);
    const allPassionAnswered = PASSION_QUESTIONS.every(q => passionRatings[q.id]);
    return allGritAnswered && allPassionAnswered;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const scores = calculateScores();
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...scores,
          completionPercent: 80,
        }),
      });

      if (response.ok) {
        router.push('/profile/interests');
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
            Step 5 of 6
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Your Persistence & Passion
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Grit - a combination of passion and perseverance - predicts achievement
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={80} className="h-3" />

      {/* Grit Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-600" />
            Perseverance & Consistency (Rate 1-10)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            1 = Not at all like me, 10 = Very much like me
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {GRIT_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-primary-600">{q.icon}</div>
                <Label className="text-base font-medium leading-relaxed">
                  {q.question}
                </Label>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleGritRating(q.id, rating)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition-all ${
                      gritRatings[q.id] === rating
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg'
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

      {/* Passion Depth Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-6 w-6 text-pink-600" />
            Depth of Interest (Rate 1-10)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Understanding how deeply you engage with your interests
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {PASSION_QUESTIONS.map((q) => (
            <div key={q.id} className="space-y-3">
              <Label className="text-base font-medium leading-relaxed">
                {q.question}
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handlePassionRating(q.id, rating)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition-all ${
                      passionRatings[q.id] === rating
                        ? 'border-pink-500 bg-pink-500 text-white shadow-lg'
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

      {/* Past Completions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-green-600" />
            Past Commitments (Optional)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select any long-term commitments you've successfully maintained
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {PROJECT_TYPES.map((project) => (
              <div
                key={project.id}
                className="flex items-center space-x-3 rounded-lg border-2 border-gray-200 p-4 transition-all hover:bg-gray-50"
              >
                <Checkbox
                  id={project.id}
                  checked={completedProjects.includes(project.id)}
                  onCheckedChange={() => toggleProject(project.id)}
                />
                <label
                  htmlFor={project.id}
                  className="flex flex-1 cursor-pointer items-center gap-3"
                >
                  <span className="text-2xl">{project.icon}</span>
                  <span className="font-medium">{project.label}</span>
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/profile/strengths')}
          className="w-32"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={!isComplete() || isSubmitting}
          className="w-32"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
