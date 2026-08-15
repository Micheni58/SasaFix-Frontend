import { useEffect, useState } from "react";
import MonthlyBookingsChart from "../../components/admin/Reports/MonthlyBookingsChart";
import RevenueCommissionChart from "../../components/admin/Reports/RevenueCommissionChart";
import ServiceCategoriesChart from "../../components/admin/Reports/ServiceCategoriesChart";
import UserGrowthChart from "../../components/admin/Reports/UserGrowthChart";
import TopRatedProvidersTable from "../../components/admin/Reports/TopRatedProvidersTable";
import reportsService from "../../services/reportsService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const ReportsAnalytics = () => {
  const [period, setPeriod] = useState("6months");

  const [reports, setReports] = useState({
    monthly_bookings: [],
    revenue_commission: [],
    service_categories: [],
    user_growth: [],
    top_rated_providers: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await reportsService.getReports(period);

      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
      setError(
        err.message || "Failed to load reports and analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [period]);

  const handleCSVExport = async () => {
    try {
      await reportsService.exportCSV(period);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handlePDFExport = async () => {
    try {
      await reportsService.exportPDF(period);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />

      <div className="flex-1 ml-72">
        <Navbar />

        <main className="pt-24 px-6 pb-6">
          <div className="min-h-screen bg-[#f8fafc]">
            <div className="mx-auto max-w-[1400px] px-8 py-8">
              {/* Page heading */}
              <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
                <div>
                  {loading ? (
                    <>
                      <div className="h-9 w-64 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-5 w-80 animate-pulse rounded bg-gray-200" />
                    </>
                  ) : (
                    <>
                      <h1 className="text-[30px] font-bold tracking-tight text-[#0f172a]">
                        Reports & Analytics
                      </h1>

                      <p className="mt-1 text-[16px] text-slate-500">
                        Comprehensive platform insights and performance
                        metrics
                      </p>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {loading ? (
                    <>
                      <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                      <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
                      <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
                    </>
                  ) : (
                    <>
                      <select
                        value={period}
                        onChange={(event) =>
                          setPeriod(event.target.value)
                        }
                        className="h-10 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#5b00ff]"
                      >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="3months">Last 3 Months</option>
                        <option value="6months">Last 6 Months</option>
                        <option value="12months">Last 12 Months</option>
                      </select>

                      <button
                        onClick={handlePDFExport}
                        className="flex h-10 items-center gap-2 rounded-lg bg-[#5b00ff] px-5 text-sm font-medium text-white transition hover:bg-[#4d00d9]"
                      >
                        ↓
                        Export to PDF
                      </button>

                      <button
                        onClick={handleCSVExport}
                        className="flex h-10 items-center gap-2 rounded-lg bg-[#08a652] px-5 text-sm font-medium text-white transition hover:bg-[#078f47]"
                      >
                        ↓
                        Export to CSV
                      </button>
                    </>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="space-y-6">
                  {/* Monthly Bookings Skeleton */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="h-6 w-48 animate-pulse rounded bg-gray-200 mb-2" />
                        <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                      </div>

                      <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
                    </div>

                    <div className="h-72 w-full animate-pulse rounded bg-gray-100" />
                  </div>

                  {/* Revenue & Commission Skeleton */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <div className="h-6 w-52 animate-pulse rounded bg-gray-200 mb-2" />
                        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
                      </div>

                      <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
                    </div>

                    <div className="h-72 w-full animate-pulse rounded bg-gray-100" />
                  </div>

                  {/* Service Categories + User Growth Skeleton */}
                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="h-6 w-48 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-200 mb-6" />
                      <div className="h-72 w-full animate-pulse rounded bg-gray-100" />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                      <div className="h-6 w-44 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-200 mb-6" />
                      <div className="h-72 w-full animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>

                  {/* Top Rated Providers Skeleton */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 pb-0">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="h-6 w-48 animate-pulse rounded bg-gray-200 mb-2" />
                          <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                        </div>

                        <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>

                    <div className="border-t border-gray-200 mt-4 overflow-x-auto">
                      <div className="p-6 space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4"
                          >
                            <div className="h-4 w-8 animate-pulse rounded bg-gray-200" />

                            <div className="flex-1 space-y-2">
                              <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
                            </div>

                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

                            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />

                            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />

                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <MonthlyBookingsChart
                    data={reports.monthly_bookings}
                  />

                  <RevenueCommissionChart
                    data={reports.revenue_commission}
                  />

                  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <ServiceCategoriesChart
                      data={reports.service_categories}
                    />

                    <UserGrowthChart
                      data={reports.user_growth}
                    />
                  </div>

                  <TopRatedProvidersTable
                    providers={reports.top_rated_providers}
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics;