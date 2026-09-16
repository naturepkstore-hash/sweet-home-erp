'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, ArrowRight } from 'lucide-react';
import { ERPModule, hasModuleAccess } from '@/lib/permissions';
import { Role } from '@prisma/client';

const commands: { name: string; href: string; module: ERPModule; keywords: string }[] = [
  { name: 'Dashboard', href: '/dashboard', module: 'dashboard', keywords: 'home overview command center' },
  { name: 'Children Management', href: '/children', module: 'children', keywords: 'child profile admission complaint' },
  { name: 'Staff & HR', href: '/staff', module: 'staff', keywords: 'employees workers' },
  { name: 'Leave Management', href: '/leave', module: 'leave', keywords: 'holiday sick absence request approval' },
  { name: 'Payroll & Salary', href: '/payroll', module: 'payroll', keywords: 'salary payslip wages deductions payment' },
  { name: 'Attendance', href: '/attendance', module: 'attendance', keywords: 'present absent daily' },
  { name: 'Duty Assignment', href: '/duties', module: 'duties', keywords: 'roster shift task' },
  { name: 'Inventory & Ration', href: '/inventory', module: 'inventory', keywords: 'stock items low empty' },
  { name: 'Kitchen & Mess', href: '/mess', module: 'mess', keywords: 'menu food meal' },
  { name: 'Medical & Health', href: '/medical', module: 'medical', keywords: 'doctor visit health' },
  { name: 'Finance & Ledger', href: '/finance', module: 'finance', keywords: 'money expense budget' },
  { name: 'Reports Center', href: '/reports', module: 'reports', keywords: 'export report excel' },
  { name: 'Settings', href: '/settings', module: 'settings', keywords: 'configuration preferences' },
];

export function CommandBar({ role, permissions }: { role: Role; permissions?: string[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const visibleCommands = useMemo(() => commands.filter((command) => hasModuleAccess(role, command.module, permissions)), [role, permissions]);
  const filtered = visibleCommands.filter((command) => `${command.name} ${command.keywords}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  if (!open) return null;
  return <div className="fixed inset-0 z-[60] bg-slate-950/50 p-4 backdrop-blur-xs" onMouseDown={() => setOpen(false)}>
    <div className="mx-auto mt-[12vh] w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl animate-scale-in" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3"><Search className="h-4 w-4 text-emerald-600" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ERP modules..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-hidden" /><kbd className="rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd></div>
      <div className="max-h-80 overflow-y-auto p-2">{filtered.length === 0 ? <p className="px-3 py-8 text-center text-xs text-slate-500">No matching module.</p> : filtered.map((command) => <button key={command.href} onClick={() => { setOpen(false); router.push(command.href); }} className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"><span className="flex items-center gap-2"><Command className="h-3.5 w-3.5 text-emerald-600" />{command.name}</span><ArrowRight className="h-3.5 w-3.5 text-slate-400" /></button>)}</div>
      <div className="border-t border-slate-100 px-4 py-2 text-[10px] text-slate-400">Quick navigation across your authorized ERP modules</div>
    </div>
  </div>;
}
