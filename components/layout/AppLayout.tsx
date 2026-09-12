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

  // Fetch recent notifications safely
  let notifications: any[] = [
    { id: 'notif-1', title: 'ERP Active', message: 'Sweet Home Multan system operational.', type: 'SUCCESS', createdAt: new Date() },
    { id: 'notif-2', title: 'Daily Duty Roster', message: 'Staff duty shifts scheduled and active.', type: 'INFO', createdAt: new Date() },
  ];

  try {
    const dbNotifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId: user.id }, { userId: null }],
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    if (dbNotifications && dbNotifications.length > 0) {
      notifications = dbNotifications;
    }
  } catch (err) {
    console.warn('Could not load notifications from database:', err);
  }

  return (
    <DashboardShell user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}

