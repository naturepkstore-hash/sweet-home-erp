import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'Email/Username and Password are required' },
        { status: 400 }
      );
    }

    const cleanLoginId = loginId.trim();

    // Look up user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanLoginId.toLowerCase() },
          { username: cleanLoginId.toLowerCase() },
        ],
      },
      include: {
        employee: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid login credentials. Please check your email/username and password.' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your staff account is inactive or suspended. Contact the Incharge.' },
        { status: 403 }
      );
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid login credentials. Please check your password.' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Sign session token
    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      username: user.username,
      fullName: user.employee?.fullName || user.username,
      employeeId: user.employee?.id,
    });

    // Record audit log
    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'LOGIN',
      module: 'AUTH',
      recordId: user.id,
      details: `User ${user.email} (${user.role}) logged into Sweet Home ERP successfully.`,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        fullName: user.employee?.fullName || user.username,
      },
    });

    // Set HTTP-Only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
