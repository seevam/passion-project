'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  User,
  Lightbulb,
  FolderKanban,
  Trophy,
  Users,
  Settings,
  Sparkles,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    name: 'Discover Ideas',
    href: '/ideas',
    icon: Lightbulb,
  },
  {
    name: 'My Projects',
    href: '/projects',
    icon: FolderKanban,
  },
  {
    name: 'AI Mentor',
    href: '/mentor',
    icon: Sparkles,
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
  },
  {
    name: 'Gallery',
    href: '/gallery',
    icon: Users,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r-2 border-gray-200 bg-white">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b-2 border-gray-200 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-duo">
              <Sparkles className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              ProjectLaunch
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-primary-100 text-primary-700 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 p-4">
          <div className="rounded-xl bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
            <p className="text-sm font-semibold text-gray-700">
              Need help getting started?
            </p>
            <Link
              href="/mentor"
              className="mt-2 inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Talk to AI Mentor →
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
