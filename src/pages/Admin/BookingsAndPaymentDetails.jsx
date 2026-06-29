// src/pages/Admin/BookingsAndPaymentsDetails.jsx - Updated to use getBooking

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Flag,
  Eye,
  MapPin,
  Phone,
  Mail,
  Star,
  User,
  Wallet,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusStyles = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Scheduled: "bg-amber-100 text-amber-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Cancelled: "bg-red-100 text-red-700",
  "New Requests": "bg-purple-100 text-purple-700",
  Accepted: "bg-blue-100 text-blue-700",
};

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(amount) {
  if (!amount) return "KES 0";
  // If amount is already a string with "KES", return it
  if (typeof amount === "string" && amount.startsWith("KES")) {
    return amount;
  }
  return `KES ${Number(amount).toLocaleString()}`;
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function DetailRow({ label, value, isLast = false }) {
  return (
    <div
      className={`flex items-start justify-between py-3 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="ml-4 text-right text-sm font-medium text-gray-800">
        {value || "-"}
      </span>
    </div>
  );
}

function Avatar({ initials }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b from-[#b517ff] to-[#6f10f4] text-lg font-bold text-white">
      {initials}
    </div>
  );
}

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value, isLoading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      {isLoading ? (
        <div className="h-8 w-24 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

function EmptyBookingState({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="rounded-full bg-amber-50 p-6 mb-6">
        <AlertCircle className="h-16 w-16 text-amber-500" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Booking Not Found</h3>
      <p className="text-gray-500 max-w-md mb-8">
        The booking you're looking for doesn't exist or may have been removed.
      </p>
      <button
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl bg-[#056db3] px-6 py-3 text-white font-semibold hover:bg-[#045a94] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Bookings
      </button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="h-10 w-32 rounded bg-gray-200" />
        <div className="h-8 w-48 rounded bg-gray-200" />
      </div>
      
      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-10 w-10 rounded-2xl bg-gray-200" />
            <div className="h-8 w-24 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-gray-200" />
            <div className="h-6 w-40 rounded bg-gray-200" />
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-start justify-between py-3 border-b border-gray-100">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          ))}
        </div>
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-5 w-5 rounded bg-gray-200" />
              <div className="h-6 w-20 rounded bg-gray-200" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-gray-200" />
              <div className="mt-3 h-5 w-32 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
              <div className="mt-1 h-4 w-36 rounded bg-gray-200" />
              <div className="mt-4 h-10 w-full rounded-lg bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function BookingsAndPaymentsDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // ── Fetch Booking Details ──
  const fetchBookingDetails = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    setNotFound(false);

    try {
      // Use the existing getBooking function
      const data = await bookingService.getBooking(bookingId);

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // The data is already normalized by bookingService.getBooking
      // But we need to ensure we have all the fields we need
      const formattedBooking = {
        id: data.id || bookingId,
        client: data.client || data.clientName || `Client #${data.clientId}` || "Unknown Client",
        provider: data.providerName || data.worker || `Provider #${data.serviceProviderId}` || "Unknown Provider",
        service: data.service || "Service Not Specified",
        date: data.date || data.scheduledDate || null,
        amount: data.amountRaw || data.amount || 0,
        commission: data.commission || data.commission_amount || 0,
        status: data.status || "Pending",
        description: data.details || data.description || "No description provided",
        location: data.location || "Not specified",
        scheduledDate: data.date || data.scheduledDate,
        startTime: data.time ? data.time.split(" - ")[0] : "Not specified",
        endTime: data.time ? data.time.split(" - ")[1] : "Not specified",
        duration: data.duration || "Not specified",
        createdOn: data.created_at || data.createdAt,
        lastUpdated: data.updated_at || data.updatedAt,
        clientEmail: data.clientEmail || data.clientObj?.email || "No email",
        clientPhone: data.clientPhone || data.clientObj?.phone || "No phone",
        providerEmail: data.providerEmail || "No email",
        providerPhone: data.providerPhone || "No phone",
        providerCategory: data.providerCategory || "Service Provider",
        providerRating: data.providerRating || 0,
        providerReviews: data.providerReviews || 0,
        providerPayout: data.providerPayout || data.net_amount || (Number(data.amountRaw) - (data.commission || 0)),
        mpesaRef: data.mpesaRef || data.mpesa_reference || "",
        verified: data.verified || false,
        clientInitials: data.clientInitials || getInitials(data.client),
        providerInitials: data.initials || getInitials(data.providerName),
        raw: data,
      };

      setBooking(formattedBooking);
    } catch (err) {
      console.error("Error fetching booking details:", err);
      // Check if it's a 404
      if (err.response && err.response.status === 404) {
        setNotFound(true);
      } else {
        setError(err.message || "Failed to load booking details");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  // ── Handle Back ──
  const handleBack = () => {
    navigate("/admin/bookings-payments");
  };

  // ── Handle Retry ──
  const handleRetry = () => {
    fetchBookingDetails(true);
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // ── Not Found state ──
  if (notFound) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>
            <EmptyBookingState onBack={handleBack} />
          </main>
        </div>
      </div>
    );
  }

  // ── Error state - Clean and friendly ──
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center max-w-2xl mx-auto">
              <div className="rounded-full bg-amber-100 p-4 mx-auto w-fit mb-4">
                <RefreshCw className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Booking</h3>
              <p className="text-gray-600 mb-6">
                We're having trouble loading this booking. This could be a temporary issue.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBack}
                  className="rounded-xl border border-gray-300 px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={handleRetry}
                  className="rounded-xl bg-[#056db3] px-6 py-2.5 text-white font-medium hover:bg-[#045a94] transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── No booking found after loading ──
  if (!booking) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>
            <EmptyBookingState onBack={handleBack} />
          </main>
        </div>
      </div>
    );
  }

  // ── Main Detail View ──
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
          {/* ── Header ── */}
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="mb-4 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>

            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  Booking Details
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Full information about this booking
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  Booking #{booking.id}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    statusStyles[booking.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {booking.status || "Unknown"}
                </span>
                <button
                  onClick={() => fetchBookingDetails(true)}
                  disabled={refreshing}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* ── Summary Cards ── */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard
              icon={ArrowUpRight}
              iconBg="bg-[#dfe6ff]"
              iconColor="text-[#5b38f2]"
              label="Booking Amount"
              value={formatCurrency(booking.amount)}
              isLoading={loading}
            />
            <SummaryCard
              icon={Wallet}
              iconBg="bg-[#dcfce7]"
              iconColor="text-[#16a34a]"
              label="Commission Earned"
              value={formatCurrency(booking.commission)}
              isLoading={loading}
            />
            <SummaryCard
              icon={CalendarDays}
              iconBg="bg-[#dfe6ff]"
              iconColor="text-[#056db3]"
              label="Booking Date"
              value={booking.date ? formatDate(booking.date) : "-"}
              isLoading={loading}
            />
            <SummaryCard
              icon={Clock3}
              iconBg="bg-[#fef3c7]"
              iconColor="text-[#f97316]"
              label="Status"
              value={booking.status || "Unknown"}
              isLoading={loading}
            />
          </div>

          {/* ── Main Content — Two Columns ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column — Booking Information */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#056db3]" />
                <h2 className="text-lg font-bold text-gray-900">
                  Booking Information
                </h2>
              </div>

              <DetailRow label="Service" value={booking.service} />
              <DetailRow label="Description" value={booking.description} />
              <DetailRow label="Location" value={booking.location} />
              <DetailRow label="Scheduled Date" value={booking.scheduledDate ? formatDate(booking.scheduledDate) : "-"} />
              <DetailRow label="Time" value={booking.time || `${booking.startTime} - ${booking.endTime}`} />
              <DetailRow label="Duration" value={booking.duration} />
              <DetailRow label="Created On" value={booking.createdOn ? formatDateTime(booking.createdOn) : "-"} />
              <DetailRow label="Last Updated" value={booking.lastUpdated ? formatDateTime(booking.lastUpdated) : "-"} isLast />

              {/* Map Placeholder */}
              <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-gray-100">
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm font-medium">{booking.location || "Location not specified"}</span>
                </div>
              </div>
            </div>

            {/* Right Column — Client and Provider */}
            <div className="space-y-6">
              {/* Client Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg font-bold text-gray-900">Client</h2>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Avatar initials={booking.clientInitials || getInitials(booking.client)} />
                  <p className="mt-3 text-base font-bold text-gray-900">
                    {booking.client || "Unknown"}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {booking.clientEmail}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    {booking.clientPhone}
                  </div>
                  <button className="mt-4 w-full rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white">
                    View Client Profile
                  </button>
                </div>
              </div>

              {/* Provider Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg font-bold text-gray-900">Provider</h2>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Avatar initials={booking.providerInitials || getInitials(booking.provider)} />
                  <p className="mt-3 text-base font-bold text-gray-900">
                    {booking.provider || "Unknown"}
                  </p>
                  <p className="text-sm font-medium text-[#056db3]">
                    {booking.providerCategory}
                  </p>

                  {/* Rating */}
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(booking.providerRating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {booking.providerRating || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({booking.providerReviews || 0} reviews)
                    </span>
                  </div>

                  {/* Verified Badge */}
                  {booking.verified && (
                    <div className="mt-2 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">
                        Verified Professional
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {booking.providerEmail}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    {booking.providerPhone}
                  </div>
                  <button className="mt-4 w-full rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white">
                    View Provider Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Payment Breakdown ── */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#056db3]" />
              <h2 className="text-lg font-bold text-gray-900">
                Payment Breakdown
              </h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full table-auto">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Description
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      Service Amount
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      Total charged to client
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      Platform Commission (15%)
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-red-500">
                      {formatCurrency(booking.commission)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      Deducted by SasaFix
                    </td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="px-5 py-4 text-sm font-bold text-gray-800">
                      Provider Payout
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-green-600">
                      {formatCurrency(booking.providerPayout)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      Amount released to provider
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* M-Pesa Reference */}
            {booking.mpesaRef && (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <span className="text-xs font-bold text-green-700">M</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Paid via M-Pesa</p>
                  <p className="text-xs text-gray-400">
                    Transaction Ref: {booking.mpesaRef}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Admin Actions ── */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#056db3]" />
              <h2 className="text-lg font-bold text-gray-900">Admin Actions</h2>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <button className="flex items-center gap-2 rounded-xl bg-[#056db3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96]">
                <Eye className="h-4 w-4" />
                Mark as Reviewed
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-red-400 px-5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white">
                <Flag className="h-4 w-4" />
                Flag Booking
              </button>
              <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Notes
              </label>
              <textarea
                rows={4}
                placeholder="Add internal notes about this booking..."
                className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
              />
              <div className="mt-3 flex justify-end">
                <button className="rounded-xl bg-[#056db3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96]">
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookingsAndPaymentsDetails;