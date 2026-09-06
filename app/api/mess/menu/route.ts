import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await requireAuth();

    const daysOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const menus = await prisma.dailyMenu.findMany();

    // Sort by standard week order
    menus.sort((a, b) => daysOrder.indexOf(a.dayOfWeek) - daysOrder.indexOf(b.dayOfWeek));

    return NextResponse.json({ success: true, menus });
  } catch (error) {
    console.error('Fetch menu error:', error);
    return NextResponse.json({ error: 'Failed to fetch menus' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.COOK
    ) {
      return NextResponse.json({ error: 'Unauthorized to modify institutional menu' }, { status: 403 });
    }

    const { dayOfWeek, breakfastMenu, lunchMenu, dinnerMenu, notes } = await request.json();

    if (!dayOfWeek || !breakfastMenu || !lunchMenu || !dinnerMenu) {
      return NextResponse.json({ error: 'All 3 meals (Breakfast, Lunch, Dinner) are required' }, { status: 400 });
    }

    const updatedMenu = await prisma.dailyMenu.upsert({
      where: { dayOfWeek },
      update: {
        breakfastMenu,
        lunchMenu,
        dinnerMenu,
        notes: notes || null,
      },
      create: {
        dayOfWeek,
        breakfastMenu,
        lunchMenu,
        dinnerMenu,
        notes: notes || null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_MENU',
      module: 'MESS',
      recordId: dayOfWeek,
      details: `Updated institutional meal menu for ${dayOfWeek}`,
    });

    return NextResponse.json({ success: true, menu: updatedMenu });
  } catch (error) {
    console.error('Update menu error:', error);
    return NextResponse.json({ error: 'Failed to update menu' }, { status: 500 });
  }
}
