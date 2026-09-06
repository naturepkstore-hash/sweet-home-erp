'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Eye,
  Trash2,
  Download,
  CheckCircle,
  X,
  AlertCircle,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';

interface EmployeeItem {
  id: string;
  fullName: string;
  fatherHusbandName: string;
  cnic: string;
  phoneNumber: string;
  address: string;
  role: string;
  department: string;
  employmentStatus: string;
  emergencyContact: string;
  notes: string | null;
  user: {
    id: string;
    email: string;
    username: string;
    status: string;
    lastLogin: string | null;
  } | null;
}

export function StaffManagement() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<EmployeeItem | null>(null);

  // Form State - strictly NO joiningDate
  const [formData, setFormData] = useState({
    fullName: '',
    fatherHusbandName: '',
    cnic: '',
    phoneNumber: '',
    address: '',
    role: 'MOTHER_MAID',
    department: 'Child Care & Wardenship Wing',
    employmentStatus: 'ACTIVE',
    emergencyContact: '',
    notes: '',
    createAccount: true,
    email: '',
    password: 'PBM@Staff2026!',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    fatherHusbandName: '',
    phoneNumber: '',
    address: '',
    role: '',
    department: '',
    employmentStatus: '',
    emergencyContact: '',
    notes: '',
    newPassword: '',
  });

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (roleFilter !== 'ALL') query.append('role', roleFilter);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);

      const res = await fetch(`/api/staff?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
    } catch (err) {
      console.error('Fetch staff error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [search, roleFilter, statusFilter]);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create employee');
        return;
      }

      setFormSuccess('Staff member & individual login account created successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchStaff();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setSelectedEmp(emp);
    setEditFormData({
      fullName: emp.fullName,
      fatherHusbandName: emp.fatherHusbandName,
      phoneNumber: emp.phoneNumber,
      address: emp.address,
      role: emp.role,
      department: emp.department,
      employmentStatus: emp.employmentStatus,
      emergencyContact: emp.emergencyContact,
      notes: emp.notes || '',
      newPassword: '',
    });
    setShowEditModal(true);
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/staff/${selectedEmp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update employee');
        return;
      }

      setShowEditModal(false);
      fetchStaff();
    } catch (err) {
      console.error(err);
      setFormError('Network error while updating employee.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive / terminate ${name}? Their login will be suspended.`)) return;

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStaff();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportExcel = () => {
    const exportData = employees.map((e, idx) => ({
      'Sr #': idx + 1,
      'Full Name': e.fullName,
      'Father / Husband Name': e.fatherHusbandName,
      'CNIC': e.cnic,
      'Phone Number': e.phoneNumber,
      'Designated Role': e.role,
      'Department': e.department,
      'Employment Status': e.employmentStatus,
      'Emergency Contact': e.emergencyContact,
      'Residential Address': e.address,
      'Login Account': e.user ? e.user.email : 'No Account',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Staff_Directory');
  };

  const roleLabels: Record<string, string> = {
    INCHARGE: 'Incharge (Director)',
    ACCOUNT_ASSISTANT: 'Account Assistant',
    HR_REPRESENTATIVE: 'HR Representative',
    CLERK: 'Records Clerk',
    MOTHER_MAID: 'Mother Maid',
    WAITER: 'Waiter (Dining)',
    COOK: 'Head Cook',
    COOK_HELPER: 'Cook Helper',
    SWEEPER: 'Sanitation Staff',
    SECURITY_GUARD: 'Security Guard',
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Human Resources</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {employees.length} Sanctioned Staff Members
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete management of institutional personnel, individual user credentials, and duty roles.
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
            <span>Add New Staff</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, CNIC, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Roles</option>
              <option value="INCHARGE">Incharge</option>
              <option value="ACCOUNT_ASSISTANT">Account Assistant</option>
              <option value="HR_REPRESENTATIVE">HR Representative</option>
              <option value="CLERK">Records Clerk</option>
              <option value="MOTHER_MAID">Mother Maid</option>
              <option value="WAITER">Waiter</option>
              <option value="COOK">Cook</option>
              <option value="COOK_HELPER">Cook Helper</option>
              <option value="SWEEPER">Sweeper</option>
              <option value="SECURITY_GUARD">Security Guard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated / Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Father / Husband</th>
                <th className="px-4 py-3">CNIC & Phone</th>
                <th className="px-4 py-3">Role & Dept</th>
                <th className="px-4 py-3">Login Account</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading staff directory...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No staff members match the selected criteria.
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{emp.fullName}</div>
                      <div className="text-[11px] text-slate-400">{emp.emergencyContact || 'No emergency contact'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{emp.fatherHusbandName}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{emp.cnic}</div>
                      <div className="text-[11px] text-slate-500">{emp.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-emerald-800">{roleLabels[emp.role] || emp.role}</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">{emp.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      {emp.user ? (
                        <div>
                          <span className="font-medium text-slate-800">{emp.user.email}</span>
                          <div className="text-[10px] text-emerald-600 font-semibold">Account Active</div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No User Account</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.employmentStatus === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : emp.employmentStatus === 'ON_LEAVE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEmp(emp);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-md transition-all cursor-pointer"
                          title="View Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(emp)}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-md transition-all cursor-pointer"
                          title="Edit & Credentials"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleArchive(emp.id, emp.fullName)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-md transition-all cursor-pointer"
                          title="Archive Employee"
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

      {/* Add New Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Add New Institutional Staff Member</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 cursor-pointer"
              >
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

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Aslam"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Father / Husband Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noor Muhammad"
                    value={formData.fatherHusbandName}
                    onChange={(e) => setFormData({ ...formData, fatherHusbandName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">CNIC / ID Card *</label>
                  <input
                    type="text"
                    required
                    placeholder="36302-XXXXXXX-X"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-XXXXXXX"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role Designation *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value="MOTHER_MAID">Mother Maid</option>
                    <option value="WAITER">Waiter</option>
                    <option value="COOK">Cook</option>
                    <option value="COOK_HELPER">Cook Helper</option>
                    <option value="SWEEPER">Sweeper</option>
                    <option value="SECURITY_GUARD">Security Guard</option>
                    <option value="CLERK">Clerk</option>
                    <option value="HR_REPRESENTATIVE">HR / Representative</option>
                    <option value="ACCOUNT_ASSISTANT">Account Assistant</option>
                    <option value="INCHARGE">Incharge</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="e.g. Child Care & Wardenship"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. Sweet Home Staff Quarters, Block A, Multan"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="0300-XXXXXXX (Brother: Farooq)"
                  value={formData.emergencyContact}
                  onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="font-bold text-emerald-900 mb-1">Individual Login Account Settings</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Login Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="e.g. staffname@sweethome.pbm.gov.pk"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Initial Password</label>
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                  {isSubmitting ? 'Saving...' : 'Save & Issue Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Staff Profile & Credentials</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStaff} className="mt-4 space-y-3 text-xs">
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
                  <label className="block font-semibold text-slate-700 mb-1">Father / Husband Name</label>
                  <input
                    type="text"
                    value={editFormData.fatherHusbandName}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherHusbandName: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editFormData.phoneNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employment Status</label>
                  <select
                    value={editFormData.employmentStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, employmentStatus: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ON_LEAVE">ON_LEAVE</option>
                    <option value="TERMINATED">TERMINATED / ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reset Password (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter new password to reset"
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
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
                  {isSubmitting ? 'Updating...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Profile Modal */}
      {showViewModal && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center">
                  {selectedEmp.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{selectedEmp.fullName}</h3>
                  <p className="text-xs text-slate-500">{roleLabels[selectedEmp.role] || selectedEmp.role}</p>
                </div>
              </div>
              <button onClick={() => setShowViewModal(false)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Father / Husband Name:</span>
                <span className="font-semibold text-slate-800">{selectedEmp.fatherHusbandName}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">CNIC / ID Card:</span>
                <span className="font-semibold text-slate-800">{selectedEmp.cnic}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Phone Number:</span>
                <span className="font-semibold text-slate-800">{selectedEmp.phoneNumber}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-semibold text-slate-800">{selectedEmp.emergencyContact}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{selectedEmp.department}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Residential Address:</span>
                <span className="font-medium text-slate-800 text-right max-w-[240px]">{selectedEmp.address}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Login Account:</span>
                <span className="font-bold text-emerald-700">{selectedEmp.user?.email || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
