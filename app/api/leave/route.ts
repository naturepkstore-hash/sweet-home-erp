import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const managers: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.HR_REPRESENTATIVE];

export async function GET() {
  try {
    const user = await requireAuth();
    const requests = await prisma.leaveRequest.findMany({
      where: managers.includes(user.role) ? undefined : { employeeId: user.employeeId || '__none__' },
      include: { employee: { select: { id: true, fullName: true, role: true, department: true } }, approvedBy: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ success: true, requests });
  } catch (error) {
    console.error('Fetch leave requests error:', error);
    return NextResponse.json({ error: 'Failed to fetch leave requests' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user.employeeId) return NextResponse.json({ error: 'No employee profile is linked to this account' }, { status: 400 });
    const body = await request.json();
    const leaveType = String(body.leaveType || '').trim();
    const reason = String(body.reason || '').trim();
    const startDate = new Date(body.startDate);
    const endDate = new Date(body.endDate);
    if (!leaveType || !reason || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      return NextResponse.json({ error: 'Valid leave type, dates, and reason are required' }, { status: 400 });
    }
    const leave = await prisma.leaveRequest.create({ data: { employeeId: user.employeeId, leaveType, reason, startDate, endDate } });
    await logAudit({ userId: user.id, userEmail: user.email, action: 'CREATE_LEAVE_REQUEST', module: 'STAFF', recordId: leave.id, details: `Submitted ${leaveType} leave request` });
    return NextResponse.json({ success: true, request: leave }, { status: 201 });
  } catch (error) {
    console.error('Create leave request error:', error);
    return NextResponse.json({ error: 'Failed to create leave request' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    if (!managers.includes(user.role)) return NextResponse.json({ error: 'Only HR, Account Assistant, or Incharge can review leave' }, { status: 403 });
    const body = await request.json();
    const id = String(body.id || '').trim();
    const status = String(body.status || '').trim();
    if (!id || !['APPROVED', 'REJECTED', 'CANCELLED'].includes(status)) return NextResponse.json({ error: 'Valid request and decision are required' }, { status: 400 });
    const leave = await prisma.leaveRequest.update({ where: { id }, data: { status, approverId: user.employeeId || null, decisionNote: body.decisionNote ? String(body.decisionNote).trim() : null } });
    await logAudit({ userId: user.id, userEmail: user.email, action: 'REVIEW_LEAVE_REQUEST', module: 'STAFF', recordId: id, details: `Leave request marked ${status}` });
    return NextResponse.json({ success: true, request: leave });
  } catch (error) {
    console.error('Review leave request error:', error);
    return NextResponse.json({ error: 'Failed to review leave request' }, { status: 500 });
  }
}
