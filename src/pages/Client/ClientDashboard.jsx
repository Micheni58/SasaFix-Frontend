// src/pages/Client/ClientDashboard.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  CheckCircle,
  Star,
  Clock,
  MessageCircle,
  Eye,
  Search,
  Calendar,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import bookingService from "../../api/bookingService";
import { getTransactionHistory } from "../../api/transactionService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ── Active statuses for the dashboard ──
const activeStatuses = ["Upcoming", "Pending", "Accepted", "In Progress"];

// ── Updated Status Colors to match the booking pages ──
const STATUS_STYLES = {
  "New Requests": "bg-amber-100 text-amber-800",
  "Pending": "bg-amber-100 text-amber-800",
  "Upcoming": "bg-sky-100 text-sky-800",
  "Accepted": "bg-blue-100 text-blue-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Completed": "bg-green-100 text-green-800",
  "Rescheduled": "bg-purple-100 text-purple-800",
  "Paid": "bg-emerald-100 text-emerald-800",
  "Cancelled": "bg-red-100 text-red-800",
};

const TIER_COLORS = { gold: "#CA8A04", blue: "#056db3", gray: "#9CA3AF" };

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getBookingProgress(status) {
  if (status === "Completed" || status === "Paid") return 100;
  if (status === "In Progress") return 75;
  if (status === "Accepted") return 50;
  if (status === "Upcoming" || status === "Pending") return 25;
  return 10;
}

function formatAmount(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getClientTier(completedCount) {
  if (completedCount >= 10) return { tier: "gold", label: "Gold member" };
  if (completedCount >= 3) return { tier: "blue", label: "Regular client" };
  return { tier: "gray", label: "New client" };
}

function getInitials(name) {
  if (!name) return "--";
  if (name.length <= 2 && name === name.toUpperCase()) {
    return name;
  }
  const normalized = name.toString().trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getProviderRing(booking) {
  const provider = booking?.raw?.service_provider || booking?.raw?.provider || {};
  const rating = provider.rating || null;
  const isPremium = !!(provider.premium || provider.is_premium);
  const tier = isPremium ? "gold" : rating ? "blue" : "gray";
  const pct = rating ? Math.round((rating / 5) * 100) : 100;
  return { tier, pct, rating };
}

function formatDateToWords(dateString) {
  if (!dateString) return "Date pending";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date pending";

    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "Date pending";
  }
}

// ─────────────────────────────────────────────
// DYNAMIC ROUTING HELPER
// ─────────────────────────────────────────────

function getBookingRoute(booking) {
  const status = booking.status || "Pending";

  const routeMap = {
    "Upcoming": `/client/my-bookings/upcoming/${booking.id}`,
    "Pending": `/client/my-bookings/upcoming/${booking.id}`,
    "Accepted": `/client/my-bookings/upcoming/${booking.id}`,
    "New Requests": `/client/my-bookings/upcoming/${booking.id}`,
    "In Progress": `/client/my-bookings/in-progress/${booking.id}`,
    "Completed": `/client/my-bookings/completed/${booking.id}`,
    "Rescheduled": `/client/my-bookings/rescheduled/${booking.id}`,
    "Paid": `/client/my-bookings/paid/${booking.id}`,
    "Cancelled": `/client/my-bookings/cancelled/${booking.id}`,
  };

  return routeMap[status] || `/client/my-bookings/${booking.id}`;
}

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────

function ProviderAvatar({ name, booking, size = 44 }) {
  const { tier, pct } = getProviderRing(booking);
  const ringColor = TIER_COLORS[tier];
  const initials = getInitials(name);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full p-0.5"
        style={{ background: `conic-gradient(${ringColor} ${pct}%, #e5e7eb ${pct}% 100%)` }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
          {initials}
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="min-h-28 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconClass, loading }) {
  return (
    <div className="min-h-28 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-gray-600">{label}</h2>
          {loading ? (
            <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <p className="mt-2 font-mono text-xl font-bold text-gray-800">{value}</p>
          )}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${iconClass}`}>{icon}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlySpent, setMonthlySpent] = useState(0);
  const [monthlySpentLoading, setMonthlySpentLoading] = useState(true);

  const storedUser = getStoredUser();
  const displayName = storedUser
    ? storedUser.full_name ||
      storedUser.name ||
      `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() ||
      storedUser.email ||
      "User"
    : "User";
  const locationLabel =
    storedUser?.location || storedUser?.city || storedUser?.address || "Location unavailable";

  const userId = Number(
    storedUser?.id || storedUser?.client_id || localStorage.getItem("userId") || 1
  );

  // ── Fetch bookings ──
  useEffect(() => {
    let mounted = true;
    const clientId = Number(
      storedUser?.client_id || storedUser?.id || localStorage.getItem("userId") || 1
    );

    bookingService
      .listClientBookings(clientId)
      .then((data) => {
        if (!mounted) return;
        setBookings(data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [storedUser?.client_id, storedUser?.id]);

  // ── Fetch monthly spend from transactions ──
  useEffect(() => {
    let mounted = true;
    if (!userId) {
      setMonthlySpentLoading(false);
      return;
    }

    const fetchMonthlySpend = async () => {
      try {
        const result = await getTransactionHistory(userId);
        const transactions = result.transactions || [];

        // Get current month date range
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Filter SUCCESS transactions for current month
        const monthTransactions = transactions.filter(tx => {
          const txDate = new Date(tx.paidAt || tx.createdAt || tx.created_at);
          if (isNaN(txDate.getTime())) return false;
          const status = tx.status || tx.status;
          return txDate >= monthStart && txDate <= monthEnd &&
                 (status === "SUCCESS" || status === "success" || status === "PAID");
        });

        // Sum gross amounts (total spent by client)
        const total = monthTransactions.reduce((sum, tx) => {
          const amount = tx.grossAmount || tx.gross_amount || tx.amount || 0;
          return sum + Number(amount);
        }, 0);

        setMonthlySpent(total);
      } catch (err) {
        console.warn("Could not fetch monthly spend:", err);
      } finally {
        if (mounted) setMonthlySpentLoading(false);
      }
    };

    fetchMonthlySpend();
    return () => { mounted = false; };
  }, [userId]);

  // ── Derived stats ──
  const activeCount = bookings.filter((booking) =>
    activeStatuses.includes(booking.status)
  ).length;

  const completedCount = bookings.filter((booking) =>
    booking.status === "Completed" || booking.status === "Paid"
  ).length;

  const loyalty = Math.min(
    100,
    Math.round((completedCount / Math.max(1, bookings.length)) * 100)
  );
  const clientTier = getClientTier(completedCount);

  const activeBooking =
    bookings.find((booking) => booking.status === "In Progress") ||
    bookings.find((booking) => activeStatuses.includes(booking.status)) ||
    null;
  const activeProgress = activeBooking ? getBookingProgress(activeBooking.status) : 0;

  const lastCompleted = bookings.find((booking) =>
    booking.status === "Completed" || booking.status === "Paid"
  ) || null;

  const recentBookings = bookings.slice(0, 5);

  const statCards = [
    {
      label: "Active jobs",
      value: activeCount,
      icon: <Briefcase className="h-6 w-6 text-[#056db3]" />,
      iconClass: "bg-blue-100",
      loading: loading,
    },
    {
      label: "Completed jobs",
      value: completedCount,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconClass: "bg-green-100",
      loading: loading,
    },
    {
      label: "Monthly Spend",
      value: formatAmount(monthlySpent),
      icon: <DollarSign className="h-6 w-6 text-emerald-600" />,
      iconClass: "bg-emerald-100",
      loading: monthlySpentLoading,
    },
    {
      label: "Loyalty progress",
      value: `${loyalty}%`,
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      iconClass: "bg-yellow-100",
      loading: loading,
    },
  ];

  const quickActions = [
    { label: "Find a service", to: "/client/find-services", icon: Search },
    { label: "My bookings", to: "/client/my-bookings", icon: Calendar },
    { label: "Messages", to: "/client/messages", icon: MessageCircle },
    { label: "Transactions", to: "/client/transactions", icon: TrendingUp },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="ml-0 lg:ml-72 min-w-0 flex-1">
        <Navbar />
        <main className="px-6 pb-6 pt-24">
          {/* ── Header ── */}
          <section className="mb-8">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {getGreeting()}, {displayName.split(" ")[0]}
                  </h1>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${TIER_COLORS[clientTier.tier]}1A`,
                      color: TIER_COLORS[clientTier.tier],
                    }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {clientTier.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg text-gray-600">{locationLabel}</h2>
                </div>
              </div>

              <Link
                to="/client/find-services"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#056db3] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#045a94]"
              >
                <Search className="h-4 w-4" />
                Find a service
              </Link>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#056db3] hover:text-[#056db3]"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          {/* ── Stat cards ── */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statCards.map((card) => (
                  <StatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    icon={card.icon}
                    iconClass={card.iconClass}
                    loading={card.loading}
                  />
                ))}
          </section>

          {/* ── Book again prompt ── */}
          {!loading && lastCompleted && (
            <section className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <ProviderAvatar
                  name={lastCompleted.providerName || lastCompleted.worker}
                  booking={lastCompleted}
                  size={48}
                />
                <div>
                  <p className="text-sm text-gray-500">Book again</p>
                  <p className="font-semibold text-gray-800">
                    {lastCompleted.providerName || lastCompleted.worker || "Your last provider"}
                    <span className="font-normal text-gray-500"> — {lastCompleted.service}</span>
                  </p>
                </div>
              </div>
              <Link
                to={`/client/find-services?rebook=${lastCompleted.serviceProviderId || lastCompleted.raw?.service_provider_id || ""}`}
                className="flex items-center justify-center gap-1 rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
              >
                <RotateCcw className="h-4 w-4" />
                Book again
              </Link>
            </section>
          )}

          {/* ── Active booking ── */}
          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">Active booking</h2>
            </div>

            {activeBooking ? (
              <>
                <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    <ProviderAvatar
                      name={activeBooking.providerName || activeBooking.worker}
                      booking={activeBooking}
                      size={56}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold text-gray-800">{activeBooking.service}</p>
                      <p className="text-gray-600">
                        {activeBooking.providerName || activeBooking.worker || "Provider"}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Clock className="mr-1 h-4 w-4 text-gray-500" />
                        <p className="text-sm text-gray-500">
                          {formatDateToWords(activeBooking.date)} {activeBooking.time || ""}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to="/client/messages"
                      className="rounded-lg border border-[#056db3] bg-white px-4 py-2 text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white"
                    >
                      <MessageCircle className="mr-1 inline h-4 w-4" />
                      Message worker
                    </Link>
                    <Link
                      to={getBookingRoute(activeBooking)}
                      className="rounded-lg bg-blue-100 px-4 py-2 text-blue-800 transition-colors hover:bg-blue-200"
                    >
                      <Eye className="mr-1 inline h-4 w-4" />
                      View details
                    </Link>
                  </div>
                </div>

                <div className="max-w-3xl">
                  <div className="mb-1 flex justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span className="font-mono">{activeProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-[#056db3] transition-all"
                      style={{ width: `${activeProgress}%` }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-gray-600">
                <Briefcase className="h-12 w-12 text-[#056db3]" />
                <div>
                  <p className="text-lg font-semibold text-gray-800">No active bookings yet</p>
                  <p className="text-sm text-gray-600">
                    Your active booking summary will appear here once a request is accepted or in progress.
                  </p>
                </div>
                <Link
                  to="/client/find-services"
                  className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94]"
                >
                  Find a service
                </Link>
              </div>
            )}
          </section>

          {/* ── Recent bookings ── */}
          <section className="rounded-xl bg-white shadow-sm">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Recent bookings</h2>
                <Link
                  to="/client/my-bookings"
                  className="flex items-center gap-1 font-medium text-[#056db3] hover:underline"
                >
                  View all
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="border-t border-gray-200">
              {loading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="p-10 text-center text-sm text-gray-500">Unable to load bookings.</div>
              ) : recentBookings.length === 0 ? (
                <div className="flex flex-col items-center gap-3 p-10 text-center">
                  <Calendar className="h-10 w-10 text-gray-300" />
                  <p className="font-semibold text-gray-800">No bookings yet</p>
                  <p className="text-sm text-gray-500">
                    Once you book a service, it'll show up here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {recentBookings.map((booking) => {
                    const route = getBookingRoute(booking);
                    return (
                      <li
                        key={booking.id}
                        className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <ProviderAvatar
                            name={booking.providerName || booking.worker}
                            booking={booking}
                            size={44}
                          />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">
                              {booking.service || "Service unavailable"}
                            </p>
                            <p className="truncate text-sm text-gray-500">
                              {booking.providerName || booking.worker || "Provider unavailable"} ·{" "}
                              {formatDateToWords(booking.date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {booking.status}
                          </span>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {booking.amount || formatAmount(booking.amountRaw)}
                          </span>
                          <Link
                            to={route}
                            className="text-sm font-medium text-[#056db3] hover:underline"
                          >
                            View
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;