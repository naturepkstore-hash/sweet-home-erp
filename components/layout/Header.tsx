'use client';

import React, { useState } from 'react';
import { Bell, ShieldCheck, CheckCircle, AlertTriangle, Menu } from 'lucide-react';
import { Role } from '@prisma/client';

interface HeaderProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
    roleDisplayName?: string;
    fullName: string;
    department: string;
  };
  notifications?: {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
  }[];
  onToggleMobileMenu?: () => void;
}

export function Header({ user, notifications = [], onToggleMobileMenu }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const todayFormatted = new Date().toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      {/* Search and System Context */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 truncate">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="truncate">Pakistan Bait-ul-Maal Sweet Home Multan</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Date Display */}
        <div className="hidden lg:flex flex-col text-right">
          <span className="text-[11px] font-medium text-slate-500">Official Date</span>
          <span className="text-xs font-bold text-slate-800">{todayFormatted}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>

        {/* Quick Staff Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 btn-interactive cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{user.roleDisplayName || user.role}</span>
          </button>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
            }}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] text-emerald-600 font-medium">Live Feed</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900">Ration Stock Alert</div>
                    <div className="text-amber-700 text-[11px]">Canola Oil (18 tins) is approaching minimum reorder threshold.</div>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-emerald-900">Daily Menu Scheduled</div>
                    <div className="text-emerald-700 text-[11px]">Today's meals prepared for 80+ children & staff.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
