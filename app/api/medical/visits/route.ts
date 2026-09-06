import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    const where: Record<string, unknown> = {};
    if (childId) where.childId = childId;

    const visits = await prisma.medicalVisit.findMany({
      where,
      include: {
        child: {
          select: {
            id: true,
            childId: true,
            fullName: true,
          },
        },
      },
      orderBy: { visitDate: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, visits });
  } catch (error) {
    console.error('Fetch visits error:', error);
    return NextResponse.json({ error: 'Failed to fetch medical visits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    const body = await request.json();
    const {
      childId,
      visitDate,
      doctorName,
      clinicHospital = 'Civil Hospital Multan / PBM Clinic',
      symptoms,
      diagnosis,
      vitals,
      prescription,
      treatment,
      notes,
    } = body;

    if (!childId || !doctorName || !diagnosis) {
      return NextResponse.json(
        { error: 'Child, Doctor Name, and Diagnosis are mandatory' },
        { status: 400 }
      );
    }

    const visit = await prisma.medicalVisit.create({
      data: {
        childId,
        visitDate: visitDate ? new Date(visitDate) : new Date(),
        doctorName,
        clinicHospital,
        symptoms: symptoms || null,
        diagnosis,
        vitals: vitals || null,
        prescription: prescription || null,
        treatment: treatment || null,
        notes: notes || null,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'LOG_MEDICAL_VISIT',
      module: 'MEDICAL',
      recordId: visit.id,
      details: `Logged doctor checkup by Dr. ${doctorName} (Diagnosis: ${diagnosis})`,
    });

    return NextResponse.json({ success: true, visit }, { status: 201 });
  } catch (error) {
    console.error('Create medical visit error:', error);
    return NextResponse.json({ error: 'Failed to record medical visit' }, { status: 500 });
  }
}
