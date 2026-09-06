import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const classId = searchParams.get('classId') || '';
    const status = searchParams.get('status') || '';
    const motherMaidId = searchParams.get('motherMaidId') || '';

    const where: Record<string, unknown> = {};

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

    if (motherMaidId && motherMaidId !== 'ALL') {
      where.motherMaidId = motherMaidId;
    }

    // If mother maid is logged in, show her assigned children by default if requested
    if (user.role === Role.MOTHER_MAID && user.employeeId && searchParams.get('onlyMine') === 'true') {
      where.motherMaidId = user.employeeId;
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

    if (!fullName || !fatherGuardianName || !dateOfBirth || !admissionNo) {
      return NextResponse.json(
        { error: 'Full Name, Father/Guardian Name, Date of Birth, and Admission Number are mandatory' },
        { status: 400 }
      );
    }

    // Auto-generate childId if not supplied
    let generatedChildId = childId;
    if (!generatedChildId) {
      const count = await prisma.child.count();
      generatedChildId = `PBM-SHM-${(count + 1).toString().padStart(3, '0')}`;
    }

    // Create child record
    const newChild = await prisma.child.create({
      data: {
        childId: generatedChildId,
        fullName,
        fatherGuardianName,
        dateOfBirth: new Date(dateOfBirth),
        gender,
        bFormNo: bFormNo || null,
        admissionNo,
        admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        guardianName: guardianName || null,
        guardianRelation: guardianRelation || null,
        guardianContact: guardianContact || null,
        address: address || null,
        photo: photo || null,
        status,
        motherMaidId: motherMaidId || null,
        roomId: roomId || null,
        bedId: bedId || null,
        classId: classId || null,
        clothingIssued: clothingIssued || 'Standard 2 Uniforms & Seasonal Bedding',
        dietaryNotes: dietaryNotes || 'Standard Nutritious Diet',
        notes: notes || 'Enrolled in Sweet Home Multan',
      },
    });

    // If bed allocated, mark bed as OCCUPIED
    if (bedId) {
      await prisma.bed.update({
        where: { id: bedId },
        data: { status: 'OCCUPIED' },
      });
    }

    // Create medical record
    await prisma.medicalRecord.create({
      data: {
        childId: newChild.id,
        bloodGroup: bloodGroup || 'B+',
        allergies: allergies || 'None',
        chronicConditions: chronicConditions || 'None',
        heightCm: heightCm ? parseFloat(heightCm) : null,
        weightKg: weightKg ? parseFloat(weightKg) : null,
        emergencyNotes: 'Standard PBM child medical profile',
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ADMIT_CHILD',
      module: 'CHILDREN',
      recordId: newChild.id,
      details: `Enrolled new child ${fullName} (ID: ${generatedChildId}, Admission: ${admissionNo})`,
    });

    return NextResponse.json({ success: true, child: newChild }, { status: 201 });
  } catch (error) {
    console.error('Admit child error:', error);
    return NextResponse.json({ error: 'Failed to admit child record' }, { status: 500 });
  }
}
