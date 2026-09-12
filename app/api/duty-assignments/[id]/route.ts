import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/audit';

const VALID_STATUSES = ['ASSIGNED', 'PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'];
const VALID_SHIFTS = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'];

function startOfDay(value: string | Date) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function effectiveStatus(status: string, dutyDate: Date) {
  if ((status === 'ASSIGNED' || status === 'PENDING') && dutyDate < startOfDay(new Date())) return 'OVERDUE';
  return status;
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    const { id } = await context.params;
    const assignment = await prisma.dutyAssignment.findUnique({ where: { id } });

    if (!assignment) return NextResponse.json({ error: 'Duty assignment not found' }, { status: 404 });

    const isManager = hasPermission(currentUser.role, 'duties.update', currentUser.permissions);
    const isOwner = currentUser.employeeId === assignment.employeeId;
    if (!isManager && !isOwner) {
      return NextResponse.json({ error: 'You are not authorized to modify this duty assignment' }, { status: 403 });
    }

    const body = await request.json();
    const requestedStatus = body.status ? String(body.status) : undefined;
    if (requestedStatus && !VALID_STATUSES.includes(requestedStatus)) {
      return NextResponse.json({ error: 'Invalid duty status' }, { status: 400 });
    }

    if (!isManager && requestedStatus !== 'COMPLETED') {
      return NextResponse.json({ error: 'Employees may only mark their own duties completed' }, { status: 403 });
    }

    const dutyDate = body.dutyDate ? startOfDay(String(body.dutyDate)) : assignment.dutyDate;
    const shift = body.shift ? String(body.shift) : assignment.shift;
    if (!VALID_SHIFTS.includes(shift) || Number.isNaN(dutyDate.getTime())) {
      return NextResponse.json({ error: 'Invalid date or shift' }, { status: 400 });
    }

    const status = requestedStatus || assignment.status;
    const updated = await prisma.dutyAssignment.update({
      where: { id },
      data: {
        dutyDate,
        shift,
        status,
        notes: body.notes === undefined ? assignment.notes : String(body.notes || '').trim() || null,
        completedAt: status === 'COMPLETED' ? assignment.completedAt || new Date() : null,
      },
      include: {
        employee: { select: { id: true, fullName: true, role: true, department: true } },
        duty: true,
        assignedBy: { select: { id: true, email: true, employee: { select: { fullName: true } } } },
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: status === 'COMPLETED' ? 'COMPLETE_DUTY' : 'UPDATE_DUTY_ASSIGNMENT',
      module: 'STAFF',
      recordId: id,
      details: `${status} duty assignment ${id}`,
    });

    return NextResponse.json({
      success: true,
      assignment: { ...updated, status: effectiveStatus(updated.status, updated.dutyDate) },
    });
  } catch (error) {
    console.error('Update duty assignment error:', error);
    return NextResponse.json({ error: 'Failed to update duty assignment' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const currentUser = await requireAuth();
    if (!hasPermission(currentUser.role, 'duties.archive', currentUser.permissions)) {
      return NextResponse.json({ error: 'Only authorized management users can archive duties' }, { status: 403 });
    }

    const { id } = await context.params;
    const assignment = await prisma.dutyAssignment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ARCHIVE_DUTY_ASSIGNMENT',
      module: 'STAFF',
      recordId: id,
      details: `Archived duty assignment ${id}`,
    });

    return NextResponse.json({ success: true, assignment });
  } catch (error) {
    console.error('Archive duty assignment error:', error);
    return NextResponse.json({ error: 'Failed to archive duty assignment' }, { status: 500 });
  }
}
