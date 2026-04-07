function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-28" />
          <div className="h-2.5 bg-gray-100 rounded-full w-16" />
        </div>
      </div>
      {/* Text lines */}
      <div className="space-y-2.5 mb-4">
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        <div className="h-3 bg-gray-100 rounded-full w-2/3" />
      </div>
      {/* Image placeholder (every other card) */}
      <div className="h-40 bg-gray-100 rounded-lg mb-4" />
      {/* Like row */}
      <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-5 w-18 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

function SkeletonCardSmall() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse">
      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-32" />
          <div className="h-2.5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
      {/* Text lines */}
      <div className="space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
      </div>
      {/* Like row */}
      <div className="flex items-center gap-3 pt-3 mt-4 border-t border-gray-50">
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function FeedLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCardSmall />
      <SkeletonCard />
    </div>
  );
}
