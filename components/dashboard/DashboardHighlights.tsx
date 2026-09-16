import { Award, Cake, CheckCircle2, TrendingUp } from 'lucide-react';

interface Birthday { id: string; fullName: string; dateOfBirth: Date }
interface Achievement { id: string; childName: string; grade: string; obtainedMarks: number; totalMarks: number }

export function DashboardHighlights({ birthdays, achievements, presentChildren, totalChildren, presentStaff, totalStaff }: { birthdays: Birthday[]; achievements: Achievement[]; presentChildren: number; totalChildren: number; presentStaff: number; totalStaff: number }) {
  const childProgress = totalChildren ? Math.round((presentChildren / totalChildren) * 100) : 0;
  const staffProgress = totalStaff ? Math.round((presentStaff / totalStaff) * 100) : 0;
  const currentMonth = new Intl.DateTimeFormat('en-PK', { month: 'long' }).format(new Date());
  return <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs lg:col-span-1">
      <div className="flex items-center justify-between"><div className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-emerald-700" /><h2 className="text-sm font-bold text-slate-800">Daily Progress</h2></div><span className="text-[10px] font-bold text-emerald-700">LIVE</span></div>
      <div className="mt-5 space-y-4"><ProgressRow label="Children attendance" value={childProgress} detail={`${presentChildren}/${totalChildren} present`} /><ProgressRow label="Staff attendance" value={staffProgress} detail={`${presentStaff}/${totalStaff} present`} /></div>
    </div>
    <div className="rounded-xl border border-pink-200 bg-pink-50/50 p-5 shadow-xs"><div className="flex items-center justify-between gap-2"><div className="flex items-center gap-2"><Cake className="h-4 w-4 text-pink-600" /><h2 className="text-sm font-bold text-slate-800">{currentMonth} Birthdays</h2></div><span className="text-[10px] font-bold text-pink-700">{birthdays.length} children</span></div><div className="mt-4 max-h-32 space-y-3 overflow-y-auto">{birthdays.length ? birthdays.map((child) => <div key={child.id} className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">{child.fullName}</span><span className="text-[10px] font-bold text-pink-700">{child.dateOfBirth.getDate()} {currentMonth}</span></div>) : <p className="text-xs text-slate-500">No birthdays recorded for {currentMonth}.</p>}</div></div>
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 shadow-xs"><div className="flex items-center gap-2"><Award className="h-4 w-4 text-blue-700" /><h2 className="text-sm font-bold text-slate-800">Learning Highlights</h2></div><div className="mt-4 space-y-3">{achievements.length ? achievements.map((achievement) => <div key={achievement.id} className="flex items-center justify-between text-xs"><span><span className="block font-semibold text-slate-700">{achievement.childName}</span><span className="text-[10px] text-slate-500">{achievement.obtainedMarks}/{achievement.totalMarks} marks</span></span><span className="flex items-center gap-1 font-bold text-blue-700"><CheckCircle2 className="h-3.5 w-3.5" />{achievement.grade}</span></div>) : <p className="text-xs text-slate-500">No education records yet.</p>}</div></div>
  </div>;
}

function ProgressRow({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div><div className="flex items-center justify-between text-xs"><span className="font-semibold text-slate-700">{label}</span><span className="font-bold text-emerald-700">{value}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-emerald-600 transition-all duration-700" style={{ width: `${Math.min(value, 100)}%` }} /></div><p className="mt-1 text-[10px] text-slate-500">{detail}</p></div>;
}
