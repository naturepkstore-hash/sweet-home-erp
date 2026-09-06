'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Building,
  Download,
  CheckCircle,
  X,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatPKR, formatDate } from '@/lib/utils';

interface PurchaseItemRow {
  itemName: string;
  quantity: string;
  unitPrice: string;
  unit: string;
  inventoryItemId?: string;
}

interface PurchaseItem {
  id: string;
  purchaseNumber: string;
  purchaseDate: string;
  totalAmount: number;
  billNumber: string | null;
  paymentStatus: string;
  paymentMethod: string;
  supplier: { id: string; name: string };
  items: { id: string; itemName: string; quantity: number; unitPrice: number; totalPrice: number; unit: string }[];
  responsiblePerson?: { fullName: string } | null;
}

export function PurchasesManagement() {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>([]);
  const [inventoryItems, setInventoryItems] = useState<{ id: string; name: string; unit: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddPurchaseModal, setShowAddPurchaseModal] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);

  // Purchase Form
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    billNumber: '',
    paymentMethod: 'CHEQUE',
    notes: '',
  });

  const [itemsList, setItemsList] = useState<PurchaseItemRow[]>([
    { itemName: '', quantity: '10', unitPrice: '100', unit: 'kg', inventoryItemId: '' },
  ]);

  // Supplier Form
  const [supplierForm, setSupplierForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    ntn: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes, iRes] = await Promise.all([
        fetch('/api/purchases'),
        fetch('/api/purchases/suppliers'),
        fetch('/api/inventory/items'),
      ]);

      const pData = await pRes.json();
      const sData = await sRes.json();
      const iData = await iRes.json();

      if (pData.success) setPurchases(pData.purchases || []);
      if (sData.success) setSuppliers(sData.suppliers || []);
      if (iData.success) setInventoryItems(iData.items || []);
    } catch (err) {
      console.error('Fetch purchases error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setItemsList([...itemsList, { itemName: '', quantity: '1', unitPrice: '0', unit: 'kg', inventoryItemId: '' }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    if (itemsList.length > 1) {
      setItemsList(itemsList.filter((_, i) => i !== idx));
    }
  };

  const handleItemChange = (idx: number, field: keyof PurchaseItemRow, value: string) => {
    const updated = [...itemsList];
    updated[idx][field] = value;

    // If selecting existing inventory item, auto-fill name & unit
    if (field === 'inventoryItemId' && value) {
      const inv = inventoryItems.find((i) => i.id === value);
      if (inv) {
        updated[idx].itemName = inv.name;
        updated[idx].unit = inv.unit;
      }
    }

    setItemsList(updated);
  };

  const totalCalculated = itemsList.reduce((acc, curr) => {
    const q = parseFloat(curr.quantity) || 0;
    const p = parseFloat(curr.unitPrice) || 0;
    return acc + q * p;
  }, 0);

  const handleCreatePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...purchaseForm,
          items: itemsList,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create purchase');
        return;
      }

      setFormSuccess('Purchase recorded! Inventory stock incremented & Expense ledger updated.');
      setTimeout(() => {
        setShowAddPurchaseModal(false);
        setFormSuccess(null);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving purchase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/purchases/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to create supplier');
        return;
      }

      setShowAddSupplierModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving supplier.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPurchases = purchases.filter(
    (p) =>
      p.purchaseNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.billNumber && p.billNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const totalSpent = purchases.reduce((acc, p) => acc + p.totalAmount, 0);

  const exportExcel = () => {
    const exportData = filteredPurchases.map((p, idx) => ({
      'Sr #': idx + 1,
      'PO Number': p.purchaseNumber,
      'Supplier Name': p.supplier.name,
      'Date': formatDate(p.purchaseDate),
      'Bill #': p.billNumber || '-',
      'Total Amount': p.totalAmount,
      'Payment Status': p.paymentStatus,
      'Payment Method': p.paymentMethod,
      'Items Count': p.items.length,
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Purchases_Ledger');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Procurement & Purchases</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Auto-Linked to Stock & Finance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional vendor purchases, ration procurement, itemized invoices, auto-stock increments, and expense vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddSupplierModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Building className="w-4 h-4 text-slate-500" />
            <span>Add Supplier</span>
          </button>
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </button>
          <button
            onClick={() => setShowAddPurchaseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Purchases</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{purchases.length} Orders</div>
          <div className="text-[11px] text-slate-400 mt-0.5">Verified Procurement Invoices</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-emerald-700 font-semibold uppercase tracking-wider">Total Expenditure</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{formatPKR(totalSpent)}</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Auto-logged in Financial Ledger</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-blue-700 font-semibold uppercase tracking-wider">Active Suppliers</div>
          <div className="text-2xl font-extrabold text-blue-800 mt-1">{suppliers.length} Vendors</div>
          <div className="text-[11px] text-blue-600 mt-0.5">Approved Grain, Flour & General Stores</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Procurement Orders & Invoices</h2>
            <p className="text-xs text-slate-500">Every purchase increases inventory stock automatically</p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by PO #, Supplier, Bill..."
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
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Items Included</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Loading procurement ledger...
                  </td>
                </tr>
              ) : filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{p.purchaseNumber}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.supplier.name}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.purchaseDate)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="truncate max-w-xs font-medium">
                        {p.items.map((i) => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-800">{formatPKR(p.totalAmount)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showAddPurchaseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-slate-900">Record New Procurement / Purchase Order</h3>
              </div>
              <button onClick={() => setShowAddPurchaseModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
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

            <form onSubmit={handleCreatePurchase} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Approved Supplier *</label>
                  <select
                    required
                    value={purchaseForm.supplierId}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
                  >
                    <option value="">-- Select Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseForm.purchaseDate}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, purchaseDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Vendor Bill / Invoice #</label>
                  <input
                    type="text"
                    placeholder="e.g. BILL-9921"
                    value={purchaseForm.billNumber}
                    onChange={(e) => setPurchaseForm({ ...purchaseForm, billNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Itemized Lines */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Itemized Purchase Lines</span>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {itemsList.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                      <div className="col-span-4">
                        <label className="text-[10px] text-slate-400 block">Link Inventory Item</label>
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) => handleItemChange(idx, 'inventoryItemId', e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                        >
                          <option value="">-- Custom / Ad-hoc --</option>
                          {inventoryItems.map((inv) => (
                            <option key={inv.id} value={inv.id}>{inv.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-3">
                        <label className="text-[10px] text-slate-400 block">Item Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Item Name"
                          value={item.itemName}
                          onChange={(e) => handleItemChange(idx, 'itemName', e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block">Quantity</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="text-[10px] text-slate-400 block">Unit Price (PKR)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 bg-slate-50 border border-slate-300 rounded text-xs font-bold"
                        />
                      </div>

                      <div className="col-span-1 text-right pt-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-700">Total Purchase Cost:</span>
                  <span className="font-extrabold text-sm text-emerald-800">{formatPKR(totalCalculated)}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPurchaseModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Recording...' : 'Record Purchase & Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Approved Supplier</h3>
              <button onClick={() => setShowAddSupplierModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Store Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Madina Grain Merchant"
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Haji Muhammad Asghar"
                  value={supplierForm.contactPerson}
                  onChange={(e) => setSupplierForm({ ...supplierForm, contactPerson: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-XXXXXXX"
                    value={supplierForm.phone}
                    onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NTN / Registration</label>
                  <input
                    type="text"
                    placeholder="1234567-8"
                    value={supplierForm.ntn}
                    onChange={(e) => setSupplierForm({ ...supplierForm, ntn: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grain Market, Chowk Kumharanwala, Multan"
                  value={supplierForm.address}
                  onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-md"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 text-white rounded-md font-bold cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
