// src/pages/admin/AdminBookings.jsx - Bookings (payouts moved to Transaction Monitor)

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Filter,
  Search,
  AlertCircle,
  Eye,
  BookOpen,
  RefreshCw,
  TrendingUp,
  Receipt,
  DollarSign,
  Wallet,
} from "lucide-react";

import bookingService from "../../api/bookingService";
import apiClient from "../../api/apiClient";
import transactionService from "../../api/transactionService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusOptions = ["All Status", "Pending", "Accepted", "In Progress", "Completed", "Paid", "Rescheduled", "Cancelled"];
const timeOptions = ["All Time", "This Week", "This Month", "This Quarter"];

const bookingStatusStyles = {
  "Pending": "bg-yellow-100 text-yellow-700",
  "Accepted": "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Paid": "bg-emerald-100 text-emerald-700",
  "Rescheduled": "bg-purple-100 text-purple-700",
  "Cancelled": "bg-red-100 text-red-700",
  "New Requests": "bg-purple-100 text-purple-700",
  "Rejected": "bg-red-100 text-red-700",
};

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === "") return "KES 0";
  const num = Number(amount);
  if (isNaN(num) || num === 0) return "KES 0";
  return `KES ${num.toLocaleString()}`;
}

// ─────────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-10 w-10 rounded-2xl bg-gray-200 animate-pulse" />
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" /></td>
      <td className="px-3 py-3"><div className="h-8 w-16 animate-pulse rounded-lg bg-gray-200" /></td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 table-auto">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {[...Array(7)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonFilters() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div className="flex flex-wrap gap-3 md:ml-auto">
          <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-28 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, label, value, sub, isLoading, isEmpty }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      {isLoading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-[1.5rem] font-bold leading-none text-gray-900">{value}</p>
      )}
      <p className="mt-2 font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      {isEmpty && !isLoading && (
        <p className="mt-1 text-xs text-gray-400">No data yet</p>
      )}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  isFiltered = false,
  onClearFilters,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-blue-50 p-6 mb-6">
        <Icon className="h-16 w-16 text-[#056db3]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {isFiltered && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-[#056db3] hover:underline font-medium"
        >
          Clear filters and try again
        </button>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 rounded-lg bg-[#056db3] px-6 py-3 text-white font-semibold hover:bg-[#045a94] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function BookingsAndPayments() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All Time");

  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch Data ──
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      let allBookings = [];
      let totalRevenue = 0;
      let totalCommission = 0;

      try {
        const resp = await apiClient.get("/bookings/admin/all", {
          validateStatus: () => true,
        });
        if (resp.status >= 200 && resp.status < 300) {
          const data = resp.data;
          allBookings = Array.isArray(data) ? data : [];
        } else {
          const bookingsData = await bookingService.listActiveBookings();
          allBookings = bookingsData || [];
        }
      } catch (bookingErr) {
        console.warn("Bookings endpoint not available:", bookingErr);
        try {
          const bookingsData = await bookingService.listActiveBookings();
          allBookings = bookingsData || [];
        } catch (e2) {
          allBookings = [];
        }
      }

      // ── Fetch transaction summary for accurate revenue/commission ──
      try {
        const summaryData = await transactionService.getTransactionSummary();
        if (summaryData && summaryData.totals) {
          totalRevenue = summaryData.totals.total_gross || 0;
          totalCommission = summaryData.totals.total_commission || 0;
        }
      } catch (txErr) {
        console.warn("Transaction summary not available, calculating from bookings:", txErr);
        // Fallback: calculate from completed/paid bookings
        const completedStatuses = ["Completed", "COMPLETED", "Paid", "PAID"];
        allBookings.forEach((b) => {
          const status = b.status || "";
          if (completedStatuses.includes(status) || completedStatuses.includes(status.toUpperCase())) {
            let amount = b.amount || b.amountRaw || 0;
            if (typeof amount === "string" && amount.includes("KES")) {
              amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
            }
            totalRevenue += Number(amount);
            totalCommission += Number(amount) * 0.1;
          }
        });
      }

      // ── Transform bookings ──
      const formattedBookings = (allBookings || []).map((b) => {
        const status = b.status || "Pending";
        const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        const amount = b.amount || b.amountRaw || 0;

        return {
          id: b.id,
          client: b.client_full_name || b.client || b.clientName || `Client #${b.client_id}`,
          client_profile_photo_url: b.client_profile_photo_url,
          provider: b.provider_full_name || b.providerName || b.worker || `Provider #${b.service_provider_id}`,
          provider_profile_photo_url: b.service_provider?.profile_photo_url || b.raw?.service_provider?.profile_photo_url || null,
          service: b.service_name || b.service || "Service Not Specified",
          date: b.scheduled_date || b.date || null,
          amount: Number(amount),
          commission: Number(amount) * 0.1,
          status: statusDisplay,
          providerId: b.service_provider_id || b.serviceProviderId,
          clientId: b.client_id || b.clientId,
          bookingDate: b.created_at || b.createdAt,
          description: b.description || b.details || "",
          location: b.location || "",
          scheduledDate: b.scheduled_date || b.date,
          lastUpdated: b.updated_at || b.updatedAt,
        };
      });

      setBookings(formattedBookings);
      setStats({
        totalRevenue: Math.round(totalRevenue),
        totalCommission: Math.round(totalCommission),
      });

    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response && err.response.status !== 404) {
        setError(err.message || "Failed to load data");
      } else {
        setBookings([]);
        setStats({ totalRevenue: 0, totalCommission: 0 });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filter Bookings ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      const matchesSearch =
        (row.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.provider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.service || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

      let matchesTime = true;
      if (timeFilter !== "All Time" && row.date) {
        const bookingDate = new Date(row.date);
        const now = new Date();
        if (timeFilter === "This Week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          matchesTime = bookingDate >= weekAgo;
        } else if (timeFilter === "This Month") {
          matchesTime = bookingDate.getMonth() === now.getMonth() &&
                        bookingDate.getFullYear() === now.getFullYear();
        } else if (timeFilter === "This Quarter") {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const bookingQuarter = Math.floor(bookingDate.getMonth() / 3);
          matchesTime = bookingQuarter === currentQuarter &&
                        bookingDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [bookings, searchTerm, statusFilter, timeFilter]);

  // ── Clear Filters ──
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setTimeFilter("All Time");
  };

  // ── Navigate to Booking Details ──
  const viewBookingDetails = (booking) => {
    navigate(`/admin/bookings-payments/${booking.id}`);
  };

  // ── Check if data exists ──
  const hasBookings = bookings.length > 0;
  const hasFilteredBookings = filteredBookings.length > 0;
  const isFiltering = searchTerm !== "" || statusFilter !== "All Status" || timeFilter !== "All Time";

  // ── Loading state with skeletons ──
  if (loading) {
    return (
      <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc] overflow-hidden">
        <Sidebar role="admin" />
        <div className="flex-1 ml-0 lg:ml-72 min-w-0">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full overflow-x-hidden">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
                <div className="mt-1 h-5 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[...Array(2)].map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <SkeletonFilters />
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SkeletonTable />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="min-w-0 flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center max-w-2xl mx-auto">
              <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
              <h3 className="mt-4 text-xl font-semibold text-amber-700">Unable to Load Data</h3>
              <p className="mt-2 text-amber-600">{error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-6 rounded-lg bg-[#056db3] px-6 py-2.5 text-white hover:bg-[#045a94] transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main List View ──
  return (
    <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72 min-w-0">
        <Navbar />
        <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* ── Page Header ── */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Bookings
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                View and manage all platform bookings
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ── Stats Cards ── */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              icon={TrendingUp}
              iconBg="bg-[#dfe6ff] text-[#5b38f2]"
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              isLoading={loading}
              isEmpty={stats.totalRevenue === 0}
            />
            <StatCard
              icon={Wallet}
              iconBg="bg-[#dcfce7] text-[#16a34a]"
              label="Total Commission"
              value={formatCurrency(stats.totalCommission)}
              isLoading={loading}
              sub="Platform earnings (10%)"
              isEmpty={stats.totalCommission === 0}
            />
          </div>

          {/* ── Pointer to Transaction Monitor ── */}
          <button
            onClick={() => navigate("/admin/transactions")}
            className="mb-6 flex w-full items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-left transition-colors hover:bg-blue-100"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#056db3]">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Looking for payouts or payment status?</p>
                <p className="text-xs text-gray-500">Payments are automatic — view or retry them in Transaction Monitor</p>
              </div>
            </div>
            <span className="text-sm font-medium text-[#056db3]">Open →</span>
          </button>

          {/* ── Filters ── */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search bookings by client, provider, or service..."
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#056db3] focus:border-2"
                />
              </div>

              <div className="flex flex-wrap gap-3 md:ml-auto">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-12 min-w-35 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                  <select
                    value={timeFilter}
                    onChange={(event) => setTimeFilter(event.target.value)}
                    className="h-12 min-w-35 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
                  >
                    {timeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {(searchTerm || statusFilter !== "All Status" || timeFilter !== "All Time") && (
                  <button
                    onClick={clearFilters}
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              {!hasBookings ? (
                <EmptyState
                  icon={BookOpen}
                  title="No Bookings Yet"
                  description="There are no bookings in the system yet. Once clients start booking services, they will appear here."
                  actionText="Refresh"
                  onAction={() => fetchData(true)}
                />
              ) : !hasFilteredBookings && isFiltering ? (
                <EmptyState
                  icon={Search}
                  title="No Matching Bookings"
                  description="We couldn't find any bookings matching your filters. Try adjusting your search terms."
                  isFiltered={true}
                  onClearFilters={clearFilters}
                />
              ) : (
                <table className="w-full min-w-200 table-auto">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Provider</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Service</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Date</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Amount</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Commission</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                      <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((row) => (
                      <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate max-w-30">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#056db3] text-xs font-semibold text-white">
                              {row.client_profile_photo_url ? <img src={row.client_profile_photo_url} alt={row.client} className="h-full w-full object-cover" /> : (row.client || "?").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <span>{row.client}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-800 truncate max-w-30">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#056db3] text-xs font-semibold text-white">
                              {row.provider_profile_photo_url ? <img src={row.provider_profile_photo_url} alt={row.provider} className="h-full w-full object-cover" /> : (row.provider || "?").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}
                            </div>
                            <span>{row.provider}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-800 truncate max-w-30">
                          {row.service}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {formatDate(row.date)}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                          {formatCurrency(row.amount)}
                        </td>
                        <td className="px-3 py-3 text-sm font-medium text-[#16a34a] whitespace-nowrap">
                          {formatCurrency(row.commission)}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              bookingStatusStyles[row.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => viewBookingDetails(row)}
                            className="inline-flex items-center gap-1 text-sm text-[#056db3] hover:underline"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookingsAndPayments;