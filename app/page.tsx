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
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-duo sm:h-10 sm:w-10">
              <Sparkles className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <span className="text-lg font-bold sm:text-xl">ProjectLaunch</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="min-h-[44px]">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="default" className="min-h-[44px]">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center rounded-full bg-primary-100 px-4 py-2 text-sm font-semibold text-primary-700 sm:mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            AI-Powered Project Discovery
          </div>

          <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl">
            Discover Your
            <span className="block bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              Passion Project
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:mb-10 sm:text-lg lg:text-xl">
            An AI-powered platform helping high school students discover, plan,
            and showcase meaningful passion projects that stand out in college
            applications.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/sign-up">
              <Button size="lg" variant="default" className="min-h-[44px] w-full text-base sm:w-auto sm:text-lg">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button size="lg" variant="outline" className="min-h-[44px] w-full text-base sm:w-auto sm:text-lg">
                View Gallery
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-8 text-center sm:mb-12">
          <h2 className="mb-4 text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
            Why ProjectLaunch?
          </h2>
          <p className="text-base text-gray-600 sm:text-lg">
            Everything you need to create impactful passion projects
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 sm:h-14 sm:w-14">
              <Sparkles className="h-6 w-6 text-primary-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              AI-Powered Ideas
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Get personalized project ideas based on your interests, skills, and
              goals using advanced AI.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-100 to-accent-200 sm:h-14 sm:w-14">
              <Target className="h-6 w-6 text-accent-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Structured Planning
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Break down big ideas into manageable milestones with our project
              planning tools.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary-100 to-secondary-200 sm:h-14 sm:w-14">
              <TrendingUp className="h-6 w-6 text-secondary-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Track Progress
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Stay motivated with gamified progress tracking, streaks, and XP
              rewards.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 sm:h-14 sm:w-14">
              <Zap className="h-6 w-6 text-purple-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              AI Mentor Support
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Get 24/7 guidance from your personal AI mentor to overcome
              challenges.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-pink-200 sm:h-14 sm:w-14">
              <Users className="h-6 w-6 text-pink-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Showcase Portfolio
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Build a beautiful portfolio to showcase your projects in college
              applications.
            </p>
          </Card>

          <Card className="p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-100 to-green-200 sm:h-14 sm:w-14">
              <TrendingUp className="h-6 w-6 text-green-600 sm:h-7 sm:w-7" />
            </div>
            <h3 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Community & Inspiration
            </h3>
            <p className="text-sm text-gray-600 sm:text-base">
              Get inspired by other students' projects in our public gallery.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <Card className="overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500 p-8 text-white shadow-2xl sm:p-12">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Ready to Start Your Passion Project?
            </h2>
            <p className="mb-6 text-base opacity-90 sm:mb-8 sm:text-lg lg:text-xl">
              Join hundreds of students creating impactful projects
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="min-h-[44px] w-full bg-white text-primary-600 hover:bg-gray-100 sm:w-auto"
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
        <div className="container mx-auto px-4 text-center text-sm text-gray-600 sm:px-6 sm:text-base">
          <p>&copy; 2024 ProjectLaunch. Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
