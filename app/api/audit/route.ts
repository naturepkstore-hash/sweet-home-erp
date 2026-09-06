import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.ACCOUNT_ASSISTANT) {
      return NextResponse.json({ error: 'Unauthorized to access audit logs' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const moduleName = searchParams.get('module') || '';
    const action = searchParams.get('action') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { userEmail: { contains: search } },
        { details: { contains: search } },
        { action: { contains: search } },
      ];
    }

    if (moduleName && moduleName !== 'ALL') {
      where.module = moduleName;
    }

    if (action && action !== 'ALL') {
      where.action = action;
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ success: true, logs });
  } catch (error) {
    console.error('Fetch audit error:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
