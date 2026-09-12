'use client';

import React, { useState } from 'react';
import { Utensils, Package, PlusCircle, CheckCircle2, Flame, ChefHat, ClipboardCheck } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { EmployeeDutyAssignments } from './EmployeeDutyAssignments';

interface KitchenDashboardProps {
  user: {
    id: string;
    fullName: string;
    role: string;
  };
  todayMenu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  } | null;
  rationItems: {
    id: string;
    name: string;
    currentStock: number;
    unit: string;
  }[];
}

export function KitchenDashboard({ user, todayMenu, rationItems }: KitchenDashboardProps) {
  const [mealType, setMealType] = useState('LUNCH');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [headCount, setHeadCount] = useState('95');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [reqItems, setReqItems] = useState('');
  const [reqNotes, setReqNotes] = useState('');
  const [reqSubmitting, setReqSubmitting] = useState(false);
  const [reqSuccess, setReqSuccess] = useState(false);

  const handleLogConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || !quantity) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/mess/consumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: selectedItemId,
          quantity: parseFloat(quantity),
          mealType,
          headCount: parseInt(headCount) || 95,
          notes,
        }),
      });

      if (res.ok) {
        setSuccessMsg('Ingredient consumption recorded and deducted from inventory stock!');
        setQuantity('');
        setNotes('');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStockRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqItems) return;
    setReqSubmitting(true);
    try {
      const res = await fetch('/api/mess/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: reqItems, notes: reqNotes }),
      });
      if (res.ok) {
        setReqSuccess(true);
        setReqItems('');
        setReqNotes('');
        setTimeout(() => setReqSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReqSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-amber-700 via-orange-800 to-amber-900 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-xs mb-2">
              <ChefHat className="w-3.5 h-3.5 text-amber-200" />
              <span>Sweet Home Multan • Kitchen & Mess Department</span>
            </div>
            <h1 className="text-2xl font-extrabold">{user.fullName}</h1>
            <p className="text-xs text-amber-100 mt-1 max-w-xl">
              Hygienic meal preparation, daily weekly menu execution, ingredient consumption tracking, and ration stock requisition.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 text-center min-w-[150px]">
            <div className="text-3xl font-extrabold text-amber-200">95+</div>
            <div className="text-xs text-amber-100 font-medium mt-0.5">Daily Meal Heads</div>
          </div>
        </div>
      </div>

      <EmployeeDutyAssignments />

      {/* Today's 3-Meal Schedule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
              Breakfast (07:00 AM)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
              Morning
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-3">
            {todayMenu?.breakfast || 'Paratha, Fried Eggs / Omelette, Fresh Milk / Tea'}
          </p>
          <div className="text-[11px] text-slate-500 mt-2">
            Target: 80 Children + 15 Duty Staff
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-blue-800 uppercase tracking-wider">
              Lunch (01:30 PM)
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">
              Afternoon
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-3">
            {todayMenu?.lunch || 'Daal Chana Special, Steamed Rice, Fresh Salad, Raita'}
          </p>
          <div className="text-[11px] text-slate-500 mt-2">
            Target: 80 Children + 15 Duty Staff
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider">
              Dinner (08:00 PM)
            </span>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
              Night
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 mt-3">
            {todayMenu?.dinner || 'Chicken Karahi / Korma, Tandoori Roti, Mint Raita'}
          </p>
          <div className="text-[11px] text-slate-500 mt-2">
            Target: 80 Children + 15 Duty Staff
          </div>
        </div>
      </div>

      {/* Grid: Ingredient Consumption Logger + Kitchen Stock Request */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ingredient Consumption Logger */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Flame className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Record Food Ingredient Consumption</h2>
              <p className="text-[11px] text-slate-500">Automatically deducted from live inventory stock</p>
            </div>
          </div>

          {successMsg && (
            <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogConsumption} className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meal Type</label>
                <select
                  value={mealType}
                  onChange={(e) => setMealType(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
                >
                  <option value="BREAKFAST">Breakfast</option>
                  <option value="LUNCH">Lunch</option>
                  <option value="DINNER">Dinner</option>
                  <option value="SPECIAL">Special Event / Refreshment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Heads Served</label>
                <input
                  type="number"
                  value={headCount}
                  onChange={(e) => setHeadCount(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ration Item Used</label>
              <select
                required
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Select Inventory Stock Item --</option>
                {rationItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (In Stock: {item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity Consumed</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 25"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dish / Menu Notes</label>
                <input
                  type="text"
                  placeholder="e.g. For Chicken Biryani lunch"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Recording...' : 'Record Meal Consumption & Deduct Stock'}
            </button>
          </form>
        </div>

        {/* Kitchen Stock Requisition */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Package className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">Kitchen Stock Requisition</h2>
              <p className="text-[11px] text-slate-500">Request supplies from Account Assistant & Incharge</p>
            </div>
          </div>

          {reqSuccess && (
            <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Requisition submitted for approval!</span>
            </div>
          )}

          <form onSubmit={handleCreateStockRequest} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Items & Quantities</label>
              <textarea
                required
                rows={3}
                value={reqItems}
                onChange={(e) => setReqItems(e.target.value)}
                placeholder="e.g. 2 Gas Cylinders, Cooking Oil 2 tins (16L), Fresh Milk 60 Liters, Spices packet"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency / Justification</label>
              <input
                type="text"
                value={reqNotes}
                onChange={(e) => setReqNotes(e.target.value)}
                placeholder="e.g. Required for Friday special meal and weekend stock"
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={reqSubmitting}
              className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {reqSubmitting ? 'Sending Request...' : 'Submit Requisition to Accounts'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
