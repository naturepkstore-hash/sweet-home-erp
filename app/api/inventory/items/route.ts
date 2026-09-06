import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { supplier: { contains: search } },
      ];
    }

    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [items, categories] = await Promise.all([
      prisma.inventoryItem.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
      }),
      prisma.inventoryCategory.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ success: true, items, categories });
  } catch (error) {
    console.error('Fetch inventory error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.COOK
    ) {
      return NextResponse.json({ error: 'Unauthorized to add inventory items' }, { status: 403 });
    }

    const body = await request.json();
    const { name, categoryId, unit, currentStock = 0, minStock = 10, supplier, notes } = body;

    if (!name || !categoryId || !unit) {
      return NextResponse.json({ error: 'Item Name, Category, and Unit are mandatory' }, { status: 400 });
    }

    const stockVal = parseFloat(currentStock) || 0;
    const minStockVal = parseFloat(minStock) || 10;

    const newItem = await prisma.inventoryItem.create({
      data: {
        name,
        categoryId,
        unit,
        currentStock: stockVal,
        minStock: minStockVal,
        supplier: supplier || null,
        status: stockVal <= minStockVal ? 'LOW_STOCK' : 'IN_STOCK',
        notes: notes || null,
      },
      include: { category: true },
    });

    // Record initial stock transaction if stock > 0
    if (stockVal > 0) {
      await prisma.stockTransaction.create({
        data: {
          itemId: newItem.id,
          transactionType: 'STOCK_IN',
          quantity: stockVal,
          unit,
          responsiblePerson: currentUser.fullName,
          reason: 'Initial Item Creation',
        },
      });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'CREATE_INVENTORY_ITEM',
      module: 'INVENTORY',
      recordId: newItem.id,
      details: `Created new inventory item ${name} (${unit}, stock: ${stockVal})`,
    });

    return NextResponse.json({ success: true, item: newItem }, { status: 201 });
  } catch (error) {
    console.error('Create inventory item error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
