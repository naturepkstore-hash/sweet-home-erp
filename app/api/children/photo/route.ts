import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import {
  storeChildPhoto,
  fetchChildPhoto,
  isPersistedChildPhotoUrl,
  CHILD_PHOTO_MAX_BYTES,
} from '@/lib/child-photo';

const PHOTO_MANAGEMENT_ROLES: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK];
const PHOTO_VIEW_ROLES: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK, Role.MOTHER_MAID];

export async function GET(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (!PHOTO_VIEW_ROLES.includes(currentUser.role)) {
      return NextResponse.json({ error: 'You are not authorized to view child photos' }, { status: 403 });
    }

    const photoUrl = new URL(request.url).searchParams.get('url');
    if (typeof photoUrl !== 'string' || !isPersistedChildPhotoUrl(photoUrl)) {
      return NextResponse.json({ error: 'Child photo URL is not a valid persisted image URL' }, { status: 400 });
    }

    const child = await prisma.child.findFirst({
      where: { photo: photoUrl },
      select: { motherMaidId: true },
    });

    if (!child) {
      return NextResponse.json({ error: 'Child photo not found' }, { status: 404 });
    }

    if (currentUser.role === Role.MOTHER_MAID && child.motherMaidId !== currentUser.employeeId) {
      return NextResponse.json({ error: 'You are not authorized to view this child photo' }, { status: 403 });
    }

    const result = await fetchChildPhoto(photoUrl);
    return new NextResponse(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CHILD_PHOTO_STORAGE_NOT_CONFIGURED') {
        return NextResponse.json(
          { error: 'Child photo storage is not configured. Set BLOB_READ_WRITE_TOKEN on the server.' },
          { status: 503 },
        );
      }
      if (error.message === 'CHILD_PHOTO_URL_INVALID') {
        return NextResponse.json({ error: 'Child photo URL is not a valid persisted image URL' }, { status: 400 });
      }
      if (error.message === 'CHILD_PHOTO_NOT_FOUND') {
        return NextResponse.json({ error: 'Child photo not found' }, { status: 404 });
      }
    }

    console.error('Child photo fetch error:', error);
    return NextResponse.json({ error: 'Failed to load child photo' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireAuth();
    if (!PHOTO_MANAGEMENT_ROLES.includes(currentUser.role)) {
      return NextResponse.json({ error: 'You are not authorized to upload child photos' }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const childId = String(formData.get('childId') || '').trim() || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'An image file is required' }, { status: 400 });
    }

    if (file.size > CHILD_PHOTO_MAX_BYTES) {
      return NextResponse.json({ error: 'Photo must be 4 MB or smaller' }, { status: 400 });
    }

    const url = await storeChildPhoto(file, childId);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'CHILD_PHOTO_STORAGE_NOT_CONFIGURED') {
        return NextResponse.json(
          { error: 'Child photo storage is not configured. Set BLOB_READ_WRITE_TOKEN on the server.' },
          { status: 503 },
        );
      }
      if (error.message === 'CHILD_PHOTO_SIZE_INVALID') {
        return NextResponse.json({ error: 'Photo must be greater than 0 bytes and no larger than 4 MB' }, { status: 400 });
      }
      if (error.message === 'CHILD_PHOTO_TYPE_INVALID') {
        return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 });
      }
    }

    console.error('Child photo upload error:', error);
    return NextResponse.json({ error: 'Failed to upload child photo' }, { status: 500 });
  }
}
