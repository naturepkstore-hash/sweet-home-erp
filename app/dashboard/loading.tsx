export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="space-y-2"><div className="skeleton-shimmer h-5 w-72 rounded" /><div className="skeleton-shimmer h-3 w-96 max-w-full rounded" /></div>
        <div className="hidden gap-2 sm:flex"><div className="skeleton-shimmer h-9 w-28 rounded-lg" /><div className="skeleton-shimmer h-9 w-24 rounded-lg" /></div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><div className="skeleton-shimmer h-3 w-28 rounded" /><div className="skeleton-shimmer mt-3 h-8 w-20 rounded" /><div className="skeleton-shimmer mt-2 h-3 w-36 rounded" /></div>)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((item) => <div key={item} className="rounded-xl border border-slate-200 bg-white p-5"><div className="skeleton-shimmer h-4 w-40 rounded" /><div className="skeleton-shimmer mt-5 h-24 rounded-lg" /><div className="skeleton-shimmer mt-3 h-24 rounded-lg" /><div className="skeleton-shimmer mt-3 h-24 rounded-lg" /></div>)}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="skeleton-shimmer h-4 w-48 rounded" /><div className="mt-4 space-y-3">{[1, 2, 3].map((item) => <div key={item} className="skeleton-shimmer h-12 rounded-lg" />)}</div></div>
    </div>
  );
}
