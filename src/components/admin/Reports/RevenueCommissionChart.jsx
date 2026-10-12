import { useState } from "react";

const RevenueCommissionChart = ({ data = [] }) => {
  const [hoveredBar, setHoveredBar] = useState(null);
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
              {data.map((item, index) => {
                const revenueHeight =
                  (Number(item.revenue || 0) / maxValue) * 100;

                const commissionHeight =
                  (Number(item.commission || 0) / maxValue) * 100;

                return (
                  <div
                    key={item.month}
                    className="relative flex h-full flex-1 items-end justify-center gap-1"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className={`w-5 cursor-pointer rounded-t-md bg-[#5b00ff] transition-all ${hoveredBar === index ? "brightness-110 shadow-lg" : ""}`}
                      style={{
                        height: `${Math.max(revenueHeight, 2)}%`,
                      }}
                      title={`Revenue: KES ${Number(
                        item.revenue || 0
                      ).toLocaleString()}`}
                    />

                    <div
                      className={`w-5 cursor-pointer rounded-t-md bg-[#10b981] transition-all ${hoveredBar === index ? "brightness-110 shadow-lg" : ""}`}
                      style={{
                        height: `${Math.max(commissionHeight, 2)}%`,
                      }}
                      title={`Commission: KES ${Number(
                        item.commission || 0
                      ).toLocaleString()}`}
                    />

                    {hoveredBar === index && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-36 -translate-x-1/2 rounded-md bg-slate-900 px-3 py-2 text-center text-[11px] text-white shadow-lg">
                        <p className="mb-1 font-semibold text-slate-300">{item.month}</p>
                        <p>Revenue: KES {Number(item.revenue || 0).toLocaleString()}</p>
                        <p>Commission: KES {Number(item.commission || 0).toLocaleString()}</p>
                      </div>
                    )}
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