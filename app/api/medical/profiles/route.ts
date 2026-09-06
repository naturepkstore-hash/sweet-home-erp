import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const profiles = await prisma.medicalRecord.findMany({
      include: {
        child: {
          select: {
            id: true,
            childId: true,
            fullName: true,
            dateOfBirth: true,
            status: true,
            room: { select: { roomNumber: true } },
            bed: { select: { bedNumber: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ success: true, profiles });
  } catch (error) {
    console.error('Fetch medical profiles error:', error);
    return NextResponse.json({ error: 'Failed to fetch medical profiles' }, { status: 500 });
  }
}
