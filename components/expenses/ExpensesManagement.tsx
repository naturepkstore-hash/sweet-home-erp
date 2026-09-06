'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Download,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatPKR, formatDate } from '@/lib/utils';

interface ExpenseItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  referenceNumber: string | null;
  paymentMethod: string;
  category?: { id: string; name: string } | null;
  responsiblePerson?: { fullName: string } | null;
}

export function ExpensesManagement() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; description: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    categoryId: '',
    description: '',
    referenceNumber: '',
    paymentMethod: 'CHEQUE',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      if (data.success) {
        setExpenses(data.expenses || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch expenses error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: 'EXPENSE',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to record expense');
        return;
      }

      setFormSuccess('Expense recorded into ledger successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchExpenses();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCat = selectedCategory === 'ALL' || e.category?.id === selectedCategory;
    const matchesSearch =
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.referenceNumber && e.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (e.category && e.category.name.toLowerCase().includes(search.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  const totalExpenseAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const exportExcel = () => {
    const exportData = filteredExpenses.map((e, idx) => ({
      'Sr #': idx + 1,
      'Date': formatDate(e.date),
      'Expense Category': e.category?.name || 'General',
      'Description': e.description,
      'Amount (PKR)': e.amount,
      'Bill / Cheque #': e.referenceNumber || '-',
      'Payment Method': e.paymentMethod,
      'Responsible Officer': e.responsiblePerson?.fullName || '-',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Expense_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutional Expenditure & Bills</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              Audited Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Category-wise breakdown: Food & Ration, Utilities, Facility Maintenance, Medical, Uniforms, and Education.
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
            className="flex items-center gap-1.5 px-3.5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Categories Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((cat) => {
          const catExpenses = expenses.filter((e) => e.category?.id === cat.id);
          const catSum = catExpenses.reduce((acc, curr) => acc + curr.amount, 0);

          return (
            <div key={cat.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[11px] text-slate-500 font-semibold truncate">{cat.name}</div>
              <div className="text-lg font-extrabold text-slate-900 mt-1 truncate">{formatPKR(catSum)}</div>
              <div className="text-[10px] text-red-600 font-medium mt-0.5">{catExpenses.length} Vouchers Logged</div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search expense description, bill #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
          >
            <option value="ALL">All Expense Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Institutional Expense Vouchers</h2>
            <p className="text-xs text-slate-500">Total filter sum: {formatPKR(totalExpenseAmount)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Expense Category</th>
                <th className="px-4 py-3">Description / Purpose</th>
                <th className="px-4 py-3">Bill / Cheque #</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Loading expense vouchers...
                  </td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(exp.date)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {exp.category?.name || 'General Operations'}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{exp.description}</td>
                    <td className="px-4 py-3 font-medium text-slate-600">{exp.referenceNumber || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{exp.paymentMethod}</td>
                    <td className="px-4 py-3 font-extrabold text-sm text-red-700 text-right">
                      {formatPKR(exp.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-red-700" />
                <h3 className="text-base font-bold text-slate-900">Record Institutional Expense</h3>
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

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500 font-medium"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 18500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500 font-extrabold text-red-700 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Bill Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sanitary & plumbing repair in Hostel Block A"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bill / Cheque Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-4412"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-red-500"
                  >
                    <option value="CHEQUE">Official Cheque</option>
                    <option value="CASH">Cash / Imprest</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>
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
                  className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Record Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
