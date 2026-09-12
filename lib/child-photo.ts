import { del, get, put } from '@vercel/blob';

export const CHILD_PHOTO_MAX_BYTES = 4 * 1024 * 1024;

const PHOTO_SIGNATURES = [
  { mimeType: 'image/jpeg', extension: 'jpg', matches: (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff },
  { mimeType: 'image/png', extension: 'png', matches: (bytes: Uint8Array) => bytes.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10' },
  { mimeType: 'image/webp', extension: 'webp', matches: (bytes: Uint8Array) => new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP' },
] as const;

export function detectChildPhotoType(bytes: Uint8Array) {
  return PHOTO_SIGNATURES.find((signature) => signature.matches(bytes));
}

export function assertChildPhotoStorageConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('CHILD_PHOTO_STORAGE_NOT_CONFIGURED');
  }
}

export function isPersistedChildPhotoUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

export function childPhotoDisplaySrc(photo: string | null | undefined) {
  if (!photo || !isPersistedChildPhotoUrl(photo)) return null;
  return `/api/children/photo?url=${encodeURIComponent(photo)}`;
}

export async function fetchChildPhoto(photoUrl: string) {
  assertChildPhotoStorageConfigured();
  if (!isPersistedChildPhotoUrl(photoUrl)) {
    throw new Error('CHILD_PHOTO_URL_INVALID');
  }

  const result = await get(photoUrl, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) {
    throw new Error('CHILD_PHOTO_NOT_FOUND');
  }

  return result;
}

export async function storeChildPhoto(file: File, childId?: string) {
  assertChildPhotoStorageConfigured();

  if (file.size <= 0 || file.size > CHILD_PHOTO_MAX_BYTES) {
    throw new Error('CHILD_PHOTO_SIZE_INVALID');
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const signature = detectChildPhotoType(buffer);
  if (!signature) {
    throw new Error('CHILD_PHOTO_TYPE_INVALID');
  }

  const path = `children/${childId || 'pending'}/${crypto.randomUUID()}.${signature.extension}`;
  const blob = await put(path, new Blob([buffer], { type: signature.mimeType }), {
    access: 'private',
    addRandomSuffix: false,
    contentType: signature.mimeType,
  });

  return blob.url;
}

export async function removeChildPhoto(photoUrl: string | null | undefined) {
  if (!photoUrl || !process.env.BLOB_READ_WRITE_TOKEN) return;
  try {
    await del(photoUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
  } catch (error) {
    console.error('Failed to remove child photo from blob storage:', error);
  }
}
