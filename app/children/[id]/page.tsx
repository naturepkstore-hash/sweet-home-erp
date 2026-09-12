import React from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { requireModuleAccess } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AppLayout } from '@/components/layout/AppLayout';
import { formatDate } from '@/lib/utils';
import { childPhotoDisplaySrc } from '@/lib/child-photo';

function calculateAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const monthDelta = today.getMonth() - dateOfBirth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dateOfBirth.getDate())) age -= 1;
  return Math.max(0, age);
}

function Section({ label, title, children, tone = 'slate' }: { label: string; title: string; children: React.ReactNode; tone?: string }) {
  return <section className={`rounded-xl border p-5 shadow-xs ${tone === 'red' ? 'border-red-200 bg-red-50/40' : 'border-slate-200 bg-white'}`}><div className="mb-3 flex items-center gap-2 border-b border-slate-100 pb-3"><span className={`text-[10px] font-bold ${tone === 'red' ? 'text-red-700' : 'text-emerald-700'}`}>{label}</span><h2 className="text-sm font-bold text-slate-800">{title}</h2></div>{children}</section>;
}

export default async function ChildProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireModuleAccess('children');
  const { id } = await params;
  let child = null;

  try {
    child = await prisma.child.findUnique({
      where: { id },
      include: {
        room: true,
        bed: true,
        class: true,
        motherMaid: { select: { id: true, fullName: true } },
        medicalRecord: true,
        medicalVisits: { orderBy: { visitDate: 'desc' }, take: 5 },
        educationRecords: { include: { class: true }, orderBy: { createdAt: 'desc' }, take: 5 },
        attendances: { orderBy: { date: 'desc' }, take: 10 },
      },
    });
  } catch (err) {
    console.warn('Could not load child record from database:', err);
  }

  if (!child) notFound();
  if (user.role === Role.MOTHER_MAID && child.motherMaidId && child.motherMaidId !== user.employeeId) {
    redirect('/dashboard?unauthorized=1');
  }


  const attendancePresent = child.attendances.filter((record) => record.status === 'PRESENT').length;

  return <AppLayout><div className="space-y-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><Link href="/children" className="text-xs font-semibold text-emerald-700">Back to Children Management</Link><h1 className="mt-1 text-xl font-bold text-slate-900">Child Profile</h1><p className="text-xs text-slate-500">Authorized consolidated view of this child record and linked modules.</p></div><Link href="/children" className="rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white">Edit in Children Management</Link></div>

    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex flex-col gap-5 md:flex-row md:items-center"><div className="flex h-32 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700">{childPhotoDisplaySrc(child.photo) ? <img src={childPhotoDisplaySrc(child.photo)!} alt={`${child.fullName} profile`} className="h-full w-full object-cover" /> : <span className="text-2xl font-extrabold text-emerald-300">SH</span>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-2xl font-extrabold text-slate-900">{child.fullName}</h2><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-800">{child.status}</span></div><p className="mt-1 text-sm font-bold text-emerald-700">{child.childId} · Admission {child.admissionNo}</p><div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><span className="block text-slate-400">Age</span><strong>{calculateAge(child.dateOfBirth)} years</strong></div><div><span className="block text-slate-400">Gender</span><strong>{child.gender}</strong></div><div><span className="block text-slate-400">Date of Birth</span><strong>{formatDate(child.dateOfBirth)}</strong></div><div><span className="block text-slate-400">Admission Date</span><strong>{formatDate(child.admissionDate)}</strong></div></div></div></div></section>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><Section label="BIO" title="Basic & Guardian Information"><dl className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-2"><div><dt className="text-slate-400">Father / Guardian</dt><dd className="font-semibold text-slate-800">{child.fatherGuardianName}</dd></div><div><dt className="text-slate-400">Guardian Name</dt><dd className="font-semibold text-slate-800">{child.guardianName || 'Not recorded'}</dd></div><div><dt className="text-slate-400">Relationship</dt><dd className="font-semibold text-slate-800">{child.guardianRelation || 'Not recorded'}</dd></div><div><dt className="text-slate-400">Contact</dt><dd className="font-semibold text-slate-800">{child.guardianContact || 'Not recorded'}</dd></div><div className="sm:col-span-2"><dt className="text-slate-400">Address / Area</dt><dd className="font-semibold text-slate-800">{child.address || 'Not recorded'}</dd></div></dl></Section><Section label="ADM" title="Admission & Placement"><dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-slate-400">Class</dt><dd className="font-semibold">{child.class?.name || 'Unassigned'}</dd></div><div><dt className="text-slate-400">Hostel Room</dt><dd className="font-semibold">{child.room?.roomNumber || 'Unassigned'}</dd></div><div><dt className="text-slate-400">Bed</dt><dd className="font-semibold">{child.bed?.bedNumber || 'Unassigned'}</dd></div><div><dt className="text-slate-400">Mother Maid</dt><dd className="font-semibold">{child.motherMaid?.fullName || 'Unassigned'}</dd></div><div className="col-span-2"><dt className="text-slate-400">Dietary Notes</dt><dd className="font-semibold">{child.dietaryNotes || 'No special dietary notes'}</dd></div></dl></Section></div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3"><Section label="MED" title="Medical Summary" tone="red">{child.medicalRecord ? <dl className="space-y-2 text-xs"><div className="flex justify-between"><dt className="text-slate-500">Blood Group</dt><dd className="font-bold text-red-800">{child.medicalRecord.bloodGroup || 'Not recorded'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Allergies</dt><dd className="font-semibold">{child.medicalRecord.allergies || 'None recorded'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Height</dt><dd className="font-semibold">{child.medicalRecord.heightCm ? `${child.medicalRecord.heightCm} cm` : 'Not recorded'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Weight</dt><dd className="font-semibold">{child.medicalRecord.weightKg ? `${child.medicalRecord.weightKg} kg` : 'Not recorded'}</dd></div></dl> : <p className="text-xs text-slate-500">No medical profile recorded.</p>}<Link href={`/medical?childId=${child.id}`} className="mt-4 inline-block text-xs font-bold text-red-700">Open Medical Module</Link></Section><Section label="EDU" title="Education Summary">{child.educationRecords.length ? <div className="space-y-2 text-xs">{child.educationRecords.map((record) => <div key={record.id} className="flex items-center justify-between border-b border-slate-100 pb-2"><span><strong>{record.examTerm}</strong><span className="block text-slate-500">{record.academicYear}</span></span><span className="font-bold text-blue-800">{record.grade} · {record.obtainedMarks}/{record.totalMarks}</span></div>)}</div> : <p className="text-xs text-slate-500">No academic records recorded.</p>}<Link href={`/education?childId=${child.id}`} className="mt-4 inline-block text-xs font-bold text-blue-700">Open Education Module</Link></Section><Section label="ATT" title="Attendance Summary"><div className="text-3xl font-extrabold text-emerald-800">{attendancePresent}<span className="ml-1 text-xs font-semibold text-slate-400">present recently</span></div><p className="mt-2 text-xs text-slate-500">Showing the latest {child.attendances.length} attendance records.</p><Link href={`/attendance?childId=${child.id}`} className="mt-4 inline-block text-xs font-bold text-amber-700">Open Attendance Module</Link></Section></div>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2"><Section label="VIS" title="Recent Medical Visits">{child.medicalVisits.length ? <div className="space-y-2 text-xs">{child.medicalVisits.map((visit) => <div key={visit.id} className="border-b border-slate-100 pb-2"><div className="flex justify-between font-bold"><span>{visit.diagnosis}</span><span className="text-slate-400">{formatDate(visit.visitDate)}</span></div><div className="text-slate-500">Dr. {visit.doctorName} · {visit.treatment || 'No treatment recorded'}</div></div>)}</div> : <p className="text-xs text-slate-500">No medical visits recorded.</p>}</Section><Section label="INFO" title="Psychological & Exit Records"><p className="text-xs text-slate-500">Psychological examination and withdrawal/exit records are not implemented in the current ERP schema.</p></Section></div>
  </div></AppLayout>;
}
