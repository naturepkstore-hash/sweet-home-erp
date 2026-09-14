import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.CLERK
    ) {
      return NextResponse.json({ error: 'Unauthorized to transfer hostel beds' }, { status: 403 });
    }

    const { childId, newBedId } = await request.json();

    if (!childId || !newBedId) {
      return NextResponse.json({ error: 'Child and target bed are required' }, { status: 400 });
    }

    const targetBed = await prisma.bed.findUnique({
      where: { id: newBedId },
      include: { room: true },
    });

    if (!targetBed || targetBed.status !== 'AVAILABLE') {
      return NextResponse.json({ error: 'Selected bed is not available' }, { status: 400 });
    }

    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: { bed: true },
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Free old bed
    if (child.bedId) {
      await prisma.bed.update({
        where: { id: child.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    // Unlink any existing inactive child holding target bed
    const existingOccupant = await prisma.child.findFirst({
      where: { bedId: newBedId },
    });
    if (existingOccupant && existingOccupant.id !== childId) {
      if (existingOccupant.status === 'ACTIVE') {
        return NextResponse.json({ error: `Selected bed is already assigned to active resident ${existingOccupant.fullName}` }, { status: 400 });
      }
      await prisma.child.update({
        where: { id: existingOccupant.id },
        data: { bedId: null, roomId: null },
      });
    }

    // Occupy new bed
    await prisma.bed.update({
      where: { id: newBedId },
      data: { status: 'OCCUPIED' },
    });

    // Update child record
    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: {
        roomId: targetBed.roomId,
        bedId: newBedId,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'HOSTEL_TRANSFER',
      module: 'HOSTEL',
      recordId: childId,
      details: `Transferred child ${child.fullName} to Room ${targetBed.room.roomNumber}, Bed ${targetBed.bedNumber}`,
    });

    return NextResponse.json({ success: true, child: updatedChild });
  } catch (error) {
    console.error('Bed transfer error:', error);
    return NextResponse.json({ error: 'Failed to transfer bed' }, { status: 500 });
  }
}
