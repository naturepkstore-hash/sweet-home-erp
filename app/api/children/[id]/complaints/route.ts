import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const allowedRoles: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK, Role.MOTHER_MAID];

async function getAuthorizedChild(id: string) {
  const currentUser = await requireAuth();
  if (!allowedRoles.includes(currentUser.role)) {
    throw new Error('UNAUTHORIZED');
  }

  const child = await prisma.child.findUnique({
    where: { id },
    select: { id: true, fullName: true, childId: true, motherMaidId: true },
  });

  if (!child) throw new Error('NOT_FOUND');
  if (currentUser.role === Role.MOTHER_MAID && child.motherMaidId !== currentUser.employeeId) {
    throw new Error('UNAUTHORIZED');
  }

  return { currentUser, child };
}

function errorResponse(error: unknown) {
  if (error instanceof Error && error.message === 'NOT_FOUND') {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 });
  }
  if (error instanceof Error && error.message === 'UNAUTHORIZED') {
    return NextResponse.json({ error: 'Unauthorized to access child complaints' }, { status: 403 });
  }
  console.error('Child complaints error:', error);
  return NextResponse.json({ error: 'Failed to process child complaint' }, { status: 500 });
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await getAuthorizedChild(id);
    const complaints = await prisma.childComplaint.findMany({
      where: { childId: id },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, complaints });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { currentUser, child } = await getAuthorizedChild(id);
    const body = await request.json();
    const category = String(body.category || '').trim();
    const description = String(body.description || '').trim();

    if (!category || !description) {
      return NextResponse.json({ error: 'Category and complaint description are required' }, { status: 400 });
    }

    const complaint = await prisma.childComplaint.create({
      data: {
        childId: id,
        category,
        description,
        reportedBy: currentUser.email,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'CREATE_CHILD_COMPLAINT',
      module: 'CHILDREN',
      recordId: complaint.id,
      details: `Recorded a ${category} complaint for ${child.fullName} (${child.childId})`,
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { currentUser } = await getAuthorizedChild(id);
    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.ACCOUNT_ASSISTANT) {
      return NextResponse.json({ error: 'Only Incharge and Account Assistant can review complaints' }, { status: 403 });
    }
    const body = await request.json();
    const complaintId = String(body.complaintId || '').trim();
    const status = String(body.status || '').trim();

    if (!complaintId || !['OPEN', 'IN_REVIEW', 'RESOLVED'].includes(status)) {
      return NextResponse.json({ error: 'A valid complaint and status are required' }, { status: 400 });
    }

    const complaint = await prisma.childComplaint.updateMany({
      where: { id: complaintId, childId: id },
      data: { status, resolvedAt: status === 'RESOLVED' ? new Date() : null },
    });

    if (!complaint.count) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_CHILD_COMPLAINT',
      module: 'CHILDREN',
      recordId: complaintId,
      details: `Changed child complaint status to ${status}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return errorResponse(error);
  }
}
