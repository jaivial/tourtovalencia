const DynamicPageSkeleton = () => {
  return (
    <div className="w-full h-auto flex flex-col items-start z-0 bg-blue-50 overflow-x-hidden animate-pulse gap-12 pt-[100px]">
      {/* IndexSection5 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Section1 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Section2 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>

      {/* Section3 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Section4 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded w-3/4"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Section5 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Section6 Skeleton */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicPageSkeleton;
