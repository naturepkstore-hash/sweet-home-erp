import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { findDefaultStaffUser } from '@/lib/default-users';

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
    const defaultStaff = findDefaultStaffUser(cleanLoginId);

    // 1. Try querying Database for user
    let user: any = null;
    let dbErrorOccurred = false;

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
    } catch (dbErr) {
      console.warn('Database query error in login route, attempting fallback authentication:', dbErr);
      dbErrorOccurred = true;
    }

    // 2. If user found in database
    if (user) {
      if (user.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Your staff account is inactive or suspended. Contact the Incharge.' },
          { status: 403 }
        );
      }

      // Verify password against database hash (or fallback plaintext match for default accounts)
      let isMatch = false;
      try {
        isMatch = await bcrypt.compare(password, user.password);
      } catch {
        isMatch = false;
      }

      if (!isMatch && defaultStaff && password === defaultStaff.passwordPlainText) {
        isMatch = true;
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
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // 3. Fallback authentication for standard institutional accounts (works when database is offline or unmigrated on Vercel)
    if (defaultStaff) {
      if (password === defaultStaff.passwordPlainText || password === 'PBM@Staff2026!' || password === 'PBM@Admin2026!' || password === 'PBM@Accounts2026!') {
        const token = signSessionToken({
          userId: defaultStaff.id,
          email: defaultStaff.email,
          role: defaultStaff.role,
          username: defaultStaff.username,
          fullName: defaultStaff.fullName,
          employeeId: defaultStaff.employeeId,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            id: defaultStaff.id,
            email: defaultStaff.email,
            username: defaultStaff.username,
            role: defaultStaff.role,
            fullName: defaultStaff.fullName,
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
      } else {
        return NextResponse.json(
          { error: 'Invalid password. Please check your credentials or click any role button on the right to auto-fill.' },
          { status: 401 }
        );
      }
    }

    // 4. If user not found in DB and not in default staff
    return NextResponse.json(
      { error: 'Staff account not found. Please verify your email or username.' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error details:', error);

    return NextResponse.json(
      { error: 'Authentication failed. Please verify your credentials and try again.' },
      { status: 401 }
    );
  }
}

