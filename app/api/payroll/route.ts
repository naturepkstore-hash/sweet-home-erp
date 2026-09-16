import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

const managers: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT];

function monthBounds(month: string) {
  const start = new Date(`${month}-01T00:00:00`);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
}

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const month = new URL(request.url).searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const entries = await prisma.payrollEntry.findMany({ where: { payrollMonth: month }, include: { employee: { select: { id: true, fullName: true, role: true, department: true } } }, orderBy: { employee: { fullName: 'asc' } } });
    const structures = managers.includes(user.role) ? await prisma.salaryStructure.findMany({ where: { active: true }, select: { employeeId: true, basicSalary: true, allowances: true, deductions: true } }) : [];
    return NextResponse.json({ success: true, month, entries, structures });
  } catch (error) {
    console.error('Fetch payroll error:', error);
    return NextResponse.json({ error: 'Failed to fetch payroll' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!managers.includes(user.role)) return NextResponse.json({ error: 'Only Incharge or Account Assistant can manage payroll' }, { status: 403 });
    const body = await request.json();
    const action = String(body.action || 'GENERATE');
    if (action === 'STRUCTURE') {
      const employeeId = String(body.employeeId || '');
      const basicSalary = Number(body.basicSalary || 0);
      const allowances = Number(body.allowances || 0);
      const deductions = Number(body.deductions || 0);
      if (!employeeId || !Number.isFinite(basicSalary) || basicSalary < 0) return NextResponse.json({ error: 'Valid employee and salary are required' }, { status: 400 });
      const structure = await prisma.salaryStructure.create({ data: { employeeId, basicSalary, allowances, deductions, active: true } });
      return NextResponse.json({ success: true, structure });
    }
    if (action === 'STATUS') {
      const status = String(body.status || '');
      if (!['APPROVED', 'PAID', 'DRAFT'].includes(status)) return NextResponse.json({ error: 'Invalid payroll status' }, { status: 400 });
      const entry = await prisma.payrollEntry.update({ where: { id: String(body.id) }, data: { status, paidAt: status === 'PAID' ? new Date() : null } });
      await logAudit({ userId: user.id, userEmail: user.email, action: 'UPDATE_PAYROLL', module: 'FINANCE', recordId: entry.id, details: `Payroll marked ${status}` });
      return NextResponse.json({ success: true, entry });
    }
    const month = String(body.month || new Date().toISOString().slice(0, 7));
    const { start, end } = monthBounds(month);
    const employees = await prisma.employee.findMany({ where: { employmentStatus: 'ACTIVE' }, include: { salaryStructures: { where: { active: true }, orderBy: { effectiveFrom: 'desc' }, take: 1 } } });
    let generated = 0;
    for (const employee of employees) {
      const structure = employee.salaryStructures[0];
      if (!structure) continue;
      const approvedLeave = await prisma.leaveRequest.findMany({ where: { employeeId: employee.id, status: 'APPROVED', startDate: { lt: end }, endDate: { gte: start } }, select: { startDate: true, endDate: true } });
      const leaveDays = approvedLeave.reduce((total, leave) => total + Math.max(0, Math.ceil((Math.min(leave.endDate.getTime(), end.getTime()) - Math.max(leave.startDate.getTime(), start.getTime())) / 86400000)), 0);
      const leaveDeduction = Math.round((structure.basicSalary / 30) * leaveDays * 100) / 100;
      const netSalary = Math.max(0, structure.basicSalary + structure.allowances - structure.deductions - leaveDeduction);
      await prisma.payrollEntry.upsert({ where: { employeeId_payrollMonth: { employeeId: employee.id, payrollMonth: month } }, update: { basicSalary: structure.basicSalary, allowances: structure.allowances, deductions: structure.deductions, leaveDeduction, netSalary }, create: { employeeId: employee.id, payrollMonth: month, basicSalary: structure.basicSalary, allowances: structure.allowances, deductions: structure.deductions, leaveDeduction, netSalary } });
      generated += 1;
    }
    await logAudit({ userId: user.id, userEmail: user.email, action: 'GENERATE_PAYROLL', module: 'FINANCE', details: `Generated ${generated} payroll entries for ${month}` });
    return NextResponse.json({ success: true, generated, month });
  } catch (error) {
    console.error('Generate payroll error:', error);
    return NextResponse.json({ error: 'Failed to generate payroll' }, { status: 500 });
  }
}
