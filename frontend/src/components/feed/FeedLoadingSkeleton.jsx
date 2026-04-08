function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="flex items-center gap-3 p-4 sm:p-5 pb-0 sm:pb-0">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-3.5 bg-gray-200 dark:bg-slate-700 rounded w-28" />
            <div className="h-4 bg-gray-100 dark:bg-slate-700 rounded-full w-14 hidden sm:block" />
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-slate-700 rounded w-16" />
        </div>
      </div>
      <div className="px-4 sm:px-5 py-3 space-y-2">
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-slate-700/70 rounded w-1/2" />
      </div>
      <div className="flex items-center gap-5 px-4 sm:px-5 py-3 border-t border-gray-50 dark:border-slate-700">
        <div className="h-4 w-16 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-14 bg-gray-200 dark:bg-slate-700 rounded ml-auto" />
      </div>
    </div>
  );
}

export default function FeedLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
