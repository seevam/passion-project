import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function calculateXPForLevel(level: number): number {
  return level * 1000; // 1000 XP per level
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function getXPProgress(xp: number): {
  currentLevel: number;
  nextLevel: number;
  currentXP: number;
  xpForNextLevel: number;
  progress: number;
} {
  const currentLevel = getLevelFromXP(xp);
  const xpInCurrentLevel = xp % 1000;
  const xpForNextLevel = 1000;
  const progress = (xpInCurrentLevel / xpForNextLevel) * 100;

  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    currentXP: xpInCurrentLevel,
    xpForNextLevel,
    progress,
  };
}
