import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    await requireAuth();

    const suppliers = await prisma.supplier.findMany({
      include: {
        _count: { select: { purchases: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ success: true, suppliers });
  } catch (error) {
    console.error('Fetch suppliers error:', error);
    return NextResponse.json({ error: 'Failed to fetch suppliers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.ACCOUNT_ASSISTANT) {
      return NextResponse.json({ error: 'Unauthorized to add suppliers' }, { status: 403 });
    }

    const { name, contactPerson, phone, email, address, ntn } = await request.json();

    if (!name || !phone || !address) {
      return NextResponse.json({ error: 'Supplier Name, Phone, and Address are required' }, { status: 400 });
    }

    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactPerson: contactPerson || null,
        phone,
        email: email || null,
        address,
        ntn: ntn || null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ADD_SUPPLIER',
      module: 'PURCHASES',
      recordId: supplier.id,
      details: `Added new approved supplier ${name} (Phone: ${phone})`,
    });

    return NextResponse.json({ success: true, supplier }, { status: 201 });
  } catch (error) {
    console.error('Create supplier error:', error);
    return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 });
  }
}
