import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, requireAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const MANAGEMENT_PERMISSION = 'duties.assign';
const ASSIGN_PERMISSION = 'duties.assign';
const VALID_SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];
const VALID_STATUSES = ['ASSIGNED', 'PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'];

function startOfDay(value: string | Date) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function effectiveStatus(status: string, dutyDate: Date) {
  if (status === 'ASSIGNED' || status === 'PENDING') {
    const today = startOfDay(new Date());
    if (dutyDate < today) return 'OVERDUE';
  }
  return status;
}

function serializeAssignment(assignment: any) {
  return {
    ...assignment,
    status: effectiveStatus(assignment.status, assignment.dutyDate),
  };
}

function isManagementUser(user: Awaited<ReturnType<typeof getCurrentUser>>) {
  return Boolean(user && hasPermission(user.role, MANAGEMENT_PERMISSION, user.permissions));
}

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { searchParams } = new URL(request.url);
    const requestedEmployeeId = searchParams.get('employeeId');
    const isManagement = isManagementUser(currentUser);

    // A self-service request is always scoped to the employee in the verified session.
    const employeeId = isManagement ? requestedEmployeeId || undefined : currentUser.employeeId;
    if (!isManagement && !employeeId) {
      return NextResponse.json({ success: true, assignments: [] });
    }

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const status = searchParams.get('status');
    const shift = searchParams.get('shift');
    const dutyId = searchParams.get('dutyId');

    const assignments = await prisma.dutyAssignment.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(dutyId ? { dutyId } : {}),
        ...(shift ? { shift } : {}),
        ...(status && status !== 'OVERDUE' ? { status } : {}),
        ...(from || to
          ? {
              dutyDate: {
                ...(from ? { gte: startOfDay(from) } : {}),
                ...(to ? { lte: startOfDay(to) } : {}),
              },
            }
          : {}),
      },
      include: {
        employee: { select: { id: true, fullName: true, role: true, department: true } },
        duty: true,
        assignedBy: { select: { id: true, email: true, employee: { select: { fullName: true } } } },
      },
      orderBy: [{ dutyDate: 'desc' }, { createdAt: 'desc' }],
    });

    const serialized = assignments
      .map(serializeAssignment)
      .filter((assignment) => !status || assignment.status === status);

    return NextResponse.json({ success: true, assignments: serialized });
  } catch (error) {
    console.warn('Fetch duty assignments fallback:', error);
    return NextResponse.json({ success: true, assignments: [] });
  }
}


export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (!hasPermission(currentUser.role, ASSIGN_PERMISSION, currentUser.permissions)) {
      return NextResponse.json({ error: 'Only authorized management users can assign duties' }, { status: 403 });
    }

    const body = await request.json();
    const employeeId = String(body.employeeId || '');
    const dutyIds = Array.isArray(body.dutyIds) ? body.dutyIds.map(String).filter(Boolean) : [];
    const dutyDate = startOfDay(String(body.dutyDate || ''));
    const shift = String(body.shift || 'MORNING');
    const notes = body.notes ? String(body.notes).trim() : null;

    if (!employeeId || !dutyIds.length || Number.isNaN(dutyDate.getTime())) {
      return NextResponse.json({ error: 'Employee, date, and at least one duty are required' }, { status: 400 });
    }
    if (!VALID_SHIFTS.includes(shift)) {
      return NextResponse.json({ error: 'Invalid shift selected' }, { status: 400 });
    }

    const employee = await prisma.employee.findFirst({ where: { id: employeeId, employmentStatus: 'ACTIVE' } });
    const duties = await prisma.duty.findMany({ where: { id: { in: dutyIds }, isActive: true } });
    if (!employee || duties.length !== dutyIds.length) {
      return NextResponse.json({ error: 'Employee or one of the selected duties is not active' }, { status: 400 });
    }

    const assignments = await prisma.$transaction(
      duties.map((duty) =>
        prisma.dutyAssignment.upsert({
          where: {
            employeeId_dutyId_dutyDate_shift: {
              employeeId,
              dutyId: duty.id,
              dutyDate,
              shift,
            },
          },
          update: { status: 'ASSIGNED', assignedById: currentUser.id, notes },
          create: {
            employeeId,
            dutyId: duty.id,
            dutyDate,
            shift,
            status: 'ASSIGNED',
            assignedById: currentUser.id,
            notes,
          },
          include: { employee: true, duty: true },
        }),
      ),
    );

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ASSIGN_DUTIES',
      module: 'STAFF',
      recordId: employeeId,
      details: `Assigned ${duties.length} duties to ${employee.fullName} for ${dutyDate.toISOString().split('T')[0]} (${shift})`,
    });

    return NextResponse.json({ success: true, assignments: assignments.map(serializeAssignment) }, { status: 201 });
  } catch (error) {
    console.error('Create duty assignments error:', error);
    return NextResponse.json({ error: 'Failed to save duty assignments' }, { status: 500 });
  }
}

export { VALID_STATUSES };
