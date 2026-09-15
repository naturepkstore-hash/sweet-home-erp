import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const authorizedRoles = [
  Role.INCHARGE,
  Role.ACCOUNT_ASSISTANT,
  Role.HR_REPRESENTATIVE,
  Role.CLERK,
];

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        status: 'ACTIVE',
        role: { in: authorizedRoles },
        employee: { isNot: null },
      },
      select: {
        email: true,
        role: true,
        employee: { select: { fullName: true } },
      },
      orderBy: { role: 'asc' },
    });

    return NextResponse.json({
      profiles: users.map((user) => ({
        name: user.employee?.fullName || user.email,
        email: user.email,
        role: user.role,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Unable to load active login profiles.' }, { status: 503 });
  }
}