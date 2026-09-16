'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, ClipboardPlus, Clock3 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface Complaint {
  id: string;
  category: string;
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
  reportedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

const statusLabels: Record<Complaint['status'], string> = {
  OPEN: 'Open',
  IN_REVIEW: 'In review',
  RESOLVED: 'Resolved',
};

export function ChildComplaintsSection({ childId, canManage = false }: { childId: string; canManage?: boolean }) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [category, setCategory] = useState('Behaviour');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadComplaints = async () => {
    try {
      const response = await fetch(`/api/children/${childId}/complaints`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load complaints');
      setComplaints(data.complaints || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [childId]);

  const submitComplaint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!description.trim()) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch(`/api/children/${childId}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, description }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save complaint');
      setDescription('');
      setComplaints((current) => [data.complaint, ...current]);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save complaint');
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (complaintId: string, status: Complaint['status']) => {
    const response = await fetch(`/api/children/${childId}/complaints`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complaintId, status }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update complaint');
      return;
    }
    setComplaints((current) => current.map((complaint) => complaint.id === complaintId
      ? { ...complaint, status, resolvedAt: status === 'RESOLVED' ? new Date().toISOString() : null }
      : complaint));
  };

  return (
    <section className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
      <div className="mb-4 flex items-center gap-2 border-b border-amber-100 pb-3">
        <ClipboardPlus className="h-4 w-4 text-amber-700" />
        <div>
          <span className="text-[10px] font-bold text-amber-700">CARE RECORD</span>
          <h2 className="text-sm font-bold text-slate-800">Child Complaints</h2>
        </div>
      </div>

      <form onSubmit={submitComplaint} className="grid gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
        <label className="text-xs font-semibold text-slate-600">
          Complaint type
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800">
            <option>Behaviour</option>
            <option>Bullying</option>
            <option>Care / Supervision</option>
            <option>Health</option>
            <option>Education</option>
            <option>Other</option>
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Complaint details
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} required placeholder="Write what happened..." className="mt-1 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-normal text-slate-800" />
        </label>
        <button type="submit" disabled={saving || !description.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
          <ClipboardPlus className="h-3.5 w-3.5" />
          {saving ? 'Saving...' : 'Add complaint'}
        </button>
      </form>

      {error && <p className="mt-3 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

      <div className="mt-5 space-y-3">
        {loading ? <p className="text-xs text-slate-500">Loading complaints...</p> : complaints.length === 0 ? <p className="text-xs text-slate-500">No complaints recorded for this child.</p> : complaints.map((complaint) => (
          <div key={complaint.id} className="rounded-lg border border-white bg-white p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-2">
                {complaint.status === 'RESOLVED' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : complaint.status === 'IN_REVIEW' ? <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />}
                <div>
                  <p className="text-xs font-bold text-slate-800">{complaint.category}</p>
                  <p className="mt-1 text-xs text-slate-600">{complaint.description}</p>
                  <p className="mt-2 text-[10px] text-slate-400">{formatDate(complaint.createdAt)}{complaint.reportedBy ? ` · ${complaint.reportedBy}` : ''}</p>
                </div>
              </div>
              {canManage && <select value={complaint.status} onChange={(event) => updateStatus(complaint.id, event.target.value as Complaint['status'])} className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700">
                {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
