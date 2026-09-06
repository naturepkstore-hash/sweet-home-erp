import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const where: Record<string, unknown> = {};
    if (itemId) where.itemId = itemId;

    const transactions = await prisma.stockTransaction.findMany({
      where,
      include: {
        item: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('Fetch stock transactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch stock transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    const body = await request.json();
    const { itemId, transactionType, quantity, responsiblePerson, reason, notes } = body;

    if (!itemId || !transactionType || !quantity) {
      return NextResponse.json(
        { error: 'Item ID, Transaction Type, and Quantity are mandatory' },
        { status: 400 }
      );
    }

    const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const qty = parseFloat(quantity);
    let newStock = item.currentStock;

    if (transactionType === 'STOCK_IN' || transactionType === 'PURCHASE') {
      newStock += qty;
    } else if (
      transactionType === 'STOCK_OUT' ||
      transactionType === 'ISSUE' ||
      transactionType === 'CONSUMPTION'
    ) {
      if (item.currentStock < qty) {
        return NextResponse.json(
          { error: `Insufficient stock! Current available stock is ${item.currentStock} ${item.unit}` },
          { status: 400 }
        );
      }
      newStock -= qty;
    } else if (transactionType === 'ADJUSTMENT') {
      newStock = qty; // Direct adjustment
    }

    const newStatus =
      newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK';

    // Execute transaction atomically
    const [txn, updatedItem] = await prisma.$transaction([
      prisma.stockTransaction.create({
        data: {
          itemId,
          transactionType,
          quantity: qty,
          unit: item.unit,
          responsiblePerson: responsiblePerson || currentUser.fullName,
          reason: reason || null,
          notes: notes || null,
        },
      }),
      prisma.inventoryItem.update({
        where: { id: itemId },
        data: {
          currentStock: newStock,
          status: newStatus,
        },
      }),
    ]);

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'STOCK_TRANSACTION',
      module: 'INVENTORY',
      recordId: itemId,
      details: `${transactionType} of ${qty} ${item.unit} for ${item.name}. New Stock: ${newStock} ${item.unit}`,
    });

    return NextResponse.json({ success: true, transaction: txn, item: updatedItem }, { status: 201 });
  } catch (error) {
    console.error('Create stock transaction error:', error);
    return NextResponse.json({ error: 'Failed to record stock transaction' }, { status: 500 });
  }
}
