import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import { logAudit } from '@/lib/audit';
import { hasPermission } from '@/lib/permissions';

function parseTasks(value: unknown): Array<{ id: string | number; text: string; done: boolean }> {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return { id: item, text: item, done: true };
        }
        if (item && typeof item === 'object') {
          const candidate = item as Record<string, unknown>;
          return {
            id: String(candidate.id ?? Math.random().toString(36).slice(2)),
            text: String(candidate.text ?? candidate.task ?? ''),
            done: Boolean(candidate.done),
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ id: string | number; text: string; done: boolean }>;
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseTasks(parsed);
    } catch {
      return [];
    }
  }

  return [];
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const adminRoles: Role[] = [
      Role.INCHARGE,
      Role.ACCOUNT_ASSISTANT,
      Role.HR_REPRESENTATIVE,
      Role.CLERK,
    ];
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const employeeId = searchParams.get('employeeId') || currentUser.employeeId || undefined;

    const startOfDay = dateParam ? new Date(`${dateParam}T00:00:00`) : new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    const isAdmin = hasPermission(currentUser.role, 'duties.assign', currentUser.permissions) && adminRoles.includes(currentUser.role as Role);
    const scopedEmployeeId = isAdmin ? employeeId : currentUser.employeeId;

    const duties = await prisma.staffDuty.findMany({
      where: {
        dutyDate: {
          gte: startOfDay,
          lt: endOfDay,
        },
        ...(scopedEmployeeId ? { employeeId: scopedEmployeeId } : {}),
      },
      include: {
        employee: {
          select: {
            id: true,
            fullName: true,
            role: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      duties: duties.map((duty) => ({
        ...duty,
        tasksCompleted: parseTasks(duty.tasksCompleted),
      })),
    });
  } catch (error) {
    console.error('Fetch duties error:', error);
    return NextResponse.json({ error: 'Failed to fetch duty assignments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const adminRoles: Role[] = [
      Role.INCHARGE,
      Role.ACCOUNT_ASSISTANT,
      Role.HR_REPRESENTATIVE,
      Role.CLERK,
    ];
    const body = await request.json();
    const employeeId = body.employeeId || currentUser.employeeId;
    const dutyDate = body.dutyDate ? new Date(body.dutyDate) : new Date();
    const shift = body.shift || 'MORNING';
    const notes = body.notes || '';
    const status = body.status || 'PENDING';
    const tasksCompleted = parseTasks(body.tasksCompleted);

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee is required to save a duty log' }, { status: 400 });
    }

    const isSelfEntry = currentUser.employeeId === employeeId;
    const isAdmin = adminRoles.includes(currentUser.role as Role);

    if (!isSelfEntry && !isAdmin) {
      return NextResponse.json({ error: 'You can only update your own duty log' }, { status: 403 });
    }

    const dayStart = new Date(dutyDate);
    dayStart.setHours(0, 0, 0, 0);

    const existing = await prisma.staffDuty.findFirst({
      where: {
        employeeId,
        dutyDate: dayStart,
      },
    });

    const savedDuty = existing
      ? await prisma.staffDuty.update({
          where: { id: existing.id },
          data: {
            shift,
            tasksCompleted: JSON.stringify(tasksCompleted),
            notes,
            status,
          },
        })
      : await prisma.staffDuty.create({
          data: {
            employeeId,
            dutyDate: dayStart,
            shift,
            tasksCompleted: JSON.stringify(tasksCompleted),
            notes,
            status,
          },
        });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_DUTY_LOG',
      module: 'STAFF',
      recordId: savedDuty.id,
      details: `Saved duty log for employee ${employeeId} on ${dayStart.toISOString().split('T')[0]} (${status})`,
    });

    return NextResponse.json({
      success: true,
      duty: {
        ...savedDuty,
        tasksCompleted: parseTasks(savedDuty.tasksCompleted),
      },
    });
  } catch (error) {
    console.error('Save duty error:', error);
    return NextResponse.json({ error: 'Failed to save duty log' }, { status: 500 });
  }
}
