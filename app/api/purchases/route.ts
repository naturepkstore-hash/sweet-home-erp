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

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { purchaseNumber: { contains: search } },
        { billNumber: { contains: search } },
        { supplier: { name: { contains: search } } },
      ];
    }

    const purchases = await prisma.purchase.findMany({
      where,
      include: {
        supplier: true,
        items: { include: { inventoryItem: true } },
        responsiblePerson: { select: { fullName: true } },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return NextResponse.json({ success: true, purchases });
  } catch (error) {
    console.error('Fetch purchases error:', error);
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.ACCOUNT_ASSISTANT) {
      return NextResponse.json({ error: 'Unauthorized to create purchases' }, { status: 403 });
    }

    const body = await request.json();
    const {
      supplierId,
      purchaseDate,
      billNumber,
      paymentStatus = 'PAID',
      paymentMethod = 'CHEQUE',
      notes,
      items, // array of { itemName, quantity, unitPrice, unit, inventoryItemId }
    } = body;

    if (!supplierId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Supplier and at least one purchase item are required' }, { status: 400 });
    }

    // Calculate total
    let calculatedTotal = 0;
    items.forEach((item) => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      calculatedTotal += q * p;
    });

    const count = await prisma.purchase.count();
    const purchaseNumber = `PO-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    // Get ration expense category for automatic finance logging
    const expCat = await prisma.expenseCategory.findFirst({
      where: {
        OR: [
          { name: { contains: 'Food' } },
          { name: { contains: 'Ration' } },
        ],
      },
    });

    // Run atomic purchase creation, stock increment, and finance logging
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          purchaseNumber,
          supplierId,
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          totalAmount: calculatedTotal,
          billNumber: billNumber || null,
          paymentStatus,
          paymentMethod,
          responsiblePersonId: currentUser.employeeId || undefined,
          notes: notes || 'Procured for Sweet Home Multan facility',
          items: {
            create: items.map((i) => ({
              itemName: i.itemName,
              quantity: parseFloat(i.quantity),
              unitPrice: parseFloat(i.unitPrice),
              totalPrice: parseFloat(i.quantity) * parseFloat(i.unitPrice),
              unit: i.unit || 'kg',
              inventoryItemId: i.inventoryItemId || undefined,
            })),
          },
        },
        include: { supplier: true, items: true },
      });

      // 2. Increment Inventory stock for each linked inventory item
      for (const item of items) {
        if (item.inventoryItemId) {
          const inv = await tx.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
          if (inv) {
            const addedQty = parseFloat(item.quantity);
            const newStock = inv.currentStock + addedQty;
            const newStatus =
              newStock <= 0 ? 'OUT_OF_STOCK' : newStock <= inv.minStock ? 'LOW_STOCK' : 'IN_STOCK';

            await tx.inventoryItem.update({
              where: { id: item.inventoryItemId },
              data: { currentStock: newStock, status: newStatus },
            });

            await tx.stockTransaction.create({
              data: {
                itemId: item.inventoryItemId,
                transactionType: 'PURCHASE',
                quantity: addedQty,
                unit: item.unit || inv.unit,
                responsiblePerson: currentUser.fullName,
                reason: `Purchase Receipt ${purchaseNumber}`,
              },
            });
          }
        }
      }

      // 3. Automatically record Expense Transaction in Finance Ledger
      await tx.financeTransaction.create({
        data: {
          type: 'EXPENSE',
          date: purchaseDate ? new Date(purchaseDate) : new Date(),
          amount: calculatedTotal,
          categoryId: expCat?.id || undefined,
          description: `Procurement Invoice ${purchaseNumber} - ${purchase.supplier.name} (Bill: ${billNumber || 'N/A'})`,
          responsiblePersonId: currentUser.employeeId || undefined,
          referenceNumber: billNumber || purchaseNumber,
          paymentMethod,
          purchaseId: purchase.id,
          notes: `Auto-recorded from Procurement Purchase order ${purchaseNumber}`,
        },
      });

      return purchase;
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'RECORD_PURCHASE',
      module: 'PURCHASES',
      recordId: result.id,
      details: `Created Purchase ${result.purchaseNumber} for ${calculatedTotal} PKR with auto stock and finance ledger entry.`,
    });

    return NextResponse.json({ success: true, purchase: result }, { status: 201 });
  } catch (error) {
    console.error('Create purchase error:', error);
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
  }
}
