import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    const { childId, note } = await request.json();

    if (!childId || !note) {
      return NextResponse.json({ error: 'Child and note are required' }, { status: 400 });
    }

    // Append to medical record emergency/observation notes
    const record = await prisma.medicalRecord.upsert({
      where: { childId },
      update: {
        emergencyNotes: `${note} (Logged by ${currentUser.fullName} on ${new Date().toLocaleDateString()})`,
      },
      create: {
        childId,
        bloodGroup: 'B+',
        emergencyNotes: `${note} (Logged by ${currentUser.fullName})`,
      },
    });

    await logAudit({
      userId: currentUser.id,
      userEmail: currentUser.email,
      action: 'ADD_HEALTH_OBSERVATION',
      module: 'MEDICAL',
      recordId: childId,
      details: `Health observation logged: ${note}`,
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error('Quick note error:', error);
    return NextResponse.json({ error: 'Failed to save health note' }, { status: 500 });
  }
}
