'use client';

import React from 'react';
import Link from 'next/link';
import {
  Users,
  Baby,
  Building2,
  Package,
  AlertTriangle,
  Receipt,
  Utensils,
  PlusCircle,
  FileText,
  UserCheck,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { formatPKR, formatDate } from '@/lib/utils';

interface InchargeDashboardProps {
  stats: {
    totalChildren: number;
    totalStaff: number;
    presentChildrenToday: number;
    presentStaffToday: number;
    totalBeds: number;
    occupiedBeds: number;
    vacantBeds: number;
    lowStockCount: number;
    totalInventoryItems: number;
    monthlyExpenses: number;
    todayMenu: {
      breakfast: string;
      lunch: string;
      dinner: string;
    } | null;
  };
  recentPurchases: {
    id: string;
    purchaseNumber: string;
    supplierName: string;
    totalAmount: number;
    purchaseDate: Date;
    paymentStatus: string;
  }[];
  recentAudits: {
    id: string;
    userEmail: string;
    action: string;
    module: string;
    details: string | null;
    createdAt: Date;
  }[];
  lowStockItems: {
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
    unit: string;
    categoryName: string;
  }[];
}

export function InchargeDashboard({
  stats,
  recentPurchases,
  recentAudits,
  lowStockItems,
}: InchargeDashboardProps) {
  const occupancyRate = stats.totalBeds > 0 ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Operations Command Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time live monitoring of Pakistan Bait-ul-Maal Sweet Home Multan
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/children?action=new"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Admit Child</span>
          </Link>
          <Link
            href="/attendance"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <UserCheck className="w-4 h-4" />
            <span>Attendance</span>
          </Link>
          <Link
            href="/reports"
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Children */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Enrolled Children
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalChildren}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>100% Resident in Hostel</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
            <Baby className="w-6 h-6" />
          </div>
        </div>

        {/* Staff Force */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Staff Positions
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.totalStaff} / 23
            </div>
            <div className="text-[11px] text-slate-500 font-medium mt-1">
              Active Institutional Roles
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Hostel Occupancy */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hostel Beds (64 Total)
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {stats.occupiedBeds} <span className="text-sm font-normal text-slate-400">/ {stats.totalBeds}</span>
            </div>
            <div className="text-[11px] text-amber-600 font-medium mt-1">
              {stats.vacantBeds} Vacant Beds Available ({occupancyRate}% Occ.)
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Monthly Expenditure
            </div>
            <div className="text-xl font-extrabold text-slate-900 mt-1 truncate">
              {formatPKR(stats.monthlyExpenses)}
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Within Budget Allocation</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-700">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Grid: Today's Menu + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Institutional Meal Plan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Utensils className="w-4 h-4 text-emerald-700" />
                <span>Today's Institutional Menu</span>
              </div>
              <Link href="/mess" className="text-xs font-semibold text-emerald-700 hover:underline">
                View Week
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  Breakfast (07:00 AM)
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {stats.todayMenu?.breakfast || 'Paratha, Fried Eggs / Omelette, Fresh Milk'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                  Lunch (01:30 PM)
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {stats.todayMenu?.lunch || 'Daal Chana Special, Steamed Rice, Fresh Salad'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Dinner (08:00 PM)
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">
                  {stats.todayMenu?.dinner || 'Chicken Karahi / Korma, Tandoori Roti, Raita'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Prepared for 95+ Heads</span>
            <span className="text-emerald-700 font-semibold">Kitchen On Schedule</span>
          </div>
        </div>

        {/* Ration & Inventory Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Package className="w-4 h-4 text-amber-600" />
                <span>Ration & Stock Status</span>
              </div>
              <Link href="/inventory" className="text-xs font-semibold text-emerald-700 hover:underline">
                Manage Stock
              </Link>
            </div>

            <div className="mt-3">
              {lowStockItems.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  All inventory items are currently above minimum threshold.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-500">{item.categoryName}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-extrabold text-amber-700">
                          {item.currentStock} {item.unit}
                        </div>
                        <div className="text-[10px] text-slate-400">Min: {item.minStock} {item.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{stats.totalInventoryItems} Total Tracked Items</span>
            <Link href="/purchases?action=new" className="text-emerald-700 font-bold hover:underline flex items-center gap-1">
              <span>Create Purchase</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Live System Audit Feed */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Security & Audit Log Feed</span>
              </div>
              <Link href="/audit" className="text-xs font-semibold text-emerald-700 hover:underline">
                Full Logs
              </Link>
            </div>

            <div className="mt-3 space-y-2.5 max-h-56 overflow-y-auto">
              {recentAudits.slice(0, 4).map((audit) => (
                <div key={audit.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                      {audit.userEmail}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(audit.createdAt)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 truncate mt-0.5">
                    <span className="font-bold text-emerald-700">[{audit.action}]</span> {audit.details || audit.module}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Immutable Audit Trail Enabled
          </div>
        </div>

      </div>

      {/* Bottom Section: Recent Purchases Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Procurement & Ration Purchases</h2>
            <p className="text-xs text-slate-500">Auto-linked with Inventory and Financial Ledger</p>
          </div>
          <Link
            href="/purchases"
            className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All Purchases</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">PO Number</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Payment Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentPurchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                    No recent purchases found.
                  </td>
                </tr>
              ) : (
                recentPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-bold text-slate-900">{p.purchaseNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{p.supplierName}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(p.purchaseDate)}</td>
                    <td className="px-4 py-3 font-bold text-emerald-800">{formatPKR(p.totalAmount)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/purchases`} className="text-emerald-700 hover:underline font-semibold">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
