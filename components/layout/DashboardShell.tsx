'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Role } from '@prisma/client';
import { CommandBar } from './CommandBar';

interface DashboardShellProps {
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
  notifications: {
    id: string;
    title: string;
    message: string;
    type: string;
    createdAt: Date;
  }[];
  children: React.ReactNode;
}

export function DashboardShell({ user, notifications, children }: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <CommandBar role={user.role} permissions={user.permissions} />
      {/* Sidebar with mobile drawer state */}
      <Sidebar
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-200">
        <Header
          user={user}
          notifications={notifications}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
