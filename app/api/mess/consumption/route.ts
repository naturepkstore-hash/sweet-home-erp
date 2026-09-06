import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await requireAuth();

    const mealRecords = await prisma.mealRecord.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ success: true, mealRecords });
  } catch (error) {
    console.error('Fetch meal records error:', error);
    return NextResponse.json({ error: 'Failed to fetch meal records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    const body = await request.json();
    const { itemId, quantity, mealType = 'LUNCH', headCount = 95, notes, menuItem } = body;

    if (!mealType) {
      return NextResponse.json({ error: 'Meal Type is required' }, { status: 400 });
    }

    const heads = parseInt(headCount) || 95;

    // Create meal record
    const mealRecord = await prisma.mealRecord.create({
      data: {
        mealType,
        menuItem: menuItem || `Prepared ${mealType.toLowerCase()} for Sweet Home residents`,
        childCount: Math.max(0, heads - 15),
        staffCount: 15,
        totalHeads: heads,
        preparedBy: currentUser.fullName,
        notes: notes || null,
      },
    });

    // If an inventory item was specified, deduct from inventory and create stock transaction
    if (itemId && quantity) {
      const qty = parseFloat(quantity);
      const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });

      if (item && item.currentStock >= qty) {
        const newStock = item.currentStock - qty;
        const newStatus =
          newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= item.minStock ? 'LOW_STOCK' : 'IN_STOCK';

        await prisma.$transaction([
          prisma.inventoryItem.update({
            where: { id: itemId },
            data: { currentStock: newStock, status: newStatus },
          }),
          prisma.stockTransaction.create({
            data: {
              itemId,
              transactionType: 'CONSUMPTION',
              quantity: qty,
              unit: item.unit,
              responsiblePerson: currentUser.fullName,
              reason: `Kitchen Mess Consumption for ${mealType} (${heads} heads)`,
              notes: notes || null,
            },
          }),
        ]);
      }
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'RECORD_MEAL_CONSUMPTION',
      module: 'MESS',
      recordId: mealRecord.id,
      details: `Logged ${mealType} meal preparation for ${heads} heads`,
    });

    return NextResponse.json({ success: true, mealRecord }, { status: 201 });
  } catch (error) {
    console.error('Record meal error:', error);
    return NextResponse.json({ error: 'Failed to record meal consumption' }, { status: 500 });
  }
}
