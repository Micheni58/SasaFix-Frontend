const medalStyles = {
  1: "bg-yellow-100 text-yellow-600",
  2: "bg-slate-100 text-slate-500",
  3: "bg-orange-100 text-orange-500",
};

const TopRatedProvidersTable = ({ providers = [] }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          Top Rated Providers
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Highest performing service providers on the platform
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Rank</th>
              <th className="px-6 py-3">Provider</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Rating</th>
              <th className="px-6 py-3">Total Jobs</th>
              <th className="px-6 py-3">Total Earnings</th>
            </tr>
          </thead>

          <tbody>
            {providers.map((provider) => (
              <tr
                key={provider.provider_id}
                className="border-t border-slate-200"
              >
                <td className="px-6 py-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                      medalStyles[provider.rank] ||
                      "bg-slate-50 text-slate-500"
                    }`}
                  >
                    {provider.rank <= 3 ? (
                      <span>♙</span>
                    ) : (
                      `#${provider.rank}`
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5b00ff] font-semibold text-white">
                      {provider.first_name?.charAt(0)}
                    </div>

                    <span className="font-medium text-slate-900">
                      {provider.first_name} {provider.last_name}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {provider.category}
                </td>

                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 font-medium text-slate-900">
                    <span className="text-yellow-500">★</span>
                    {Number(provider.rating || 0).toFixed(1)}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-700">
                  {provider.total_jobs}
                </td>

                <td className="px-6 py-4 font-semibold text-emerald-600">
                  KES{" "}
                  {Number(
                    provider.total_earnings || 0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopRatedProvidersTable;