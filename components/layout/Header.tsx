'use client';

import React, { useState } from 'react';
import { Bell, ShieldCheck, CheckCircle, AlertTriangle, Menu, Moon, Sun } from 'lucide-react';
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
  const [darkMode, setDarkMode] = useState(false);
  const todayFormatted = new Date().toLocaleDateString('en-PK', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const notificationCount = notifications.length;

  React.useEffect(() => {
    const saved = window.localStorage.getItem('sweet-home-theme') === 'dark';
    setDarkMode(saved);
    document.documentElement.dataset.theme = saved ? 'dark' : 'light';
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    window.localStorage.setItem('sweet-home-theme', next ? 'dark' : 'light');
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
  };

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

        <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all cursor-pointer" aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'} title={darkMode ? 'Light theme' : 'Dark theme'}>
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

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
            aria-expanded={showNotifications}
            aria-haspopup="menu"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-amber-500 text-white rounded-full ring-2 ring-white text-[9px] font-bold leading-4 text-center animate-scale-in">{notificationCount > 9 ? '9+' : notificationCount}</span>}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-3 z-50 animate-scale-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-800">System Notifications</span>
                <span className="text-[10px] text-emerald-600 font-medium">Live Feed</span>
              </div>
              <div className="py-2 space-y-2 max-h-60 overflow-y-auto" role="menu">
                {notifications.length === 0 ? <div className="px-2 py-5 text-center text-xs text-slate-500">No new notifications.</div> : notifications.map((notification) => {
                  const isWarning = notification.type === 'WARNING' || notification.type === 'ALERT';
                  return <div key={notification.id} className={`p-2.5 rounded-lg border text-xs flex gap-2 ${isWarning ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`} role="menuitem">
                    {isWarning ? <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
                    <div><div className={`font-semibold ${isWarning ? 'text-amber-900' : 'text-emerald-900'}`}>{notification.title}</div><div className={`text-[11px] ${isWarning ? 'text-amber-700' : 'text-emerald-700'}`}>{notification.message}</div></div>
                  </div>;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
