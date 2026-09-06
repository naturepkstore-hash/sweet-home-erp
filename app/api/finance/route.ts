import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || '';
    const categoryId = searchParams.get('categoryId') || '';

    const where: Record<string, unknown> = {};
    if (type && type !== 'ALL') where.type = type;
    if (categoryId && categoryId !== 'ALL') where.categoryId = categoryId;

    const [transactions, categories, expenseSum, incomeSum] = await Promise.all([
      prisma.financeTransaction.findMany({
        where,
        include: {
          category: true,
          responsiblePerson: { select: { fullName: true } },
          purchase: { select: { purchaseNumber: true, supplier: { select: { name: true } } } },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.expenseCategory.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.financeTransaction.aggregate({
        where: { type: 'EXPENSE' },
        _sum: { amount: true },
      }),
      prisma.financeTransaction.aggregate({
        where: {
          OR: [{ type: 'INCOME' }, { type: 'GRANT' }, { type: 'DONATION' }],
        },
        _sum: { amount: true },
      }),
    ]);

    const totalExpense = expenseSum._sum.amount || 0;
    const totalIncome = incomeSum._sum.amount || 0;
    const netBalance = totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      transactions,
      categories,
      summary: {
        totalIncome,
        totalExpense,
        netBalance,
      },
    });
  } catch (error) {
    console.error('Fetch finance error:', error);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.ACCOUNT_ASSISTANT) {
      return NextResponse.json({ error: 'Unauthorized to log financial transactions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      type = 'EXPENSE',
      date,
      amount,
      categoryId,
      description,
      referenceNumber,
      paymentMethod = 'CHEQUE',
      notes,
    } = body;

    if (!amount || !description) {
      return NextResponse.json({ error: 'Amount and Description are required' }, { status: 400 });
    }

    const transaction = await prisma.financeTransaction.create({
      data: {
        type,
        date: date ? new Date(date) : new Date(),
        amount: parseFloat(amount),
        categoryId: categoryId || undefined,
        description,
        responsiblePersonId: currentUser.employeeId || undefined,
        referenceNumber: referenceNumber || null,
        paymentMethod,
        notes: notes || null,
      },
      include: { category: true },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'RECORD_FINANCE_TXN',
      module: 'FINANCE',
      recordId: transaction.id,
      details: `Recorded ${type} transaction of ${amount} PKR: ${description}`,
    });

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (error) {
    console.error('Create finance transaction error:', error);
    return NextResponse.json({ error: 'Failed to save financial transaction' }, { status: 500 });
  }
}
