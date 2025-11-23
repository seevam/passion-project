'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Flame, Zap } from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { user } = useUser();

  // Mock data - will be replaced with real data from database
  const userStats = {
    xp: 2500,
    level: 3,
    currentStreak: 7,
    xpProgress: 50, // percentage
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 will-change-auto">
      <div className="flex h-16 items-center justify-between px-8">
        {/* Page Title */}
        <div className="min-w-0">
          {title && (
            <h1 className="text-2xl font-bold text-gray-900 leading-tight truncate">{title}</h1>
          )}
          {description && (
            <p className="text-sm text-muted-foreground leading-snug truncate">{description}</p>
          )}
        </div>

        {/* User Stats & Profile */}
        <div className="flex items-center space-x-6 flex-shrink-0">
          {/* Streak */}
          <Badge variant="streak" className="px-3 py-2">
            <Flame className="h-4 w-4 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
            <span className="ml-1 leading-none">{userStats.currentStreak} day streak</span>
          </Badge>

          {/* XP & Level */}
          <div className="flex items-center space-x-3">
            <Badge variant="xp" className="px-3 py-2">
              <Zap className="h-4 w-4 flex-shrink-0" strokeWidth={2} aria-hidden="true" />
              <span className="ml-1 leading-none">
                Level {userStats.level} · {userStats.xp} XP
              </span>
            </Badge>

            {/* XP Progress */}
            <div className="hidden w-32 flex-col lg:flex">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 leading-none">
                  To Level {userStats.level + 1}
                </span>
              </div>
              <Progress value={userStats.xpProgress} className="h-2" />
            </div>
          </div>

          {/* User Profile */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-10 w-10 border-2 border-primary-200',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
