import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    await requireAuth();

    const buildings = await prisma.building.findMany({
      include: {
        rooms: {
          include: {
            beds: {
              include: {
                child: {
                  select: {
                    id: true,
                    childId: true,
                    fullName: true,
                    fatherGuardianName: true,
                    class: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Flatten beds for quick selection dropdowns
    const flatBeds: { id: string; bedNumber: string; roomNumber: string; buildingName: string; status: string }[] = [];
    buildings.forEach((b) => {
      b.rooms.forEach((r) => {
        r.beds.forEach((bed) => {
          if (bed.status === 'AVAILABLE' && !bed.child) {
            flatBeds.push({
              id: bed.id,
              bedNumber: bed.bedNumber,
              roomNumber: r.roomNumber,
              buildingName: b.name,
              status: bed.status,
            });
          }
        });
      });
    });

    return NextResponse.json({ success: true, buildings, beds: flatBeds });
  } catch (error) {
    console.error('Fetch hostel error:', error);
    return NextResponse.json({ error: 'Failed to fetch hostel structure' }, { status: 500 });
  }
}
