import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const classes = await prisma.class.findMany({
      include: {
        children: {
          select: {
            id: true,
            childId: true,
            fullName: true,
            status: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, classes });
  } catch (error) {
    console.error('Fetch classes error:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
