import { useState } from "react";

const ServiceCategoriesChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const colors = [
    "#5b00ff",
    "#913cff",
    "#a855f7",
    "#c084fc",
    "#ddd6fe",
    "#ede9fe",
  ];

  let cumulative = 0;

  const gradient = data
    .map((item, index) => {
      const start = cumulative;
      cumulative += Number(item.percentage || 0);

      return `${colors[index % colors.length]} ${start}% ${cumulative}%`;
    })
    .join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Top Service Categories
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Distribution of bookings by service type
        </p>
      </div>

      <div className="relative flex min-h-[340px] items-center justify-center px-5 pb-8 pt-3">
        <div className="relative h-48 w-48 shrink-0">
          <div
            className={`h-full w-full rounded-full transition-transform ${hoveredIndex !== null ? "scale-105" : ""}`}
            style={{
              background: `conic-gradient(${gradient})`,
            }}
          />

          <div className="absolute inset-[1px] rounded-full bg-white" />

          <div className="absolute inset-[28%] rounded-full bg-white" />
        </div>

        <div className="ml-8 space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className={`flex cursor-pointer items-center gap-2 text-sm transition-opacity ${hoveredIndex !== null && hoveredIndex !== index ? "opacity-40" : ""}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor:
                    colors[index % colors.length],
                }}
              />

              <span className="text-slate-700">
                {item.name}
              </span>

              <span className="font-medium text-slate-900">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>

        {hoveredIndex !== null && data[hoveredIndex] && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="max-w-20 text-xs font-medium text-slate-500">{data[hoveredIndex].name}</p>
            <p className="text-lg font-bold text-slate-900">{data[hoveredIndex].percentage}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCategoriesChart;