import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <header className="border-b-2 border-gray-200 bg-white/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-duo">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold">ProjectLaunch</span>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="default">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center">
          <div className="mb-6 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Project Discovery
          </div>

          <h1 className="mb-6 text-6xl font-bold leading-tight text-gray-900">
            Discover Your
            <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Passion Project
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            An AI-powered platform helping high school students discover, plan,
            and showcase meaningful passion projects that stand out in college
            applications.
          </p>

          <div className="flex justify-center space-x-4">
            <Link href="/sign-up">
              <Button size="lg" variant="default" className="text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="text-lg">
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            Why ProjectLaunch?
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to create impactful passion projects
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200">
              <Sparkles className="h-7 w-7 text-primary-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              AI-Powered Ideas
            </h3>
            <p className="text-gray-600">
              Get personalized project ideas based on your interests, skills, and
              goals using advanced AI.
            </p>
          </Card>

          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200">
              <Target className="h-7 w-7 text-accent-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              Structured Planning
            </h3>
            <p className="text-gray-600">
              Break down big ideas into manageable milestones with our project
              planning tools.
            </p>
          </Card>

          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200">
              <TrendingUp className="h-7 w-7 text-secondary-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              Track Progress
            </h3>
            <p className="text-gray-600">
              Stay motivated with gamified progress tracking, streaks, and XP
              rewards.
            </p>
          </Card>

          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200">
              <Zap className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              AI Mentor Support
            </h3>
            <p className="text-gray-600">
              Get 24/7 guidance from your personal AI mentor to overcome
              challenges.
            </p>
          </Card>

          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200">
              <Users className="h-7 w-7 text-pink-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              Showcase Portfolio
            </h3>
            <p className="text-gray-600">
              Build a beautiful portfolio to showcase your projects in college
              applications.
            </p>
          </Card>

          <Card className="p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200">
              <TrendingUp className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-gray-900">
              Community & Inspiration
            </h3>
            <p className="text-gray-600">
              Get inspired by other students' projects in our public gallery.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <Card className="overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 p-12 text-white shadow-2xl">
          <div className="text-center">
            <h2 className="mb-4 text-4xl font-bold">
              Ready to Start Your Passion Project?
            </h2>
            <p className="mb-8 text-xl opacity-90">
              Join hundreds of students creating impactful projects
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-gray-200 bg-white py-8">
        <div className="container mx-auto px-6 text-center text-gray-600">
          <p>&copy; 2024 ProjectLaunch. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
