const Skeleton = ({
  className = "",
}) => (
  <div
    className={`animate-pulse rounded-md bg-gray-200 ${className}`}
  />
);


const SubscriptionSkeleton = () => {
  return (
    <div className="space-y-8">

      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-10 w-80" />
        <Skeleton className="mx-auto h-5 w-[420px]" />
      </div>


      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-64" />
          </div>

          <Skeleton className="h-5 w-64" />
        </div>
      </div>


      <div className="rounded-xl border border-green-200 bg-green-50 p-7">
        <Skeleton className="mb-6 h-6 w-48" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-9 w-36" />
            <Skeleton className="mx-auto h-4 w-28" />
          </div>

          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-9 w-28" />
            <Skeleton className="mx-auto h-4 w-20" />
          </div>

          <div className="space-y-3 text-center">
            <Skeleton className="mx-auto h-4 w-40" />
            <Skeleton className="mx-auto h-9 w-36" />
            <Skeleton className="mx-auto h-4 w-40" />
          </div>
        </div>
      </div>


      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-8">
          <Skeleton className="mx-auto h-7 w-32" />
          <Skeleton className="mx-auto mt-5 h-12 w-48" />
          <Skeleton className="mx-auto mt-4 h-5 w-40" />

          <div className="mt-8 space-y-5">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-5 w-48"
              />
            ))}
          </div>

          <Skeleton className="mt-8 h-11 w-full" />
        </div>


        <div className="rounded-xl border bg-white p-8">
          <Skeleton className="mx-auto h-7 w-40" />
          <Skeleton className="mx-auto mt-5 h-12 w-52" />
          <Skeleton className="mx-auto mt-4 h-5 w-48" />

          <div className="mt-8 space-y-5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <Skeleton
                key={index}
                className="h-5 w-56"
              />
            ))}
          </div>

          <Skeleton className="mt-8 h-11 w-full" />
        </div>
      </div>


      <div className="rounded-xl border bg-white">
        <div className="p-6">
          <Skeleton className="h-7 w-56" />
        </div>

        {Array.from({
          length: 7,
        }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-3 border-t px-6 py-5"
          >
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

    </div>
  );
};


export default SubscriptionSkeleton;