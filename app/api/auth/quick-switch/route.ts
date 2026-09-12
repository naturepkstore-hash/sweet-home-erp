import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { findDefaultStaffUser } from '@/lib/default-users';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: { employee: true },
      });
    } catch (dbErr) {
      console.warn('Database lookup failed in quick-switch:', dbErr);
    }

    const defaultStaff = findDefaultStaffUser(email);

    if (!user && !defaultStaff) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user?.id || defaultStaff?.id || 'usr-quick-switch';
    const userEmail = user?.email || defaultStaff?.email || email;
    const userRole = user?.role || defaultStaff?.role;
    const userUsername = user?.username || defaultStaff?.username || email.split('@')[0];
    const userFullName = user?.employee?.fullName || defaultStaff?.fullName || userUsername;
    const userEmpId = user?.employee?.id || defaultStaff?.employeeId;

    const token = signSessionToken({
      userId,
      email: userEmail,
      role: userRole,
      username: userUsername,
      fullName: userFullName,
      employeeId: userEmpId,
    });

    try {
      await logAudit({
        userId,
        userEmail,
        action: 'QUICK_SWITCH_LOGIN',
        module: 'AUTH',
        recordId: userId,
        details: `Switched active session to ${userEmail} (${userRole}).`,
      });
    } catch (err) {
      console.warn('Could not write quick-switch audit log:', err);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: userEmail,
        username: userUsername,
        role: userRole,
        fullName: userFullName,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    console.error('Quick switch error:', error);
    return NextResponse.json({ error: 'Failed to switch user.' }, { status: 500 });
  }
}

