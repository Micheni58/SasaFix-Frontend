import { useMemo, useState, useEffect } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Search,
  Wallet,
} from "lucide-react";

import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const payoutRows = [
  {
    id: 1,
    provider: "John Mwangi",
    initials: "J",
    requestDate: "2026-03-06",
    amount: "KES 45,000",
    jobsCompleted: "12 jobs",
    status: "Pending",
  },
  {
    id: 2,
    provider: "David Kariuki",
    initials: "D",
    requestDate: "2026-03-05",
    amount: "KES 67,500",
    jobsCompleted: "18 jobs",
    status: "Pending",
  },
  {
    id: 3,
    provider: "Faith Achieng",
    initials: "F",
    requestDate: "2026-03-04",
    amount: "KES 38,000",
    jobsCompleted: "9 jobs",
    status: "Approved",
  },
];

const statusOptions = ["All Status", "Completed", "In Progress", "Scheduled"];
const payoutStatusOptions = ["All Status", "Pending", "Approved"];
const timeOptions = ["All Time", "This Week", "This Month", "This Quarter"];

const bookingStatusStyles = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Scheduled: "bg-amber-100 text-amber-700",
};

const payoutStatusStyles = {
  Pending: "bg-[#f7f3a1] text-[#b58100]",
  Approved: "bg-green-100 text-green-700",
  Paid: "bg-green-100 text-green-700",
};

function formatDate(date) {
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

function BookingsAndPayments() {
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [bookingsError, setBookingsError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoadingBookings(true);
    bookingService
      .listActiveBookings()
      .then((data) => {
        if (!mounted) return;
        // Map API booking shape to the minimal row fields expected by the table
        const rows = (data || []).map((b) => ({
          id: b.id,
          client:
            b.clientName ||
            (b.client && (b.client.full_name || b.client.name)) ||
            (b.clientId ? `Client #${b.clientId}` : "") ||
            "",
          provider:
            b.providerName ||
            b.worker ||
            (b.service_provider && (b.service_provider.name || b.service_provider.full_name)) ||
            (b.serviceProviderId ? `Provider #${b.serviceProviderId}` : "") ||
            "",
          service: b.service || b.service_name || "",
          date: b.date || b.scheduled_date || b.booking_date || null,
          amount: b.amount || "",
          commission: b.commission || "",
          status: b.status || "",
        }));
        setBookings(rows);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setBookingsError(err);
      })
      .finally(() => mounted && setLoadingBookings(false));

    return () => {
      mounted = false;
    };
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      const matchesSearch =
        (row.client || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.provider || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.service || "").toString().toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchTerm, statusFilter]);

  const filteredPayouts = useMemo(() => {
    return payoutRows.filter((row) => {
      const matchesSearch =
        row.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.amount.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.jobsCompleted.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Bookings &amp; Payments</h1>
        <p className="mt-2 text-lg text-gray-600">
          Manage bookings and process provider payouts
        </p>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-28 p-6 shadow-sm">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#dfe6ff]">
            <ArrowUpRight className="h-6 w-6 text-[#5b38f2]" />
          </div>
          <p className="text-[1.5rem] font-bold leading-none text-gray-900">KES 58.0K</p>
          <p className="mt-2  font-medium text-gray-500">Total Revenue</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-28 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcfce7]">
            <Wallet className="h-6 w-6 text-[#16a34a]" />
          </div>
          <p className="text-[1.5rem] font-bold leading-none text-gray-900">KES 8.7K</p>
          <p className="mt-2  font-medium text-gray-500">Commission This Month</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-28 p-6 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fef3c7]">
            <Clock3 className="h-6 w-6 text-[#f97316]" />
          </div>
          <p className="text-[1.5rem] font-bold leading-none text-gray-900">KES 144.5K</p>
          <p className="mt-2  font-medium text-gray-500">Pending Payouts</p>
        </div>
      </section>

      <section className="mb-6 border-b border-gray-200">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => {
              setActiveTab("All Bookings");
              setStatusFilter("All Status");
            }}
            className={`border-b-2 pb-4  font-medium transition-colors ${
              activeTab === "All Bookings"
                ? "border-[#056db3] text-[#056db3]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            All Bookings
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("Payout Requests");
              setStatusFilter("All Status");
            }}
            className={`flex items-center gap-3 border-b-2 pb-4  font-medium transition-colors ${
              activeTab === "Payout Requests"
                ? "border-[#056db3] text-[#056db3]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>Payout Requests</span>
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#fde7b2] px-2 text-sm font-semibold text-[#d97706]">
              {payoutRows.length}
            </span>
          </button>
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={activeTab === "All Bookings" ? "Search bookings..." : "Search providers..."}
              className="h-14 w-full rounded-xl border border-gray-200 bg-white pl-14 pr-4 text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#056db3] focus:border-2"
            />
          </div>

          <div className="flex shrink-0 flex-col gap-4 md:flex-row md:items-center lg:ml-auto">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-14 min-w-44 appearance-none rounded-xl border border-gray-200 bg-white pl-12 pr-12 text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
              >
                {(activeTab === "All Bookings" ? statusOptions : payoutStatusOptions).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {activeTab === "All Bookings" && (
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-700" />
                <select
                  value={timeFilter}
                  onChange={(event) => setTimeFilter(event.target.value)}
                  className="h-14 min-w-44 appearance-none rounded-xl border border-gray-200 bg-white pl-12 pr-12  text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
                >
                  {timeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          {activeTab === "All Bookings" ? (
            loadingBookings ? (
              <div className="p-8 text-center text-sm text-gray-600">Loading bookings...</div>
            ) : (
              <table className="w-full min-w-245 table-auto">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Client
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Provider
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Service
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Commission
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-5 py-4.5 text-base font-medium text-gray-800">{row.client}</td>
                    <td className="px-4 py-4.5 text-base font-medium text-gray-800">{row.provider}</td>
                    <td className="px-4 py-4.5 text-base text-gray-800">{row.service}</td>
                    <td className="px-4 py-4.5 text-base text-gray-600">{row.date ? formatDate(row.date) : "-"}</td>
                    <td className="px-4 py-4.5 text-base font-medium text-gray-800">{row.amount}</td>
                    <td className="px-4 py-4.5 text-base font-medium text-[#16a34a]">{row.commission}</td>
                    <td className="px-4 py-4.5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          bookingStatusStyles[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4.5">
                      <button className="text-sm text-[#056db3]  hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )) : (
            <table className="w-full min-w-245 table-auto">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Provider
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Jobs Completed
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Request Date
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100">
                    <td className="px-5 py-4.5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#b517ff] to-[#6f10f4] text-lg font-bold text-white">
                          {row.initials}
                        </div>
                        <span className="text-base font-medium text-gray-800">{row.provider}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4.5 text-base font-semibold text-gray-800">{row.amount}</td>
                    <td className="px-4 py-4.5 text-base text-gray-700">{row.jobsCompleted}</td>
                    <td className="px-4 py-4.5 text-base text-gray-600">{row.requestDate}</td>
                    <td className="px-4 py-4.5">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          payoutStatusStyles[row.status]
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-4.5">
                      <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-green-600 hover:text-white">
                          <CheckCircle2 className="h-4 w-4" />
                          Approve
                        </button>
                        <button className="rounded-xl  px-4 py-2 text-base font-medium text-gray-600 transition-colors hover:bg-red-500 hover:text-white">
                          Hold
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {(activeTab === "All Bookings" ? filteredBookings : filteredPayouts).length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No results found for the current filters.
          </div>
        )}
      </section>
        </main>
      </div>
    </div>
  );
}

export default BookingsAndPayments;
