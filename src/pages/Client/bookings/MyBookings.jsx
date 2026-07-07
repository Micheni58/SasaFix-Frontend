// src/pages/Client/bookings/MyBookings.jsx - Updated with Proper Client ID and Empty States

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
} from "lucide-react";
import { Link } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

const tabs = ["All Bookings", "Upcoming", "In Progress", "Completed", "Cancelled"];

const statusStyles = {
  Upcoming: "bg-purple-100 text-purple-700",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Cancelled: "bg-red-100 text-red-800",
};

const emptyStateConfigs = {
  "All Bookings": {
    icon: Inbox,
    title: "No Bookings Yet",
    description: "You haven't made any bookings yet. Find a service provider and book your first service!",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
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
  "Cancelled": {
    icon: XCircle,
    title: "No Cancelled Bookings",
    description: "You don't have any cancelled bookings.",
    color: "bg-red-50",
    iconColor: "text-red-500",
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
// MAIN COMPONENT
// ─────────────────────────────────────────────

function MyBookings() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ── Fetch Bookings ──
  const fetchBookings = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    // Get client ID from localStorage
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

  const filteredBookings =
    activeTab === "All Bookings"
      ? bookings
      : bookings.filter((booking) => booking.status === activeTab);

  const tabCounts = {
    "All Bookings": bookings.length,
    Upcoming: bookings.filter((booking) => booking.status === "Upcoming").length,
    "In Progress": bookings.filter((booking) => booking.status === "In Progress").length,
    Completed: bookings.filter((booking) => booking.status === "Completed").length,
    Cancelled: bookings.filter((booking) => booking.status === "Cancelled").length,
  };

  const getEmptyState = (tab) => {
    return emptyStateConfigs[tab] || emptyStateConfigs["All Bookings"];
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-[#056db3]" />
              <p className="text-gray-500">Loading your bookings...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
              {tabs.map((tab) => (
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
                    {tabCounts[tab]}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ── Table ── */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              {filteredBookings.length === 0 ? (
                <EmptyState
                  icon={getEmptyState(activeTab).icon}
                  title={getEmptyState(activeTab).title}
                  description={getEmptyState(activeTab).description}
                  color={getEmptyState(activeTab).color}
                  iconColor={getEmptyState(activeTab).iconColor}
                />
              ) : (
                <table className="w-full table-auto min-w-200">
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
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5">
                          <div className="max-w-42.5">
                            <p className="text-base font-semibold text-gray-800">{booking.service}</p>
                            <p className="mt-1 text-sm leading-6 text-gray-500">{booking.details}</p>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                              {booking.clientInitials || getInitials(booking.providerName || booking.worker || "Provider")}
                            </div>
                            <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800">
                              {booking.providerName || booking.worker || "Provider"}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="space-y-2 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3.5 w-3.5 text-gray-500" />
                              <span className="text-sm">{formatBookingDate(booking.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                              <span className="text-sm">{booking.time}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-3.5 w-3.5 text-gray-500" />
                            <span className="max-w-33.75 text-sm leading-6 truncate">{booking.location}</span>
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
                          <span className="text-sm font-bold text-gray-800">{booking.amount}</span>
                        </td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-4 whitespace-nowrap">
                            <Link
                              to={`/client/my-bookings/${booking.id}`}
                              className="rounded-xl border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                            >
                              View
                            </Link>
                            {(booking.status === "Upcoming" || booking.status === "In Progress") && (
                              <button className="text-sm font-semibold text-[#056db3] hover:bg-blue-50 rounded-md px-2 py-1">
                                Reschedule
                              </button>
                            )}
                            <button className="text-gray-500 hover:text-gray-700">
                              <EllipsisVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// ── Helper function ──
function getInitials(name) {
  if (!name) return "--";
  return name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default MyBookings;