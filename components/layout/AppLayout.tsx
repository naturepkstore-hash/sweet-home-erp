import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { prisma } from '@/lib/prisma';

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch recent notifications
  const notifications = await prisma.notification.findMany({
    where: {
      OR: [{ userId: user.id }, { userId: null }],
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Fixed Sidebar */}
      <Sidebar user={user} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        <Header user={user} notifications={notifications} />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
