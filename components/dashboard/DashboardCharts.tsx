import { BarChart3, TrendingDown, Users } from 'lucide-react';
import { formatPKR } from '@/lib/utils';

interface ExpensePoint { label: string; amount: number }

export function DashboardCharts({ expenses, presentChildren, totalChildren, presentStaff, totalStaff }: { expenses: ExpensePoint[]; presentChildren: number; totalChildren: number; presentStaff: number; totalStaff: number }) {
  const maxExpense = Math.max(...expenses.map((point) => point.amount), 1);
  const childRate = totalChildren ? Math.round((presentChildren / totalChildren) * 100) : 0;
  const staffRate = totalStaff ? Math.round((presentStaff / totalStaff) * 100) : 0;
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-700" /><h2 className="text-sm font-bold text-slate-800">Six-Month Expense Trend</h2></div><TrendingDown className="h-4 w-4 text-emerald-600" /></div><div className="mt-5 flex h-40 items-end gap-3 border-b border-slate-200 px-2">{expenses.map((point) => <div key={point.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="invisible text-[9px] font-bold text-blue-700 group-hover:visible">{formatPKR(point.amount)}</span><div className="w-full max-w-10 rounded-t-md bg-linear-to-t from-blue-700 to-blue-400 transition-all duration-700 hover:from-emerald-700 hover:to-emerald-400" style={{ height: `${Math.max(8, (point.amount / maxExpense) * 100)}%` }} title={`${point.label}: ${formatPKR(point.amount)}`} /><span className="text-[10px] font-bold text-slate-500">{point.label}</span></div>)}</div><p className="mt-3 text-[10px] text-slate-400">Hover a bar to inspect the monthly total.</p></section>
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center gap-2 border-b border-slate-100 pb-3"><Users className="h-4 w-4 text-emerald-700" /><h2 className="text-sm font-bold text-slate-800">Today Attendance Graph</h2></div><div className="mt-5 space-y-5"><AttendanceBar label="Children" present={presentChildren} total={totalChildren} rate={childRate} color="bg-emerald-600" /><AttendanceBar label="Staff" present={presentStaff} total={totalStaff} rate={staffRate} color="bg-blue-600" /></div><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-lg bg-emerald-50 p-3"><p className="text-xl font-extrabold text-emerald-700">{presentChildren}</p><p className="text-[10px] text-slate-500">Children present</p></div><div className="rounded-lg bg-blue-50 p-3"><p className="text-xl font-extrabold text-blue-700">{presentStaff}</p><p className="text-[10px] text-slate-500">Staff present</p></div></div></section>
  </div>;
}

function AttendanceBar({ label, present, total, rate, color }: { label: string; present: number; total: number; rate: number; color: string }) {
  return <div><div className="mb-1 flex justify-between text-xs"><span className="font-semibold text-slate-700">{label}</span><span className="font-bold text-slate-500">{present}/{total} · {rate}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${Math.min(100, rate)}%` }} /></div></div>;
}
