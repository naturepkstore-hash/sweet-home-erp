'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Edit2,
  Download,
  CheckCircle,
  X,
  AlertCircle,
  ChefHat,
} from 'lucide-react';
import { exportToExcelFile } from '@/lib/export';
import { formatDate } from '@/lib/utils';

interface MenuDay {
  id: string;
  dayOfWeek: string;
  breakfastMenu: string;
  lunchMenu: string;
  dinnerMenu: string;
  notes: string | null;
}

interface MealRecordItem {
  id: string;
  date: string;
  mealType: string;
  menuItem: string;
  totalHeads: number;
  preparedBy: string;
  notes: string | null;
}

export function MessManagement() {
  const [menus, setMenus] = useState<MenuDay[]>([]);
  const [mealRecords, setMealRecords] = useState<MealRecordItem[]>([]);
  const [rationItems, setRationItems] = useState<{ id: string; name: string; currentStock: number; unit: string }[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showEditMenuModal, setShowEditMenuModal] = useState(false);
  const [selectedDayMenu, setSelectedDayMenu] = useState<MenuDay | null>(null);
  const [showLogMealModal, setShowLogMealModal] = useState(false);

  // Edit Menu Form
  const [editMenuForm, setEditMenuForm] = useState({
    dayOfWeek: '',
    breakfastMenu: '',
    lunchMenu: '',
    dinnerMenu: '',
    notes: '',
  });

  // Log Meal Form
  const [mealForm, setMealForm] = useState({
    mealType: 'LUNCH',
    menuItem: 'Chicken Karahi with Tandoori Roti',
    headCount: '95',
    itemId: '',
    quantity: '',
    notes: '',
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, mealRes, itemRes] = await Promise.all([
        fetch('/api/mess/menu'),
        fetch('/api/mess/consumption'),
        fetch('/api/inventory/items?categoryId=FOOD_RATION'),
      ]);

      const menuData = await menuRes.json();
      const mealData = await mealRes.json();
      const itemData = await itemRes.json();

      if (menuData.success) setMenus(menuData.menus || []);
      if (mealData.success) setMealRecords(mealData.mealRecords || []);
      if (itemData.success) setRationItems(itemData.items || []);
    } catch (err) {
      console.error('Fetch mess error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditMenu = (menu: MenuDay) => {
    setSelectedDayMenu(menu);
    setEditMenuForm({
      dayOfWeek: menu.dayOfWeek,
      breakfastMenu: menu.breakfastMenu,
      lunchMenu: menu.lunchMenu,
      dinnerMenu: menu.dinnerMenu,
      notes: menu.notes || '',
    });
    setFormError(null);
    setFormSuccess(null);
    setShowEditMenuModal(true);
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/mess/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMenuForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to update menu');
        return;
      }

      setFormSuccess('Weekly menu updated successfully!');
      setTimeout(() => {
        setShowEditMenuModal(false);
        setFormSuccess(null);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveMealRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/mess/consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealForm),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || 'Failed to record meal');
        return;
      }

      setFormSuccess('Meal consumption recorded and stock updated!');
      setTimeout(() => {
        setShowLogMealModal(false);
        setFormSuccess(null);
        fetchData();
      }, 1500);
    } catch (err) {
      console.error(err);
      setFormError('Network error while saving meal.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportExcel = () => {
    const exportData = menus.map((m) => ({
      'Day of Week': m.dayOfWeek,
      'Breakfast (07:00 AM)': m.breakfastMenu,
      'Lunch (01:30 PM)': m.lunchMenu,
      'Dinner (08:00 PM)': m.dinnerMenu,
      'Dietary Notes': m.notes || '-',
    }));

    exportToExcelFile(exportData, 'Sweet_Home_Multan_Weekly_Meal_Menu');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Kitchen & Mess Management</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Approved Weekly Diet
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Nutritional menu planning, 3 daily meals (Breakfast, Lunch, Dinner), ingredient stock deductions, and meal service records.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Menu</span>
          </button>
          <button
            onClick={() => setShowLogMealModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>Record Meal Cooking</span>
          </button>
        </div>
      </div>

      {/* 7-Day Weekly Menu Schedule Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Standard 7-Day Institutional Menu Schedule</h2>
          <span className="text-xs text-slate-500">Prepared for 95+ heads daily</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col justify-between hover:border-emerald-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-extrabold text-xs text-emerald-900 uppercase tracking-wider">
                    {menu.dayOfWeek}
                  </span>
                  <button
                    onClick={() => handleOpenEditMenu(menu)}
                    className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                    title="Edit Day Menu"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2.5 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <span className="text-[10px] font-bold uppercase text-emerald-800 block">Breakfast</span>
                    <p className="text-slate-800 font-semibold mt-0.5">{menu.breakfastMenu}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100">
                    <span className="text-[10px] font-bold uppercase text-blue-800 block">Lunch</span>
                    <p className="text-slate-800 font-semibold mt-0.5">{menu.lunchMenu}</p>
                  </div>

                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                    <span className="text-[10px] font-bold uppercase text-amber-800 block">Dinner</span>
                    <p className="text-slate-800 font-semibold mt-0.5">{menu.dinnerMenu}</p>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-400 truncate">
                {menu.notes || 'Full standard nutritious diet'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Meal Preparation Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Meal Preparation & Serving History</h2>
            <p className="text-xs text-slate-500">Recorded by Kitchen staff and Waiters</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Meal Type</th>
                <th className="px-4 py-3">Dish / Menu Items</th>
                <th className="px-4 py-3">Total Heads</th>
                <th className="px-4 py-3">Prepared By</th>
                <th className="px-4 py-3">Kitchen Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Loading kitchen records...
                  </td>
                </tr>
              ) : mealRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    No recent meal logs found.
                  </td>
                </tr>
              ) : (
                mealRecords.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-500">{formatDate(m.date)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">{m.mealType}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{m.menuItem}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{m.totalHeads} Heads</td>
                    <td className="px-4 py-3 text-slate-700">{m.preparedBy}</td>
                    <td className="px-4 py-3 text-slate-500 text-[11px]">{m.notes || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Menu Modal */}
      {showEditMenuModal && selectedDayMenu && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Update {selectedDayMenu.dayOfWeek} Menu</h3>
              <button onClick={() => setShowEditMenuModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
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

            <form onSubmit={handleSaveMenu} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Breakfast Menu (07:00 AM) *</label>
                <textarea
                  rows={2}
                  required
                  value={editMenuForm.breakfastMenu}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, breakfastMenu: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lunch Menu (01:30 PM) *</label>
                <textarea
                  rows={2}
                  required
                  value={editMenuForm.lunchMenu}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, lunchMenu: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dinner Menu (08:00 PM) *</label>
                <textarea
                  rows={2}
                  required
                  value={editMenuForm.dinnerMenu}
                  onChange={(e) => setEditMenuForm({ ...editMenuForm, dinnerMenu: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditMenuModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Save Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Meal Cooking Modal */}
      {showLogMealModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">Record Meal Preparation & Stock Usage</h3>
              </div>
              <button onClick={() => setShowLogMealModal(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-md">
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

            <form onSubmit={handleSaveMealRecord} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Meal Type *</label>
                  <select
                    value={mealForm.mealType}
                    onChange={(e) => setMealForm({ ...mealForm, mealType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                  >
                    <option value="BREAKFAST">BREAKFAST</option>
                    <option value="LUNCH">LUNCH</option>
                    <option value="DINNER">DINNER</option>
                    <option value="SPECIAL">SPECIAL / EVENT</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Heads *</label>
                  <input
                    type="number"
                    value={mealForm.headCount}
                    onChange={(e) => setMealForm({ ...mealForm, headCount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dish Prepared *</label>
                <input
                  type="text"
                  required
                  value={mealForm.menuItem}
                  onChange={(e) => setMealForm({ ...mealForm, menuItem: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/70">
                <div className="font-bold text-amber-900 mb-1">Auto-Deduct Ration from Inventory</div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Inventory Item</label>
                    <select
                      value={mealForm.itemId}
                      onChange={(e) => setMealForm({ ...mealForm, itemId: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden text-[11px]"
                    >
                      <option value="">-- Optional Item --</option>
                      {rationItems.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.name} ({i.currentStock} {i.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 mb-1 font-semibold">Quantity</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 25"
                      value={mealForm.quantity}
                      onChange={(e) => setMealForm({ ...mealForm, quantity: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-md outline-hidden font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowLogMealModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-bold shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSubmitting ? 'Saving...' : 'Record Meal & Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
