const UserGrowthChart = ({ data = [] }) => {
  const width = 500;
  const height = 260;

  const padding = {
    top: 20,
    right: 20,
    bottom: 45,
    left: 50,
  };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxValue = Math.max(
    3000,
    ...data.flatMap((item) => [
      Number(item.clients || 0),
      Number(item.providers || 0),
    ])
  );

  const getPoints = (key) =>
    data.map((item, index) => ({
      x:
        padding.left +
        (index / Math.max(data.length - 1, 1)) * chartWidth,

      y:
        padding.top +
        chartHeight -
        (Number(item[key] || 0) / maxValue) * chartHeight,
    }));

  const clientPoints = getPoints("clients");
  const providerPoints = getPoints("providers");

  const buildPath = (points) =>
    points
      .map((point, index) =>
        index === 0
          ? `M ${point.x} ${point.y}`
          : `L ${point.x} ${point.y}`
      )
      .join(" ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="px-6 pt-6">
        <h2 className="text-lg font-semibold text-slate-900">
          User Growth Over Time
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Client and provider registration trends
        </p>
      </div>

      <div className="px-5 pb-4 pt-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full"
        >
          {[0, 750, 1500, 2250, 3000].map((value) => {
            const y =
              padding.top +
              chartHeight -
              (value / maxValue) * chartHeight;

            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  x2={width - padding.right}
                  y1={y}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                />

                <text
                  x={padding.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#64748b"
                >
                  {value}
                </text>
              </g>
            );
          })}

          <path
            d={buildPath(clientPoints)}
            fill="none"
            stroke="#5b00ff"
            strokeWidth="2"
          />

          <path
            d={buildPath(providerPoints)}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />

          {clientPoints.map((point, index) => (
            <circle
              key={`client-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#5b00ff"
            />
          ))}

          {providerPoints.map((point, index) => (
            <circle
              key={`provider-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#10b981"
            />
          ))}

          {data.map((item, index) => {
            const x =
              padding.left +
              (index / Math.max(data.length - 1, 1)) *
                chartWidth;

            return (
              <text
                key={item.month}
                x={x}
                y={height - 14}
                textAnchor="middle"
                fontSize="11"
                fill="#64748b"
              >
                {item.month}
              </text>
            );
          })}
        </svg>

        <div className="mt-1 flex justify-center gap-6 text-sm">
          <span className="flex items-center gap-2 text-[#5b00ff]">
            <span className="h-2 w-2 rounded-full bg-[#5b00ff]" />
            Clients
          </span>

          <span className="flex items-center gap-2 text-[#10b981]">
            <span className="h-2 w-2 rounded-full bg-[#10b981]" />
            Providers
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserGrowthChart;