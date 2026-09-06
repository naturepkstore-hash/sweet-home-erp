'use client';

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Award,
  Download,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface EducationRecordItem {
  id: string;
  academicYear: string;
  schoolName: string;
  examTerm: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks: string | null;
  createdAt: string;
  child: {
    id: string;
    childId: string;
    fullName: string;
  };
  class?: {
    id: string;
    name: string;
  } | null;
}

export function EducationManagement() {
  const [classes, setClasses] = useState<{ id: string; name: string; children: any[] }[]>([]);
  const [records, setRecords] = useState<EducationRecordItem[]>([]);
  const [children, setChildren] = useState<{ id: string; fullName: string; childId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Result Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    childId: '',
    classId: '',
    academicYear: '2025-2026',
    schoolName: 'Sweet Home Model School Multan',
    examTerm: 'Mid Term Exam 2026',
    totalMarks: '500',
    obtainedMarks: '',
    remarks: 'Consistent academic effort and discipline.',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clsRes, recRes, childRes] = await Promise.all([
        fetch('/api/education/classes'),
        fetch('/api/education/records'),
        fetch('/api/children?status=ACTIVE'),
      ]);

      const clsData = await clsRes.json();
      const recData = await recRes.json();
      const childData = await childRes.json();

      if (clsData.success) setClasses(clsData.classes || []);
      if (recData.success) setRecords(recData.records || []);
      if (childData.success) setChildren(childData.children || []);
    } catch (err) {
      console.error('Fetch education data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/education/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save exam score');
        return;
      }

      setFormSuccess('Academic result saved successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving exam record.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter(
    (r) =>
      r.child.fullName.toLowerCase().includes(search.toLowerCase()) ||
      r.child.childId.toLowerCase().includes(search.toLowerCase()) ||
      r.examTerm.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const exportData = filteredRecords.map((r, idx) => ({
      'Sr #': idx + 1,
      'Child Name': r.child.fullName,
      'Child ID': r.child.childId,
      'Class': r.class?.name || '-',
      'School / Institution': r.schoolName,
      'Academic Term': r.examTerm,
      'Total Marks': r.totalMarks,
      'Obtained Marks': r.obtainedMarks,
      'Percentage': `${Math.round((r.obtainedMarks / r.totalMarks) * 100)}%`,
      'Grade': r.grade,
      'Remarks': r.remarks || '-',
      'Date Logged': formatDate(r.createdAt),
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Academic_Results');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Education & Academic Tracking</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {classes.length} Academic Classes
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal schooling management, grade progress books, examination marks, and academic evaluations for all children.
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Exam Result</span>
          </button>
        </div>
      </div>

      {/* Classes Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-center">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center justify-center mx-auto mb-2">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="font-bold text-xs text-slate-900">{cls.name}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              {cls.children?.length || 0} Students
            </div>
          </div>
        ))}
      </div>

      {/* Grade Book & Exam Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Official Student Exam Grade Book</h2>
            <p className="text-xs text-slate-500">Historical examination term results & grades</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or term..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Class & School</th>
                <th className="px-4 py-3">Exam Term</th>
                <th className="px-4 py-3">Obtained / Total</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading academic records...
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No academic records found.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => {
                  const percentage = Math.round((r.obtainedMarks / r.totalMarks) * 100);

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{r.child.fullName}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold">{r.child.childId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">{r.class?.name || 'Class 4'}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{r.schoolName}</div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">{r.examTerm}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {r.obtainedMarks} <span className="text-slate-400 font-normal">/ {r.totalMarks}</span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-800">{percentage}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.grade.startsWith('A')
                              ? 'bg-emerald-100 text-emerald-800'
                              : r.grade === 'B'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Grade {r.grade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-[11px] max-w-xs">{r.remarks || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Exam Score Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Record Student Exam Result</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveRecord} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Resident Child *</label>
                <select
                  required
                  value={formData.childId}
                  onChange={(e) => setFormData({ ...formData, childId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="">-- Choose Child --</option>
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.childId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Exam Term *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mid Term Exam 2026"
                    value={formData.examTerm}
                    onChange={(e) => setFormData({ ...formData, examTerm: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Marks *</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Obtained Marks *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 425"
                    value={formData.obtainedMarks}
                    onChange={(e) => setFormData({ ...formData, obtainedMarks: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher / Warden Remarks</label>
                <input
                  type="text"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Academic Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
