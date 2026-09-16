'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, FilePlus2, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  employee?: { id: string; fullName: string; role: string; department: string };
}
interface StaffMember { id: string; fullName: string; role: string; department: string }

export function LeaveManagement({ canReview }: { canReview: boolean }) {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [form, setForm] = useState({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [message, setMessage] = useState('');

  const load = async () => {
    const response = await fetch('/api/leave');
    const data = await response.json();
    if (response.ok) setRequests(data.requests || []);
  };

  useEffect(() => {
    load();
    if (canReview) fetch('/api/staff?status=ACTIVE').then((response) => response.json()).then((data) => setStaff(data.employees || []));
  }, [canReview]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    const response = await fetch('/api/leave', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Unable to submit leave'); return; }
    setMessage('Leave request submitted for review.');
    setForm({ employeeId: '', leaveType: 'ANNUAL', startDate: '', endDate: '', reason: '' });
    load();
  };

  const review = async (id: string, status: string) => {
    const response = await fetch('/api/leave', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error || 'Unable to update request'); return; }
    setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
  };

  const visibleRequests = requests.filter((request) => (staffFilter === 'ALL' || request.employee?.id === staffFilter) && (statusFilter === 'ALL' || request.status === statusFilter));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Staff & HR</p><h1 className="text-xl font-bold text-slate-900">Leave Management</h1><p className="mt-1 text-xs text-slate-500">Submit, review, and track staff leave requests.</p></div><CalendarDays className="h-8 w-8 text-emerald-700" /></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={submit} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><FilePlus2 className="h-4 w-4 text-emerald-700" /><h2 className="text-sm font-bold text-slate-800">New Leave Request</h2></div><div className="space-y-3">
          {canReview && <label className="block text-xs font-semibold text-slate-600">Staff member<select required value={form.employeeId} onChange={(event) => setForm({ ...form, employeeId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option value="">Select staff member</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName} · {member.role}</option>)}</select></label>}
          <label className="block text-xs font-semibold text-slate-600">Leave type<select value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs"><option>ANNUAL</option><option>SICK</option><option>EMERGENCY</option><option>MATERNITY</option><option>UNPAID</option></select></label>
          <label className="block text-xs font-semibold text-slate-600">Start date<input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
          <label className="block text-xs font-semibold text-slate-600">End date<input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
          <label className="block text-xs font-semibold text-slate-600">Reason<textarea required rows={4} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-xs" /></label>
          <button className="w-full rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white">Submit request</button>{message && <p className="text-xs font-semibold text-emerald-700">{message}</p>}
        </div></form>
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3"><h2 className="text-sm font-bold text-slate-800">Leave Requests</h2><div className="flex gap-2"><select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-[10px]"><option value="ALL">All staff</option>{staff.map((member) => <option key={member.id} value={member.id}>{member.fullName}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="rounded-md border border-slate-300 px-2 py-1 text-[10px]"><option value="ALL">All statuses</option><option>PENDING</option><option>APPROVED</option><option>REJECTED</option><option>CANCELLED</option></select></div></div><div className="space-y-3">{visibleRequests.length === 0 ? <p className="text-xs text-slate-500">No leave requests found for this filter.</p> : visibleRequests.map((request) => <div key={request.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold text-slate-800">{request.employee?.fullName || 'My request'} <span className="font-normal text-slate-400">· {request.employee?.department || 'Staff'} · {request.leaveType}</span></p><p className="mt-1 text-[11px] text-slate-600">{formatDate(request.startDate)} to {formatDate(request.endDate)}</p><p className="mt-1 text-xs text-slate-600">{request.reason}</p></div><Status status={request.status} /></div>{canReview && request.status === 'PENDING' && <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3"><button onClick={() => review(request.id, 'APPROVED')} className="flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1.5 text-[10px] font-bold text-white"><CheckCircle2 className="h-3 w-3" />Approve</button><button onClick={() => review(request.id, 'REJECTED')} className="flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-[10px] font-bold text-white"><XCircle className="h-3 w-3" />Reject</button></div>}</div>)}</div></section>
      </div>
    </div>
  );
}

function Status({ status }: { status: string }) { return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}><Clock3 className="h-3 w-3" />{status}</span>; }
