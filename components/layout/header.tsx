'use client';

import { UserButton, useUser } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Flame, Zap, Menu } from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
  onMobileMenuToggle?: () => void;
}

export function Header({ title, description, onMobileMenuToggle }: HeaderProps) {
  const { user } = useUser();

  // Mock data - will be replaced with real data from database
  const userStats = {
    xp: 2500,
    level: 3,
    currentStreak: 7,
    xpProgress: 50, // percentage
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left side: Hamburger + Title */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu - Only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden min-h-[44px] min-w-[44px]"
            onClick={onMobileMenuToggle}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Page Title - Hidden on mobile if not set */}
          {title && (
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {title}
              </h1>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          )}
        </div>

        {/* User Stats & Profile */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          {/* Streak - Hidden on mobile */}
          <Badge variant="streak" className="hidden px-3 py-2 sm:flex">
            <Flame className="h-4 w-4" />
            <span className="ml-1">{userStats.currentStreak} day streak</span>
          </Badge>

          {/* XP & Level */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Badge variant="xp" className="px-2 py-2 sm:px-3">
              <Zap className="h-4 w-4" />
              <span className="ml-1 text-xs sm:text-sm">
                <span className="hidden sm:inline">Level {userStats.level} · </span>
                {userStats.xp} XP
              </span>
            </Badge>

            {/* XP Progress - Hidden on mobile and tablet */}
            <div className="hidden w-32 flex-col lg:flex">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600">
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
                avatarBox: 'h-9 w-9 border-2 border-primary-200 sm:h-10 sm:w-10',
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
