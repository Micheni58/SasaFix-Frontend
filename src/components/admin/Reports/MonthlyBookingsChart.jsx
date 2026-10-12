import { useState } from "react";

const MonthlyBookingsChart = ({ data = [] }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const width = 900;
  const height = 260;

  const padding = {
    top: 20,
    right: 20,
    bottom: 45,
    left: 55,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    140,
    ...data.map((item) => Number(item.bookings || 0))
  );

  const points = data.map((item, index) => {
    const x =
      padding.left +
      (index / Math.max(data.length - 1, 1)) * chartWidth;

    const y =
      padding.top +
      chartHeight -
      (Number(item.bookings || 0) / maxValue) * chartHeight;

    return {
      ...item,
      x,
      y,
    };
  });

  const path = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`
    )
    .join(" ");

  const yLabels = [0, 35, 70, 105, 140];

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Monthly Bookings Trend
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Total bookings over the selected period
        </p>
      </div>

      <div className="px-5 pb-5 pt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-auto w-full"
        >
          {yLabels.map((label) => {
            const y =
              padding.top +
              chartHeight -
              (label / maxValue) * chartHeight;

            return (
              <g key={label}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                />

                <text
                  x={padding.left - 10}
                  y={y + 5}
                  textAnchor="end"
                  fontSize="12"
                  fill="#64748b"
                >
                  {label}
                </text>
              </g>
            );
          })}

          {data.map((item, index) => {
            const point = points[index];

            return (
              <g key={item.month}>
                <line
                  x1={point.x}
                  x2={point.x}
                  y1={padding.top}
                  y2={padding.top + chartHeight}
                  stroke="#f1f5f9"
                  strokeDasharray="3 3"
                />

                <text
                  x={point.x}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#64748b"
                >
                  {item.month}
                </text>
              </g>
            );
          })}

          <path
            d={path}
            fill="none"
            stroke="#5b00ff"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point, index) => (
            <circle
              key={point.month}
              cx={point.x}
              cy={point.y}
              r={hoveredIndex === index ? "8" : "6"}
              fill="#5b00ff"
              className="cursor-pointer transition-all"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}

          {hoveredIndex !== null && points[hoveredIndex] && (
            <g
              pointerEvents="none"
              transform={`translate(${Math.min(
                Math.max(points[hoveredIndex].x - 54, 4),
                width - 112
              )} ${Math.max(points[hoveredIndex].y - 48, 4)})`}
            >
              <rect width="108" height="34" rx="6" fill="#0f172a" />
              <text x="54" y="14" textAnchor="middle" fontSize="11" fill="#cbd5e1">
                {points[hoveredIndex].month}
              </text>
              <text x="54" y="27" textAnchor="middle" fontSize="12" fontWeight="600" fill="#ffffff">
                {Number(points[hoveredIndex].bookings || 0).toLocaleString()} bookings
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
};

export default MonthlyBookingsChart;