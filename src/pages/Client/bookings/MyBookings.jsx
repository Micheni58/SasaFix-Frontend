// src/pages/Client/bookings/MyBookings.jsx

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
import { Link, useLocation, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { useToast } from "../../../components/ui/ToastProvider";

// ── Tabs ──
const tabs = ["Upcoming", "In Progress", "Completed", "Rescheduled", "Cancelled", "Paid"];

// ── Status Colors ──
const statusStyles = {
  "New Requests": "bg-amber-100 text-amber-800",
  "Pending": "bg-amber-100 text-amber-800",
  "Upcoming": "bg-amber-100 text-amber-800",
  "Accepted": "bg-sky-100 text-sky-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Completed": "bg-green-100 text-green-800",
  "Rescheduled": "bg-purple-100 text-purple-800",
  "Reschedule Requested": "bg-purple-100 text-purple-800",
  "Reschedule Proposed": "bg-purple-100 text-purple-800",
  "Reschedule Confirmed": "bg-purple-100 text-purple-800",
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

function normalizeBookingStatus(statusValue) {
  const rawStatus = (statusValue || "").toString().trim();
  if (!rawStatus) return "";

  const normalized = rawStatus.toLowerCase().replace(/\s+/g, "_");
  const statusMap = {
    pending: "Pending",
    accepted: "Accepted",
    in_progress: "In Progress",
    completed: "Completed",
    paid: "Paid",
    cancelled: "Cancelled",
    rescheduled: "Rescheduled",
    reschedule_requested: "Reschedule Requested",
    reschedule_proposed: "Reschedule Proposed",
    reschedule_confirmed: "Reschedule Confirmed",
  };

  return statusMap[normalized] || rawStatus;
}

function getRescheduleInitiator(booking) {
  const rawInitiator = (
    booking?.rescheduleInitiatedBy ||
    booking?.raw?.reschedule_initiated_by ||
    booking?.initiated_by ||
    booking?.raw?.initiated_by ||
    ""
  ).toString().trim().toLowerCase();

  return rawInitiator;
}

function getBookingRoute(booking) {
  const rawStatus = (booking?.raw?.status ?? booking?.status ?? "pending")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  const initiator = getRescheduleInitiator(booking);
  const isProviderInitiated = ["provider", "service_provider", "service-provider"].includes(initiator);
  const isClientInitiated = ["client", "customer"].includes(initiator);

  // Check if this is a reschedule state
  const isRescheduleState = [
    "reschedule_requested", 
    "reschedule_proposed", 
    "reschedule_confirmed",
    "rescheduled"
  ].includes(rawStatus);

  if (isRescheduleState) {
    // Client initiated reschedule → show "Requested" page (waiting for provider)
    if (isClientInitiated) {
      return `/client/my-bookings/reschedule-requested/${booking.id}`;
    }
    // Provider initiated reschedule → show "Proposed" page (client needs to respond)
    if (isProviderInitiated) {
      return `/client/my-bookings/reschedule-proposed/${booking.id}`;
    }
    // Fallback: if initiator is not set, use status
    if (rawStatus === "reschedule_proposed" || rawStatus === "reschedule_confirmed") {
      return `/client/my-bookings/reschedule-proposed/${booking.id}`;
    }
    return `/client/my-bookings/reschedule-requested/${booking.id}`;
  }

  // Regular status routes
  const routeMap = {
    "upcoming": `/client/my-bookings/upcoming/${booking.id}`,
    "pending": `/client/my-bookings/upcoming/${booking.id}`,
    "accepted": `/client/my-bookings/upcoming/${booking.id}`,
    "new requests": `/client/my-bookings/upcoming/${booking.id}`,
    "in_progress": `/client/my-bookings/in-progress/${booking.id}`,
    "completed": `/client/my-bookings/completed/${booking.id}`,
    "paid": `/client/my-bookings/paid/${booking.id}`,
    "cancelled": `/client/my-bookings/cancelled/${booking.id}`,
  };

  return routeMap[rawStatus] || `/client/my-bookings/${booking.id}`;
}

// ─────────────────────────────────────────────
// GET DISPLAY STATUS FOR RESCHEDULE
// ─────────────────────────────────────────────

function getDisplayStatus(booking) {
  const status = booking.status || "Pending";
  
  // All reschedule statuses show as "Rescheduled" in the table
  if (status === "Reschedule Requested" || 
      status === "Reschedule Proposed" || 
      status === "Reschedule Confirmed") {
    return "Rescheduled";
  }
  return status;
}

// ─────────────────────────────────────────────
// GET STATUS SUBTEXT (client-facing)
// ─────────────────────────────────────────────

function getStatusSubtext(booking) {
  const status = booking.status || "Pending";
  const initiator = getRescheduleInitiator(booking);
  
  if (status === "Reschedule Requested") {
    return initiator === "client" 
      ? " Waiting for provider approval" 
      : " Provider requested reschedule";
  }
  
  if (status === "Reschedule Proposed") {
    return initiator === "provider" || initiator === "service_provider"
      ? " Please review new time" 
      : "Provider proposed new time";
  }
  
  if (status === "Reschedule Confirmed") {
    return " Reschedule confirmed";
  }
  
  return null;
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
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

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

  // Refresh when returning from reschedule action
  useEffect(() => {
    if (location.state?.rescheduleUpdated) {
      fetchBookings();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state]);

  // ── Filter bookings based on active tab ──
  const filteredBookings = bookings.filter((booking) => {
    const status = booking.status || "Pending";
    
    if (activeTab === "Upcoming") {
      return status === "Upcoming" ||
             status === "Pending" ||
             status === "Accepted" ||
             status === "New Requests";
    }
    
    if (activeTab === "Rescheduled") {
      return status === "Rescheduled" ||
             status === "Reschedule Requested" ||
             status === "Reschedule Proposed" ||
             status === "Reschedule Confirmed";
    }
    
    return status === activeTab;
  });

  const tabCounts = {
    Upcoming: bookings.filter((booking) => {
      const status = booking.status || "Pending";
      return status === "Upcoming" ||
             status === "Pending" ||
             status === "Accepted" ||
             status === "New Requests";
    }).length,
    "In Progress": bookings.filter((booking) => booking.status === "In Progress").length,
    "Completed": bookings.filter((booking) => booking.status === "Completed").length,
    "Rescheduled": bookings.filter((booking) => {
      const status = booking.status || "Pending";
      return status === "Rescheduled" ||
             status === "Reschedule Requested" ||
             status === "Reschedule Proposed" ||
             status === "Reschedule Confirmed";
    }).length,
    "Cancelled": bookings.filter((booking) => booking.status === "Cancelled").length,
    "Paid": bookings.filter((booking) => booking.status === "Paid").length,
  };

  // Count pending client actions (client needs to respond to provider proposals)
  const pendingClientActions = bookings.filter((b) => {
    const status = b.status || "Pending";
    const initiator = getRescheduleInitiator(b);
    return status === "Reschedule Proposed" && 
           ["provider", "service_provider", "service-provider"].includes(initiator);
  }).length;

  const getEmptyState = (tab) => {
    return emptyStateConfigs[tab] || emptyStateConfigs["Upcoming"];
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="min-w-0 flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="min-w-0 pt-24 px-6 pb-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
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
                const isRescheduledTab = tab === "Rescheduled";
                const needsAction = isRescheduledTab && pendingClientActions > 0;

                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 border-b-[3px] px-6 py-3.5 text-base font-semibold transition-colors whitespace-nowrap ${
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
                    {needsAction && (
                      <span className="ml-1 text-xs text-purple-600 font-medium">
                        ({pendingClientActions} need action)
                      </span>
                    )}
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
                      const displayStatus = getDisplayStatus(booking);
                      const statusSubtext = getStatusSubtext(booking);
                      const isRescheduleState = ["Reschedule Requested", "Reschedule Proposed", "Reschedule Confirmed"].includes(booking.status);
                      
                      // Check if client needs to respond (provider initiated)
                      const initiator = getRescheduleInitiator(booking);
                      const needsClientResponse = booking.status === "Reschedule Proposed" && 
                                                   ["provider", "service_provider", "service-provider"].includes(initiator);

                      return (
                        <tr key={booking.id} className="border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="max-w-50">
                              <p className="text-base font-semibold text-gray-800 truncate">{booking.service}</p>
                              <p className="mt-1 text-sm leading-6 text-gray-500 truncate">{booking.details}</p>
                            </div>
                          </td>
                          <td className="px-4 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#056db3] text-sm font-semibold text-white shadow-sm ring-2 ring-[#056db3]/15">
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
                            <div className="flex flex-col items-start gap-0.5">
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                                  statusStyles[displayStatus] || "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {displayStatus}
                              </span>
                              {statusSubtext && (
                                <span className={`text-xs font-medium ${
                                  needsClientResponse ? "text-purple-600" : "text-gray-500"
                                }`}>
                                  {statusSubtext}
                                </span>
                              )}
                              {isRescheduleState && booking.raw?.proposed_scheduled_date && (
                                <span className="text-xs text-gray-400 mt-0.5">
                                  Proposed: {formatBookingDate(booking.raw.proposed_scheduled_date)}
                                </span>
                              )}
                            </div>
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
                                className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-colors ${
                                  needsClientResponse
                                    ? "border-purple-800  text-purple-800 hover:bg-purple-50 "
                                    : "border-[#056db3] text-[#056db3] hover:bg-blue-50"
                                }`}
                              >
                                {needsClientResponse ? "Respond" : "View"}
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
                                 booking.status !== "Reschedule Requested" &&
                                 booking.status !== "Reschedule Proposed" &&
                                 booking.status !== "Reschedule Confirmed" &&
                                 booking.status !== "Cancelled" && (
                                  <button
                                    onClick={async () => {
                                      if (booking.status === 'In Progress') {
                                        toast.warning('Cancellation unavailable', 'In-progress bookings cannot be cancelled right now.');
                                        setOpenMenuId(null);
                                        return;
                                      }
                                      if (!window.confirm('Cancel this booking?')) return;
                                      try {
                                        setActionLoading(true);
                                        await bookingService.cancelBooking(booking.id);
                                        await fetchBookings();
                                        toast.success('Booking cancelled');
                                      } catch (e) {
                                        console.error(e);
                                        toast.error('Failed to cancel booking');
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
                                {booking.status === "Reschedule Requested" && (
                                  <div className="px-3 py-2 text-sm text-purple-600 bg-purple-50">
                                    {getStatusSubtext(booking)}
                                  </div>
                                )}
                                {booking.status === "Reschedule Proposed" && (
                                  <div className="px-3 py-2 text-sm text-purple-600 bg-purple-50">
                                    {getStatusSubtext(booking)}
                                  </div>
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
          </div>
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