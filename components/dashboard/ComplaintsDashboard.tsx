'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Clock3, ClipboardList } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export interface DashboardComplaint {
  id: string;
  childId: string;
  childName: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  reportedBy: string | null;
  createdAt: Date | string;
}

export function ComplaintsDashboard({ complaints, canManage }: { complaints: DashboardComplaint[]; canManage: boolean }) {
  const [items, setItems] = useState(complaints);
  const [error, setError] = useState('');

  const updateStatus = async (complaint: DashboardComplaint, status: DashboardComplaint['status']) => {
    const response = await fetch(`/api/children/${complaint.childId}/complaints`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintId: complaint.id, status }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update complaint');
      return;
    }
    setItems((current) => current.map((item) => item.id === complaint.id ? { ...item, status } : item));
  };

  return (
    <section className="rounded-xl border border-amber-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-amber-700" />
          <div>
            <span className="text-[10px] font-bold text-amber-700">CHILD CARE</span>
            <h2 className="text-sm font-bold text-slate-800">Recent Child Complaints</h2>
          </div>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-800">{items.filter((item) => item.status !== 'RESOLVED').length} pending</span>
      </div>
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}
      {items.length === 0 ? <p className="py-5 text-xs text-slate-500">No child complaints recorded.</p> : <div className="mt-3 space-y-2.5">
        {items.map((complaint) => (
          <div key={complaint.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-2">
                {complaint.status === 'RESOLVED' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : complaint.status === 'IN_REVIEW' ? <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
                <div>
                  <Link href={`/children/${complaint.childId}`} className="text-xs font-bold text-emerald-800 hover:underline">{complaint.childName}</Link>
                  <p className="text-[10px] font-bold uppercase text-slate-400">{complaint.category} · {formatDate(complaint.createdAt)}</p>
                  <p className="mt-1 text-xs text-slate-700">{complaint.description}</p>
                  {complaint.reportedBy && <p className="mt-1 text-[10px] text-slate-400">Reported by {complaint.reportedBy}</p>}
                </div>
              </div>
              {canManage && <select value={complaint.status} onChange={(event) => updateStatus(complaint, event.target.value as DashboardComplaint['status'])} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700">
                <option value="OPEN">Open</option>
                <option value="IN_REVIEW">In review</option>
                <option value="RESOLVED">Resolved</option>
              </select>}
            </div>
          </div>
        ))}
      </div>}
    </section>
  );
}
