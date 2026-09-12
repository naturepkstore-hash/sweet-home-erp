'use client';

import React, { useEffect, useState } from 'react';
import { Archive, Calendar, Check, ClipboardList, Edit2, Filter, Save, Search, X } from 'lucide-react';

interface EmployeeOption {
  id: string;
  fullName: string;
  role: string;
  department: string;
}

interface DutyOption {
  id: string;
  nameEnglish: string;
  nameUrdu: string;
  description?: string | null;
}

interface Assignment {
  id: string;
  employeeId: string;
  dutyId: string;
  dutyDate: string;
  shift: string;
  status: string;
  completedAt: string | null;
  employee: EmployeeOption;
  duty: DutyOption;
  assignedBy?: { employee?: { fullName: string } | null; email: string };
}

const shifts = [
  { value: 'MORNING', label: 'Morning' },
  { value: 'AFTERNOON', label: 'Afternoon' },
  { value: 'EVENING', label: 'Evening' },
  { value: 'NIGHT', label: 'Night' },
];

const statuses = ['ASSIGNED', 'PENDING', 'COMPLETED', 'OVERDUE', 'CANCELLED'];

function today() {
  return new Date().toISOString().split('T')[0];
}

function dateValue(value: string) {
  return new Date(value).toISOString().split('T')[0];
}

export function DutyManagement({ historyOnly = false }: { historyOnly?: boolean }) {
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [duties, setDuties] = useState<DutyOption[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [employeeId, setEmployeeId] = useState('');
  const [dutyDate, setDutyDate] = useState(today());
  const [shift, setShift] = useState('MORNING');
  const [selectedDutyIds, setSelectedDutyIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState('ASSIGNED');
  const [filters, setFilters] = useState({ employeeId: '', from: '', to: '', shift: '', status: '', dutyId: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadReferenceData = async () => {
    const [staffResponse, catalogResponse] = await Promise.all([
      fetch('/api/staff?status=ACTIVE'),
      fetch('/api/duty-catalog'),
    ]);
    const [staffData, catalogData] = await Promise.all([staffResponse.json(), catalogResponse.json()]);
    setEmployees(staffData.employees || []);
    setDuties(catalogData.duties || []);
  };

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query.set(key, value);
      });
      const response = await fetch(`/api/duty-assignments?${query.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to load assignments');
      setAssignments(data.assignments || []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([loadReferenceData(), loadAssignments()]).catch((loadError) => {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load duty data');
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [filters]);

  const toggleDuty = (id: string) => {
    setSelectedDutyIds((current) => current.includes(id) ? current.filter((dutyId) => dutyId !== id) : [...current, id]);
  };

  const resetForm = () => {
    setEditingId(null);
    setEditingStatus('ASSIGNED');
    setSelectedDutyIds([]);
    setNotes('');
    setDutyDate(today());
    setShift('MORNING');
  };

  const saveAssignment = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const response = editingId
        ? await fetch(`/api/duty-assignments/${editingId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dutyDate, shift, notes, status: editingStatus }),
          })
        : await fetch('/api/duty-assignments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, dutyDate, shift, dutyIds: selectedDutyIds, notes }),
          });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to save assignment');

      setMessage(editingId ? 'Assignment updated successfully.' : 'Duty assignment saved successfully.');
      resetForm();
      await loadAssignments();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save assignment');
    } finally {
      setSaving(false);
    }
  };

  const editAssignment = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setEditingStatus(assignment.status);
    setEmployeeId(assignment.employeeId);
    setDutyDate(dateValue(assignment.dutyDate));
    setShift(assignment.shift);
    setSelectedDutyIds([assignment.dutyId]);
    setNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const archiveAssignment = async (id: string) => {
    if (!window.confirm('Archive this duty assignment? It will remain visible in history as cancelled.')) return;
    const response = await fetch(`/api/duty-assignments/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Failed to archive assignment');
      return;
    }
    setMessage('Assignment archived.');
    await loadAssignments();
  };

  const markComplete = async (id: string) => {
    const response = await fetch(`/api/duty-assignments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'COMPLETED' }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Failed to complete assignment');
      return;
    }
    setMessage('Duty marked completed.');
    await loadAssignments();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{historyOnly ? 'Duty History' : 'Duty Assignment'}</h1>
            <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">Database-backed</span>
          </div>
          <p className="mt-0.5 text-xs text-slate-500">Assign, monitor, and review bilingual staff duties.</p>
        </div>
        {!historyOnly && <a href="/duty-history" className="text-xs font-bold text-emerald-700 hover:text-emerald-900">Open full history</a>}
      </div>

      {message && <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800"><Check className="h-4 w-4" />{message}</div>}
      {error && <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"><X className="h-4 w-4" />{error}</div>}

      {!historyOnly && (
        <form onSubmit={saveAssignment} className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3"><ClipboardList className="h-5 w-5 text-emerald-700" /><h2 className="text-sm font-bold text-slate-800">{editingId ? 'Edit Duty Assignment' : 'Create Duty Assignment'}</h2></div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-xs font-semibold text-slate-700">Employee<select required value={employeeId} disabled={Boolean(editingId)} onChange={(event) => setEmployeeId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs font-normal"><option value="">Select active employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} · {employee.role}</option>)}</select></label>
            <label className="text-xs font-semibold text-slate-700">Date<input required type="date" value={dutyDate} onChange={(event) => setDutyDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs" /></label>
            <label className="text-xs font-semibold text-slate-700">Shift<select value={shift} onChange={(event) => setShift(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs">{shifts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          </div>

          {!editingId && <div className="mt-4"><div className="mb-2 flex items-center justify-between"><div className="text-xs font-bold text-slate-700">Duties <span className="font-normal text-slate-400">({selectedDutyIds.length} selected)</span></div><div className="flex gap-2"><button type="button" onClick={() => setSelectedDutyIds(duties.map((duty) => duty.id))} className="text-[11px] font-bold text-emerald-700">Select All</button><button type="button" onClick={() => setSelectedDutyIds([])} className="text-[11px] font-bold text-slate-500">Clear All</button></div></div><div className="grid grid-cols-1 gap-2 md:grid-cols-2">{duties.map((duty) => <label key={duty.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs ${selectedDutyIds.includes(duty.id) ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}><input type="checkbox" checked={selectedDutyIds.includes(duty.id)} onChange={() => toggleDuty(duty.id)} className="mt-1 h-4 w-4 accent-emerald-700" /><span><span className="block font-bold text-slate-800">{duty.nameEnglish}</span><span className="mt-0.5 block text-right text-base text-slate-700" dir="rtl">{duty.nameUrdu}</span><span className="mt-1 block text-[11px] font-normal text-slate-500">{duty.description}</span></span></label>)}</div></div>}

          <label className="mt-4 block text-xs font-semibold text-slate-700">Notes<textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs font-normal" /></label>
          <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={resetForm} className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button><button type="submit" disabled={saving || (!editingId && (!employeeId || selectedDutyIds.length === 0))} className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Save Assignment'}</button></div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-slate-500" /><h2 className="text-sm font-bold text-slate-800">Filters</h2></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:grid-cols-6">
          <label className="text-[11px] font-semibold text-slate-600">Employee<select value={filters.employeeId} onChange={(event) => setFilters({ ...filters, employeeId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs"><option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
          <label className="text-[11px] font-semibold text-slate-600">From<input type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs" /></label>
          <label className="text-[11px] font-semibold text-slate-600">To<input type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs" /></label>
          <label className="text-[11px] font-semibold text-slate-600">Shift<select value={filters.shift} onChange={(event) => setFilters({ ...filters, shift: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs"><option value="">All shifts</option>{shifts.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
          <label className="text-[11px] font-semibold text-slate-600">Status<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs"><option value="">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label className="text-[11px] font-semibold text-slate-600">Duty<select value={filters.dutyId} onChange={(event) => setFilters({ ...filters, dutyId: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs"><option value="">All duties</option>{duties.map((duty) => <option key={duty.id} value={duty.id}>{duty.nameEnglish}</option>)}</select></label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs"><div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-slate-700"><tr><th className="px-4 py-3">Employee</th><th className="px-4 py-3">Duty</th><th className="px-4 py-3">Date / Shift</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Assigned By</th><th className="px-4 py-3">Completed At</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading duty records...</td></tr> : assignments.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No duty assignments match these filters.</td></tr> : assignments.map((assignment) => <tr key={assignment.id} className="hover:bg-slate-50"><td className="px-4 py-3"><div className="font-bold text-slate-900">{assignment.employee.fullName}</div><div className="text-[11px] text-slate-500">{assignment.employee.role}</div></td><td className="px-4 py-3"><div className="font-bold text-slate-800">{assignment.duty.nameEnglish}</div><div className="text-right text-base text-slate-700" dir="rtl">{assignment.duty.nameUrdu}</div></td><td className="px-4 py-3"><div>{new Date(assignment.dutyDate).toLocaleDateString()}</div><div className="text-[11px] text-slate-500">{shifts.find((item) => item.value === assignment.shift)?.label || assignment.shift}</div></td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${assignment.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : assignment.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : assignment.status === 'CANCELLED' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'}`}>{assignment.status}</span></td><td className="px-4 py-3 text-slate-600">{assignment.assignedBy?.employee?.fullName || assignment.assignedBy?.email || '-'}</td><td className="px-4 py-3 text-slate-600">{assignment.completedAt ? new Date(assignment.completedAt).toLocaleString() : '-'}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-1"><button onClick={() => editAssignment(assignment)} title="Edit assignment" className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"><Edit2 className="h-3.5 w-3.5" /></button>{assignment.status !== 'COMPLETED' && assignment.status !== 'CANCELLED' && <button onClick={() => markComplete(assignment.id)} title="Mark complete" className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"><Check className="h-3.5 w-3.5" /></button>}{assignment.status !== 'CANCELLED' && <button onClick={() => archiveAssignment(assignment.id)} title="Archive assignment" className="rounded-md p-1.5 text-red-600 hover:bg-red-50"><Archive className="h-3.5 w-3.5" /></button>}</div></td></tr>)}</tbody></table></div></div>
    </div>
  );
}
