'use client';

import React, { useState } from 'react';
import { Bell, Search, User, ShieldCheck, ChevronDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { Role } from '@prisma/client';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  user: {
    id: string;
    username: string;
    email: string;
    role: Role;
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
}

export function Header({ user, notifications = [] }: HeaderProps) {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [switchingUser, setSwitchingUser] = useState(false);

  const staffProfiles = [
    { email: 'incharge@sweethome.pbm.gov.pk', name: 'Malik Muhammad Aslam', role: 'Incharge (Highest Authority)' },
    { email: 'accounts@sweethome.pbm.gov.pk', name: 'Muhammad Tariq Javed', role: 'Account Assistant (Full Ops)' },
    { email: 'hr@sweethome.pbm.gov.pk', name: 'Syed Ali Raza Rizvi', role: 'HR / Representative' },
    { email: 'clerk@sweethome.pbm.gov.pk', name: 'Abdul Rehman Qureshi', role: 'Records Clerk' },
    { email: 'mothermaid1@sweethome.pbm.gov.pk', name: 'Kaneez Fatima', role: 'Mother Maid 1 (Room 101)' },
    { email: 'mothermaid2@sweethome.pbm.gov.pk', name: 'Rashida Bibi', role: 'Mother Maid 2 (Room 102)' },
    { email: 'waiter1@sweethome.pbm.gov.pk', name: 'Muhammad Ramzan', role: 'Waiter 1 (Mess Service)' },
    { email: 'cook1@sweethome.pbm.gov.pk', name: 'Ustad Abdul Majeed', role: 'Head Cook 1 (Kitchen)' },
    { email: 'cookhelper1@sweethome.pbm.gov.pk', name: 'Muhammad Imran', role: 'Cook Helper 1' },
    { email: 'sweeper1@sweethome.pbm.gov.pk', name: 'Babu Masih', role: 'Sweeper 1 (Sanitation)' },
    { email: 'security1@sweethome.pbm.gov.pk', name: 'Subedar (R) M. Hanif', role: 'Security Guard 1 (Day)' },
  ];

  const handleQuickSwitch = async (email: string) => {
    setSwitchingUser(true);
    try {
      const res = await fetch('/api/auth/quick-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        router.refresh();
        window.location.reload();
      }
    } catch (err) {
      console.error('Quick switch failed:', err);
    } finally {
      setSwitchingUser(false);
      setShowUserMenu(false);
    }
  };

  const todayFormatted = new Date().toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-6 shadow-xs">
      {/* Search and System Context */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Pakistan Bait-ul-Maal Sweet Home Multan</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Display */}
        <div className="hidden md:flex flex-col text-right">
          <span className="text-xs font-medium text-slate-500">Official Date</span>
          <span className="text-xs font-bold text-slate-800">{todayFormatted}</span>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

        {/* Quick Staff Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200 transition-all cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Switch Staff Account</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Staff Account Switcher
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {staffProfiles.map((staff) => (
                  <button
                    key={staff.email}
                    onClick={() => handleQuickSwitch(staff.email)}
                    disabled={switchingUser || staff.email === user.email}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex flex-col cursor-pointer ${
                      staff.email === user.email
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{staff.name}</span>
                      {staff.email === user.email && (
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded">Active</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{staff.role}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-all cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] text-emerald-600 font-medium">Live Feed</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto">
                <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-xs flex gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-900">Ration Stock Alert</div>
                    <div className="text-amber-700 text-[11px]">Canola Oil (18 tins) is approaching minimum reorder threshold.</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex gap-2">
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
