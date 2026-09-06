import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const type = searchParams.get('type') || 'CHILD'; // CHILD or EMPLOYEE

    const targetDate = new Date(dateStr);
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
        type,
      },
      include: {
        child: {
          select: {
            id: true,
            childId: true,
            fullName: true,
            class: { select: { name: true } },
            bed: { select: { bedNumber: true } },
          },
        },
        employee: {
          select: {
            id: true,
            fullName: true,
            role: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, attendances, date: dateStr, type });
  } catch (error) {
    console.error('Fetch attendance error:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    // Check authorization: Incharge, Accounts, HR, Clerk, or Mother Maid can record attendance
    const body = await request.json();
    const { date, type = 'CHILD', records } = body;

    if (!date || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Date and records array are required' }, { status: 400 });
    }

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    // Batch upsert attendance entries
    const operations = records.map((r: { id: string; status: string; remarks?: string }) => {
      if (type === 'CHILD') {
        return prisma.attendance.upsert({
          where: {
            date_childId: {
              date: targetDate,
              childId: r.id,
            },
          },
          update: {
            status: r.status,
            remarks: r.remarks || null,
            markedBy: currentUser.fullName,
          },
          create: {
            date: targetDate,
            type: 'CHILD',
            childId: r.id,
            status: r.status,
            remarks: r.remarks || null,
            markedBy: currentUser.fullName,
          },
        });
      } else {
        return prisma.attendance.upsert({
          where: {
            date_employeeId: {
              date: targetDate,
              employeeId: r.id,
            },
          },
          update: {
            status: r.status,
            remarks: r.remarks || null,
            markedBy: currentUser.fullName,
          },
          create: {
            date: targetDate,
            type: 'EMPLOYEE',
            employeeId: r.id,
            status: r.status,
            remarks: r.remarks || null,
            markedBy: currentUser.fullName,
          },
        });
      }
    });

    await prisma.$transaction(operations);

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'RECORD_ATTENDANCE',
      module: 'ATTENDANCE',
      recordId: `${type}_${date}`,
      details: `Recorded ${records.length} ${type.toLowerCase()} attendance entries for date ${date}`,
    });

    return NextResponse.json({ success: true, count: records.length });
  } catch (error) {
    console.error('Save attendance error:', error);
    return NextResponse.json({ error: 'Failed to record attendance' }, { status: 500 });
  }
}
