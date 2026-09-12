import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET(request: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const department = searchParams.get('department') || '';
    const status = searchParams.get('status') || '';

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { cnic: { contains: search } },
        { phoneNumber: { contains: search } },
        { fatherHusbandName: { contains: search } },
      ];
    }

    if (role && role !== 'ALL') {
      where.role = role as Role;
    }

    if (department && department !== 'ALL') {
      where.department = department;
    }

    if (status && status !== 'ALL') {
      where.employmentStatus = status;
    }

    const employees = await prisma.employee.findMany({
      where,
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
      },
      orderBy: { fullName: 'asc' },
    });

    return NextResponse.json({ success: true, employees });
  } catch (error) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();

    // Check authorization: Incharge, Account Assistant, or HR can create staff
    if (
      currentUser.role !== Role.INCHARGE &&
      currentUser.role !== Role.ACCOUNT_ASSISTANT &&
      currentUser.role !== Role.HR_REPRESENTATIVE
    ) {
      return NextResponse.json({ error: 'Unauthorized to add staff members' }, { status: 403 });
    }

    const body = await request.json();
    const {
      fullName,
      fatherHusbandName,
      cnic,
      address,
      phoneNumber,
      role,
      department,
      joiningDate,
      employmentStatus = 'ACTIVE',
      emergencyContact,
      photo,
      notes,
      createAccount = true,
      username,
      email,
      password,
      permissions = [],
    } = body;

    // Field validation
    if (!fullName || !fatherHusbandName || !cnic || !phoneNumber || !role) {
      return NextResponse.json(
        { error: 'Full Name, Father/Husband Name, CNIC, Phone Number, and Role are mandatory' },
        { status: 400 }
      );
    }

    // Security Check: Non-Incharge CANNOT assign INCHARGE role
    if (role === Role.INCHARGE && currentUser.role !== Role.INCHARGE) {
      return NextResponse.json(
        { error: 'Only the Incharge can create or assign Incharge-level authority' },
        { status: 403 }
      );
    }

    // Check for existing CNIC
    const existingEmp = await prisma.employee.findUnique({ where: { cnic } });
    if (existingEmp) {
      return NextResponse.json({ error: 'An employee with this CNIC already exists' }, { status: 400 });
    }

    // Look up RoleDefinition and Department
    const roleDef = await prisma.roleDefinition.findUnique({ where: { name: role } });
    const deptDef = department
      ? await prisma.department.findFirst({
          where: {
            OR: [
              { name: { contains: department } },
              { code: department.toUpperCase() },
            ],
          },
        })
      : null;

    let createdUserId: string | undefined;

    if (createAccount) {
      const cleanUsername = username?.trim() || cnic.replace(/[^0-9]/g, '');
      const staffEmail = email?.trim() || `${cleanUsername}@sweethome.pbm.gov.pk`;
      const plainPassword = password || 'PBM@Staff2026!';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: staffEmail.toLowerCase() }, { username: cleanUsername.toLowerCase() }],
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'A login account with this email or username already exists' },
          { status: 400 }
        );
      }

      const newUser = await prisma.user.create({
        data: {
          email: staffEmail.toLowerCase(),
          username: cleanUsername.toLowerCase(),
          password: hashedPassword,
          role: role as Role,
          roleId: roleDef?.id,
          status: employmentStatus === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
          permissions: JSON.stringify(permissions),
        },
      });

      createdUserId = newUser.id;
    }

    const newEmployee = await prisma.employee.create({
      data: {
        userId: createdUserId,
        fullName,
        fatherHusbandName,
        cnic,
        address: address || '',
        phoneNumber,
        role: role as Role,
        roleId: roleDef?.id,
        department: department || 'Operations',
        departmentId: deptDef?.id,
        joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
        employmentStatus,
        emergencyContact: emergencyContact || '',
        photo: photo || null,
        notes: notes || '',
        permissions: JSON.stringify(permissions),
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'CREATE_EMPLOYEE',
      module: 'STAFF',
      recordId: newEmployee.id,
      details: `Created new staff record for ${fullName} (${role}, CNIC: ${cnic})`,
    });

    return NextResponse.json({ success: true, employee: newEmployee }, { status: 201 });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Failed to create employee record' }, { status: 500 });
  }
}

