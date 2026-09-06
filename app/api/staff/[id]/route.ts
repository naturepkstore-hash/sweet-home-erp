import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            status: true,
            lastLogin: true,
            permissions: true,
          },
        },
        assignedChildren: {
          select: {
            id: true,
            childId: true,
            fullName: true,
            status: true,
          },
        },
        attendances: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, employee });
  } catch (error) {
    console.error('Fetch employee error:', error);
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.HR_REPRESENTATIVE
    ) {
      return NextResponse.json({ error: 'Unauthorized to update staff members' }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      fatherHusbandName,
      address,
      phoneNumber,
      role,
      department,
      employmentStatus,
      emergencyContact,
      notes,
      permissions,
      newPassword,
      accountStatus,
    } = body;

    const existingEmp = await prisma.employee.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existingEmp) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    // Update employee record
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        fullName: fullName ?? existingEmp.fullName,
        fatherHusbandName: fatherHusbandName ?? existingEmp.fatherHusbandName,
        address: address ?? existingEmp.address,
        phoneNumber: phoneNumber ?? existingEmp.phoneNumber,
        role: role ? (role as Role) : existingEmp.role,
        department: department ?? existingEmp.department,
        employmentStatus: employmentStatus ?? existingEmp.employmentStatus,
        emergencyContact: emergencyContact ?? existingEmp.emergencyContact,
        notes: notes ?? existingEmp.notes,
        permissions: permissions ? JSON.stringify(permissions) : existingEmp.permissions,
      },
    });

    // Update attached user account if present
    if (existingEmp.userId) {
      const userUpdateData: Record<string, unknown> = {};

      if (role) userUpdateData.role = role as Role;
      if (accountStatus) userUpdateData.status = accountStatus;
      if (employmentStatus && !accountStatus) {
        userUpdateData.status = employmentStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
      }
      if (permissions) userUpdateData.permissions = JSON.stringify(permissions);

      if (newPassword && newPassword.trim()) {
        userUpdateData.password = await bcrypt.hash(newPassword.trim(), 10);
      }

      await prisma.user.update({
        where: { id: existingEmp.userId },
        data: userUpdateData,
      });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_EMPLOYEE',
      module: 'STAFF',
      recordId: id,
      details: `Updated employee profile for ${updatedEmployee.fullName}`,
    });

    return NextResponse.json({ success: true, employee: updatedEmployee });
  } catch (error) {
    console.error('Update employee error:', error);
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAuth();
    const { id } = await params;

    if (currentUser.role !== Role.INCHARGE) {
      return NextResponse.json(
        { error: 'Only the Incharge has authority to archive or remove staff members' },
        { status: 403 }
      );
    }

    // Soft-delete / archive
    const archivedEmp = await prisma.employee.update({
      where: { id },
      data: { employmentStatus: 'TERMINATED' },
      include: { user: true },
    });

    if (archivedEmp.userId) {
      await prisma.user.update({
        where: { id: archivedEmp.userId },
        data: { status: 'SUSPENDED' },
      });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ARCHIVE_EMPLOYEE',
      module: 'STAFF',
      recordId: id,
      details: `Archived/Terminated employee ${archivedEmp.fullName}`,
    });

    return NextResponse.json({ success: true, message: 'Employee archived successfully' });
  } catch (error) {
    console.error('Archive employee error:', error);
    return NextResponse.json({ error: 'Failed to archive employee' }, { status: 500 });
  }
}
