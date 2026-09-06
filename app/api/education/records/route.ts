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
    const classId = searchParams.get('classId');

    const where: Record<string, unknown> = {};
    if (childId) where.childId = childId;
    if (classId) where.classId = classId;

    const records = await prisma.educationRecord.findMany({
      where,
      include: {
        child: {
          select: {
            id: true,
            childId: true,
            fullName: true,
          },
        },
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error('Fetch education records error:', error);
    return NextResponse.json({ error: 'Failed to fetch education records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.CLERK
    ) {
      return NextResponse.json({ error: 'Unauthorized to log academic records' }, { status: 403 });
    }

    const body = await request.json();
    const {
      childId,
      classId,
      academicYear = '2025-2026',
      schoolName = 'Sweet Home Model School Multan',
      examTerm,
      totalMarks,
      obtainedMarks,
      remarks,
    } = body;

    if (!childId || !examTerm || totalMarks === undefined || obtainedMarks === undefined) {
      return NextResponse.json(
        { error: 'Child, Exam Term, Total Marks, and Obtained Marks are required' },
        { status: 400 }
      );
    }

    const tMarks = parseFloat(totalMarks);
    const oMarks = parseFloat(obtainedMarks);
    const percentage = (oMarks / tMarks) * 100;

    let grade = 'F';
    if (percentage >= 80) grade = 'A+';
    else if (percentage >= 70) grade = 'A';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const record = await prisma.educationRecord.create({
      data: {
        childId,
        classId: classId || undefined,
        academicYear,
        schoolName,
        examTerm,
        totalMarks: tMarks,
        obtainedMarks: oMarks,
        grade,
        remarks: remarks || 'Good academic performance and classroom participation.',
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ADD_EDUCATION_RECORD',
      module: 'EDUCATION',
      recordId: record.id,
      details: `Added ${examTerm} result for child (${obtainedMarks}/${totalMarks}, Grade: ${grade})`,
    });

    return NextResponse.json({ success: true, record }, { status: 201 });
  } catch (error) {
    console.error('Save education record error:', error);
    return NextResponse.json({ error: 'Failed to save academic record' }, { status: 500 });
  }
}
