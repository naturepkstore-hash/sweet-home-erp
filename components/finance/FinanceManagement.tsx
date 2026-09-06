'use client';

import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Download,
  CheckCircle,
  X,
  AlertCircle,
  Wallet,
  Receipt,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatPKR, formatDate } from '@/lib/utils';

interface TransactionItem {
  id: string;
  type: string;
  date: string;
  amount: number;
  description: string;
  referenceNumber: string | null;
  paymentMethod: string;
  notes: string | null;
  category?: { name: string } | null;
  responsiblePerson?: { fullName: string } | null;
  purchase?: { purchaseNumber: string; supplier: { name: string } } | null;
}

export function FinanceManagement() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
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

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (typeFilter !== 'ALL') query.append('type', typeFilter);

      const res = await fetch(`/api/finance?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setCategories(data.categories || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Fetch finance error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [typeFilter]);

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to record transaction');
        return;
      }

      setFormSuccess('Financial transaction recorded into institutional ledger!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchFinance();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTxns = transactions.filter(
    (t) =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.category && t.category.name.toLowerCase().includes(search.toLowerCase()))
  );

  const exportExcel = () => {
    const exportData = filteredTxns.map((t, idx) => ({
      'Sr #': idx + 1,
      'Date': formatDate(t.date),
      'Type': t.type,
      'Category': t.category?.name || 'General / Grant',
      'Description': t.description,
      'Amount (PKR)': t.amount,
      'Payment Method': t.paymentMethod,
      'Reference / Cheque #': t.referenceNumber || '-',
      'Responsible Officer': t.responsiblePerson?.fullName || '-',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Finance_Ledger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Finance & Institutional Ledger</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Government Budget Account
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pakistan Bait-ul-Maal grant allocations, food expenditure, utilities, repairs, vendor payments, and monthly balance.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Ledger</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log Transaction</span>
          </button>
        </div>
      </div>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">
              Total Grants & Income
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 truncate">
              {formatPKR(summary.totalIncome)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Head Office PBM Grants</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-red-700 font-semibold uppercase tracking-wider">
              Total Expenditure
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1 truncate">
              {formatPKR(summary.totalExpense)}
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Ration, Utilities & Care</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-700">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider">
              Net Available Fund Balance
            </div>
            <div className="text-2xl font-extrabold text-blue-900 mt-1 truncate">
              {formatPKR(summary.netBalance)}
            </div>
            <div className="text-[11px] text-blue-600 font-medium mt-1">
              National Bank of Pakistan Account
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, cheque #, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Transactions</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="GRANT">Government Grants</option>
            <option value="DONATION">Public Donations</option>
            <option value="INCOME">Other Income</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Transaction Description</th>
                <th className="px-4 py-3">Ref / Cheque #</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading financial ledger...
                  </td>
                </tr>
              ) : filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((t) => {
                  const isExpense = t.type === 'EXPENSE';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-slate-500 font-medium">{formatDate(t.date)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isExpense ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {t.category?.name || 'Grant Allocation'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{t.description}</div>
                        {t.purchase && (
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            PO: {t.purchase.purchaseNumber} ({t.purchase.supplier.name})
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600">{t.referenceNumber || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{t.paymentMethod}</td>
                      <td
                        className={`px-4 py-3 font-extrabold text-sm text-right ${
                          isExpense ? 'text-red-700' : 'text-emerald-700'
                        }`}
                      >
                        {isExpense ? '-' : '+'} {formatPKR(t.amount)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Record Financial Transaction</h3>
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

            <form onSubmit={handleCreateTxn} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                  >
                    <option value="EXPENSE">EXPENSE</option>
                    <option value="GRANT">GOVERNMENT GRANT</option>
                    <option value="DONATION">DONATION / WELFARE FUND</option>
                    <option value="INCOME">OTHER INCOME</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-extrabold text-emerald-800 text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense / Income Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Purpose *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MEPCO Electric Bill Payment for March 2026"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cheque / Bill / Voucher #</label>
                  <input
                    type="text"
                    placeholder="e.g. CHQ-449102"
                    value={formData.referenceNumber}
                    onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="CHEQUE">Official Cheque</option>
                    <option value="BANK_TRANSFER">Direct Bank Transfer</option>
                    <option value="CASH">Cash / Imprest Fund</option>
                    <option value="ONLINE">Online Portal</option>
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : 'Record Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
