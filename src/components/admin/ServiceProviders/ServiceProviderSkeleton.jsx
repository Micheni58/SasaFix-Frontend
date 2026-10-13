const Skeleton = ({ className = "" }) => (
  <div
    className={`animate-pulse rounded-md bg-slate-200 ${className}`}
  />
);

const ServiceProvidersSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-80" />
        <Skeleton className="h-5 w-96" />
      </div>

      {/* Tabs */}
      <div className="flex items-end gap-8 border-b border-slate-200">
        <Skeleton className="h-10 w-32 rounded-none" />
        <Skeleton className="h-10 w-44 rounded-none" />
      </div>

      {/* Search/filter */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-10" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="min-w-275">
        <div className="grid grid-cols-8 gap-4 bg-slate-50 px-6 py-4">
          {Array.from({ length: 8 }).map(
            (_, index) => (
              <Skeleton
                key={index}
                className="h-4 w-20"
              />
            )
          )}
        </div>

        {Array.from({ length: 6 }).map(
          (_, row) => (
            <div
              key={row}
              className="grid grid-cols-8 items-center gap-4 border-t border-slate-200 px-6 py-5"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>

              <Skeleton className="h-4 w-24" />

              <Skeleton className="h-4 w-28" />

              <Skeleton className="h-6 w-20 rounded-full" />

              <Skeleton className="h-4 w-10" />

              <Skeleton className="h-4 w-10" />

              <Skeleton className="h-4 w-20" />

              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          )
        )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProvidersSkeleton;