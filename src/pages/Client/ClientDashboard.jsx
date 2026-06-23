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
} from "lucide-react";
import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const activeStatuses = ["New Requests", "Accepted", "Upcoming", "In Progress"];

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

function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const activeCount = bookings.filter((booking) =>
    activeStatuses.includes(booking.status)
  ).length;
  const completedCount = bookings.filter((booking) => booking.status === "Completed").length;
  const totalBookingValue = bookings.reduce(
    (sum, booking) => sum + Number(booking.amountRaw || 0),
    0
  );
  const loyalty = Math.min(
    100,
    Math.round((completedCount / Math.max(1, bookings.length)) * 100)
  );

  const activeBooking =
    bookings.find((booking) => booking.status === "In Progress") ||
    bookings.find((booking) => activeStatuses.includes(booking.status)) ||
    null;
  const activeProgress = activeBooking ? getBookingProgress(activeBooking.status) : 0;

  const statCards = [
    {
      label: "Active Jobs",
      value: activeCount,
      icon: <Briefcase className="h-7 w-7 text-[#056db3]" />,
      iconClass: "bg-blue-100",
    },
    {
      label: "Completed Jobs",
      value: completedCount,
      icon: <CheckCircle className="h-7 w-7 text-green-600" />,
      iconClass: "bg-green-100",
    },
    {
      label: "Wallet Balance",
      value: formatAmount(totalBookingValue),
      icon: <Wallet className="h-7 w-7 text-[#056db3]" />,
      iconClass: "bg-blue-100",
    },
    {
      label: "Loyalty Progress",
      value: `${loyalty}%`,
      icon: <Star className="h-7 w-7 text-yellow-600" />,
      iconClass: "bg-yellow-100",
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-72 min-w-0">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {displayName}!</h1>
              <div className="mt-2 flex items-center">
                <MapPin className="mr-2 h-5 w-5 text-[#056db3]" />
                <h2 className="text-lg text-gray-600">{locationLabel}</h2>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className="min-h-28 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-full items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-medium text-gray-600">{card.label}</h2>
                      <p className="mt-2 wrap-break-word text-xl font-bold text-gray-800">{card.value}</p>
                    </div>
                    <div className={`shrink-0 rounded-lg p-2 ${card.iconClass}`}>{card.icon}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">Active Booking In Progress</h2>
            </div>

            {activeBooking ? (
              <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center">
                  <Briefcase className="mr-4 h-10 w-10 shrink-0 text-[#056db3]" />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-bold text-gray-800">{activeBooking.service}</p>
                    <p className="text-gray-600">
                      Worker: {activeBooking.providerName || activeBooking.worker || "Provider"}
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
                    Message Worker
                  </Link>
                  <Link
                    to={`/client/my-bookings/${activeBooking.id}`}
                    className="rounded-lg bg-blue-100 px-4 py-2 text-blue-800 transition-colors hover:bg-blue-200"
                  >
                    <Eye className="mr-1 inline h-4 w-4" />
                    View Details
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-gray-600">
                {loading ? "Loading active booking..." : "No active bookings"}
              </div>
            )}

            <div className="max-w-3xl">
              <div className="mb-1 flex justify-between text-sm text-gray-600">
                <span>Progress</span>
                <span>{activeProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-[#056db3]"
                  style={{ width: `${activeProgress}%` }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-white shadow-sm">
            <div className="p-6 pb-0">
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-gray-800">Recent Bookings</h2>
                <Link to="/client/my-bookings" className="font-medium text-[#056db3] hover:underline">
                  View All
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Service</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Worker</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Date</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Amount</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4">{booking.service || "Service unavailable"}</td>
                        <td className="px-6 py-4">
                          {booking.providerName || booking.worker || "Provider unavailable"}
                        </td>
                        <td className="px-6 py-4">{booking.date || "Date pending"}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-md px-3 py-1 text-xs font-medium ${
                              booking.status === "Completed"
                                ? "bg-green-100 text-green-800"
                                : booking.status === "In Progress"
                                ? "bg-blue-50 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {booking.amount || formatAmount(booking.amountRaw)}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/client/my-bookings/${booking.id}`}
                            className="font-medium text-[#056db3] hover:underline"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}

                    {(loading || error || bookings.length === 0) && (
                      <tr>
                        <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                          {loading
                            ? "Loading bookings..."
                            : error
                            ? "Unable to load bookings"
                            : "No bookings found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ClientDashboard;
