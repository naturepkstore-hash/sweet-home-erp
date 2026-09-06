import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logAudit } from '@/lib/audit';

export async function GET() {
  try {
    const user = await requireAuth();

    const settings = await prisma.systemSetting.findMany({
      orderBy: { group: 'asc' },
    });

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const currentUser = await requireAuth();

    if (currentUser.role !== Role.INCHARGE) {
      return NextResponse.json({ error: 'Only the Incharge can modify system settings' }, { status: 403 });
    }

    const { settings } = await request.json();

    if (!Array.isArray(settings)) {
      return NextResponse.json({ error: 'Settings array required' }, { status: 400 });
    }

    for (const s of settings) {
      await prisma.systemSetting.upsert({
        where: { key: s.key },
        update: { value: s.value },
        create: {
          key: s.key,
          value: s.value,
          group: s.group || 'GENERAL',
          description: s.description || null,
        },
      });
    }

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'UPDATE_SYSTEM_SETTINGS',
      module: 'SETTINGS',
      recordId: 'GLOBAL',
      details: `Updated ${settings.length} system configuration parameters`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Current password does not match' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'CHANGE_PASSWORD',
      module: 'AUTH',
      recordId: user.id,
      details: 'User updated personal security password',
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
