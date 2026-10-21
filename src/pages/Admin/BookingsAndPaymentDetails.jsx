// src/pages/admin/BookingsAndPaymentsDetails.jsx - Fixed Timeline (Removed Approve/Reject)

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
  MessageSquare,
  AlertTriangle,
  History,
} from "lucide-react";

import bookingService from "../../api/bookingService";
import ratingService from "../../api/ratingService";
import reviewService from "../../api/reviewService";
import paymentsService from "../../api/paymentsService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ui/ToastProvider";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusStyles = {
  "pending": "bg-yellow-100 text-yellow-700",
  "accepted": "bg-blue-100 text-blue-700",
  "in progress": "bg-amber-100 text-amber-700",
  "completed": "bg-green-100 text-green-700",
  "approved": "bg-green-100 text-green-700",
  "rejected": "bg-red-100 text-red-700",
  "cancelled": "bg-red-100 text-red-700",
  "paid": "bg-emerald-100 text-emerald-700",
  "rescheduled": "bg-purple-100 text-purple-700",
  "Pending": "bg-yellow-100 text-yellow-700",
  "Accepted": "bg-blue-100 text-blue-700",
  "In Progress": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Approved": "bg-green-100 text-green-700",
  "Rejected": "bg-red-100 text-red-700",
  "Cancelled": "bg-red-100 text-red-700",
  "New Requests": "bg-purple-100 text-purple-700",
  "Paid": "bg-emerald-100 text-emerald-700",
  "Rescheduled": "bg-purple-100 text-purple-700",
};

const statusDisplayMap = {
  "pending": "Pending",
  "accepted": "Accepted",
  "inprogress": "In Progress",
  "in progress": "In Progress",
  "completed": "Completed",
  "approved": "Approved",
  "rejected": "Rejected",
  "cancelled": "Cancelled",
  "paid": "Paid",
  "rescheduled": "Rescheduled",
};

// Define the order of statuses for timeline progression
const STATUS_ORDER = [
  "pending",
  "accepted",
  "inprogress",
  "completed",
  "paid"
];

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
  if (!amount && amount !== 0) return "KES 0";
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

function getStatusDisplay(status) {
  const lowerStatus = status?.toLowerCase() || "pending";
  return statusDisplayMap[lowerStatus] || status || "Pending";
}

// ─────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="h-8 w-48 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-10 w-10 rounded-2xl bg-gray-200" />
            <div className="h-8 w-24 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
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

function Avatar({ initials, photoUrl, name }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-linear-to-b from-[#b517ff] to-[#6f10f4] text-lg font-bold text-white">
      {photoUrl ? <img src={photoUrl} alt={name || "User"} className="h-full w-full object-cover" /> : initials}
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

function TimelineItem({ task, completed, isLast, timestamp }) {
  return (
    <div className={`relative flex gap-4 ${!isLast ? "pb-8" : ""}`}>
      {!isLast && (
        <div className="absolute left-5 top-10 h-full w-0.5 bg-gray-200" />
      )}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
        completed ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
      }`}>
        {completed ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Clock3 className="h-5 w-5 text-gray-400" />
        )}
      </div>
      <div className="pt-1">
        <p className={`text-sm font-medium ${completed ? "text-gray-900" : "text-gray-500"}`}>
          {task}
        </p>
        {timestamp && completed && (
          <p className="text-xs text-gray-400">{timestamp}</p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="rounded-full bg-gray-100 p-3 mb-3">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <h4 className="text-sm font-semibold text-gray-700">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function BookingsAndPaymentsDetails() {
  const toast = useToast();
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [escrowTransaction, setEscrowTransaction] = useState(null);

  // ── Fetch Booking Details ──
  const fetchBookingDetails = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);
    setNotFound(false);

    try {
      const data = await bookingService.getBooking(bookingId);

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch provider details (ratings and reviews)
      let providerRatings = { averageScore: 0, totalRatings: 0 };
      let providerReviews = [];

      try {
        const providerId = data.serviceProviderId || data.raw?.service_provider_id;
        if (providerId) {
          const [ratings, reviews] = await Promise.all([
            ratingService.getProviderAverageRating(providerId),
            reviewService.getProviderReviews(providerId),
          ]);
          providerRatings = ratings || { averageScore: 0, totalRatings: 0 };
          providerReviews = reviews || [];
        }
      } catch (e) {
        console.warn("Could not fetch provider details:", e);
      }

      // Calculate duration from start and end time
      let duration = "Not specified";
      if (data.time) {
        const parts = data.time.split(" - ");
        if (parts.length === 2) {
          try {
            const start = new Date(`1970-01-01T${parts[0].trim()}`);
            const end = new Date(`1970-01-01T${parts[1].trim()}`);
            const diffMs = end - start;
            const diffHours = diffMs / (1000 * 60 * 60);
            if (diffHours > 0) {
              const hrs = Math.floor(diffHours);
              const mins = Math.round((diffHours - hrs) * 60);
              duration = hrs > 0 ? `${hrs}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;
            }
          } catch (e) {
            duration = "Not specified";
          }
        }
      }

      // Determine commission rate (10% default)
      const commissionRate = 0.10;
      const amount = Number(data.amountRaw || data.amount || 0);
      const commission = amount * commissionRate;
      const providerPayout = amount - commission;

      // Get provider name from raw data
      const providerName = data.providerName || data.worker ||
        data.raw?.provider_full_name ||
        data.raw?.service_provider?.name ||
        data.raw?.provider_name ||
        `Provider #${data.serviceProviderId}`;

      // Get client name
      const clientName = data.client || data.clientName ||
        data.raw?.client_full_name ||
        data.raw?.client?.full_name ||
        `Client #${data.clientId}`;

      // ── FIXED: Build timeline based on status progression (no APPROVED) ──
      const currentStatus = (data.status || "pending").toLowerCase();

      // Get the index of the current status in the progression
      const statusIndex = STATUS_ORDER.indexOf(currentStatus);

      // Timeline tasks in order (removed "Client Approved")
      const timelineTasks = [
        { task: "Booking Created", key: "created" },
        { task: "Provider Accepted", key: "accepted" },
        { task: "Work In Progress", key: "in progress" },
        { task: "Work Completed", key: "completed" },
        { task: "Payment Processed", key: "paid" },
      ];

      // Determine which tasks are completed based on status index
      const timelineItems = timelineTasks.map((item, index) => {
        // Created is always completed
        if (item.key === "created") {
          return { ...item, completed: true, timestamp: data.created_at || data.createdAt || data.raw?.created_at };
        }
        // For other tasks, check if the status has reached that point
        const isCompleted = statusIndex >= index;
        return { ...item, completed: isCompleted, timestamp: null };
      });

      const formattedBooking = {
        id: data.id || bookingId,
        client: clientName,
        provider: providerName,
        service: data.service || "Service Not Specified",
        date: data.date || data.scheduledDate || null,
        amount: amount,
        commission: commission,
        status: data.status || "Pending",
        description: data.details || data.description || "No description provided",
        location: data.location || "Not specified",
        scheduledDate: data.date || data.scheduledDate,
        startTime: data.time ? data.time.split(" - ")[0] : "Not specified",
        endTime: data.time ? data.time.split(" - ")[1] : "Not specified",
        duration: duration,
        createdOn: data.created_at || data.createdAt || data.raw?.created_at,
        lastUpdated: data.updated_at || data.updatedAt || data.raw?.updated_at,
        clientEmail: data.clientEmail || data.raw?.client_email || data.raw?.client?.email || "No email",
        clientPhone: data.clientPhone || data.raw?.client_phone || data.raw?.client?.phone || "No phone",
        providerEmail: data.providerEmail || data.raw?.provider_email || data.raw?.service_provider?.contact_email || "No email",
        providerPhone: data.providerPhone || data.raw?.provider_phone || data.raw?.service_provider?.contact_phone || "No phone",
        providerCategory: data.raw?.service_provider?.service_type || data.raw?.service_provider?.category || "Service Provider",
        providerRating: providerRatings.averageScore || 0,
        providerReviews: providerRatings.totalRatings || 0,
        providerPayout: providerPayout,
        mpesaRef: data.mpesaRef || data.mpesa_reference || data.raw?.mpesa_reference || "",
        verified: data.raw?.service_provider?.is_verified || false,
        clientInitials: getInitials(clientName),
        providerInitials: getInitials(providerName),
        client_profile_photo_url: data.raw?.client_profile_photo_url,
        provider_profile_photo_url: data.raw?.service_provider?.profile_photo_url,
        clientId: data.clientId || data.raw?.client_id,
        providerId: data.serviceProviderId || data.raw?.service_provider_id,
        timeline: timelineItems,
        raw: data,
        providerReviewsList: providerReviews,
      };

      setBooking(formattedBooking);

      // Fetch escrow transaction
      try {
        const escrowData = await paymentsService.getBookingEscrowTransaction(bookingId);
        if (escrowData && escrowData.length > 0) {
          const escrow = escrowData.find(t =>
            t.type === "payment" &&
            (t.status === "COMPLETED" || t.status === "PENDING" || t.status === "RELEASED")
          );
          setEscrowTransaction(escrow);
        }
      } catch (e) {
        console.warn("No escrow transaction found");
      }

    } catch (err) {
      console.error("Error fetching booking details:", err);
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

  // ── Handle Release Escrow Funds ──
  const handleReleaseFunds = async () => {
    if (!escrowTransaction) {
      toast.warning("No escrow transaction", "No escrow transaction was found for this booking.");
      return;
    }

    const amount = escrowTransaction.net_amount || escrowTransaction.gross_amount || 0;
    if (!window.confirm(`Are you sure you want to release KES ${amount.toLocaleString()} to the provider?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const adminId = storedUser.id || 9;

      await paymentsService.releaseEscrowFunds(escrowTransaction.id, adminId);
      toast.success("Funds released", "Funds were released to the provider wallet.");

      // Refresh data
      await fetchBookingDetails(true);

    } catch (err) {
      toast.error("Failed to release funds", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Admin Actions ──
  const handleAdminAction = async (action, data = null) => {
    setActionLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (action === "review") {
        setBooking(prev => ({ ...prev, reviewed: true }));
        toast.success("Booking marked as reviewed");
      } else if (action === "flag") {
        setBooking(prev => ({ ...prev, flagged: !prev.flagged }));
        toast.info(booking?.flagged ? "Booking unflagged" : "Booking flagged for review");
      } else if (action === "export") {
        toast.info("Export started", "Booking details are being exported as a PDF.");
      } else if (action === "save_note") {
        if (data?.note) {
          setBooking(prev => ({ ...prev, adminNote: data.note }));
          toast.success("Admin note saved");
          setAdminNote("");
        }
      }
    } catch (err) {
      console.error(`Failed to perform ${action}:`, err);
      toast.error(`Failed to ${action}`, err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Status Check ──
  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase() || "pending";
    return statusStyles[normalizedStatus] || statusStyles[status] || "bg-gray-100 text-gray-700";
  };

  const displayStatus = getStatusDisplay(booking?.status);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // ── Not Found state ──
  if (notFound || !booking) {
    return (
      <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full">
            <button
              onClick={handleBack}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Bookings
            </button>
            <EmptyState
              icon={AlertCircle}
              title="Booking Not Found"
              description="The booking you're looking for doesn't exist or may have been removed."
            />
          </main>
        </div>
      </div>
    );
  }

  // ── Main Detail View ──
  return (
    <div className="admin-layout-shell flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72">
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
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(booking.status)}`}
                >
                  {displayStatus}
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
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              label="Commission (10%)"
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
              value={displayStatus}
              isLoading={loading}
            />
          </div>

          {/* ── Main Content ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column — Booking Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Info Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
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
                <DetailRow label="Time" value={`${booking.startTime} - ${booking.endTime}`} />
                <DetailRow label="Duration" value={booking.duration} />
                <DetailRow label="Created On" value={booking.createdOn ? formatDateTime(booking.createdOn) : "-"} />
                <DetailRow label="Last Updated" value={booking.lastUpdated ? formatDateTime(booking.lastUpdated) : "-"} isLast />

                <div className="mt-6 flex h-32 items-center justify-center rounded-xl bg-gray-100">
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <MapPin className="h-6 w-6" />
                    <span className="text-sm font-medium">{booking.location || "Location not specified"}</span>
                  </div>
                </div>
              </div>

              {/* ── FIXED: Timeline Card (no Approve/Reject) ── */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <History className="h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg font-bold text-gray-900">Booking Timeline</h2>
                </div>
                <div className="space-y-0">
                  {booking.timeline && booking.timeline.length > 0 ? (
                    booking.timeline.map((item, index) => (
                      <TimelineItem
                        key={index}
                        task={item.task}
                        completed={item.completed}
                        isLast={index === booking.timeline.length - 1}
                        timestamp={item.timestamp}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={Clock3}
                      title="No Timeline Data"
                      description="Timeline information is not available for this booking."
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Client Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg font-bold text-gray-900">Client</h2>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Avatar initials={booking.clientInitials} photoUrl={booking.client_profile_photo_url} name={booking.client} />
                  <p className="mt-3 text-base font-bold text-gray-900">
                    {booking.client}
                  </p>
                  <p className="text-sm text-gray-500">Client ID: #{booking.clientId}</p>
                  <div className="mt-3 w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{booking.clientEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{booking.clientPhone}</span>
                    </div>
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
                  <Avatar initials={booking.providerInitials} photoUrl={booking.provider_profile_photo_url} name={booking.provider} />
                  <p className="mt-3 text-base font-bold text-gray-900">
                    {booking.provider}
                  </p>
                  <p className="text-sm font-medium text-[#056db3]">
                    {booking.providerCategory}
                  </p>
                  <p className="text-sm text-gray-500">Provider ID: #{booking.providerId}</p>

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
                      {booking.providerRating ? booking.providerRating.toFixed(1) : "N/A"}
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

                  <div className="mt-3 w-full space-y-2 text-left">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{booking.providerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{booking.providerPhone}</span>
                    </div>
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
                      Platform Commission (10%)
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

            {/* ── Escrow Status ── */}
            {escrowTransaction && (
              <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <Wallet className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-800">Escrow Status</p>
                    <p className="text-sm text-blue-700">
                      {escrowTransaction.status === "COMPLETED"
                        ? `✅ KES ${(escrowTransaction.net_amount || escrowTransaction.gross_amount)?.toLocaleString()} held in escrow. Awaiting admin release.`
                        : escrowTransaction.status === "RELEASED"
                        ? `✅ Funds released to provider`
                        : escrowTransaction.status === "PENDING"
                        ? `⏳ Payment pending...`
                        : `📊 Status: ${escrowTransaction.status}`}
                    </p>
                    {escrowTransaction.mpesa_reference && (
                      <p className="text-xs text-blue-600">M-Pesa Ref: {escrowTransaction.mpesa_reference}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* M-Pesa Reference */}
            {booking.mpesaRef ? (
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
            ) : (
              <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                  <span className="text-xs font-bold text-gray-500">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Payment Status</p>
                  <p className="text-xs text-gray-400">
                    {booking.status === "completed" || booking.status === "paid" ? "Payment pending release" : "No payment recorded yet"}
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
              <button
                onClick={() => handleAdminAction("review")}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-[#056db3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96] disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                Mark as Reviewed
              </button>
              <button
                onClick={() => handleAdminAction("flag")}
                disabled={actionLoading}
                className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${
                  booking?.flagged
                    ? "border-green-400 text-green-500 hover:bg-green-500 hover:text-white"
                    : "border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
                }`}
              >
                <Flag className="h-4 w-4" />
                {booking?.flagged ? "Unflag Booking" : "Flag Booking"}
              </button>
              <button
                onClick={() => handleAdminAction("export")}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>

            {/* ── RELEASE FUNDS BUTTON ── */}
            {booking?.status === "completed" && escrowTransaction?.status === "COMPLETED" && (
              <button
                onClick={handleReleaseFunds}
                disabled={actionLoading}
                className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Release Funds to Provider
              </button>
            )}

            {/* ── RELEASE FUNDS INFO ── */}
            {booking?.status === "completed" && escrowTransaction?.status === "COMPLETED" && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                <AlertCircle className="inline h-4 w-4 mr-1" />
                This booking has been completed and payment is held in escrow.
                Click the button above to release funds to the provider's wallet.
              </div>
            )}

            <div>
              <label htmlFor="admin-notes" className="mb-2 block text-sm font-medium text-gray-700">
                Admin Notes
              </label>
              <textarea
                id="admin-notes"
                name="admin-notes"
                rows={4}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add internal notes about this booking..."
                className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleAdminAction("save_note", { note: adminNote })}
                  disabled={actionLoading || !adminNote.trim()}
                  className="rounded-xl bg-[#056db3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96] disabled:opacity-50 flex items-center gap-2"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Notes"}
                </button>
              </div>
              {booking?.adminNote && (
                <div className="mt-3 rounded-xl bg-gray-50 p-3">
                  <p className="text-xs font-medium text-gray-500">Previous Notes:</p>
                  <p className="text-sm text-gray-700 mt-1">{booking.adminNote}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default BookingsAndPaymentsDetails;