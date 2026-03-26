/**
 * Skeleton Loader Component
 */

export function SkeletonLoader() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 w-full bg-gray-200" />
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/3" />
        <div className="h-4 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-3 w-5/6" />
        <div className="flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-10 bg-gray-200 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

export default function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <SkeletonLoader key={i} />
      ))}
    </div>
  );
}
