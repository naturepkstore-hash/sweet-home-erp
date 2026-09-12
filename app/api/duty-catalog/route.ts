import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';

export async function GET() {
  try {
    await requireAuth();
    const duties = await prisma.duty.findMany({
      where: { isActive: true },
      orderBy: { nameEnglish: 'asc' },
    });

    return NextResponse.json({ success: true, duties });
  } catch (error) {
    console.error('Fetch duty catalog error:', error);
    return NextResponse.json({ error: 'Failed to fetch duty catalog' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || !hasPermission(currentUser.role, 'duties.assign', currentUser.permissions)) {
      return NextResponse.json({ error: 'You are not authorized to manage the duty catalog' }, { status: 403 });
    }

    const body = await request.json();
    const nameEnglish = String(body.nameEnglish || '').trim();
    const nameUrdu = String(body.nameUrdu || '').trim();
    const description = body.description ? String(body.description).trim() : null;

    if (!nameEnglish || !nameUrdu) {
      return NextResponse.json({ error: 'English and Urdu duty names are required' }, { status: 400 });
    }

    const duty = await prisma.duty.create({
      data: { nameEnglish, nameUrdu, description },
    });

    return NextResponse.json({ success: true, duty }, { status: 201 });
  } catch (error) {
    console.error('Create duty catalog entry error:', error);
    return NextResponse.json({ error: 'Failed to create duty catalog entry' }, { status: 500 });
  }
}
