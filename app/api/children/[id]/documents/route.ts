import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { fetchChildDocument, removeChildDocument, storeChildDocument } from '@/lib/child-document';

const viewRoles: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK, Role.MOTHER_MAID];
const manageRoles: Role[] = [Role.INCHARGE, Role.ACCOUNT_ASSISTANT, Role.CLERK];

async function authorized(id: string, manage = false) {
  const user = await requireAuth();
  const child = await prisma.child.findUnique({ where: { id }, select: { id: true, fullName: true, childId: true, motherMaidId: true } });
  if (!child) throw new Error('NOT_FOUND');
  const allowed = manage ? manageRoles : viewRoles;
  if (!allowed.includes(user.role) || (user.role === Role.MOTHER_MAID && child.motherMaidId !== user.employeeId)) throw new Error('UNAUTHORIZED');
  return { user, child };
}

function failure(error: unknown) {
  if (error instanceof Error && error.message === 'NOT_FOUND') return NextResponse.json({ error: 'Child not found' }, { status: 404 });
  if (error instanceof Error && error.message === 'UNAUTHORIZED') return NextResponse.json({ error: 'Unauthorized to access child documents' }, { status: 403 });
  if (error instanceof Error && error.message === 'CHILD_DOCUMENT_STORAGE_NOT_CONFIGURED') return NextResponse.json({ error: 'Document storage is not configured' }, { status: 503 });
  if (error instanceof Error && error.message === 'CHILD_DOCUMENT_TYPE_INVALID') return NextResponse.json({ error: 'Only PDF, JPEG, PNG, and WebP documents are allowed' }, { status: 400 });
  if (error instanceof Error && error.message === 'CHILD_DOCUMENT_SIZE_INVALID') return NextResponse.json({ error: 'Document must be greater than 0 and no larger than 8 MB' }, { status: 400 });
  console.error('Child document error:', error);
  return NextResponse.json({ error: 'Failed to process child document' }, { status: 500 });
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await authorized(id);
    const documentId = new URL(request.url).searchParams.get('documentId');
    if (documentId) {
      const document = await prisma.childDocument.findFirst({ where: { id: documentId, childId: id } });
      if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
      const result = await fetchChildDocument(document.fileUrl);
      return new NextResponse(result.stream, { headers: { 'Content-Type': result.blob.contentType || 'application/octet-stream', 'Content-Disposition': `inline; filename="${document.title}"`, 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
    }
    const documents = await prisma.childDocument.findMany({ where: { childId: id }, orderBy: { uploadedAt: 'desc' }, select: { id: true, title: true, documentType: true, fileSize: true, uploadedAt: true } });
    return NextResponse.json({ success: true, documents });
  } catch (error) { return failure(error); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user, child } = await authorized(id, true);
    const formData = await request.formData();
    const file = formData.get('file');
    const title = String(formData.get('title') || '').trim();
    const documentType = String(formData.get('documentType') || 'OTHER').trim();
    if (!(file instanceof File) || !title) return NextResponse.json({ error: 'Document title and file are required' }, { status: 400 });
    const fileUrl = await storeChildDocument(file, id);
    const document = await prisma.childDocument.create({ data: { childId: id, title, documentType, fileUrl, fileSize: `${Math.round(file.size / 1024)} KB` } });
    await logAudit({ userId: user.id, userEmail: user.email, action: 'UPLOAD_CHILD_DOCUMENT', module: 'CHILDREN', recordId: document.id, details: `Uploaded ${documentType} document for ${child.fullName} (${child.childId})` });
    return NextResponse.json({ success: true, document: { id: document.id, title: document.title, documentType: document.documentType, fileSize: document.fileSize, uploadedAt: document.uploadedAt } }, { status: 201 });
  } catch (error) { return failure(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { user } = await authorized(id, true);
    const documentId = new URL(request.url).searchParams.get('documentId');
    if (!documentId) return NextResponse.json({ error: 'Document id is required' }, { status: 400 });
    const document = await prisma.childDocument.findFirst({ where: { id: documentId, childId: id } });
    if (!document) return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    await removeChildDocument(document.fileUrl);
    await prisma.childDocument.delete({ where: { id: document.id } });
    await logAudit({ userId: user.id, userEmail: user.email, action: 'DELETE_CHILD_DOCUMENT', module: 'CHILDREN', recordId: document.id, details: `Deleted child document ${document.title}` });
    return NextResponse.json({ success: true });
  } catch (error) { return failure(error); }
}
