// src/pages/Admin/AdminDashboard.jsx - Updated Payout Integration

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronRight,
  Activity,
  CreditCard,
  Download,
  Wallet,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import bookingService from "../../api/bookingService";
import paymentsService from "../../api/paymentsService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === "") return "KES 0";
  const num = Number(amount);
  if (isNaN(num) || num === 0) return "KES 0";
  return `KES ${num.toLocaleString()}`;
}

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function getStatusStyles(status) {
  const styles = {
    "Completed": "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    "Scheduled": "bg-amber-100 text-amber-700",
    "Pending": "bg-yellow-100 text-yellow-700",
    "Cancelled": "bg-red-100 text-red-700",
    "New Requests": "bg-amber-50 text-amber-700",
    "Accepted": "bg-green-200 text-green-700",
    "Approved": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
    "Paid": "bg-emerald-100 text-emerald-700",
    "Rescheduled": "bg-purple-100 text-purple-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
}

function getStatusIcon(status) {
  const icons = {
    "Completed": CheckCircle,
    "In Progress": Clock,
    "Scheduled": Calendar,
    "Pending": Clock,
    "Cancelled": XCircle,
    "New Requests": AlertTriangle,
    "Accepted": CheckCircle,
    "Approved": CheckCircle,
    "Rejected": XCircle,
    "Paid": CheckCircle,
    "Rescheduled": Clock,
  };
  return icons[status] || Activity;
}

// ─────────────────────────────────────────────
// SKELETON LOADER COMPONENTS
// ─────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
      <div className="flex flex-col items-start">
        <div className="p-3 rounded-full mb-3 bg-gray-200 animate-pulse">
          <div className="w-6 h-6" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200 mb-1" />
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200 mb-2" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="h-72 w-full animate-pulse rounded bg-gray-100" />
    </div>
  );
}

function SkeletonQuickStats() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="h-6 w-32 animate-pulse rounded bg-gray-200 mb-4" />
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-200 animate-pulse">
                <div className="w-5 h-5" />
              </div>
              <div>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200 mb-1" />
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <div className="w-5 h-5 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 pb-0">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200 mb-2" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
      <div className="border-t border-gray-200 mt-4 overflow-x-auto">
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
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
  );
}

// ─────────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────────

function StatCard({ title, value, icon: Icon, iconBg, trend, isLoading, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-all relative ${
        onClick ? "cursor-pointer hover:border-[#056db3]" : ""
      }`}
    >
      {trend && !isLoading && (
        <div className="absolute top-4 right-4">
          <span className="text-sm text-green-600 font-medium">{trend}</span>
        </div>
      )}
      <div className="flex flex-col items-start">
        <div className={`p-3 ${iconBg} rounded-full mb-3`}>
          <Icon className="w-6 h-6" />
        </div>
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-gray-200 mb-1" />
        ) : (
          <p className="text-2xl font-bold text-gray-800 mb-1">{value}</p>
        )}
        <h2 className="text-sm font-medium text-gray-600">{title}</h2>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CHART COMPONENT
// ─────────────────────────────────────────────

function BookingChart({ data }) {
  const [chartReady, setChartReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setChartReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  if (!chartReady || !data || data.length === 0) {
    return (
      <div className="h-72 w-full flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-400">Loading chart data...</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value) => [value, "Bookings"]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#056db3"
            strokeWidth={3}
            dot={{ fill: "#056db3", r: 4 }}
            activeDot={{ r: 6 }}
            name="Bookings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function AdminDashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProviders: 0,
    activeBookings: 0,
    totalBookings: 0,
    platformCommission: 0,
    totalRevenue: 0,
    pendingPayouts: 0,
    totalPaid: 0,
  });

  const [bookingData, setBookingData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      // ── Fetch Users ──
      let totalUsers = 0;
      try {
        const resp = await fetch("/api/users");
        if (resp.ok) {
          const data = await resp.json();
          const users = Array.isArray(data) ? data : data.users || [];
          totalUsers = users.length;
        }
      } catch (e) {
        console.info("Users endpoint not yet available");
      }

      // ── Fetch Providers ──
      let totalProviders = 0;
      try {
        const resp = await fetch("/api/service-providers");
        if (resp.ok) {
          const data = await resp.json();
          const providers = Array.isArray(data) ? data : data.service_providers || [];
          totalProviders = providers.length;
        }
      } catch (e) {
        console.info("Service providers endpoint not yet available");
      }

      // ── Fetch ALL Bookings from admin endpoint ──
      let allBookings = [];
      try {
        const resp = await fetch("/api/bookings/admin/all");
        if (resp.ok) {
          const data = await resp.json();
          allBookings = Array.isArray(data) ? data : [];
          console.log("📊 All bookings from admin endpoint:", allBookings);
        } else {
          // Fallback: get active bookings
          const active = await bookingService.listActiveBookings();
          allBookings = active || [];
        }
      } catch (e) {
        console.warn("Admin bookings endpoint not available, using fallback");
        try {
          const active = await bookingService.listActiveBookings();
          allBookings = active || [];
        } catch (e2) {
          allBookings = [];
        }
      }

      // ── Calculate stats from ALL bookings ──
      const completedBookings = allBookings.filter(b => {
        const status = b.status || "";
        const completedStatuses = ["Completed", "COMPLETED", "Paid", "PAID", "completed", "paid"];
        return completedStatuses.includes(status);
      });
      
      const totalRevenue = completedBookings.reduce((sum, b) => {
        let amount = b.amount || b.amountRaw || 0;
        if (typeof amount === "string" && amount.includes("KES")) {
          amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
        }
        return sum + Number(amount);
      }, 0);

      // ── Calculate Platform Commission (10% of revenue) ──
      const platformCommission = totalRevenue * 0.1;

      // ── Fetch Payout Stats from paymentsService ──
      let pendingPayouts = 0;
      let totalPaid = 0;
      try {
        const statsData = await paymentsService.getAdminStats();
        console.log("📊 Payout stats from paymentsService:", statsData);
        pendingPayouts = statsData.total_pending_amount || 0;
        totalPaid = statsData.total_completed_amount || 0;
      } catch (e) {
        console.warn("Payout stats endpoint not available");
        // Fallback: calculate from bookings
        const paidBookings = allBookings.filter(b => {
          const status = b.status || "";
          return status === "Paid" || status === "PAID" || status === "paid";
        });
        totalPaid = paidBookings.reduce((sum, b) => {
          let amount = b.amount || b.amountRaw || 0;
          if (typeof amount === "string" && amount.includes("KES")) {
            amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
          }
          return sum + Number(amount);
        }, 0);
      }

      // ── Calculate active bookings ──
      const activeBookings = allBookings.filter(b => {
        const status = b.status || "";
        const activeStatuses = ["Pending", "pending", "Accepted", "accepted", "In Progress", "in progress", "New Requests", "new_requests"];
        return activeStatuses.includes(status);
      });

      // ── Prepare chart data (12 months) ──
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(0, i).toLocaleString("default", { month: "short" }),
        bookings: 0,
      }));

      allBookings.forEach((b) => {
        const dateStr = b.scheduled_date || b.date || b.raw?.scheduled_date || null;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            const m = d.getMonth();
            months[m].bookings += 1;
          }
        }
      });

      setBookingData(months);

      // ── Recent Activities - Get names from API response ──
      const recent = allBookings
        .slice(0, 10)
        .filter(b => b)
        .map((b) => {
          let amount = b.amount || b.amountRaw || 0;
          if (typeof amount === "string" && amount.includes("KES")) {
            amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
          }

          // ✅ Get names from the API response fields
          const clientName = b.client_full_name || b.client || b.clientName || `Client #${b.client_id}`;
          const providerName = b.provider_full_name || b.providerName || b.worker || `Provider #${b.service_provider_id}`;

          const displayStatus = b.status || "Pending";
          const displayStatusFormatted = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1).toLowerCase();

          return {
            id: b.id,
            type: "Booking",
            worker: providerName,
            client: clientName,
            service: b.service_name || b.service || "",
            amount: Number(amount),
            status: displayStatusFormatted,
            time: b.scheduled_date || b.date || b.raw?.scheduled_date || "",
            formattedAmount: formatCurrency(Number(amount)),
          };
        });

      setRecentActivities(recent);

      // ── Set Stats ──
      setStats({
        totalUsers: totalUsers || 0,
        totalProviders: totalProviders || 0,
        activeBookings: activeBookings.length || 0,
        totalBookings: allBookings.length || 0,
        platformCommission: Math.round(platformCommission) || 0,
        totalRevenue: Math.round(totalRevenue) || 0,
        pendingPayouts: Math.round(pendingPayouts) || 0,
        totalPaid: Math.round(totalPaid) || 0,
      });

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const exportChartData = () => {
    const headers = ["Month", "Bookings"];
    const rows = bookingData.map((item) => [item.month, item.bookings]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking_trends_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const navigateTo = (path) => {
    navigate(path);
  };

  const getDisplayStatus = (status) => {
    const statusMap = {
      "pending": "Pending",
      "accepted": "Accepted",
      "in progress": "In Progress",
      "completed": "Completed",
      "approved": "Approved",
      "rejected": "Rejected",
      "cancelled": "Cancelled",
      "paid": "Paid",
      "rescheduled": "Rescheduled",
      "Pending": "Pending",
      "Accepted": "Accepted",
      "In Progress": "In Progress",
      "Completed": "Completed",
      "Approved": "Approved",
      "Rejected": "Rejected",
      "Cancelled": "Cancelled",
      "Paid": "Paid",
      "Rescheduled": "Rescheduled",
      "New Requests": "New Requests",
    };
    return statusMap[status] || status || "Pending";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="h-9 w-64 animate-pulse rounded bg-gray-200 mb-2" />
                <div className="h-5 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <SkeletonChart />
              </div>
              <div>
                <SkeletonQuickStats />
              </div>
            </div>
            <SkeletonTable />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6">
            <div className="flex flex-col items-center justify-center h-64">
              <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg text-gray-700">Failed to load dashboard</p>
              <p className="text-sm text-gray-500 mt-2">{error}</p>
              <button
                onClick={() => fetchDashboardData()}
                className="mt-4 px-4 py-2 bg-[#056db3] text-white rounded-lg hover:bg-[#045a94]"
              >
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">

          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Monitor and manage Sasafix Service Hub</p>
            </div>
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              iconBg="bg-blue-100 text-blue-600"
              trend="+12.5%"
              isLoading={loading}
              onClick={() => navigateTo("/admin/users")}
            />
            <StatCard
              title="Total Providers"
              value={stats.totalProviders.toLocaleString()}
              icon={Briefcase}
              iconBg="bg-purple-100 text-purple-600"
              trend="+8.2%"
              isLoading={loading}
              onClick={() => navigateTo("/admin/service-providers")}
            />
            <StatCard
              title="Active Bookings"
              value={stats.activeBookings.toLocaleString()}
              icon={Calendar}
              iconBg="bg-orange-100 text-orange-600"
              trend="+15.3%"
              isLoading={loading}
              onClick={() => navigateTo("/admin/bookings-payments")}
            />
            <StatCard
              title="Platform Commission"
              value={formatCurrency(stats.platformCommission)}
              icon={DollarSign}
              iconBg="bg-green-100 text-green-600"
              trend={stats.platformCommission > 0 ? "+18.7%" : "0%"}
              isLoading={loading}
              onClick={() => navigateTo("/admin/bookings-payments")}
            />
          </div>

          {/* ── Chart & Quick Stats ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div>
                  <h2 className="font-bold text-xl text-gray-800">Bookings Over Time</h2>
                  <p className="text-gray-600 text-sm">All bookings ever created</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={exportChartData}
                    className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                  <Link
                    to="/admin/reports"
                    className="flex items-center gap-1 text-[#056db3] hover:underline font-medium text-sm"
                  >
                    View Report
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <BookingChart data={bookingData} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-bold text-xl text-gray-800 mb-4">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Wallet className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Revenue</p>
                      <p className="font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Paid Out</p>
                      <p className="font-bold text-gray-800">{formatCurrency(stats.totalPaid)}</p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending Payouts</p>
                      <p className="font-bold text-gray-800">{formatCurrency(stats.pendingPayouts)}</p>
                    </div>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Bookings</p>
                      <p className="font-bold text-gray-800">{stats.totalBookings.toLocaleString()}</p>
                    </div>
                  </div>
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Recent Activity Table ── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 pb-0 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-bold text-xl text-gray-800">Recent Activity</h2>
                <p className="text-gray-600 text-sm">Latest bookings and activities</p>
              </div>
              <Link
                to="/admin/bookings-payments"
                className="text-[#056db3] hover:underline font-medium text-sm flex items-center gap-1"
              >
                View All
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="border-t border-gray-200 mt-4 overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Type
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Details
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left py-3 px-6 font-medium text-gray-600 text-xs uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivities.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center gap-2">
                          <Activity className="h-8 w-8 text-gray-300" />
                          <p>No recent activity</p>
                          <p className="text-sm text-gray-400">Bookings will appear here once clients start booking</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentActivities.map((activity, index) => {
                      const displayStatus = getDisplayStatus(activity.status);
                      const StatusIcon = getStatusIcon(displayStatus);
                      const statusClass = getStatusStyles(displayStatus);
                      return (
                        <tr key={activity.id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-gray-700">Booking</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-gray-800">
                                {activity.worker} → {activity.client}
                              </div>
                              <div className="text-sm text-gray-500">{activity.service}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-700">
                            {activity.formattedAmount || formatCurrency(activity.amount)}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 w-fit ${statusClass}`}>
                              <StatusIcon className="h-3 w-3" />
                              {displayStatus}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-500 text-sm whitespace-nowrap">
                            {activity.time ? formatDate(activity.time) : "-"}
                          </td>
                          <td className="py-4 px-6">
                            <button
                              onClick={() => navigateTo(`/admin/bookings-payments/${activity.id}`)}
                              className="text-[#056db3] hover:underline font-medium text-sm flex items-center gap-1"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;