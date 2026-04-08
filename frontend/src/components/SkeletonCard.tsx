export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-48 animate-shimmer" />
      <div className="p-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-3/5 rounded animate-shimmer" />
          <div className="h-6 w-10 rounded-full animate-shimmer" />
        </div>
        <div className="h-4 w-full rounded animate-shimmer" />
        <div className="h-4 w-4/5 rounded animate-shimmer" />
        <div className="flex justify-between pt-1">
          <div className="h-6 w-24 rounded-md animate-shimmer" />
          <div className="h-5 w-16 rounded animate-shimmer" />
        </div>
        <div className="flex gap-3 pt-1">
          <div className="h-4 w-20 rounded animate-shimmer" />
          <div className="h-4 w-14 rounded animate-shimmer" />
          <div className="h-4 w-18 rounded animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
