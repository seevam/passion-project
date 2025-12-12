'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Sparkles, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';

const CATEGORIES = [
  { value: 'CREATIVE', label: 'Creative', icon: '🎨' },
  { value: 'SOCIAL_IMPACT', label: 'Social Impact', icon: '🌍' },
  { value: 'ENTREPRENEURIAL', label: 'Entrepreneurial', icon: '💼' },
  { value: 'RESEARCH', label: 'Research', icon: '🔬' },
  { value: 'TECHNICAL', label: 'Technical', icon: '💻' },
  { value: 'LEADERSHIP', label: 'Leadership', icon: '👑' },
];

function NewProjectForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ideaId = searchParams?.get('ideaId');

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    ideaSourceId: ideaId || '',
    idealTeamSize: 'SOLO' as 'SOLO' | 'DUO' | 'SMALL_TEAM' | 'LARGE_TEAM',
    openForCollaboration: false,
    maxTeamSize: 1,
    skillsNeeded: [] as string[],
    collaborationDesc: '',
  });

  // If coming from an idea, load idea details
  useEffect(() => {
    if (ideaId) {
      loadIdea(ideaId);
    }
  }, [ideaId]);

  const loadIdea = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/ideas/${id}`);
      const data = await response.json();
      if (data.success && data.idea) {
        setFormData((prev) => ({
          ...prev,
          title: data.idea.title,
          description: data.idea.description,
          category: data.idea.category,
          ideaSourceId: id,
        }));
      }
    } catch (error) {
      console.error('Error loading idea:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const addSkill = (skill: string) => {
    if (skill && !formData.skillsNeeded.includes(skill)) {
      updateFormData({
        skillsNeeded: [...formData.skillsNeeded, skill],
      });
    }
  };

  const removeSkill = (skill: string) => {
    updateFormData({
      skillsNeeded: formData.skillsNeeded.filter((s) => s !== skill),
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to the new project page
        router.push(`/projects/${data.project.id}`);
      } else {
        alert('Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const TEAM_SIZES = [
    { value: 'SOLO', label: 'Solo', icon: '👤', desc: 'Work independently' },
    { value: 'DUO', label: 'Duo', icon: '👥', desc: '2 people' },
    { value: 'SMALL_TEAM', label: 'Small Team', icon: '👨‍👩‍👦', desc: '3-4 people' },
    { value: 'LARGE_TEAM', label: 'Large Team', icon: '👨‍👩‍👦‍👦', desc: '5+ people' },
  ];

  const COMMON_SKILLS = [
    'Coding',
    'Design',
    'Writing',
    'Research',
    'Marketing',
    'Video Editing',
    'Photography',
    'Public Speaking',
    'Leadership',
    'Organization',
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
          <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2">
          <Rocket className="mr-2 h-4 w-4 text-primary-600" />
          <span className="text-sm font-semibold text-primary-700">
            Step {step} of {totalSteps}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">
          Create Your Project
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Let's bring your idea to life
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
                <CardTitle className="mb-6">Project Basics</CardTitle>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">
                    Project Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData({ title: e.target.value })}
                    placeholder="e.g., Community Garden Initiative"
                    className="mt-2"
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData({ description: e.target.value })
                    }
                    placeholder="Describe your project and its impact..."
                    rows={6}
                    maxLength={1000}
                    className="mt-2 w-full rounded-xl border-2 border-gray-300 bg-white p-4 font-medium transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                <div>
                  <Label htmlFor="category">
                    Project Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      updateFormData({ category: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center">
                            <span className="mr-2">{cat.icon}</span>
                            {cat.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-6">Team Configuration</CardTitle>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>
                    Ideal Team Size <span className="text-red-500">*</span>
                  </Label>
                  <p className="mb-3 text-sm text-muted-foreground">
                    How many people do you envision working on this?
                  </p>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    {TEAM_SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => {
                          updateFormData({
                            idealTeamSize: size.value as any,
                            maxTeamSize: size.value === 'SOLO' ? 1 :
                                        size.value === 'DUO' ? 2 :
                                        size.value === 'SMALL_TEAM' ? 4 : 8,
                          });
                        }}
                        className={`rounded-xl border-2 p-4 text-center transition-all ${
                          formData.idealTeamSize === size.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-300 hover:border-primary-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{size.icon}</div>
                        <div className="font-semibold">{size.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {size.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {formData.idealTeamSize !== 'SOLO' && (
                  <>
                    <div className="rounded-lg border-2 border-primary-200 bg-primary-50/30 p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="openForCollaboration"
                          checked={formData.openForCollaboration}
                          onChange={(e) =>
                            updateFormData({
                              openForCollaboration: e.target.checked,
                            })
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor="openForCollaboration"
                            className="font-semibold cursor-pointer"
                          >
                            Open for Collaboration
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Allow other students to discover and request to join
                            your project
                          </p>
                        </div>
                      </div>
                    </div>

                    {formData.openForCollaboration && (
                      <>
                        <div>
                          <Label htmlFor="collaborationDesc">
                            Collaboration Description
                          </Label>
                          <p className="mb-2 text-sm text-muted-foreground">
                            Tell potential collaborators what you're looking for
                          </p>
                          <textarea
                            id="collaborationDesc"
                            value={formData.collaborationDesc}
                            onChange={(e) =>
                              updateFormData({
                                collaborationDesc: e.target.value,
                              })
                            }
                            placeholder="We're looking for team members who are passionate about..."
                            rows={3}
                            maxLength={1000}
                            className="w-full rounded-xl border-2 border-gray-300 bg-white p-4 font-medium transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                          />
                        </div>

                        <div>
                          <Label>Skills Needed</Label>
                          <p className="mb-2 text-sm text-muted-foreground">
                            What skills are you looking for in collaborators?
                          </p>
                          <div className="mb-3 flex flex-wrap gap-2">
                            {COMMON_SKILLS.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                onClick={() => {
                                  if (formData.skillsNeeded.includes(skill)) {
                                    removeSkill(skill);
                                  } else {
                                    addSkill(skill);
                                  }
                                }}
                                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                                  formData.skillsNeeded.includes(skill)
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <CardTitle className="mb-2">Review & Create</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review your project details before creating
                </p>
              </div>

              <div className="space-y-4 rounded-xl border-2 border-primary-200 bg-primary-50/30 p-6">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Project Title
                  </Label>
                  <p className="mt-1 text-lg font-bold text-gray-900">
                    {formData.title}
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Category
                  </Label>
                  <p className="mt-1 font-semibold text-gray-900">
                    {
                      CATEGORIES.find((c) => c.value === formData.category)
                        ?.icon
                    }{' '}
                    {
                      CATEGORIES.find((c) => c.value === formData.category)
                        ?.label
                    }
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Description
                  </Label>
                  <p className="mt-1 text-gray-900">{formData.description}</p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Team Configuration
                  </Label>
                  <p className="mt-1 font-semibold text-gray-900">
                    {TEAM_SIZES.find((t) => t.value === formData.idealTeamSize)
                      ?.icon}{' '}
                    {TEAM_SIZES.find((t) => t.value === formData.idealTeamSize)
                      ?.label}
                    {formData.openForCollaboration && (
                      <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        Open for Collaboration
                      </span>
                    )}
                  </p>
                  {formData.openForCollaboration && formData.skillsNeeded.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {formData.skillsNeeded.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <Card className="border-2 border-accent-200 bg-gradient-to-br from-accent-50 to-white">
                <CardContent className="py-6">
                  <div className="text-center">
                    <div className="mb-3 text-5xl">🎉</div>
                    <h3 className="text-xl font-bold text-gray-900">
                      You're Ready to Start!
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      After creating your project, you'll be able to:
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-700">
                      <li>✓ Set milestones and track progress</li>
                      <li>✓ Log your work and earn XP</li>
                      <li>✓ Get AI mentor guidance</li>
                      <li>✓ Build your portfolio</li>
                      {formData.openForCollaboration && (
                        <li>✓ Collaborate with other students</li>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={step === 1 ? () => router.back() : handleBack}
          className="w-32"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {step < totalSteps ? (
          <Button
            onClick={handleNext}
            disabled={
              (step === 1 && (!formData.title || !formData.description || !formData.category)) ||
              (step === 2 && !formData.idealTeamSize)
            }
            className="w-32"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            size="lg"
            className="bg-gradient-to-r from-primary-500 to-secondary-500 px-8 text-lg shadow-xl hover:from-primary-600 hover:to-secondary-600"
          >
            {isSubmitting ? 'Creating...' : 'Create Project'}
            <Rocket className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Sparkles className="mx-auto h-12 w-12 animate-pulse text-primary-500" />
            <p className="mt-4 text-lg text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <NewProjectForm />
    </Suspense>
  );
}
