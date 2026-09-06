'use client';

import React, { useState, useEffect } from 'react';
import {
  HeartPulse,
  Search,
  Stethoscope,
  Download,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface MedicalProfileItem {
  id: string;
  bloodGroup: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  heightCm: number | null;
  weightKg: number | null;
  emergencyNotes: string | null;
  child: {
    id: string;
    childId: string;
    fullName: string;
    dateOfBirth: string;
    room?: { roomNumber: string } | null;
    bed?: { bedNumber: string } | null;
  };
}

interface MedicalVisitItem {
  id: string;
  visitDate: string;
  doctorName: string;
  clinicHospital: string;
  symptoms: string | null;
  diagnosis: string;
  vitals: string | null;
  prescription: string | null;
  treatment: string | null;
  notes: string | null;
  child: {
    id: string;
    childId: string;
    fullName: string;
  };
}

export function MedicalManagement() {
  const [profiles, setProfiles] = useState<MedicalProfileItem[]>([]);
  const [visits, setVisits] = useState<MedicalVisitItem[]>([]);
  const [children, setChildren] = useState<{ id: string; fullName: string; childId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Log Visit Modal
  const [showAddVisitModal, setShowAddVisitModal] = useState(false);
  const [visitForm, setVisitForm] = useState({
    childId: '',
    visitDate: new Date().toISOString().split('T')[0],
    doctorName: 'Dr. Salman Haider (Child Specialist)',
    clinicHospital: 'Civil Hospital Multan / PBM Campus Clinic',
    symptoms: 'Mild fever, dry cough, and fatigue after sports',
    diagnosis: 'Seasonal Viral Pharyngitis',
    vitals: 'Temp: 100.2 F, Pulse: 88 bpm, BP: 110/70',
    prescription: 'Syrup Panadol 2 tsp TDS x 3 days, Syrup Arinac 1 tsp BD',
    treatment: 'Bed rest in hostel room, warm fluids, sponge with lukewarm water',
    notes: 'To be reviewed if fever persists beyond 48 hours.',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, visitRes, childRes] = await Promise.all([
        fetch('/api/medical/profiles'),
        fetch('/api/medical/visits'),
        fetch('/api/children?status=ACTIVE'),
      ]);

      const profData = await profRes.json();
      const visitData = await visitRes.json();
      const childData = await childRes.json();

      if (profData.success) setProfiles(profData.profiles || []);
      if (visitData.success) setVisits(visitData.visits || []);
      if (childData.success) setChildren(childData.children || []);
    } catch (err) {
      console.error('Fetch medical data error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/medical/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to save checkup');
        return;
      }

      setFormSuccess('Doctor checkup recorded successfully!');
      setTimeout(() => {
        setShowAddVisitModal(false);
        setFormSuccess(null);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving checkup.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVisits = visits.filter(
    (v) =>
      v.child.fullName.toLowerCase().includes(search.toLowerCase()) ||
      v.child.childId.toLowerCase().includes(search.toLowerCase()) ||
      v.doctorName.toLowerCase().includes(search.toLowerCase()) ||
      v.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  const exportExcel = () => {
    const exportData = filteredVisits.map((v, idx) => ({
      'Sr #': idx + 1,
      'Checkup Date': formatDate(v.visitDate),
      'Child Name': v.child.fullName,
      'Child ID': v.child.childId,
      'Attending Doctor': v.doctorName,
      'Hospital / Clinic': v.clinicHospital,
      'Reported Symptoms': v.symptoms || '-',
      'Clinical Diagnosis': v.diagnosis,
      'Vitals Recorded': v.vitals || '-',
      'Prescribed Medicines': v.prescription || '-',
      'Treatment / Care Advice': v.treatment || '-',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Medical_Checkups');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medical & Healthcare Management</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              Confidential Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Child health records, blood groups, vitals tracking, routine doctor checkups, prescriptions, and clinical logs.
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
            onClick={() => setShowAddVisitModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Log Doctor Checkup</span>
          </button>
        </div>
      </div>

      {/* Children Health Roster Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profiles.slice(0, 4).map((p) => (
          <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-xs text-slate-900">{p.child.fullName}</h3>
                  <p className="text-[10px] text-slate-500">{p.child.childId}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-100 text-red-800">
                  {p.bloodGroup || 'B+'}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Height:</span>
                  <span className="font-semibold">{p.heightCm || 135} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Weight:</span>
                  <span className="font-semibold">{p.weightKg || 30} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Allergies:</span>
                  <span className="font-medium text-slate-800">{p.allergies || 'None'}</span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-emerald-700 font-semibold">
              Hostel: {p.child.bed?.bedNumber || 'Assigned'}
            </div>
          </div>
        ))}
      </div>

      {/* Clinical Visits History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Official Doctor Visits & Treatment History</h2>
            <p className="text-xs text-slate-500">Documented by visiting physicians and Sweet Home medical officer</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by child, doctor, diagnosis..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Child Name</th>
                <th className="px-4 py-3">Doctor & Clinic</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Prescription</th>
                <th className="px-4 py-3">Vitals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Loading medical logs...
                  </td>
                </tr>
              ) : filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No doctor checkups recorded yet.
                  </td>
                </tr>
              ) : (
                filteredVisits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(v.visitDate)}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{v.child.fullName}</div>
                      <div className="text-[10px] text-emerald-700 font-semibold">{v.child.childId}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{v.doctorName}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{v.clinicHospital}</div>
                    </td>
                    <td className="px-4 py-3 font-bold text-red-800">{v.diagnosis}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium max-w-xs">{v.prescription || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{v.vitals || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Doctor Visit Modal */}
      {showAddVisitModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-red-700" />
                <h3 className="text-base font-bold text-slate-900">Record Doctor Checkup & Prescription</h3>
              </div>
              <button onClick={() => setShowAddVisitModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
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

            <form onSubmit={handleSaveVisit} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Child *</label>
                  <select
                    required
                    value={visitForm.childId}
                    onChange={(e) => setVisitForm({ ...visitForm, childId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  >
                    <option value="">-- Choose Resident Child --</option>
                    {children.map((c) => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.childId})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={visitForm.visitDate}
                    onChange={(e) => setVisitForm({ ...visitForm, visitDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor Name *</label>
                  <input
                    type="text"
                    required
                    value={visitForm.doctorName}
                    onChange={(e) => setVisitForm({ ...visitForm, doctorName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinic / Hospital</label>
                  <input
                    type="text"
                    value={visitForm.clinicHospital}
                    onChange={(e) => setVisitForm({ ...visitForm, clinicHospital: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seasonal Viral Pharyngitis"
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500 font-bold text-red-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescription & Dosage</label>
                <textarea
                  rows={2}
                  value={visitForm.prescription}
                  onChange={(e) => setVisitForm({ ...visitForm, prescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vitals (BP, Temp, Pulse)</label>
                  <input
                    type="text"
                    value={visitForm.vitals}
                    onChange={(e) => setVisitForm({ ...visitForm, vitals: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Treatment / Care Instructions</label>
                  <input
                    type="text"
                    value={visitForm.treatment}
                    onChange={(e) => setVisitForm({ ...visitForm, treatment: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVisitModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Save Checkup'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
