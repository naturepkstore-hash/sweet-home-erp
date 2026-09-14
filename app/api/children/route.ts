import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { isPersistedChildPhotoUrl } from '@/lib/child-photo';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || '';
    const status = searchParams.get('status') || '';
    const motherMaidId = searchParams.get('motherMaidId') || '';

    const where: Record<string, unknown> = {};

    if (user.role === Role.MOTHER_MAID) {
      if (!user.employeeId) {
        return NextResponse.json({ success: true, children: [] });
      }
      where.motherMaidId = user.employeeId;
    } else if (
      user.role !== Role.INCHARGE &&
      user.role !== Role.ACCOUNT_ASSISTANT &&
      user.role !== Role.CLERK
    ) {
      return NextResponse.json({ error: 'Unauthorized to access child records' }, { status: 403 });
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { childId: { contains: search } },
        { fatherGuardianName: { contains: search } },
        { bFormNo: { contains: search } },
        { admissionNo: { contains: search } },
      ];
    }

    if (classId && classId !== 'ALL') {
      where.classId = classId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (motherMaidId && motherMaidId !== 'ALL' && user.role !== Role.MOTHER_MAID) {
      where.motherMaidId = motherMaidId;
    }

    const children = await prisma.child.findMany({
      where,
      include: {
        room: true,
        bed: true,
        class: true,
        motherMaid: {
          select: {
            id: true,
            fullName: true,
          },
        },
        medicalRecord: true,
        documents: true,
      },
      orderBy: { childId: 'asc' },
    });

    return NextResponse.json({ success: true, children });
  } catch (error) {
    console.error('Fetch children error:', error);
    return NextResponse.json({ error: 'Failed to fetch children records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    // Check authorization: Incharge, Accounts, or Clerk can admit children
    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.CLERK
    ) {
      return NextResponse.json({ error: 'Unauthorized to admit children' }, { status: 403 });
    }

    const body = await request.json();
    const {
      childId,
      fullName,
      fatherGuardianName,
      dateOfBirth,
      gender = 'MALE',
      bFormNo,
      admissionNo,
      admissionDate,
      guardianName,
      guardianRelation,
      guardianContact,
      address,
      photo,
      status = 'ACTIVE',
      motherMaidId,
      roomId,
      bedId,
      classId,
      clothingIssued,
      dietaryNotes,
      notes,
      // Medical initial data
      bloodGroup,
      allergies,
      chronicConditions,
      heightCm,
      weightKg,
    } = body;

    const trimmedFullName = typeof fullName === 'string' ? fullName.trim() : '';
    const trimmedFatherName = typeof fatherGuardianName === 'string' ? fatherGuardianName.trim() : '';
    const trimmedAdmissionNo = typeof admissionNo === 'string' ? admissionNo.trim() : '';

    if (!trimmedFullName || !trimmedFatherName || !dateOfBirth || !trimmedAdmissionNo) {
      return NextResponse.json(
        { error: 'Full Name, Father/Guardian Name, Date of Birth, and Admission Number are mandatory' },
        { status: 400 }
      );
    }

    const parsedDob = new Date(dateOfBirth);
    if (isNaN(parsedDob.getTime())) {
      return NextResponse.json({ error: 'Valid Date of Birth is required' }, { status: 400 });
    }

    const parsedAdmissionDate = admissionDate ? new Date(admissionDate) : new Date();
    if (isNaN(parsedAdmissionDate.getTime())) {
      return NextResponse.json({ error: 'Valid Admission Date is required' }, { status: 400 });
    }

    if (photo && !isPersistedChildPhotoUrl(photo)) {
      return NextResponse.json({ error: 'Child photo URL is not a valid persisted image URL' }, { status: 400 });
    }

    // Check if admissionNo already exists
    const existingAdmission = await prisma.child.findUnique({
      where: { admissionNo: trimmedAdmissionNo },
    });
    if (existingAdmission) {
      return NextResponse.json(
        { error: `Admission file number "${trimmedAdmissionNo}" is already in use by ${existingAdmission.fullName}` },
        { status: 400 }
      );
    }

    // Auto-generate childId if not supplied
    let generatedChildId = childId ? String(childId).trim() : '';
    if (!generatedChildId) {
      const childrenWithPrefix = await prisma.child.findMany({
        where: { childId: { startsWith: 'PBM-SHM-' } },
        select: { childId: true },
      });
      let maxNum = 0;
      for (const c of childrenWithPrefix) {
        const match = c.childId.match(/^PBM-SHM-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) maxNum = num;
        }
      }
      let candidateNum = maxNum + 1;
      let candidateId = `PBM-SHM-${candidateNum.toString().padStart(3, '0')}`;
      while (await prisma.child.findUnique({ where: { childId: candidateId } })) {
        candidateNum++;
        candidateId = `PBM-SHM-${candidateNum.toString().padStart(3, '0')}`;
      }
      generatedChildId = candidateId;
    } else {
      const existingChild = await prisma.child.findUnique({
        where: { childId: generatedChildId },
      });
      if (existingChild) {
        return NextResponse.json(
          { error: `Child ID "${generatedChildId}" is already assigned to ${existingChild.fullName}` },
          { status: 400 }
        );
      }
    }

    // Bed & Room validation and resolution
    let resolvedRoomId: string | null = roomId ? String(roomId).trim() : null;
    const resolvedBedId: string | null = bedId ? String(bedId).trim() : null;

    if (resolvedBedId) {
      const bedRecord = await prisma.bed.findUnique({
        where: { id: resolvedBedId },
        include: { child: true },
      });

      if (!bedRecord) {
        return NextResponse.json({ error: 'Selected hostel bed not found' }, { status: 400 });
      }

      if (bedRecord.child && bedRecord.child.id) {
        if (bedRecord.child.status === 'ACTIVE') {
          return NextResponse.json(
            { error: `Selected Bed (${bedRecord.bedNumber}) is currently assigned to active resident ${bedRecord.child.fullName}` },
            { status: 400 }
          );
        } else {
          // Unlink inactive child from this bed to prevent unique constraint collision
          await prisma.child.update({
            where: { id: bedRecord.child.id },
            data: { bedId: null, roomId: null },
          });
        }
      }

      resolvedRoomId = bedRecord.roomId;
    }

    // Create child record
    const newChild = await prisma.child.create({
      data: {
        childId: generatedChildId,
        fullName: trimmedFullName,
        fatherGuardianName: trimmedFatherName,
        dateOfBirth: parsedDob,
        gender,
        bFormNo: bFormNo ? String(bFormNo).trim() : null,
        admissionNo: trimmedAdmissionNo,
        admissionDate: parsedAdmissionDate,
        guardianName: guardianName ? String(guardianName).trim() : null,
        guardianRelation: guardianRelation ? String(guardianRelation).trim() : null,
        guardianContact: guardianContact ? String(guardianContact).trim() : null,
        address: address ? String(address).trim() : null,
        photo: photo ? String(photo).trim() : null,
        status,
        motherMaidId: motherMaidId ? String(motherMaidId).trim() : null,
        roomId: resolvedRoomId,
        bedId: resolvedBedId,
        classId: classId ? String(classId).trim() : null,
        clothingIssued: clothingIssued || 'Standard 2 Uniforms & Seasonal Bedding',
        dietaryNotes: dietaryNotes || 'Standard Nutritious Diet',
        notes: notes || 'Enrolled in Sweet Home Multan',
      },
    });

    // If bed allocated, mark bed as OCCUPIED
    if (resolvedBedId) {
      await prisma.bed.update({
        where: { id: resolvedBedId },
        data: { status: 'OCCUPIED' },
      });
    }

    // Create medical record
    const parsedHeight = heightCm !== undefined && heightCm !== null && heightCm !== '' ? parseFloat(String(heightCm)) : null;
    const parsedWeight = weightKg !== undefined && weightKg !== null && weightKg !== '' ? parseFloat(String(weightKg)) : null;

    await prisma.medicalRecord.create({
      data: {
        childId: newChild.id,
        bloodGroup: bloodGroup ? String(bloodGroup).trim() : 'B+',
        allergies: allergies ? String(allergies).trim() : 'None',
        chronicConditions: chronicConditions ? String(chronicConditions).trim() : 'None',
        heightCm: Number.isFinite(parsedHeight) ? parsedHeight : null,
        weightKg: Number.isFinite(parsedWeight) ? parsedWeight : null,
        emergencyNotes: 'Standard PBM child medical profile',
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ADMIT_CHILD',
      module: 'CHILDREN',
      recordId: newChild.id,
      details: `Enrolled new child ${trimmedFullName} (ID: ${generatedChildId}, Admission: ${trimmedAdmissionNo})`,
    });

    return NextResponse.json({ success: true, child: newChild }, { status: 201 });
  } catch (error: any) {
    console.error('Admit child error:', error);
    if (error?.code === 'P2002') {
      const targets = error?.meta?.target ? ` on field (${Array.isArray(error.meta.target) ? error.meta.target.join(', ') : error.meta.target})` : '';
      return NextResponse.json(
        { error: `Unique record constraint violation${targets}. Please verify admission number, child ID, and bed allocation.` },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to admit child record' },
      { status: 500 }
    );
  }
}
