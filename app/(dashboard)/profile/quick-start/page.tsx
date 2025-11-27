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
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

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

// Domain hierarchy for two-step subject selection
const SUBJECT_DOMAINS = [
  {
    id: 'stem',
    label: 'STEM & Technology',
    icon: '🔬',
    subjects: ['Math', 'Science', 'Computer Science', 'Engineering', 'Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'arts',
    label: 'Arts & Creative',
    icon: '🎨',
    subjects: ['Art', 'Music', 'Design', 'Theater', 'Film', 'Photography', 'Creative Writing'],
  },
  {
    id: 'humanities',
    label: 'Humanities & Languages',
    icon: '📚',
    subjects: ['English', 'History', 'Languages', 'Philosophy', 'Literature', 'Social Studies'],
  },
  {
    id: 'social',
    label: 'Social Sciences',
    icon: '🌍',
    subjects: ['Psychology', 'Sociology', 'Economics', 'Political Science', 'Anthropology', 'Geography'],
  },
  {
    id: 'business',
    label: 'Business & Leadership',
    icon: '💼',
    subjects: ['Business', 'Entrepreneurship', 'Marketing', 'Finance', 'Management', 'Accounting'],
  },
  {
    id: 'health',
    label: 'Health & Wellness',
    icon: '⚕️',
    subjects: ['Health', 'Physical Education', 'Nutrition', 'Medicine', 'Nursing', 'Sports Science'],
  },
];

export default function QuickStartPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subjectSubstep, setSubjectSubstep] = useState(1); // 1 = domains, 2 = subjects
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<QuickStartData>>({
    currentActivities: [],
    favoriteSubjects: [],
    skillsConfidence: {},
  });

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    // Handle substeps in step 3
    if (step === 3 && subjectSubstep === 1) {
      if (selectedDomains.length > 0) {
        setSubjectSubstep(2);
      } else {
        alert('Please select at least one domain');
      }
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
      if (step + 1 === 3) {
        setSubjectSubstep(1); // Reset to substep 1 when entering step 3
      }
    }
  };

  const handleBack = () => {
    // Handle substeps in step 3
    if (step === 3 && subjectSubstep === 2) {
      setSubjectSubstep(1);
      return;
    }

    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  // Get available subjects based on selected domains
  const getAvailableSubjects = () => {
    if (selectedDomains.length === 0) return [];
    return SUBJECT_DOMAINS
      .filter((domain) => selectedDomains.includes(domain.id))
      .flatMap((domain) => domain.subjects);
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
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Sparkles className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step {step} of {totalSteps}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Let's Get to Know You
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      {/* Progress Bar */}
      <Progress value={progress} className="h-3" />

      {/* Form Steps */}
      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-6">Basic Information</CardTitle>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="gradeLevel">What grade are you in?</Label>
                  <Select
                    value={formData.gradeLevel?.toString()}
                    onValueChange={(value) =>
                      updateFormData({ gradeLevel: parseInt(value) })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select your grade" />
                    </SelectTrigger>
                    <SelectContent>
                      {[9, 10, 11, 12].map((grade) => (
                        <SelectItem key={grade} value={grade.toString()}>
                          Grade {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="collegeTimeline">
                    When are you applying to college?
                  </Label>
                  <Select
                    value={formData.collegeTimeline}
                    onValueChange={(value) =>
                      updateFormData({ collegeTimeline: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="applying-2025">Fall 2025</SelectItem>
                      <SelectItem value="applying-2026">Fall 2026</SelectItem>
                      <SelectItem value="applying-2027">Fall 2027</SelectItem>
                      <SelectItem value="applying-2028">Fall 2028</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="timeCommitment">
                    How many hours per week can you dedicate to a passion
                    project?
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
                    className="mt-2"
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    Be realistic - quality over quantity!
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-2">Your Activities</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Select all that apply
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {COMMON_ACTIVITIES.map((activity) => {
                  const isSelected =
                    formData.currentActivities?.includes(activity);
                  return (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {activity}
                    </button>
                  );
                })}
              </div>

              <div>
                <Label htmlFor="customActivity">Other activities?</Label>
                <Input
                  id="customActivity"
                  placeholder="Type and press Enter"
                  className="mt-2"
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

          {step === 3 && subjectSubstep === 1 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-2">Academic Interests</CardTitle>
                <p className="text-sm text-muted-foreground">
                  First, select the broader domains you're interested in
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {SUBJECT_DOMAINS.map((domain) => {
                  const isSelected = selectedDomains.includes(domain.id);
                  return (
                    <button
                      key={domain.id}
                      onClick={() => toggleDomain(domain.id)}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2 text-3xl">{domain.icon}</div>
                      <div className="font-semibold">{domain.label}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {domain.subjects.slice(0, 3).join(', ')}...
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && subjectSubstep === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-2">Favorite Subjects</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Now select up to 5 specific subjects from your chosen domains ({formData.favoriteSubjects?.length || 0}/5 selected)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {getAvailableSubjects().map((subject) => {
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
                      className={`rounded-xl border-2 px-4 py-3 text-left font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {subject}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-2">Preferences</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help us understand your work style
                </p>
              </div>

              <div>
                <Label>How do you prefer to work?</Label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { value: 'solo', label: 'Solo' },
                    { value: 'small-team', label: 'Small Team' },
                    { value: 'large-team', label: 'Large Team' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFormData({
                          workStyle: option.value as QuickStartData['workStyle'],
                        })
                      }
                      className={`rounded-xl border-2 px-4 py-3 font-semibold transition-all ${
                        formData.workStyle === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Who do you want to impact?</Label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { value: 'friends', label: 'Friends & Family' },
                    { value: 'school', label: 'My School' },
                    { value: 'community', label: 'My Community' },
                    { value: 'world', label: 'The World' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        updateFormData({
                          impactPreference: option.value as QuickStartData['impactPreference'],
                        })
                      }
                      className={`rounded-xl border-2 px-4 py-3 font-semibold transition-all ${
                        formData.impactPreference === option.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="challengeLevel">
                  How challenging do you want your project to be?
                </Label>
                <div className="mt-3 flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">Easy</span>
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
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">
                    Challenging
                  </span>
                </div>
                <p className="mt-2 text-center text-sm font-semibold text-primary-600">
                  Level: {formData.challengeLevel || 5}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 1}
          className="w-32"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
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
            className="w-32"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
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
            className="w-32"
          >
            {isSubmitting ? 'Saving...' : 'Continue'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
