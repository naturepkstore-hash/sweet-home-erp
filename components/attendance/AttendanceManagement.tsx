'use client';

import React, { useState, useEffect } from 'react';
import {
  Baby,
  Users,
  Calendar,
  Download,
  Printer,
  CheckCircle,
  Save,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';

interface AttendanceRow {
  id: string; // childId or employeeId
  name: string;
  identifier: string; // childId or role
  subtext: string; // class/bed or department
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE';
  remarks: string;
}

export function AttendanceManagement() {
  const [activeTab, setActiveTab] = useState<'CHILD' | 'EMPLOYEE'>('CHILD');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'CHILD') {
        const [childRes, attRes] = await Promise.all([
          fetch('/api/children?status=ACTIVE'),
          fetch(`/api/attendance?date=${selectedDate}&type=CHILD`),
        ]);

        const childData = await childRes.json();
        const attData = await attRes.json();

        const attMap: Record<string, { status: string; remarks: string }> = {};
        if (attData.success && Array.isArray(attData.attendances)) {
          attData.attendances.forEach((a: any) => {
            if (a.childId) attMap[a.childId] = { status: a.status, remarks: a.remarks || '' };
          });
        }

        const formatted: AttendanceRow[] = (childData.children || []).map((c: any) => ({
          id: c.id,
          name: c.fullName,
          identifier: c.childId,
          subtext: `${c.class?.name || 'Class'} • ${c.bed?.bedNumber || 'Bed'}`,
          status: (attMap[c.id]?.status as any) || 'PRESENT',
          remarks: attMap[c.id]?.remarks || '',
        }));

        setRows(formatted);
      } else {
        const [staffRes, attRes] = await Promise.all([
          fetch('/api/staff?status=ACTIVE'),
          fetch(`/api/attendance?date=${selectedDate}&type=EMPLOYEE`),
        ]);

        const staffData = await staffRes.json();
        const attData = await attRes.json();

        const attMap: Record<string, { status: string; remarks: string }> = {};
        if (attData.success && Array.isArray(attData.attendances)) {
          attData.attendances.forEach((a: any) => {
            if (a.employeeId) attMap[a.employeeId] = { status: a.status, remarks: a.remarks || '' };
          });
        }

        const formatted: AttendanceRow[] = (staffData.employees || []).map((e: any) => ({
          id: e.id,
          name: e.fullName,
          identifier: e.role,
          subtext: e.department,
          status: (attMap[e.id]?.status as any) || 'PRESENT',
          remarks: attMap[e.id]?.remarks || '',
        }));

        setRows(formatted);
      }
    } catch (err) {
      console.error('Attendance load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, selectedDate]);

  const handleStatusChange = (id: string, status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE') => {
    setRows(rows.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const handleRemarksChange = (id: string, remarks: string) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, remarks } : r)));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'LATE') => {
    setRows(rows.map((r) => ({ ...r, status })));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          type: activeTab,
          records: rows.map((r) => ({ id: r.id, status: r.status, remarks: r.remarks })),
        }),
      });

      if (res.ok) {
        setSuccessMsg(`Official ${activeTab === 'CHILD' ? 'Children' : 'Staff'} Attendance Saved Successfully!`);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const presentCount = rows.filter((r) => r.status === 'PRESENT').length;
  const absentCount = rows.filter((r) => r.status === 'ABSENT').length;
  const leaveCount = rows.filter((r) => r.status === 'LEAVE').length;
  const lateCount = rows.filter((r) => r.status === 'LATE').length;

  const exportExcel = () => {
    const exportData = rows.map((r, idx) => ({
      'Sr #': idx + 1,
      'Date': selectedDate,
      'Name': r.name,
      'Designation / ID': r.identifier,
      'Class / Department': r.subtext,
      'Attendance Status': r.status,
      'Remarks': r.remarks || '-',
    }));

    exportToExcelFile(exportData, `Sweet_Home_Multan_${activeTab}_Attendance_${selectedDate}`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Official Log
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional attendance tracking for Sweet Home resident children and 23 duty staff members.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Register</span>
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* Control Bar: Tabs, Date Picker, Quick Batch Buttons */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('CHILD')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CHILD'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Baby className="w-4 h-4" />
            <span>Children Attendance</span>
          </button>
          <button
            onClick={() => setActiveTab('EMPLOYEE')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'EMPLOYEE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Attendance (23 Posts)</span>
          </button>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Calendar className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Attendance Date:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Batch Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-400 font-medium">Batch:</span>
          <button
            onClick={() => markAll('PRESENT')}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
          >
            All Present
          </button>
          <button
            onClick={() => markAll('LEAVE')}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
          >
            All Leave
          </button>
        </div>
      </div>

      {/* Summary Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Present</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-0.5">{presentCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-xs text-red-700 font-bold uppercase tracking-wider">Absent</div>
          <div className="text-2xl font-extrabold text-red-800 mt-0.5">{absentCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Leave</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-0.5">{leaveCount}</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-xs">
          <div className="text-xs text-blue-700 font-bold uppercase tracking-wider">Late</div>
          <div className="text-2xl font-extrabold text-blue-800 mt-0.5">{lateCount}</div>
        </div>
      </div>

      {/* Attendance Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12">#</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Identifier / Role</th>
                <th className="px-4 py-3">Class / Dept</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Loading attendance roster...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No active records found.
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{r.name}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-800">{r.identifier}</td>
                    <td className="px-4 py-3 text-slate-500">{r.subtext}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, 'PRESENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            r.status === 'PRESENT'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-emerald-50 text-slate-600'
                          }`}
                        >
                          P
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, 'ABSENT')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            r.status === 'ABSENT'
                              ? 'bg-red-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-red-50 text-slate-600'
                          }`}
                        >
                          A
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, 'LEAVE')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            r.status === 'LEAVE'
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-amber-50 text-slate-600'
                          }`}
                        >
                          L
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusChange(r.id, 'LATE')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer ${
                            r.status === 'LATE'
                              ? 'bg-blue-700 text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-blue-50 text-slate-600'
                          }`}
                        >
                          T
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Optional remarks..."
                        value={r.remarks}
                        onChange={(e) => handleRemarksChange(r.id, e.target.value)}
                        className="w-full text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-md outline-hidden focus:bg-white focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
