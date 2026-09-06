import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await requireAuth();

    const requests = await prisma.kitchenRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch kitchen requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch kitchen requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { items, notes } = await request.json();

    if (!items) {
      return NextResponse.json({ error: 'Items description is required' }, { status: 400 });
    }

    const newReq = await prisma.kitchenRequest.create({
      data: {
        requestedBy: currentUser.fullName,
        items,
        notes: notes || null,
        status: 'PENDING',
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'KITCHEN_STOCK_REQUEST',
      module: 'MESS',
      recordId: newReq.id,
      details: `Kitchen staff submitted requisition: ${items}`,
    });

    return NextResponse.json({ success: true, request: newReq }, { status: 201 });
  } catch (error) {
    console.error('Create kitchen request error:', error);
    return NextResponse.json({ error: 'Failed to submit kitchen request' }, { status: 500 });
  }
}
