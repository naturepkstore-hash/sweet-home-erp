import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { isPersistedChildPhotoUrl } from '@/lib/child-photo';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
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

    if (
      currentUser.role === Role.MOTHER_MAID &&
      child.motherMaidId !== currentUser.employeeId
    ) {
      return NextResponse.json({ error: 'Unauthorized to access this child profile' }, { status: 403 });
    }

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.CLERK &&
      currentUser.role !== Role.MOTHER_MAID
    ) {
      return NextResponse.json({ error: 'Unauthorized to access child profiles' }, { status: 403 });
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
      photo,
    } = body;

    const existingChild = await prisma.child.findUnique({ where: { id } });
    if (!existingChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    if (Object.prototype.hasOwnProperty.call(body, 'photo') && photo && !isPersistedChildPhotoUrl(photo)) {
      return NextResponse.json({ error: 'Child photo URL is not a valid persisted image URL' }, { status: 400 });
    }

    const targetStatus = status ?? existingChild.status;
    const isBecomingInactive = targetStatus !== 'ACTIVE';

    let nextBedId: string | null = existingChild.bedId;
    let nextRoomId: string | null = existingChild.roomId;

    if (isBecomingInactive) {
      if (existingChild.bedId) {
        await prisma.bed.update({
          where: { id: existingChild.bedId },
          data: { status: 'AVAILABLE' },
        });
      }
      nextBedId = null;
      nextRoomId = null;
    } else if (Object.prototype.hasOwnProperty.call(body, 'bedId')) {
      const requestedBedId = bedId ? String(bedId).trim() : null;
      if (requestedBedId !== existingChild.bedId) {
        if (existingChild.bedId) {
          await prisma.bed.update({
            where: { id: existingChild.bedId },
            data: { status: 'AVAILABLE' },
          });
        }

        if (requestedBedId) {
          const targetBed = await prisma.bed.findUnique({
            where: { id: requestedBedId },
            include: { child: true },
          });

          if (!targetBed) {
            return NextResponse.json({ error: 'Selected hostel bed not found' }, { status: 400 });
          }

          if (targetBed.child && targetBed.child.id !== id) {
            if (targetBed.child.status === 'ACTIVE') {
              return NextResponse.json(
                { error: `Selected Bed (${targetBed.bedNumber}) is currently assigned to ${targetBed.child.fullName}` },
                { status: 400 }
              );
            } else {
              await prisma.child.update({
                where: { id: targetBed.child.id },
                data: { bedId: null, roomId: null },
              });
            }
          }

          await prisma.bed.update({
            where: { id: requestedBedId },
            data: { status: 'OCCUPIED' },
          });

          nextBedId = requestedBedId;
          nextRoomId = targetBed.roomId;
        } else {
          nextBedId = null;
          nextRoomId = null;
        }
      }
    }

    if (roomId !== undefined && !nextBedId) {
      nextRoomId = roomId ? String(roomId).trim() : null;
    }

    const updatedChild = await prisma.child.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? String(fullName).trim() : existingChild.fullName,
        fatherGuardianName: fatherGuardianName !== undefined ? String(fatherGuardianName).trim() : existingChild.fatherGuardianName,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : existingChild.dateOfBirth,
        bFormNo: bFormNo !== undefined ? (bFormNo ? String(bFormNo).trim() : null) : existingChild.bFormNo,
        guardianName: guardianName !== undefined ? (guardianName ? String(guardianName).trim() : null) : existingChild.guardianName,
        guardianRelation: guardianRelation !== undefined ? (guardianRelation ? String(guardianRelation).trim() : null) : existingChild.guardianRelation,
        guardianContact: guardianContact !== undefined ? (guardianContact ? String(guardianContact).trim() : null) : existingChild.guardianContact,
        address: address !== undefined ? (address ? String(address).trim() : null) : existingChild.address,
        status: targetStatus,
        motherMaidId: motherMaidId !== undefined ? (motherMaidId ? String(motherMaidId).trim() : null) : existingChild.motherMaidId,
        roomId: nextRoomId,
        bedId: nextBedId,
        classId: classId !== undefined ? (classId ? String(classId).trim() : null) : existingChild.classId,
        clothingIssued: clothingIssued !== undefined ? clothingIssued : existingChild.clothingIssued,
        dietaryNotes: dietaryNotes !== undefined ? dietaryNotes : existingChild.dietaryNotes,
        notes: notes !== undefined ? notes : existingChild.notes,
        ...(Object.prototype.hasOwnProperty.call(body, 'photo')
          ? { photo: photo ? String(photo).trim() : null }
          : {}),
      },
    });

    // Update medical record
    if (bloodGroup || allergies || chronicConditions || heightCm || weightKg) {
      const parsedHeight = heightCm !== undefined && heightCm !== null && heightCm !== '' ? parseFloat(String(heightCm)) : undefined;
      const parsedWeight = weightKg !== undefined && weightKg !== null && weightKg !== '' ? parseFloat(String(weightKg)) : undefined;

      await prisma.medicalRecord.upsert({
        where: { childId: id },
        update: {
          bloodGroup: bloodGroup ? String(bloodGroup).trim() : undefined,
          allergies: allergies ? String(allergies).trim() : undefined,
          chronicConditions: chronicConditions ? String(chronicConditions).trim() : undefined,
          heightCm: parsedHeight !== undefined && Number.isFinite(parsedHeight) ? parsedHeight : undefined,
          weightKg: parsedWeight !== undefined && Number.isFinite(parsedWeight) ? parsedWeight : undefined,
        },
        create: {
          childId: id,
          bloodGroup: bloodGroup ? String(bloodGroup).trim() : 'B+',
          allergies: allergies ? String(allergies).trim() : 'None',
          chronicConditions: chronicConditions ? String(chronicConditions).trim() : 'None',
          heightCm: parsedHeight !== undefined && Number.isFinite(parsedHeight) ? parsedHeight : null,
          weightKg: parsedWeight !== undefined && Number.isFinite(parsedWeight) ? parsedWeight : null,
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
  } catch (error: any) {
    console.error('Update child error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Unique constraint conflict occurred while updating child profile.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update child profile' },
      { status: 500 }
    );
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

    // Free bed and unlink from child record
    if (child.bedId) {
      await prisma.bed.update({
        where: { id: child.bedId },
        data: { status: 'AVAILABLE' },
      });
    }

    const archived = await prisma.child.update({
      where: { id },
      data: {
        status: 'DEACTIVATED',
        bedId: null,
        roomId: null,
      },
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
