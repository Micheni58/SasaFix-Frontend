import { useState } from "react";
import {
  Calendar,
  Clock3,
  EllipsisVertical,
  Eye,
  MapPin,
  RotateCcw,
  XCircle,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    service: "Plumbing Repair",
    details: "Fix leaking kitchen sink",
    worker: "Michael Ochieng",
    initials: "MO",
    date: "2026-01-08",
    time: "10:00 AM",
    location: "Westlands, Nairobi",
    status: "Upcoming",
    amount: "KES 3,000",
  },
  {
    id: 2,
    service: "Electrical Repair",
    details: "Restore living room sockets",
    worker: "Jane Smith",
    initials: "JS",
    date: "2026-01-09",
    time: "2:00 PM",
    location: "Kilimani, Nairobi",
    status: "In Progress",
    amount: "KES 1,500",
  },
  {
    id: 3,
    service: "Cleaning",
    details: "Deep clean two-bedroom apartment",
    worker: "Bob Johnson",
    initials: "BJ",
    date: "2026-03-26",
    time: "9:00 AM",
    location: "Lavington, Nairobi",
    status: "Completed",
    amount: "KES 800",
  },
  {
    id: 4,
    service: "Gardening",
    details: "Lawn trimming and hedge shaping",
    worker: "Alice Brown",
    initials: "AB",
    date: "2026-03-24",
    time: "1:00 PM",
    location: "Karen, Nairobi",
    status: "Cancelled",
    amount: "KES 1,200",
  },
  {
    id: 5,
    service: "Appliance Repair",
    details: "Repair washing machine drum",
    worker: "David Mwangi",
    initials: "DM",
    date: "2026-04-05",
    time: "8:30 AM",
    location: "Riverside, Nairobi",
    status: "Upcoming",
    amount: "KES 2,300",
  },
  {
    id: 6,
    service: "Painting",
    details: "Bedroom wall repainting",
    worker: "Faith Njeri",
    initials: "FN",
    date: "2026-03-20",
    time: "11:30 AM",
    location: "South B, Nairobi",
    status: "Completed",
    amount: "KES 4,100",
  },
];

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
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-5">
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
                  ? "border-[#2563eb] bg-blue-50 text-[#2563eb]"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  activeTab === tab
                    ? "bg-[#2563eb] text-white"
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
                        {booking.initials}
                      </div>
                      <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800">
                        {booking.worker}
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
                      <button className="rounded-xl border-2 border-[#2563eb] px-4 py-2 text-sm font-semibold text-[#2563eb] transition-colors hover:bg-blue-50">
                        View
                      </button>
                      {(booking.status === "Upcoming" || booking.status === "In Progress") && (
                        <>
                          <button className="text-sm font-semibold text-[#2563eb] hover:bg-blue-50 rounded-md px-2 py-1">
                            Reschedule
                          </button>
                          <button className="text-sm font-semibold text-red-600 hover:bg-red-50 rounded-md px-2 py-1">
                            Cancel
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
    </div>
  );
}

export default MyBookings;
