'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const QuickStartSchema = z.object({
  gradeLevel: z.number().min(6).max(12),
  collegeTimeline: z.string(),
  timeCommitment: z.number().min(2).max(20),
  currentActivities: z.array(z.string()),
  favoriteSubjects: z.array(z.string()),
  skillsConfidence: z.record(z.string(), z.number().min(1).max(10)),
  workStyle: z.enum(['solo', 'small-team', 'large-team']),
  impactPreference: z.enum(['friends', 'school', 'community', 'world']),
  challengeLevel: z.number().min(1).max(10),
});

type QuickStartData = z.infer<typeof QuickStartSchema>;

const SKILLS = [
  'coding',
  'writing',
  'public_speaking',
  'design',
  'leadership',
  'research',
  'organization',
];

const COMMON_ACTIVITIES = [
  'Sports',
  'Music',
  'Debate',
  'Volunteering',
  'Clubs',
  'Student Government',
  'Art',
  'Theater',
];

const SUBJECTS = [
  'Math',
  'Science',
  'English',
  'History',
  'Computer Science',
  'Art',
  'Music',
  'Languages',
];

export default function QuickStartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<QuickStartData>>({
    currentActivities: [],
    favoriteSubjects: [],
    skillsConfidence: {},
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/profile/values');
      } else {
        console.error('Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (data: Partial<QuickStartData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const toggleActivity = (activity: string) => {
    const current = formData.currentActivities || [];
    if (current.includes(activity)) {
      updateFormData({
        currentActivities: current.filter((a) => a !== activity),
      });
    } else {
      updateFormData({ currentActivities: [...current, activity] });
    }
  };

  const toggleSubject = (subject: string) => {
    const current = formData.favoriteSubjects || [];
    if (current.includes(subject)) {
      updateFormData({
        favoriteSubjects: current.filter((s) => s !== subject),
      });
    } else if (current.length < 5) {
      updateFormData({ favoriteSubjects: [...current, subject] });
    }
  };

  const updateSkillConfidence = (skill: string, value: number) => {
    updateFormData({
      skillsConfidence: {
        ...formData.skillsConfidence,
        [skill]: value,
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      {/* Header */}
      <div className="text-center animate-slide-down">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-green-400 px-6 py-3 shadow-duo">
          <Sparkles className="h-5 w-5 text-white animate-pulse" />
          <span className="text-base font-bold text-white">
            Step {step} of {totalSteps}
          </span>
        </div>
        <h1 className="text-5xl font-black text-gray-900 mb-3">
          Let&apos;s Get to Know You 👋
        </h1>
        <p className="text-xl text-gray-600 font-semibold">
          This helps us personalize your experience
        </p>
      </div>

      {/* Progress Bar with Step Indicators */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full font-bold transition-all duration-300 ${
                  stepNum < step
                    ? 'bg-primary-500 text-white shadow-duo scale-110'
                    : stepNum === step
                      ? 'bg-primary-500 text-white shadow-duo-hover scale-125 animate-pulse-glow'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {stepNum < step ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : (
                  stepNum
                )}
              </div>
              {stepNum < 4 && (
                <div
                  className={`h-2 w-16 sm:w-24 mx-2 rounded-full transition-all duration-300 ${
                    stepNum < step ? 'bg-primary-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <Card className="border-4 border-gray-100 shadow-duo hover:shadow-duo-hover transition-all duration-300 animate-scale-in">
        <CardContent className="pt-8 px-8 pb-8">
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-2">
                  📚 Basic Information
                </CardTitle>
                <p className="text-gray-600">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="gradeLevel" className="text-lg font-bold text-gray-800">
                    What grade are you in?
                  </Label>
                  <Select
                    value={formData.gradeLevel?.toString()}
                    onValueChange={(value) =>
                      updateFormData({ gradeLevel: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="h-14 text-base font-semibold border-2 border-gray-300 hover:border-primary-500 transition-colors">
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()} className="text-base font-semibold">
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="collegeTimeline" className="text-lg font-bold text-gray-800">
                    When are you applying to college?
                  </Label>
                  <Select
                    value={formData.collegeTimeline}
                    onValueChange={(value) =>
                      updateFormData({ collegeTimeline: value })
                    }
                  >
                    <SelectTrigger className="h-14 text-base font-semibold border-2 border-gray-300 hover:border-primary-500 transition-colors">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applying-2025" className="text-base font-semibold">Fall 2025</SelectItem>
                      <SelectItem value="applying-2026" className="text-base font-semibold">Fall 2026</SelectItem>
                      <SelectItem value="applying-2027" className="text-base font-semibold">Fall 2027</SelectItem>
                      <SelectItem value="applying-2028" className="text-base font-semibold">Fall 2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="timeCommitment" className="text-lg font-bold text-gray-800">
                    How many hours per week can you dedicate to a passion project?
                  </Label>
                  <Input
                    id="timeCommitment"
                    type="number"
                    min="2"
                    max="20"
                    value={formData.timeCommitment || ''}
                    onChange={(e) =>
                      updateFormData({
                        timeCommitment: parseInt(e.target.value),
                      })
                    }
                    placeholder="e.g., 5"
                    className="h-14 text-base font-semibold border-2 border-gray-300 hover:border-primary-500 focus:border-primary-500 transition-colors"
                  />
                  <div className="flex items-center gap-2 bg-accent-50 border-2 border-accent-200 rounded-xl p-3">
                    <span className="text-2xl">💡</span>
                    <p className="text-sm font-semibold text-accent-800">
                      Be realistic - quality over quantity!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-2">
                  🎯 Your Activities
                </CardTitle>
                <p className="text-lg text-gray-600 font-semibold">
                  Select all that apply
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {COMMON_ACTIVITIES.map((activity) => {
                  const isSelected =
                    formData.currentActivities?.includes(activity);
                  return (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`group relative rounded-2xl border-4 px-6 py-5 text-left font-bold text-lg transition-all duration-200 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-500 text-white shadow-duo scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="h-5 w-5" />}
                        {activity}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                <Label htmlFor="customActivity" className="text-lg font-bold text-gray-800">
                  Other activities?
                </Label>
                <Input
                  id="customActivity"
                  placeholder="Type and press Enter"
                  className="h-14 text-base font-semibold border-2 border-gray-300 hover:border-primary-500 focus:border-primary-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      toggleActivity(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-2">
                  ❤️ Favorite Subjects
                </CardTitle>
                <p className="text-lg text-gray-600 font-semibold">
                  Select up to 5 subjects you enjoy most
                </p>
                <div className="mt-3 flex items-center gap-2 bg-secondary-50 border-2 border-secondary-200 rounded-xl p-3">
                  <span className="text-xl">📊</span>
                  <p className="text-sm font-semibold text-secondary-800">
                    Selected: {formData.favoriteSubjects?.length || 0} / 5
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SUBJECTS.map((subject) => {
                  const isSelected =
                    formData.favoriteSubjects?.includes(subject);
                  const isDisabled =
                    !isSelected &&
                    (formData.favoriteSubjects?.length || 0) >= 5;
                  return (
                    <button
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      disabled={isDisabled}
                      className={`rounded-2xl border-4 px-6 py-5 text-left font-bold text-lg transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-secondary-500 bg-secondary-500 text-white shadow-duo scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-secondary-400 hover:bg-secondary-50 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isSelected && <CheckCircle2 className="h-5 w-5" />}
                        {subject}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8">
              <div>
                <CardTitle className="text-3xl font-black text-gray-900 mb-2">
                  ⚙️ Preferences
                </CardTitle>
                <p className="text-lg text-gray-600 font-semibold">
                  Help us understand your work style
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold text-gray-800">
                  How do you prefer to work?
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'solo', label: '🧑 Solo', emoji: '🧑' },
                    { value: 'small-team', label: '👥 Small Team', emoji: '👥' },
                    { value: 'large-team', label: '👨‍👩‍👧‍👦 Large Team', emoji: '👨‍👩‍👧‍👦' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFormData({
                          workStyle: option.value as QuickStartData['workStyle'],
                        })
                      }
                      className={`rounded-2xl border-4 px-4 py-5 font-bold text-base transition-all duration-200 ${
                        formData.workStyle === option.value
                          ? 'border-accent-500 bg-accent-500 text-white shadow-duo scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-accent-400 hover:bg-accent-50 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{option.emoji}</div>
                        <div>{option.label.split(' ')[1]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-bold text-gray-800">
                  Who do you want to impact?
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'friends', label: 'Friends & Family', emoji: '👨‍👩‍👧' },
                    { value: 'school', label: 'My School', emoji: '🏫' },
                    { value: 'community', label: 'My Community', emoji: '🏘️' },
                    { value: 'world', label: 'The World', emoji: '🌍' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFormData({
                          impactPreference: option.value as QuickStartData['impactPreference'],
                        })
                      }
                      className={`rounded-2xl border-4 px-6 py-5 text-left font-bold text-base transition-all duration-200 ${
                        formData.impactPreference === option.value
                          ? 'border-primary-500 bg-primary-500 text-white shadow-duo scale-105'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-primary-400 hover:bg-primary-50 hover:scale-105 active:scale-95'
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-2xl">{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="challengeLevel" className="text-lg font-bold text-gray-800">
                  How challenging do you want your project to be?
                </Label>
                <div className="bg-gradient-to-r from-green-50 to-yellow-50 border-2 border-gray-300 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                      <span className="text-2xl">😌</span>
                      Easy
                    </span>
                    <span className="text-base font-bold text-gray-700 flex items-center gap-2">
                      Challenging
                      <span className="text-2xl">🔥</span>
                    </span>
                  </div>
                  <Input
                    id="challengeLevel"
                    type="range"
                    min="1"
                    max="10"
                    value={formData.challengeLevel || 5}
                    onChange={(e) =>
                      updateFormData({
                        challengeLevel: parseInt(e.target.value),
                      })
                    }
                    className="w-full h-3 cursor-pointer"
                  />
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white border-2 border-primary-500 rounded-full px-6 py-3 shadow-duo">
                      <span className="text-2xl">
                        {(formData.challengeLevel || 5) <= 3 ? '😊' : (formData.challengeLevel || 5) <= 7 ? '💪' : '🚀'}
                      </span>
                      <span className="text-xl font-black text-primary-600">
                        Level {formData.challengeLevel || 5}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          size="lg"
          className="px-8 font-bold border-2 hover:scale-105 active:scale-95 transition-transform disabled:opacity-30"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 &&
                (!formData.gradeLevel ||
                  !formData.collegeTimeline ||
                  !formData.timeCommitment)) ||
              (step === 2 && !formData.currentActivities?.length) ||
              (step === 3 && !formData.favoriteSubjects?.length)
            }
            size="lg"
            className="px-10 font-black text-base hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"
          >
            Next
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !formData.workStyle ||
              !formData.impactPreference ||
              !formData.challengeLevel
            }
            size="lg"
            className="px-10 font-black text-base hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 animate-pulse-glow"
          >
            {isSubmitting ? 'Saving...' : 'Continue 🎉'}
            {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>
        )}
      </div>
    </div>
  );
}
