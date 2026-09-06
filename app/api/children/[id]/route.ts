import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const child = await prisma.child.findUnique({
      where: { id },
      include: {
        room: { include: { building: true } },
        bed: true,
        class: true,
        motherMaid: true,
        medicalRecord: true,
        medicalVisits: { orderBy: { visitDate: 'desc' } },
        educationRecords: { orderBy: { createdAt: 'desc' } },
        documents: true,
        attendances: { orderBy: { date: 'desc' }, take: 10 },
      },
    });

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, child });
  } catch (error) {
    console.error('Fetch child profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch child profile' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.CLERK
    ) {
      return NextResponse.json({ error: 'Unauthorized to update child profile' }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      fatherGuardianName,
      dateOfBirth,
      bFormNo,
      guardianName,
      guardianRelation,
      guardianContact,
      address,
      status,
      motherMaidId,
      roomId,
      bedId,
      classId,
      clothingIssued,
      dietaryNotes,
      notes,
      // Medical updates
      bloodGroup,
      allergies,
      chronicConditions,
      heightCm,
      weightKg,
    } = body;

    const existingChild = await prisma.child.findUnique({ where: { id } });
    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // If bed changed, free old bed and occupy new bed
    if (bedId && bedId !== existingChild.bedId) {
      if (existingChild.bedId) {
        await prisma.bed.update({
          where: { id: existingChild.bedId },
          data: { status: 'AVAILABLE' },
        });
      }
      await prisma.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      });
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        fullName: fullName ?? existingChild.fullName,
        fatherGuardianName: fatherGuardianName ?? existingChild.fatherGuardianName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingChild.dateOfBirth,
        bFormNo: bFormNo ?? existingChild.bFormNo,
        guardianName: guardianName ?? existingChild.guardianName,
        guardianRelation: guardianRelation ?? existingChild.guardianRelation,
        guardianContact: guardianContact ?? existingChild.guardianContact,
        address: address ?? existingChild.address,
        status: status ?? existingChild.status,
        motherMaidId: motherMaidId ?? existingChild.motherMaidId,
        roomId: roomId ?? existingChild.roomId,
        bedId: bedId ?? existingChild.bedId,
        classId: classId ?? existingChild.classId,
        clothingIssued: clothingIssued ?? existingChild.clothingIssued,
        dietaryNotes: dietaryNotes ?? existingChild.dietaryNotes,
        notes: notes ?? existingChild.notes,
      },
    });

    // Update medical record
    if (bloodGroup || allergies || chronicConditions || heightCm || weightKg) {
      await prisma.medicalRecord.upsert({
        where: { childId: id },
        update: {
          bloodGroup: bloodGroup || undefined,
          allergies: allergies || undefined,
          chronicConditions: chronicConditions || undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
        },
        create: {
          childId: id,
          bloodGroup: bloodGroup || 'B+',
          allergies: allergies || 'None',
          chronicConditions: chronicConditions || 'None',
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
        },
      });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_CHILD',
      module: 'CHILDREN',
      recordId: id,
      details: `Updated child profile for ${updatedChild.fullName} (${updatedChild.childId})`,
    });

    return NextResponse.json({ success: true, child: updatedChild });
  } catch (error) {
    console.error('Update child error:', error);
    return NextResponse.json({ error: 'Failed to update child profile' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    if (currentUser.role !== Role.INCHARGE && currentUser.role !== Role.CLERK) {
      return NextResponse.json({ error: 'Unauthorized to archive child records' }, { status: 403 });
    }

    const child = await prisma.child.findUnique({ where: { id } });
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Free bed
    if (child.bedId) {
      await prisma.bed.update({
        where: { id: child.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    const archived = await prisma.child.update({
      where: { id },
      data: { status: 'DEACTIVATED' },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ARCHIVE_CHILD',
      module: 'CHILDREN',
      recordId: id,
      details: `Archived/Deactivated child file ${archived.fullName} (${archived.childId})`,
    });

    return NextResponse.json({ success: true, message: 'Child archived successfully' });
  } catch (error) {
    console.error('Archive child error:', error);
    return NextResponse.json({ error: 'Failed to archive child' }, { status: 500 });
  }
}
