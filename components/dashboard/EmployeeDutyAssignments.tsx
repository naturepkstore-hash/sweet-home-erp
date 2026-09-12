'use client';

import React, { useEffect, useState } from 'react';
import { Check, ClipboardList } from 'lucide-react';

interface Assignment {
  id: string;
  dutyDate: string;
  shift: string;
  status: string;
  completedAt: string | null;
  duty: { nameEnglish: string; nameUrdu: string };
}

export function EmployeeDutyAssignments() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [error, setError] = useState('');

  const loadAssignments = async () => {
    try {
      const response = await fetch('/api/duty-assignments');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load assigned duties');
      setAssignments(data.assignments || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load assigned duties');
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const markComplete = async (id: string) => {
    const response = await fetch(`/api/duty-assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || 'Failed to complete duty');
      return;
    }
    await loadAssignments();
  };

  return (
    <section className="rounded-xl border border-emerald-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2"><ClipboardList className="h-5 w-5 text-emerald-700" /><h2 className="text-sm font-bold text-slate-800">Assigned Duties</h2></div>
        <span className="text-xs font-bold text-emerald-700">{assignments.filter((assignment) => assignment.status === 'COMPLETED').length} / {assignments.length} complete</span>
      </div>
      {error && <p className="mt-3 text-xs font-semibold text-red-700">{error}</p>}
      {assignments.length === 0 ? <p className="mt-4 text-xs text-slate-500">No database-assigned duties for the current date range.</p> : <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">{assignments.map((assignment) => <div key={assignment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3"><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-800">{assignment.duty.nameEnglish}</div><div className="mt-0.5 text-right text-base text-slate-700" dir="rtl">{assignment.duty.nameUrdu}</div><div className="mt-1 text-[11px] text-slate-500">Date: {new Date(assignment.dutyDate).toLocaleDateString()} · Shift: {assignment.shift}</div></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${assignment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>{assignment.status}</span></div>{assignment.status !== 'COMPLETED' && assignment.status !== 'CANCELLED' && <button onClick={() => markComplete(assignment.id)} className="mt-3 flex items-center gap-1 rounded-md bg-emerald-700 px-2.5 py-1.5 text-[11px] font-bold text-white"><Check className="h-3.5 w-3.5" />Mark Complete</button>}</div>)}</div>}
    </section>
  );
}
