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
    // 1. Try querying Database for user
    let user: any = null;

    try {
      user = await prisma.user.findFirst({
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
    } catch {
      return NextResponse.json({ error: 'Authentication service unavailable.' }, { status: 503 });
    }

    // 2. If user found in database
    if (user) {
      if (user.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Your staff account is inactive or suspended. Contact the Incharge.' },
          { status: 403 }
        );
      }

      // Verify only the bcrypt hash stored for this database user.
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch {
        isMatch = false;
      }

      if (!isMatch) {
        return NextResponse.json(
          { error: 'Invalid login credentials. Please check your password.' },
          { status: 401 }
        );
      }

      // Safely update lastLogin (catch read-only SQLite errors on Vercel)
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date(), lastLoginAt: new Date() },
        });
      } catch (err) {
        console.warn('Could not update user lastLogin (read-only db or connection error):', err);
      }

      // Sign session token
      const token = signSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
        fullName: user.employee?.fullName || user.username,
        employeeId: user.employee?.id,
      });

      // Safely record audit log
      try {
        await logAudit({
          userId: user.id,
          userEmail: user.email,
          action: 'LOGIN',
          module: 'AUTH',
          recordId: user.id,
          details: `User ${user.email} (${user.role}) logged into Sweet Home ERP successfully.`,
        });
      } catch (err) {
        console.warn('Could not write login audit log:', err);
      }

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
      });

      return response;
    }

    // Users must exist in the database and be ACTIVE to authenticate.
    return NextResponse.json(
      { error: 'Staff account not found. Please verify your email or username.' },
      { status: 401 }
    );
  } catch {

    return NextResponse.json(
      { error: 'Authentication failed. Please verify your credentials and try again.' },
      { status: 401 }
    );
  }
}

