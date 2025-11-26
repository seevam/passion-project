'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight, Brain, Target, Users } from 'lucide-react';

// Motivation questions based on Self-Determination Theory (Deci & Ryan)
const MOTIVATION_QUESTIONS = [
  {
    id: 'autonomy1',
    category: 'autonomy',
    question: 'I prefer to choose my own path and make my own decisions when working on projects',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'autonomy2',
    category: 'autonomy',
    question: 'I feel most motivated when I have freedom to decide HOW to accomplish my goals',
    icon: <Target className="h-5 w-5" />,
  },
  {
    id: 'competence1',
    category: 'competence',
    question: 'I feel confident I can learn new skills when I put effort into them',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: 'competence2',
    category: 'competence',
    question: 'Even if something is hard at first, I believe I can get better with practice',
    icon: <Brain className="h-5 w-5" />,
  },
  {
    id: 'relatedness1',
    category: 'relatedness',
    question: 'Working with others who share my interests makes projects more meaningful',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'relatedness2',
    category: 'relatedness',
    question: 'I value being part of a community that cares about similar causes',
    icon: <Users className="h-5 w-5" />,
  },
];

// Growth Mindset questions (Dweck)
const MINDSET_SCENARIOS = [
  {
    id: 'challenge1',
    question: 'You start a coding project but encounter difficult bugs. How do you typically respond?',
    options: [
      { value: 'embrace', label: 'Get excited - this is how I learn!', growth: 10 },
      { value: 'neutral', label: 'Keep trying methodically until solved', growth: 7 },
      { value: 'avoid', label: 'Feel frustrated and consider switching projects', growth: 3 },
    ],
  },
  {
    id: 'challenge2',
    question: 'Your first attempt at something doesn\'t turn out well. What do you think?',
    options: [
      { value: 'embrace', label: 'Valuable feedback - now I know what to improve', growth: 10 },
      { value: 'neutral', label: 'Not great, but I can try a different approach', growth: 7 },
      { value: 'avoid', label: 'Maybe I\'m not good at this type of thing', growth: 3 },
    ],
  },
  {
    id: 'challenge3',
    question: 'Someone else is really good at something you want to learn. How does this make you feel?',
    options: [
      { value: 'embrace', label: 'Inspired! I can learn from them', growth: 10 },
      { value: 'neutral', label: 'Curious about how they got so good', growth: 7 },
      { value: 'avoid', label: 'Intimidated - they have natural talent', growth: 3 },
    ],
  },
];

export default function MotivationPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Motivation ratings (1-10 scale)
  const [motivationRatings, setMotivationRatings] = useState<Record<string, number>>({});

  // Mindset scenario responses
  const [mindsetResponses, setMindsetResponses] = useState<Record<string, string>>({});

  const handleMotivationRating = (questionId: string, rating: number) => {
    setMotivationRatings(prev => ({ ...prev, [questionId]: rating }));
  };

  const handleMindsetResponse = (scenarioId: string, value: string) => {
    setMindsetResponses(prev => ({ ...prev, [scenarioId]: value }));
  };

  const calculateScores = () => {
    // Calculate SDT dimension scores
    const autonomyQuestions = MOTIVATION_QUESTIONS.filter(q => q.category === 'autonomy');
    const competenceQuestions = MOTIVATION_QUESTIONS.filter(q => q.category === 'competence');
    const relatednessQuestions = MOTIVATION_QUESTIONS.filter(q => q.category === 'relatedness');

    const autonomyScore = Math.round(
      autonomyQuestions.reduce((sum, q) => sum + (motivationRatings[q.id] || 0), 0) / autonomyQuestions.length
    );
    const competenceScore = Math.round(
      competenceQuestions.reduce((sum, q) => sum + (motivationRatings[q.id] || 0), 0) / competenceQuestions.length
    );
    const relatednessScore = Math.round(
      relatednessQuestions.reduce((sum, q) => sum + (motivationRatings[q.id] || 0), 0) / relatednessQuestions.length
    );

    // Calculate growth mindset score
    const growthScores = Object.entries(mindsetResponses).map(([scenarioId, responseValue]) => {
      const scenario = MINDSET_SCENARIOS.find(s => s.id === scenarioId);
      const option = scenario?.options.find(o => o.value === responseValue);
      return option?.growth || 5;
    });
    const growthMindsetScore = Math.round(
      growthScores.reduce((sum, score) => sum + score, 0) / growthScores.length
    );

    // Determine challenge response tendency
    const responseCounts = { embrace: 0, neutral: 0, avoid: 0 };
    Object.values(mindsetResponses).forEach(value => {
      responseCounts[value as keyof typeof responseCounts]++;
    });
    const challengeResponse = Object.entries(responseCounts).reduce((a, b) =>
      responseCounts[a[0] as keyof typeof responseCounts] > responseCounts[b[0] as keyof typeof responseCounts] ? a : b
    )[0];

    return {
      autonomyScore,
      competenceScore,
      relatednessScore,
      growthMindsetScore,
      challengeResponse,
      motivationProfile: motivationRatings,
      failureAttribution: mindsetResponses,
    };
  };

  const isComplete = () => {
    const allMotivationAnswered = MOTIVATION_QUESTIONS.every(q => motivationRatings[q.id]);
    const allMindsetAnswered = MINDSET_SCENARIOS.every(s => mindsetResponses[s.id]);
    return allMotivationAnswered && allMindsetAnswered;
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
          completionPercent: 50,
        }),
      });

      if (response.ok) {
        router.push('/profile/strengths');
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
            Step 3 of 6
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Understanding Your Motivation
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Research shows intrinsic motivation and growth mindset predict success
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={50} className="h-3" />

      {/* Intrinsic Motivation Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary-600" />
            What Drives You? (Rate 1-10)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            1 = Strongly Disagree, 10 = Strongly Agree
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {MOTIVATION_QUESTIONS.map((q) => (
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
                    onClick={() => handleMotivationRating(q.id, rating)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 font-semibold transition-all ${
                      motivationRatings[q.id] === rating
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

      {/* Growth Mindset Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary-600" />
            How You Approach Challenges
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose the response that best describes your typical reaction
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {MINDSET_SCENARIOS.map((scenario, idx) => (
            <div key={scenario.id} className="space-y-3">
              <Label className="text-base font-semibold">
                {idx + 1}. {scenario.question}
              </Label>
              <div className="space-y-2">
                {scenario.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleMindsetResponse(scenario.id, option.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                      mindsetResponses[scenario.id] === option.value
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/profile/values')}
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
