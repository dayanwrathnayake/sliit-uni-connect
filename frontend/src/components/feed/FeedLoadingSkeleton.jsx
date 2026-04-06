function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-9 w-9 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 bg-gray-200 rounded w-32" />
          <div className="h-2.5 bg-gray-200 rounded w-20" />
        </div>
      </div>
      {/* Text lines */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
      {/* Like row */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
        <div className="h-5 w-12 bg-gray-200 rounded" />
        <div className="h-5 w-16 bg-gray-200 rounded" />
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
