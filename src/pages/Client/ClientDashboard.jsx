// Client Home Dashboard — fetches real bookings and computes summary stats
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  CheckCircle,
  Wallet,
  Star,
  Clock,
  MessageCircle,
  Eye,
  Search,
  Calendar,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import bookingService from "../../api/bookingService";
import { getWalletBalance } from "../../api/walletService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const activeStatuses = ["New Requests", "Accepted", "Upcoming", "In Progress"];

const STATUS_STYLES = {
  Completed: "bg-green-100 text-green-800",
  "In Progress": "bg-amber-100 text-amber-800",
  Upcoming: "bg-sky-100 text-sky-800",
  Cancelled: "bg-red-100 text-red-800",
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
  if (status === "Completed") return 100;
  if (status === "In Progress") return 50;
  if (status === "Accepted" || status === "Upcoming") return 25;
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

// Client loyalty tier — same gold / blue / gray language used for
// provider trust tiers on Find Services, applied here to the client's
// own booking history so the two pages read as one system.
function getClientTier(completedCount) {
  if (completedCount >= 10) return { tier: "gold", label: "Gold member" };
  if (completedCount >= 3) return { tier: "blue", label: "Regular client" };
  return { tier: "gray", label: "New client" };
}

function getInitials(name) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Derives a trust ring for a booking's provider from whatever fields the
// booking payload happens to carry (mirrors the tiering used on Find Services).
function getProviderRing(booking) {
  const provider = booking?.raw?.service_provider || booking?.raw?.provider || {};
  const rating = provider.rating || null;
  const isPremium = !!(provider.premium || provider.is_premium);
  const tier = isPremium ? "gold" : rating ? "blue" : "gray";
  const pct = rating ? Math.round((rating / 5) * 100) : 100;
  return { tier, pct, rating };
}

// ─────────────────────────────────────────────
// SMALL COMPONENTS
// ─────────────────────────────────────────────

function ProviderAvatar({ name, booking, size = 44 }) {
  const { tier, pct } = getProviderRing(booking);
  const ringColor = TIER_COLORS[tier];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full p-0.5"
        style={{ background: `conic-gradient(${ringColor} ${pct}%, #056db3 ${pct}% 100%)` }}
      >
        <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-sm font-bold text-gray-700">
          {getInitials(name)}
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

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

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

  // ── Fetch bookings (unchanged logic) ──
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

  // ── Fetch wallet balance (unchanged logic) ──
  useEffect(() => {
    let mounted = true;
    const walletUserId = Number(
      storedUser?.id || storedUser?.client_id || localStorage.getItem("userId") || 0
    );

    if (!walletUserId) {
      setWalletLoading(false);
      return;
    }

    getWalletBalance(walletUserId)
      .then((data) => {
        if (!mounted) return;
        setWalletBalance(data.balance || 0);
      })
      .catch((err) => {
        console.error("Failed to load wallet balance", err);
      })
      .finally(() => {
        if (mounted) setWalletLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [storedUser?.client_id, storedUser?.id]);

  // ── Derived stats ──
  const activeCount = bookings.filter((booking) =>
    activeStatuses.includes(booking.status)
  ).length;
  const completedCount = bookings.filter((booking) => booking.status === "Completed").length;
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

  // Most recent completed booking — used for the "Book again" prompt.
  const lastCompleted = bookings.find((booking) => booking.status === "Completed") || null;

  const recentBookings = bookings.slice(0, 5);

  const statCards = [
    {
      label: "Active jobs",
      value: activeCount,
      icon: <Briefcase className="h-6 w-6 text-[#056db3]" />,
      iconClass: "bg-blue-100",
    },
    {
      label: "Completed jobs",
      value: completedCount,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      iconClass: "bg-green-100",
    },
    {
      label: "Wallet balance",
      value: formatAmount(walletBalance),
      icon: <Wallet className="h-6 w-6 text-[#056db3]" />,
      iconClass: "bg-blue-100",
      loading: walletLoading,
    },
    {
      label: "Loyalty progress",
      value: `${loyalty}%`,
      icon: <Star className="h-6 w-6 text-yellow-600" />,
      iconClass: "bg-yellow-100",
    },
  ];

  const quickActions = [
    { label: "Find a service", to: "/client/find-services", icon: Search },
    { label: "My bookings", to: "/client/my-bookings", icon: Calendar },
    { label: "Wallet", to: "/client/wallet", icon: Wallet },
    { label: "Messages", to: "/client/messages", icon: MessageCircle },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="ml-72 min-w-0 flex-1">
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
                  <div
                    key={card.label}
                    className="min-h-28 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex h-full items-center justify-between gap-4">
                      <div className="min-w-0">
                        <h2 className="text-sm font-medium text-gray-600">{card.label}</h2>
                        {card.loading ? (
                          <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-200" />
                        ) : (
                          <p className="mt-2 wrap-break-word font-mono text-xl font-bold text-gray-800">
                            {card.value}
                          </p>
                        )}
                      </div>
                      <div className={`shrink-0 rounded-lg p-2 ${card.iconClass}`}>{card.icon}</div>
                    </div>
                  </div>
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
                          {activeBooking.date || "Date pending"} {activeBooking.time || ""}
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
                      to={`/client/my-bookings/${activeBooking.id}`}
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
                  {recentBookings.map((booking) => (
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
                            {booking.date || "Date pending"}
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
                          to={`/client/my-bookings/${booking.id}`}
                          className="text-sm font-medium text-[#056db3] hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
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