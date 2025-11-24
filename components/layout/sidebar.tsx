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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from './sidebar-provider';

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
  const { isCollapsed, setIsCollapsed } = useSidebar();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 hidden h-screen border-r-2 border-gray-200 bg-white transition-all duration-300 md:block',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b-2 border-gray-200 px-4">
            {isCollapsed ? (
              <Link
                href="/dashboard"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-duo"
              >
                <Sparkles className="h-6 w-6" />
              </Link>
            ) : (
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-duo">
                  <Sparkles className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ProjectLaunch
                </span>
              </Link>
            )}
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
                    'flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all',
                    isCollapsed ? 'justify-center' : 'space-x-3',
                    isActive
                      ? 'bg-primary-100 text-primary-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
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
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border-2 border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Pill */}
      <nav className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full border-2 border-gray-200 bg-white/95 px-2 py-2 shadow-duo backdrop-blur supports-[backdrop-filter]:bg-white/80 md:hidden">
        {navigation.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full transition-all',
                isActive
                  ? 'bg-primary-500 text-white shadow-duo'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              aria-label={item.name}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
