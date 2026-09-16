'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  Building2,
  GraduationCap,
  Package,
  UtensilsCrossed,
  HeartPulse,
  DollarSign,
  ShoppingCart,
  Receipt,
  FileBarChart,
  ShieldAlert,
  Settings,
  Baby,
  LogOut,
  ChevronRight,
  Shield,
  X,
  CalendarDays,
  Banknote,
} from 'lucide-react';
import { Role } from '@prisma/client';
import { hasModuleAccess, ERPModule, ROLE_DISPLAY_NAMES } from '@/lib/permissions';

interface SidebarProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
    roleDisplayName?: string;
    fullName: string;
    department: string;
    permissions?: string[];
  };
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  href: string;
  module: ERPModule;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ user, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', module: 'dashboard', icon: LayoutDashboard },
    { name: 'Children Management', href: '/children', module: 'children', icon: Baby },
    { name: 'Staff & HR', href: '/staff', module: 'staff', icon: Users },
    { name: 'Leave Management', href: '/leave', module: 'leave', icon: CalendarDays },
    { name: 'Payroll & Salary', href: '/payroll', module: 'payroll', icon: Banknote },
    { name: 'Attendance', href: '/attendance', module: 'attendance', icon: UserCheck },
    { name: 'Duty Assignment', href: '/duties', module: 'duties', icon: ClipboardList },
    { name: 'Hostel Management', href: '/hostel', module: 'hostel', icon: Building2 },
    { name: 'Education', href: '/education', module: 'education', icon: GraduationCap },
    { name: 'Inventory & Ration', href: '/inventory', module: 'inventory', icon: Package },
    { name: 'Kitchen & Mess', href: '/mess', module: 'mess', icon: UtensilsCrossed },
    { name: 'Medical & Health', href: '/medical', module: 'medical', icon: HeartPulse },
    { name: 'Finance & Ledger', href: '/finance', module: 'finance', icon: DollarSign },
    { name: 'Purchases', href: '/purchases', module: 'purchases', icon: ShoppingCart },
    { name: 'Expenses', href: '/expenses', module: 'expenses', icon: Receipt },
    { name: 'Reports Center', href: '/reports', module: 'reports', icon: FileBarChart },
    { name: 'Audit Logs', href: '/audit', module: 'audit', icon: ShieldAlert },
    { name: 'Settings', href: '/settings', module: 'settings', icon: Settings },
  ];

  const visibleItems = navItems.filter((item) => hasModuleAccess(user.role, item.module, user.permissions));

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-fade-in"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-2xl md:shadow-xl border-r border-slate-800 transition-transform duration-250 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/40 border border-emerald-400/30 transition-transform duration-200 hover:scale-105">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm leading-tight text-white truncate">
                SWEET HOME MULTAN
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium truncate">
                Pakistan Bait-ul-Maal
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Role Pill */}
        <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800">
          <div className="text-xs text-slate-400 font-medium">Logged in as:</div>
          <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
            {user.fullName}
          </div>
          <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            {user.roleDisplayName || ROLE_DISPLAY_NAMES[user.role] || user.role}
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Main Menu
          </div>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/50'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white hover:translate-x-0.5'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>
                {isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-200 animate-slide-right" />
                ) : item.badge ? (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg border border-red-900/30 btn-interactive cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </form>
          <div className="text-center mt-2 text-[10px] text-slate-400">
            Sweet Home Multan ERP v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
