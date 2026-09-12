import React from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DashboardShell } from './DashboardShell';

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
    <DashboardShell user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}
