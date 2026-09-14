'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Baby,
  Search,
  Plus,
  Printer,
  Download,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  CheckCircle,
  Building2,
  GraduationCap,
  HeartPulse,
  Shield,
  FileText,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDate } from '@/lib/utils';
import { ChildPhotoPicker } from './ChildPhotoPicker';
import { childPhotoDisplaySrc } from '@/lib/child-photo';

interface ChildItem {
  id: string;
  childId: string;
  fullName: string;
  fatherGuardianName: string;
  dateOfBirth: string;
  gender: string;
  bFormNo: string | null;
  admissionNo: string;
  admissionDate: string;
  guardianName: string | null;
  guardianRelation: string | null;
  guardianContact: string | null;
  address: string | null;
  status: string;
  clothingIssued: string | null;
  dietaryNotes: string | null;
  notes: string | null;
  photo: string | null;
  room?: { id: string; roomNumber: string } | null;
  bed?: { id: string; bedNumber: string } | null;
  class?: { id: string; name: string } | null;
  motherMaid?: { id: string; fullName: string } | null;
  medicalRecord?: {
    bloodGroup: string | null;
    allergies: string | null;
    chronicConditions: string | null;
    heightCm: number | null;
    weightKg: number | null;
  } | null;
}

function calculateAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return Math.max(0, age);
}

export function ChildrenManagement() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDossierModal, setShowDossierModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildItem | null>(null);

  // Hostel beds and classes for dropdowns
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [beds, setBeds] = useState<{ id: string; bedNumber: string; roomNumber: string }[]>([]);
  const [motherMaids, setMotherMaids] = useState<{ id: string; fullName: string }[]>([]);

  // Add Form State
  const [formData, setFormData] = useState({
    fullName: '',
    fatherGuardianName: '',
    dateOfBirth: '2015-05-15',
    gender: 'MALE',
    bFormNo: '',
    admissionNo: `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    admissionDate: new Date().toISOString().split('T')[0],
    guardianName: '',
    guardianRelation: 'Mother / Widow',
    guardianContact: '',
    address: '',
    classId: '',
    bedId: '',
    motherMaidId: '',
    bloodGroup: 'B+',
    allergies: 'None',
    chronicConditions: 'None',
    heightCm: '135',
    weightKg: '30',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoRemoved, setEditPhotoRemoved] = useState(false);

  // Edit Form State
  const [editFormData, setEditFormData] = useState<any>({});

  const uploadChildPhoto = async (file: File, childId?: string) => {
    const body = new FormData();
    body.append('file', file);
    if (childId) body.append('childId', childId);

    const response = await fetch('/api/children/photo', { method: 'POST', body });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Photo upload failed');
    return data.url as string;
  };

  const fetchChildren = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);

      const res = await fetch(`/api/children?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setChildren(data.children);
      }
    } catch (err) {
      console.error('Fetch children error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [classRes, hostelRes, staffRes] = await Promise.all([
        fetch('/api/education/classes'),
        fetch('/api/hostel/beds'),
        fetch('/api/staff?role=MOTHER_MAID'),
      ]);

      if (classRes.ok) {
        const d = await classRes.json();
        setClasses(d.classes || []);
      }
      if (hostelRes.ok) {
        const d = await hostelRes.json();
        setBeds(d.beds || []);
      }
      if (staffRes.ok) {
        const d = await staffRes.json();
        setMotherMaids(d.employees || []);
      }
    } catch (err) {
      console.error('Fetch options error:', err);
    }
  };

  useEffect(() => {
    fetchChildren();
    fetchOptions();
  }, [search, statusFilter]);

  const generateNewAdmissionNo = () => `ADM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      fatherGuardianName: '',
      dateOfBirth: '2015-05-15',
      gender: 'MALE',
      bFormNo: '',
      admissionNo: generateNewAdmissionNo(),
      admissionDate: new Date().toISOString().split('T')[0],
      guardianName: '',
      guardianRelation: 'Mother / Widow',
      guardianContact: '',
      address: '',
      classId: '',
      bedId: '',
      motherMaidId: '',
      bloodGroup: 'B+',
      allergies: 'None',
      chronicConditions: 'None',
      heightCm: '135',
      weightKg: '30',
    });
    setNewPhotoFile(null);
    setFormError(null);
    setFormSuccess(null);
    setShowAddModal(true);
    fetchOptions();
  };

  const handleCreateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      let photo: string | null = null;
      let photoUploadWarning: string | null = null;

      if (newPhotoFile) {
        try {
          photo = await uploadChildPhoto(newPhotoFile);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown photo upload error';
          console.error('Profile photo upload failed during child admission:', error);
          photoUploadWarning = `Profile photo upload could not be completed (${message}). Child record will be saved without the photo until the Vercel Blob token is configured.`;
        }
      }

      const res = await fetch('/api/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, photo }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to admit child');
        return;
      }

      setFormSuccess(
        photoUploadWarning
          ? `${photoUploadWarning} Child enrolled into Sweet Home Multan successfully.`
          : 'Child enrolled into Sweet Home Multan successfully!'
      );
      setNewPhotoFile(null);
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchChildren();
        fetchOptions();
      }, 2200);
    } catch (err: any) {
      console.error('Child admission submit error:', err);
      setFormError(err instanceof Error ? err.message : 'Network error while saving child admission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (c: ChildItem) => {
    setSelectedChild(c);
    setEditFormData({
      fullName: c.fullName,
      fatherGuardianName: c.fatherGuardianName,
      dateOfBirth: c.dateOfBirth.split('T')[0],
      bFormNo: c.bFormNo || '',
      guardianName: c.guardianName || '',
      guardianRelation: c.guardianRelation || '',
      guardianContact: c.guardianContact || '',
      address: c.address || '',
      status: c.status,
      classId: c.class?.id || '',
      bedId: c.bed?.id || '',
      motherMaidId: c.motherMaid?.id || '',
      bloodGroup: c.medicalRecord?.bloodGroup || 'B+',
      allergies: c.medicalRecord?.allergies || 'None',
      chronicConditions: c.medicalRecord?.chronicConditions || 'None',
      heightCm: c.medicalRecord?.heightCm?.toString() || '',
      weightKg: c.medicalRecord?.weightKg?.toString() || '',
    });
    setEditPhotoFile(null);
    setEditPhotoRemoved(false);
    setShowEditModal(true);
  };

  const handleUpdateChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const photo = editPhotoFile
        ? await uploadChildPhoto(editPhotoFile, selectedChild.id)
        : editPhotoRemoved
        ? null
        : undefined;
      const res = await fetch(`/api/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editFormData, ...(photo !== undefined ? { photo } : {}) }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditPhotoFile(null);
        setEditPhotoRemoved(false);
        fetchChildren();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to update child profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to deactivate/archive the child file of ${name}?`)) return;

    try {
      const res = await fetch(`/api/children/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchChildren();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportExcel = () => {
    const exportData = children.map((c, idx) => ({
      'Sr #': idx + 1,
      'Child ID': c.childId,
      'Admission No': c.admissionNo,
      'Full Name': c.fullName,
      'Father / Guardian': c.fatherGuardianName,
      'Date of Birth': formatDate(c.dateOfBirth),
      'B-Form Number': c.bFormNo || '-',
      'Assigned Class': c.class?.name || '-',
      'Hostel Bed': c.bed?.bedNumber || '-',
      'Mother Maid': c.motherMaid?.fullName || '-',
      'Blood Group': c.medicalRecord?.bloodGroup || '-',
      'Guardian Contact': c.guardianContact || '-',
      'Admission Date': formatDate(c.admissionDate),
      'Status': c.status,
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Children_Register');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Children Care & Admissions</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {children.length} Enrolled Resident Children
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete child management: biometrics, B-Form, hostel beds, academic classes, medical records, and official dossiers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Register</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Admit New Child</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Child Name, ID, B-Form, Father..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active Residents</option>
            <option value="GRADUATED">Graduated</option>
            <option value="TRANSFERRED">Transferred</option>
            <option value="DEACTIVATED">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Children Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Child Profile</th>
                <th className="px-4 py-3">Age / Gender</th>
                <th className="px-4 py-3">Father / Guardian</th>
                <th className="px-4 py-3">B-Form / CNIC</th>
                <th className="px-4 py-3">Hostel & Class</th>
                <th className="px-4 py-3">Mother Maid</th>
                <th className="px-4 py-3">Medical Summary</th>
                <th className="px-4 py-3">Status / Admission</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    Loading enrolled children records...
                  </td>
                </tr>
              ) : children.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    No children found matching the search criteria.
                  </td>
                </tr>
              ) : (
                children.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
                          {childPhotoDisplaySrc(c.photo) ? <img src={childPhotoDisplaySrc(c.photo)!} alt={`${c.fullName} profile`} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center font-bold">{c.fullName.charAt(0)}</div>}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{c.fullName}</div>
                          <div className="text-[10px] text-emerald-700 font-semibold">{c.childId} • {c.admissionNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><div className="font-bold text-slate-800">{calculateAge(c.dateOfBirth)} years</div><div className="text-[10px] text-slate-500">{c.gender}</div></td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium">{c.fatherGuardianName}</div>
                      <div className="text-[10px] text-slate-400">{c.guardianContact || 'No contact'}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {c.bFormNo || <span className="text-slate-400 italic">Pending B-Form</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800">{c.bed?.bedNumber || 'No Bed'}</div>
                      <div className="text-[10px] text-slate-500">{c.class?.name || 'Class Unassigned'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        {c.motherMaid?.fullName || 'Relief Supervision'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
                        {c.medicalRecord?.bloodGroup || 'B+'}
                      </span>
                      <div className="text-[10px] text-slate-400 truncate max-w-[120px] mt-0.5">
                        {c.medicalRecord?.allergies || 'Healthy'}
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">{c.status}</span><div className="mt-1 text-[10px] text-slate-500">{formatDate(c.admissionDate)}</div></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link href={`/children/${c.id}`} className="rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50" title="View Child Profile">
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedChild(c);
                            setShowDossierModal(true);
                          }}
                          className="p-1.5 hover:bg-emerald-50 text-emerald-700 rounded-md transition-all cursor-pointer"
                          title="Print Official Dossier"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-all cursor-pointer"
                          title="Edit Child Profile"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(c.id, c.fullName)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-all cursor-pointer"
                          title="Archive File"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Child Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Official Child Admission & Enrollment Form</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleCreateChild} className="mt-4 space-y-4 text-xs">
              <ChildPhotoPicker
                onFileSelected={setNewPhotoFile}
                onRemove={() => setNewPhotoFile(null)}
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Child Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Bilal"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood (Late)"
                    value={formData.fatherGuardianName}
                    onChange={(e) => setFormData({ ...formData, fatherGuardianName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNIC / B-Form Number</label>
                  <input
                    type="text"
                    placeholder="36302-XXXXXXX-X"
                    value={formData.bFormNo}
                    onChange={(e) => setFormData({ ...formData, bFormNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission File Number *</label>
                  <input
                    type="text"
                    required
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Date</label>
                  <input
                    type="date"
                    value={formData.admissionDate}
                    onChange={(e) => setFormData({ ...formData, admissionDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Living Guardian / Next of Kin</label>
                  <input
                    type="text"
                    placeholder="e.g. Maryam Bibi (Mother)"
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Guardian Contact Number</label>
                  <input
                    type="text"
                    placeholder="0300-XXXXXXX"
                    value={formData.guardianContact}
                    onChange={(e) => setFormData({ ...formData, guardianContact: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Native City / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Basti Malook, Multan"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 mb-2">Institutional Facility Allocations</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Academic Class</label>
                    <select
                      value={formData.classId}
                      onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map((cl) => (
                        <option key={cl.id} value={cl.id}>{cl.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Available Hostel Bed</label>
                    <select
                      value={formData.bedId}
                      onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    >
                      <option value="">-- Select Bed --</option>
                      {beds.map((b) => (
                        <option key={b.id} value={b.id}>{b.bedNumber} ({b.roomNumber})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Assigned Mother Maid (1 of 9)</label>
                    <select
                      value={formData.motherMaidId}
                      onChange={(e) => setFormData({ ...formData, motherMaidId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    >
                      <option value="">-- Select Mother Maid --</option>
                      {motherMaids.map((m) => (
                        <option key={m.id} value={m.id}>{m.fullName}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/60">
                <div className="font-bold text-red-900 mb-2">Initial Health & Medical Details</div>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={formData.bloodGroup}
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    >
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g. Dust / Penicillin"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="e.g. 135"
                      value={formData.heightCm}
                      onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 30"
                      value={formData.weightKg}
                      onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Enrolling...' : 'Complete Child Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Child Dossier Modal */}
      {showDossierModal && selectedChild && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 no-print">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Child Profile Dossier Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Dossier</span>
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Area */}
            <div className="pt-6 space-y-6 text-slate-900">
              {/* Header with Government / PBM Seal */}
              <div className="text-center border-b-2 border-emerald-800 pb-4">
                <div className="inline-block p-2 rounded-full bg-emerald-50 border border-emerald-300 mb-2">
                  <Shield className="w-8 h-8 text-emerald-800 mx-auto" />
                </div>
                <h2 className="text-xl font-extrabold uppercase tracking-tight text-slate-900">
                  PAKISTAN BAIT-UL-MAAL
                </h2>
                <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">
                  SWEET HOME MULTAN • RESIDENT CHILD DOSSIER
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Near Eidgah, LMQ Road, Multan, Punjab, Pakistan | Institutional Welfare File
                </p>
              </div>

              {/* Bio & Photograph Box */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5 text-xs flex-1">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">Child Full Name:</span>
                    <span className="font-extrabold text-slate-900 text-sm">{selectedChild.fullName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">Father / Guardian:</span>
                    <span className="font-bold text-slate-800">{selectedChild.fatherGuardianName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">Institutional Child ID:</span>
                    <span className="font-bold text-emerald-800">{selectedChild.childId}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">Admission File No:</span>
                    <span className="font-bold text-slate-800">{selectedChild.admissionNo}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">B-Form Number:</span>
                    <span className="font-bold text-slate-800">{selectedChild.bFormNo || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-slate-500 font-semibold">Date of Birth / Age:</span>
                    <span className="font-bold text-slate-800">{formatDate(selectedChild.dateOfBirth)}</span>
                  </div>
                </div>

                {/* Photograph Box */}
                <div className="w-32 h-36 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center text-center p-2 bg-white shrink-0 self-center">
                  {childPhotoDisplaySrc(selectedChild.photo) ? <img src={childPhotoDisplaySrc(selectedChild.photo)!} alt={`${selectedChild.fullName} profile`} className="h-full w-full rounded object-cover" /> : <><Baby className="w-10 h-10 text-slate-300 mb-1" /><span className="text-[10px] text-slate-400 font-medium">Official Child Photograph</span></>}
                </div>
              </div>

              {/* Placement & Care Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 font-medium block">Hostel Bed Number</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedChild.bed?.bedNumber || 'Bed 01'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 font-medium block">Enrolled Class</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedChild.class?.name || 'Class 4'}</span>
                </div>
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <span className="text-slate-400 font-medium block">Assigned Mother Maid</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedChild.motherMaid?.fullName || 'Assigned'}</span>
                </div>
              </div>

              {/* Medical Profile Section */}
              <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 text-xs space-y-2">
                <div className="font-bold text-red-900 uppercase tracking-wider text-[11px]">
                  Confidential Medical Record Summary
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-500 block">Blood Group:</span>
                    <span className="font-bold text-red-700">{selectedChild.medicalRecord?.bloodGroup || 'B+'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Allergies:</span>
                    <span className="font-bold text-slate-800">{selectedChild.medicalRecord?.allergies || 'None'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Height:</span>
                    <span className="font-bold text-slate-800">{selectedChild.medicalRecord?.heightCm || 135} cm</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Weight:</span>
                    <span className="font-bold text-slate-800">{selectedChild.medicalRecord?.weightKg || 30} kg</span>
                  </div>
                </div>
              </div>

              {/* Signatures & Verification */}
              <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs border-t border-slate-200">
                <div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Records Clerk</div>
                  <div className="text-[10px] text-slate-400">Sweet Home Multan</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-semibold text-slate-700">Mother Maid Incharge</div>
                  <div className="text-[10px] text-slate-400">Child Care Wing</div>
                </div>
                <div>
                  <div className="border-t border-slate-400 pt-1 font-bold text-emerald-900">Incharge / Director</div>
                  <div className="text-[10px] text-slate-400">Pakistan Bait-ul-Maal Multan</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Child Modal */}
      {showEditModal && selectedChild && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Child File: {selectedChild.fullName}</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateChild} className="mt-4 space-y-3 text-xs">
              {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">{formError}</div>}

              <ChildPhotoPicker
                currentPhoto={selectedChild.photo}
                onFileSelected={(file) => {
                  setEditPhotoFile(file);
                  if (file) setEditPhotoRemoved(false);
                }}
                onRemove={() => setEditPhotoRemoved(true)}
                disabled={isSubmitting}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father / Guardian Name</label>
                  <input
                    type="text"
                    value={editFormData.fatherGuardianName}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherGuardianName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">B-Form / CNIC</label>
                  <input
                    type="text"
                    value={editFormData.bFormNo}
                    onChange={(e) => setEditFormData({ ...editFormData, bFormNo: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md font-bold"
                  >
                    <option value="ACTIVE">ACTIVE RESIDENT</option>
                    <option value="TRANSFERRED">TRANSFERRED</option>
                    <option value="GRADUATED">GRADUATED</option>
                    <option value="DEACTIVATED">DEACTIVATED</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-md font-bold cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
