// src/pages/Client/bookings/MyBookings.jsx - With Skeleton Loader & Dynamic Routing

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock3,
  EllipsisVertical,
  MapPin,
  XCircle,
  Loader2,
  RefreshCw,
  Inbox,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

// ── Updated Tabs - Removed "All Bookings", Added "Paid" at the end ──
const tabs = ["Upcoming", "In Progress", "Completed", "Rescheduled", "Cancelled", "Paid"];

// ── Updated Status Colors ──
const statusStyles = {
  "New Requests": "bg-amber-100 text-amber-800",
  "Pending": "bg-amber-100 text-amber-800",
  "Upcoming": "bg-amber-100 text-amber-800",
  "Accepted": "bg-sky-100 text-sky-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Completed": "bg-green-100 text-green-800",
  "Rescheduled": "bg-purple-100 text-purple-800",
  "Paid": "bg-emerald-100 text-emerald-800",
  "Cancelled": "bg-red-100 text-red-800",
};

const emptyStateConfigs = {
  "Upcoming": {
    icon: Calendar,
    title: "No Upcoming Bookings",
    description: "You don't have any upcoming bookings. Schedule a service to get started.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  "In Progress": {
    icon: Clock3,
    title: "No Bookings In Progress",
    description: "You don't have any bookings currently in progress.",
    color: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  "Completed": {
    icon: CheckCircle,
    title: "No Completed Bookings",
    description: "You haven't completed any bookings yet.",
    color: "bg-green-50",
    iconColor: "text-green-500",
  },
  "Rescheduled": {
    icon: Clock,
    title: "No Rescheduled Bookings",
    description: "You don't have any rescheduled bookings. When a booking is rescheduled, it will appear here.",
    color: "bg-purple-50",
    iconColor: "text-purple-500",
  },
  "Cancelled": {
    icon: XCircle,
    title: "No Cancelled Bookings",
    description: "You don't have any cancelled bookings.",
    color: "bg-red-50",
    iconColor: "text-red-500",
  },
  "Paid": {
    icon: CheckCircle,
    title: "No Paid Bookings",
    description: "You don't have any paid bookings yet. Once you complete and pay for a service, it will appear here.",
    color: "bg-emerald-50",
    iconColor: "text-emerald-500",
  },
};

function formatBookingDate(date) {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

// ─────────────────────────────────────────────
// HELPER: Get Provider Name
// ─────────────────────────────────────────────

function getProviderName(booking) {
  if (booking.providerName && booking.providerName !== "Provider" && !booking.providerName.includes("Provider #")) {
    return booking.providerName;
  }
  if (booking.worker && booking.worker !== "Provider" && !booking.worker.includes("Provider #")) {
    return booking.worker;
  }
  if (booking.raw?.provider_full_name) {
    return booking.raw.provider_full_name;
  }
  if (booking.raw?.provider_name) {
    return booking.raw.provider_name;
  }
  if (booking.raw?.service_provider?.name) {
    return booking.raw.service_provider.name;
  }
  if (booking.raw?.service_provider?.full_name) {
    return booking.raw.service_provider.full_name;
  }
  if (booking.raw?.service_provider?.user?.full_name) {
    return booking.raw.service_provider.user.full_name;
  }
  if (booking.serviceProviderId || booking.raw?.service_provider_id) {
    return `Provider #${booking.serviceProviderId || booking.raw?.service_provider_id}`;
  }
  return "Provider";
}

function getProviderInitials(booking) {
  const fullName = getProviderName(booking);
  return getInitials(fullName);
}

// ─────────────────────────────────────────────
// SKELETON LOADER COMPONENTS
// ─────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100 align-middle">
      <td className="px-6 py-5">
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-48 animate-pulse rounded bg-gray-100"></div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200"></div>
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="space-y-2">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
      </td>
      <td className="px-4 py-5">
        <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200"></div>
      </td>
      <td className="px-4 py-5">
        <div className="space-y-2">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
          <div className="h-3 w-24 animate-pulse rounded bg-gray-100"></div>
        </div>
      </td>
      <td className="px-4 py-5">
        <div className="flex items-center gap-4">
          <div className="h-10 w-20 animate-pulse rounded-xl bg-gray-200"></div>
          <div className="h-8 w-8 animate-pulse rounded-md bg-gray-200"></div>
        </div>
      </td>
    </tr>
  );
}

function SkeletonLoader() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto min-w-200">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Service</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Worker</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date &amp; Time</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Location</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Amount</th>
            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, color, iconColor }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className={`rounded-full ${color} p-6 mb-6`}>
        <Icon className={`h-16 w-16 ${iconColor}`} />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// GET ROUTE FOR BOOKING STATUS
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
// MAIN COMPONENT
// ─────────────────────────────────────────────

function MyBookings() {
  const [activeTab, setActiveTab] = useState("Upcoming");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // ── Fetch Bookings ──
  const fetchBookings = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const clientId = userData.id || localStorage.getItem("userId");

    if (!clientId) {
      setLoading(false);
      return;
    }

    try {
      const data = await bookingService.listClientBookings(Number(clientId));
      setBookings(data || []);
    } catch (err) {
      console.info("No bookings available");
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ── Filter bookings based on active tab ──
  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "Upcoming") {
      return booking.status === "Upcoming" || 
             booking.status === "Pending" || 
             booking.status === "Accepted" || 
             booking.status === "New Requests";
    }
    return booking.status === activeTab;
  });

  const tabCounts = {
    Upcoming: bookings.filter((booking) => 
      booking.status === "Upcoming" || 
      booking.status === "Pending" || 
      booking.status === "Accepted" || 
      booking.status === "New Requests"
    ).length,
    "In Progress": bookings.filter((booking) => booking.status === "In Progress").length,
    Completed: bookings.filter((booking) => booking.status === "Completed").length,
    Rescheduled: bookings.filter((booking) => booking.status === "Rescheduled").length,
    Cancelled: bookings.filter((booking) => booking.status === "Cancelled").length,
    Paid: bookings.filter((booking) => booking.status === "Paid").length,
  };

  const getEmptyState = (tab) => {
    return emptyStateConfigs[tab] || emptyStateConfigs["Upcoming"];
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          {/* ── Page Header ── */}
          <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">My Bookings</h1>
              <p className="mt-1 text-sm text-gray-600">View and manage all your service bookings</p>
            </div>
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </section>

          {/* ── Tabs ── */}
          <section className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex min-w-max">
              {tabs.map((tab) => {
                const count = tabCounts[tab] || 0;
                
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 border-b-[3px] px-6 py-3.5 text-base font-semibold transition-colors ${
                      activeTab === tab
                        ? "border-[#056db3] bg-blue-50 text-[#056db3]"
                        : "border-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span>{tab}</span>
                    <span
                      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                        activeTab === tab
                          ? "bg-[#056db3] text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── Table ── */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {loading ? (
              <SkeletonLoader />
            ) : filteredBookings.length === 0 ? (
              <EmptyState
                icon={getEmptyState(activeTab).icon}
                title={getEmptyState(activeTab).title}
                description={getEmptyState(activeTab).description}
                color={getEmptyState(activeTab).color}
                iconColor={getEmptyState(activeTab).iconColor}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Service
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Worker
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Date &amp; Time
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Location
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Status
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Amount
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((booking) => {
                      const providerName = getProviderName(booking);
                      const providerInitials = getProviderInitials(booking);
                      const bookingRoute = getBookingRoute(booking);
                      
                      return (
                        <tr key={booking.id} className="border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            {/* ── Fixed width for service column ── */}
                            <div className="max-w-50">
                              <p className="text-base font-semibold text-gray-800 truncate">{booking.service}</p>
                              <p className="mt-1 text-sm leading-6 text-gray-500 truncate">{booking.details}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white shrink-0">
                                {providerInitials}
                              </div>
                              <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800 truncate">
                                {providerName}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="space-y-2 text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                <span className="text-sm whitespace-nowrap">{formatBookingDate(booking.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock3 className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                                <span className="text-sm whitespace-nowrap">{booking.time}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="h-3.5 w-3.5 text-gray-500 shrink-0" />
                              <span className="max-w-32.5 text-sm leading-6 truncate">{booking.location}</span>
                            </div>
                          </td>
                          <td className="px-4 py-5 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                statusStyles[booking.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-4 py-5">
                            <div>
                              <div className="text-sm font-bold text-gray-800 whitespace-nowrap">{booking.amount || 'KES 0'}</div>
                              <div className="text-xs text-gray-500 mt-1">{(() => {
                                  const amt = booking.amountRaw || booking.raw?.amount || 0;
                                  const isPremium = !!(booking.raw?.service_provider?.premium || booking.raw?.service_provider?.is_premium);
                                  const fee = amt ? Math.round(amt * (isPremium ? 0.05 : 0.1)) : 0;
                                  return `Platform fee: KES ${fee.toLocaleString()}`;
                                })()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-5 relative">
                            <div className="flex items-center gap-4 whitespace-nowrap">
                              <Link
                                to={bookingRoute}
                                className="rounded-xl border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                              >
                                View
                              </Link>
                              <button
                                onClick={() => setOpenMenuId(openMenuId === booking.id ? null : booking.id)}
                                className="p-2 rounded-md hover:bg-gray-100"
                                aria-label="More actions"
                              >
                                <EllipsisVertical className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                            {openMenuId === booking.id && (
                              <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                <Link
                                  to={`/client/messages?provider=${booking.serviceProviderId || booking.raw?.service_provider_id || ''}`}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setOpenMenuId(null)}
                                >
                                  <span className="h-4 w-4 text-gray-600">💬</span>
                                  Message
                                </Link>
                                {booking.status !== "Completed" && 
                                 booking.status !== "Paid" && 
                                 booking.status !== "Rescheduled" && 
                                 booking.status !== "Cancelled" && (
                                  <button
                                    onClick={async () => {
                                      if (booking.status === 'In Progress') {
                                        window.alert('In-progress bookings cannot be cancelled right now.');
                                        setOpenMenuId(null);
                                        return;
                                      }
                                      if (!window.confirm('Cancel this booking?')) return;
                                      try {
                                        setActionLoading(true);
                                        await bookingService.cancelBooking(booking.id);
                                        await fetchBookings();
                                        window.alert('Booking cancelled');
                                      } catch (e) {
                                        console.error(e);
                                        window.alert('Failed to cancel');
                                      } finally {
                                        setActionLoading(false);
                                        setOpenMenuId(null);
                                      }
                                    }}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HELPER: Get Initials from Name
// ─────────────────────────────────────────────

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

export default MyBookings;