import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { employee: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      fullName: user.employee?.fullName || user.username,
      employeeId: user.employee?.id,
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'QUICK_SWITCH_LOGIN',
      module: 'AUTH',
      recordId: user.id,
      details: `Switched active session to ${user.email} (${user.role}).`,
    });

    const response = NextResponse.json({ success: true, user });
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
  } catch (error) {
    console.error('Quick switch error:', error);
    return NextResponse.json({ error: 'Failed to switch user' }, { status: 500 });
  }
}
