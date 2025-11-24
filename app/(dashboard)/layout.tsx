'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { SidebarProvider, useSidebar } from '@/components/layout/sidebar-provider';
import { cn } from '@/lib/utils';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          // No margin on mobile (bottom nav pill), margin on desktop based on sidebar state
          'md:ml-20 lg:ml-64',
          isCollapsed && 'md:ml-20'
        )}
      >
        <Header />
        <main
          className={cn(
            'mx-auto transition-all duration-300',
            // Mobile: full width with bottom padding for nav pill
            'p-4 pb-24 md:pb-8',
            // Desktop: centered when collapsed, full width when expanded
            'md:p-8',
            isCollapsed ? 'md:max-w-6xl' : 'md:max-w-none'
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
