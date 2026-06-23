import { useState, useEffect } from "react";
import {
  Calendar,
  Clock3,
  EllipsisVertical,
  Eye,
  Import,
  MapPin,
  RotateCcw,
  XCircle,
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

function formatBookingDate(date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function MyBookings() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Once auth is working replace the hardcoded ID with the actual logged in user:

    const clientId = Number(localStorage.getItem("userId") || 1);
    let mounted = true;
    setLoading(true);
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
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
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

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-6">
            <h1 className="text-3xl font-semibold text-gray-800">My Bookings</h1>
            <p className="mt-1 text-sm text-gray-600">View and manage all your service bookings</p>
          </section>

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

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
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
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 align-middle">
                  <td className="px-6 py-5">
                    <div className="max-w-42.5">
                      <p className="text-base font-semibold text-gray-800">{booking.service}</p>
                      <p className="mt-1 text-sm leading-6 text-gray-500">{booking.details}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                        {(() => {
                          const displayName =
                            booking.providerName ||
                            booking.provider_full_name ||
                            booking.worker ||
                            (booking.service_provider && (booking.service_provider.name || booking.service_provider.full_name)) ||
                            (booking.serviceProviderId ? `Provider #${booking.serviceProviderId}` : (booking.service_provider_id ? `Provider #${booking.service_provider_id}` : "Provider"));
                          const initials = displayName
                            .toString()
                            .split(" ")
                            .map((s) => (s ? s[0] : ""))
                            .slice(0, 2)
                            .join("");
                          return initials || booking.initials || "--";
                        })()}
                      </div>
                      <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800">
                        {booking.providerName || booking.provider_full_name || booking.worker || (booking.service_provider && (booking.service_provider.name || booking.service_provider.full_name)) || (booking.serviceProviderId ? `Provider #${booking.serviceProviderId}` : (booking.service_provider_id ? `Provider #${booking.service_provider_id}` : "Provider"))}
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
                      <span className="max-w-33.75 text-sm leading-6">{booking.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-5 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[booking.status]
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
                      <Link to={`/client/my-bookings/${booking.id}`} className="rounded-xl border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50">
                        View
                      </Link>
                      {(booking.status === "Upcoming" || booking.status === "In Progress") && (
                        <>
                          <button className="text-sm font-semibold text-[#056db3] hover:bg-blue-50 rounded-md px-2 py-1">
                            Reschedule
                          </button>

                        </>
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
        </div>

        {filteredBookings.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No bookings found in this category yet.
          </div>
        )}
      </section>
        </main>
      </div>
    </div>
  );
}

export default MyBookings;
