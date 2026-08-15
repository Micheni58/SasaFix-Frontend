const RevenueCommissionChart = ({ data = [] }) => {
  const maxValue = Math.max(
    800000,
    ...data.flatMap((item) => [
      Number(item.revenue || 0),
      Number(item.commission || 0),
    ])
  );

  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `${Math.round(value / 1000)}K`;
    }

    return value;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Revenue vs Commission
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Platform revenue and commission earnings comparison
        </p>
      </div>

      <div className="px-6 pb-6 pt-5">
        <div className="flex h-[290px]">
          <div className="flex w-14 flex-col justify-between pb-10 pt-1 text-xs text-slate-500">
            {[800000, 600000, 400000, 200000, 0].map((value) => (
              <span key={value}>{formatValue(value)}</span>
            ))}
          </div>

          <div className="relative flex-1">
            <div className="absolute inset-x-0 top-0 h-[240px]">
              {[0, 25, 50, 75, 100].map((position) => (
                <div
                  key={position}
                  className="absolute left-0 right-0 border-t border-dashed border-slate-200"
                  style={{ top: `${position}%` }}
                />
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-10 top-0 flex items-end justify-between px-2">
              {data.map((item) => {
                const revenueHeight =
                  (Number(item.revenue || 0) / maxValue) * 100;

                const commissionHeight =
                  (Number(item.commission || 0) / maxValue) * 100;

                return (
                  <div
                    key={item.month}
                    className="flex h-full flex-1 items-end justify-center gap-1"
                  >
                    <div
                      className="w-5 rounded-t-md bg-[#5b00ff]"
                      style={{
                        height: `${Math.max(revenueHeight, 2)}%`,
                      }}
                      title={`Revenue: KES ${Number(
                        item.revenue || 0
                      ).toLocaleString()}`}
                    />

                    <div
                      className="w-5 rounded-t-md bg-[#10b981]"
                      style={{
                        height: `${Math.max(commissionHeight, 2)}%`,
                      }}
                      title={`Commission: KES ${Number(
                        item.commission || 0
                      ).toLocaleString()}`}
                    />
                  </div>
                );
              })}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2">
              {data.map((item) => (
                <span
                  key={item.month}
                  className="flex-1 text-center text-xs text-slate-500"
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-2 text-[#5b00ff]">
            <span className="h-3 w-3 bg-[#5b00ff]" />
            Total Revenue
          </span>

          <span className="flex items-center gap-2 text-[#10b981]">
            <span className="h-3 w-3 bg-[#10b981]" />
            Platform Commission
          </span>
        </div>
      </div>
    </div>
  );
};

export default RevenueCommissionChart;