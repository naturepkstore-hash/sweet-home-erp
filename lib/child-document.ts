import { del, get, put } from '@vercel/blob';

export const CHILD_DOCUMENT_MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

export function assertChildDocumentStorageConfigured() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('CHILD_DOCUMENT_STORAGE_NOT_CONFIGURED');
}

export function assertChildDocumentType(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) throw new Error('CHILD_DOCUMENT_TYPE_INVALID');
  if (file.size <= 0 || file.size > CHILD_DOCUMENT_MAX_BYTES) throw new Error('CHILD_DOCUMENT_SIZE_INVALID');
}

export function isChildDocumentUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname.endsWith('.blob.vercel-storage.com'); } catch { return false; }
}

export async function storeChildDocument(file: File, childId: string) {
  assertChildDocumentStorageConfigured();
  assertChildDocumentType(file);
  const extension = file.type === 'application/pdf' ? 'pdf' : file.type.split('/')[1];
  const blob = await put(`children/${childId}/documents/${crypto.randomUUID()}.${extension}`, file, { access: 'private', addRandomSuffix: false, contentType: file.type });
  return blob.url;
}

export async function fetchChildDocument(url: string) {
  assertChildDocumentStorageConfigured();
  if (!isChildDocumentUrl(url)) throw new Error('CHILD_DOCUMENT_URL_INVALID');
  const result = await get(url, { access: 'private' });
  if (!result || result.statusCode !== 200 || !result.stream) throw new Error('CHILD_DOCUMENT_NOT_FOUND');
  return result;
}

export async function removeChildDocument(url: string) {
  if (isChildDocumentUrl(url) && process.env.BLOB_READ_WRITE_TOKEN) await del(url, { token: process.env.BLOB_READ_WRITE_TOKEN });
}
