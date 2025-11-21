'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight } from 'lucide-react';

const VALUES = [
  { id: 'creativity', label: 'Creativity', icon: '🎨' },
  { id: 'impact', label: 'Social Impact', icon: '🌍' },
  { id: 'innovation', label: 'Innovation', icon: '💡' },
  { id: 'leadership', label: 'Leadership', icon: '👑' },
  { id: 'learning', label: 'Learning', icon: '📚' },
  { id: 'community', label: 'Community', icon: '🤝' },
  { id: 'independence', label: 'Independence', icon: '🦅' },
  { id: 'collaboration', label: 'Collaboration', icon: '👥' },
  { id: 'achievement', label: 'Achievement', icon: '🏆' },
  { id: 'helping', label: 'Helping Others', icon: '❤️' },
  { id: 'expression', label: 'Self-Expression', icon: '🎭' },
  { id: 'justice', label: 'Justice', icon: '⚖️' },
  { id: 'growth', label: 'Personal Growth', icon: '🌱' },
  { id: 'excellence', label: 'Excellence', icon: '⭐' },
  { id: 'adventure', label: 'Adventure', icon: '🚀' },
];

export default function ValuesPage() {
  const router = useRouter();
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleValue = (valueId: string) => {
    if (selectedValues.includes(valueId)) {
      setSelectedValues(selectedValues.filter((v) => v !== valueId));
    } else if (selectedValues.length < 5) {
      setSelectedValues([...selectedValues, valueId]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topValues: selectedValues,
          completionPercent: 50, // Completed values
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
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Sparkles className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step 2 of 4
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          What Matters Most to You?
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Choose your top 5 values that guide your decisions
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={50} className="h-3" />

      {/* Selected Values */}
      {selectedValues.length > 0 && (
        <Card className="border-2 border-primary-200 bg-primary-50/50">
          <CardHeader>
            <CardTitle className="text-lg">
              Your Top Values ({selectedValues.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {selectedValues.map((valueId, index) => {
                const value = VALUES.find((v) => v.id === valueId);
                return (
                  <div
                    key={valueId}
                    className="flex items-center space-x-2 rounded-full bg-primary-500 px-4 py-2 text-white shadow-duo"
                  >
                    <span className="text-xl">{value?.icon}</span>
                    <span className="font-semibold">
                      {index + 1}. {value?.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Values Grid */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {VALUES.map((value) => {
              const isSelected = selectedValues.includes(value.id);
              const isDisabled = !isSelected && selectedValues.length >= 5;
              const rank = selectedValues.indexOf(value.id) + 1;

              return (
                <button
                  key={value.id}
                  onClick={() => toggleValue(value.id)}
                  disabled={isDisabled}
                  className={`relative rounded-2xl border-2 p-6 text-center transition-all disabled:opacity-30 ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 shadow-duo'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-bold text-white shadow-lg">
                      {rank}
                    </div>
                  )}
                  <div className="mb-3 text-4xl">{value.icon}</div>
                  <div
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-primary-700' : 'text-gray-700'
                    }`}
                  >
                    {value.label}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => router.push('/profile/quick-start')}
          className="w-32"
        >
          Back
        </Button>

        <Button
          onClick={handleSubmit}
          disabled={selectedValues.length !== 5 || isSubmitting}
          className="w-32"
        >
          {isSubmitting ? 'Saving...' : 'Continue'}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
