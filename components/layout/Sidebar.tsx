'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
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
} from 'lucide-react';
import { Role } from '@prisma/client';
import { hasModuleAccess, ERPModule } from '@/lib/permissions';

interface SidebarProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
    fullName: string;
    department: string;
  };
}

interface NavItem {
  name: string;
  href: string;
  module: ERPModule;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard', module: 'dashboard', icon: LayoutDashboard },
    { name: 'Children Management', href: '/children', module: 'children', icon: Baby },
    { name: 'Staff & HR', href: '/staff', module: 'staff', icon: Users },
    { name: 'Attendance', href: '/attendance', module: 'attendance', icon: UserCheck },
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

  const visibleItems = navItems.filter((item) => hasModuleAccess(user.role, item.module));

  const roleDisplayNames: Record<Role, string> = {
    INCHARGE: 'Incharge (Highest Authority)',
    ACCOUNT_ASSISTANT: 'Account Assistant',
    HR_REPRESENTATIVE: 'HR Representative',
    CLERK: 'Records Clerk',
    MOTHER_MAID: 'Mother Maid',
    WAITER: 'Waiter / Mess Staff',
    COOK: 'Head Cook / Kitchen',
    COOK_HELPER: 'Cook Helper',
    SWEEPER: 'Sanitation Staff',
    SECURITY_GUARD: 'Security Guard',
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed left-0 top-0 z-30 shadow-xl border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/40 border border-emerald-400/30">
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
      </div>

      {/* Current User Role Pill */}
      <div className="px-4 py-3 bg-slate-800/40 border-b border-slate-800">
        <div className="text-xs text-slate-400 font-medium">Logged in as:</div>
        <div className="text-xs font-semibold text-slate-200 truncate mt-0.5">
          {user.fullName}
        </div>
        <div className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
          {roleDisplayNames[user.role] || user.role}
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
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="truncate">{item.name}</span>
              </div>
              {isActive ? (
                <ChevronRight className="w-3.5 h-3.5 text-emerald-200" />
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/40 rounded-lg border border-red-900/30 transition-all cursor-pointer"
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
  );
}
