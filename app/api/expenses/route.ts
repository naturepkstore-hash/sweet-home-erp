import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const [categories, expenses] = await Promise.all([
      prisma.expenseCategory.findMany({
        include: {
          _count: { select: { transactions: true } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.financeTransaction.findMany({
        where: { type: 'EXPENSE' },
        include: {
          category: true,
          responsiblePerson: { select: { fullName: true } },
        },
        orderBy: { date: 'desc' },
      }),
    ]);

    return NextResponse.json({ success: true, categories, expenses });
  } catch (error) {
    console.error('Fetch expenses error:', error);
    return NextResponse.json({ error: 'Failed to fetch expense records' }, { status: 500 });
  }
}
