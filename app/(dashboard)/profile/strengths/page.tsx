'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowRight } from 'lucide-react';

const STRENGTHS = [
  { id: 'creativity', label: 'Creativity & Innovation', icon: '🎨' },
  { id: 'leadership', label: 'Leadership', icon: '👑' },
  { id: 'communication', label: 'Communication', icon: '💬' },
  { id: 'technical', label: 'Technical Skills', icon: '💻' },
  { id: 'organization', label: 'Organization', icon: '📋' },
  { id: 'empathy', label: 'Empathy & Emotional Intelligence', icon: '❤️' },
  { id: 'problemSolving', label: 'Problem Solving', icon: '🧩' },
  { id: 'adaptability', label: 'Adaptability', icon: '🔄' },
];

export default function StrengthsPage() {
  const router = useRouter();
  const [strengths, setStrengths] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    STRENGTHS.forEach((s) => {
      initial[s.id] = 5; // Default to middle
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateStrength = (id: string, value: number) => {
    setStrengths((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strengthsRadar: strengths,
          completionPercent: 75, // Completed strengths
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

  const getStrengthLevel = (value: number) => {
    if (value <= 3) return { label: 'Developing', color: 'text-gray-600' };
    if (value <= 6) return { label: 'Intermediate', color: 'text-blue-600' };
    if (value <= 8) return { label: 'Proficient', color: 'text-primary-600' };
    return { label: 'Expert', color: 'text-purple-600' };
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Sparkles className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step 3 of 4
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Assess Your Strengths
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Rate yourself honestly - this helps us match you with the right projects
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={75} className="h-3" />

      {/* Strengths Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Your Current Level</CardTitle>
          <p className="text-sm text-muted-foreground">
            1 = Just starting • 10 = Very experienced
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {STRENGTHS.map((strength) => {
            const value = strengths[strength.id] || 5;
            const level = getStrengthLevel(value);

            return (
              <div key={strength.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{strength.icon}</span>
                    <Label className="text-base">{strength.label}</Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm font-semibold ${level.color}`}
                    >
                      {level.label}
                    </span>
                    <span className="text-xl font-bold text-primary-600">
                      {value}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={value}
                    onChange={(e) =>
                      updateStrength(strength.id, parseInt(e.target.value))
                    }
                    className="h-3 w-full cursor-pointer appearance-none rounded-full bg-gray-200 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-500 [&::-webkit-slider-thumb]:shadow-duo [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:bg-primary-600"
                  />
                </div>

                {/* Visual progress bar */}
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-300"
                    style={{ width: `${value * 10}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Top Strengths Summary */}
      <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white">
        <CardHeader>
          <CardTitle>Your Top Strengths</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STRENGTHS.sort((a, b) => (strengths[b.id] || 0) - (strengths[a.id] || 0))
              .slice(0, 4)
              .map((strength) => (
                <div
                  key={strength.id}
                  className="rounded-xl border-2 border-primary-300 bg-white p-4 text-center"
                >
                  <div className="mb-2 text-3xl">{strength.icon}</div>
                  <div className="text-xs font-semibold text-gray-700">
                    {strength.label}
                  </div>
                  <div className="mt-1 text-lg font-bold text-primary-600">
                    {strengths[strength.id]}/10
                  </div>
                </div>
              ))}
          </div>
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
          disabled={isSubmitting}
          className="w-32"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
