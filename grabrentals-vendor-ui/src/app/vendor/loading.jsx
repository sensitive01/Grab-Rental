export default function VendorLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
          <div className="h-8 w-64 bg-slate-200 rounded-xl" />
          <div className="h-3.5 w-80 bg-slate-200/70 rounded-md" />
        </div>
        <div className="h-10 w-36 bg-slate-200 rounded-xl" />
      </div>

      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="w-8 h-8 rounded-xl bg-slate-100" />
            </div>
            <div className="h-7 w-20 bg-slate-200 rounded-lg" />
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Content Table Skeleton */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="h-5 w-40 bg-slate-200 rounded-md" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
        </div>
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center px-4 justify-between">
              <div className="h-3.5 w-44 bg-slate-200 rounded" />
              <div className="h-3.5 w-28 bg-slate-200 rounded" />
              <div className="h-3.5 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
