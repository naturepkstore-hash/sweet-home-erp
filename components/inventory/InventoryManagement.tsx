'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Plus,
  ArrowDownUp,
  AlertTriangle,
  Download,
  CheckCircle,
  History,
  X,
  AlertCircle,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minStock: number;
  supplier: string | null;
  status: string;
  notes: string | null;
  category: {
    id: string;
    name: string;
    code: string;
  };
}

interface StockTransactionItem {
  id: string;
  transactionType: string;
  quantity: number;
  unit: string;
  date: string;
  responsiblePerson: string;
  reason: string | null;
  notes: string | null;
  item: {
    name: string;
    category: { name: string };
  };
}

export function InventoryManagement() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; code: string }[]>([]);
  const [transactions, setTransactions] = useState<StockTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Add Item State
  const [newItemData, setNewItemData] = useState({
    name: '',
    categoryId: '',
    unit: 'kg',
    currentStock: '0',
    minStock: '10',
    supplier: '',
    notes: '',
  });

  // Transaction Form State
  const [txnData, setTxnData] = useState({
    transactionType: 'STOCK_IN',
    quantity: '',
    responsiblePerson: '',
    reason: 'Ration Store Issue',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (categoryFilter !== 'ALL') query.append('categoryId', categoryFilter);
      if (statusFilter !== 'ALL') query.append('status', statusFilter);

      const res = await fetch(`/api/inventory/items?${query.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Fetch inventory error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (itemId?: string) => {
    try {
      const url = itemId ? `/api/inventory/transactions?itemId=${itemId}` : '/api/inventory/transactions';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Fetch transactions error:', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, categoryFilter, statusFilter]);

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItemData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to add item');
        return;
      }

      setFormSuccess('Inventory item added successfully!');
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
        fetchItems();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving inventory item.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenTxn = (item: InventoryItem) => {
    setSelectedItem(item);
    setTxnData({
      transactionType: 'ISSUE',
      quantity: '',
      responsiblePerson: '',
      reason: 'Kitchen / Care Ward Issue',
      notes: '',
    });
    setFormError(null);
    setFormSuccess(null);
    setShowTxnModal(true);
  };

  const handleExecuteTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inventory/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItem.id,
          ...txnData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to record stock transaction');
        return;
      }

      setFormSuccess('Stock transaction recorded and inventory updated!');
      setTimeout(() => {
        setShowTxnModal(false);
        setFormSuccess(null);
        fetchItems();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while processing stock transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewHistory = (item?: InventoryItem) => {
    setSelectedItem(item || null);
    fetchTransactions(item?.id);
    setShowHistoryModal(true);
  };

  const lowStockCount = items.filter((i) => i.currentStock <= i.minStock).length;

  const exportExcel = () => {
    const exportData = items.map((i, idx) => ({
      'Sr #': idx + 1,
      'Item Name': i.name,
      'Category': i.category.name,
      'Current Stock': `${i.currentStock} ${i.unit}`,
      'Min Reorder Level': `${i.minStock} ${i.unit}`,
      'Status': i.status,
      'Approved Supplier': i.supplier || '-',
      'Notes': i.notes || '-',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Inventory_Report');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Inventory & Ration Management</h1>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{lowStockCount} Low Stock Alerts</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of food ration, kitchen utensils, sanitation supplies, clothing, uniforms, and stationery.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleViewHistory()}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span>Stock Ledger</span>
          </button>
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
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Items</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{items.length}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across 7 Categories</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">In Stock & Normal</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{items.length - lowStockCount}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Adequate buffer stock</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-amber-700 font-semibold uppercase tracking-wider">Low Stock Warning</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{lowStockCount}</div>
          <div className="text-[11px] text-amber-600 mt-0.5">Below Reorder Threshold</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Categories</div>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">{categories.length}</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Ration, Kitchen, Hygiene, etc.</div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search items by name or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
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
              <option value="IN_STOCK">In Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3">Reorder Point</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No items match the selected filters.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isLow = item.currentStock <= item.minStock;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{item.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-emerald-800">{item.category.name}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-extrabold text-sm ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-medium">
                        {item.minStock} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">
                        {item.supplier || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.currentStock <= 0
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.currentStock <= 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenTxn(item)}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <ArrowDownUp className="w-3 h-3" />
                            <span>Stock Action</span>
                          </button>
                          <button
                            onClick={() => handleViewHistory(item)}
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded cursor-pointer"
                            title="Item Stock Ledger"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Add New Inventory Item</h3>
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

            <form onSubmit={handleCreateItem} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super Basmati Rice (Karnal)"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    required
                    value={newItemData.categoryId}
                    onChange={(e) => setNewItemData({ ...newItemData, categoryId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure *</label>
                  <input
                    type="text"
                    required
                    placeholder="kg / liter / packet / box"
                    value={newItemData.unit}
                    onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Opening Stock</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItemData.currentStock}
                    onChange={(e) => setNewItemData({ ...newItemData, currentStock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Minimum Alert Threshold</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newItemData.minStock}
                    onChange={(e) => setNewItemData({ ...newItemData, minStock: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized Supplier</label>
                <input
                  type="text"
                  placeholder="e.g. Al-Madina Grain Merchant Multan"
                  value={newItemData.supplier}
                  onChange={(e) => setNewItemData({ ...newItemData, supplier: e.target.value })}
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
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transaction (In/Out/Issue/Consumption/Adjustment) Modal */}
      {showTxnModal && selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Stock Transaction</h3>
                <p className="text-xs text-slate-500">
                  {selectedItem.name} (Current: {selectedItem.currentStock} {selectedItem.unit})
                </p>
              </div>
              <button onClick={() => setShowTxnModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
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

            <form onSubmit={handleExecuteTxn} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Type *</label>
                <select
                  value={txnData.transactionType}
                  onChange={(e) => setTxnData({ ...txnData, transactionType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                >
                  <option value="ISSUE">ISSUE (To Kitchen, Hostel, or Care Staff)</option>
                  <option value="CONSUMPTION">CONSUMPTION (Kitchen Food Usage)</option>
                  <option value="STOCK_IN">STOCK IN (Addition to Store)</option>
                  <option value="STOCK_OUT">STOCK OUT (Damaged / Expired)</option>
                  <option value="ADJUSTMENT">PHYSICAL AUDIT ADJUSTMENT</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Quantity ({selectedItem.unit}) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 20"
                    value={txnData.quantity}
                    onChange={(e) => setTxnData({ ...txnData, quantity: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Responsible Staff / Receiver</label>
                  <input
                    type="text"
                    placeholder="e.g. Ustad Abdul Majeed (Cook)"
                    value={txnData.responsiblePerson}
                    onChange={(e) => setTxnData({ ...txnData, responsiblePerson: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Issued for daily dinner and next day lunch"
                  value={txnData.reason}
                  onChange={(e) => setTxnData({ ...txnData, reason: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Recording...' : 'Execute Stock Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transaction History / Ledger Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">
                  {selectedItem ? `Stock Ledger: ${selectedItem.name}` : 'Institutional Stock Transaction Ledger'}
                </h3>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Item Name</th>
                    <th className="px-3 py-2.5">Type</th>
                    <th className="px-3 py-2.5">Quantity</th>
                    <th className="px-3 py-2.5">Responsible</th>
                    <th className="px-3 py-2.5">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No transactions found for this selection.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/80">
                        <td className="px-3 py-2.5 text-slate-500">{formatDate(t.date)}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">{t.item.name}</td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.transactionType === 'STOCK_IN' || t.transactionType === 'PURCHASE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.transactionType}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-extrabold text-slate-800">
                          {t.quantity} {t.unit}
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">{t.responsiblePerson}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px]">{t.reason || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
