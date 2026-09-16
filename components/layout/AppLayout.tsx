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

    const lowStockItems = (await prisma.inventoryItem.findMany({
      select: { id: true, name: true, currentStock: true, minStock: true, unit: true },
    })).filter((item) => item.currentStock <= item.minStock).sort((a, b) => a.currentStock - b.currentStock).slice(0, 5);
    const activeChildren = await prisma.child.findMany({ where: { status: 'ACTIVE' }, select: { id: true, fullName: true, dateOfBirth: true } });
    const today = new Date();
    const birthdayAlerts = activeChildren.filter((child) => {
      const birthday = new Date(today.getFullYear(), child.dateOfBirth.getMonth(), child.dateOfBirth.getDate());
      if (birthday < new Date(today.getFullYear(), today.getMonth(), today.getDate())) birthday.setFullYear(today.getFullYear() + 1);
      return birthday.getTime() - today.getTime() <= 7 * 24 * 60 * 60 * 1000;
    }).slice(0, 3);
    notifications = [
      ...birthdayAlerts.map((child) => ({
        id: `birthday-${child.id}`,
        title: 'Upcoming Birthday',
        message: `${child.fullName}'s birthday is coming within the next 7 days.`,
        type: 'SUCCESS',
        createdAt: new Date(),
      })),
      ...lowStockItems.map((item) => ({
        id: `stock-${item.id}`,
        title: item.currentStock <= 0 ? 'Stock Empty' : 'Low Stock Alert',
        message: `${item.name} is ${item.currentStock <= 0 ? 'out of stock' : `down to ${item.currentStock} ${item.unit}; minimum is ${item.minStock} ${item.unit}`}.`,
        type: item.currentStock <= 0 ? 'ALERT' : 'WARNING',
        createdAt: new Date(),
      })),
      ...notifications,
    ].slice(0, 8);
  } catch (err) {
    console.warn('Could not load notifications from database:', err);
  }

  return (
    <DashboardShell user={user} notifications={notifications}>
      {children}
    </DashboardShell>
  );
}

