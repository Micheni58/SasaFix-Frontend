// src/pages/admin/PayoutDetails.jsx - Fully Updated with All Actions

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  Flag,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Star,
  User,
  Wallet,
  X,
  AlertCircle,
  DollarSign,
  CreditCard,
  Check,
  AlertTriangle,
} from "lucide-react";

import paymentsService from "../../api/paymentsService";
import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ui/ToastProvider";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const payoutStatusStyles = {
  Pending: "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-700",
  Processing: "bg-purple-100 text-purple-700",
  Completed: "bg-green-100 text-green-700",
  Failed: "bg-red-100 text-red-700",
  Held: "bg-gray-100 text-gray-700",
};

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === "") return "KES 0";
  if (typeof amount === "string" && amount.includes("KES")) {
    return amount;
  }
  const num = Number(amount);
  if (isNaN(num) || num === 0) return "KES 0";
  return `KES ${num.toLocaleString()}`;
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
// CONFIRMATION MODAL COMPONENT
// ─────────────────────────────────────────────

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon: Icon,
  iconColor,
  confirmButtonColor,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${iconColor} mb-4`}>
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <p className="mt-2 text-gray-600">{message}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {cancelText || "Cancel"}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center ${confirmButtonColor}`}
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                confirmText || "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HOLD PAYOUT MODAL
// ─────────────────────────────────────────────

function HoldPayoutModal({
  isOpen,
  onClose,
  onConfirm,
  holdReason,
  setHoldReason,
  isLoading,
  payoutAmount,
  providerName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 mb-4">
            <Flag className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Hold Payout</h3>
          <p className="mt-2 text-gray-600">
            Please provide a reason for holding this payout of {payoutAmount} to {providerName}.
          </p>

          <div className="mt-4 text-left">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Holding
            </label>
            <textarea
              rows={3}
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              placeholder="Enter reason for holding this payout..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || !holdReason.trim()}
              className="flex-1 rounded-xl bg-yellow-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-yellow-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Hold Payout"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

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

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-10 w-32 rounded bg-gray-200" />
        <div className="h-8 w-48 rounded bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-10 w-10 rounded-2xl bg-gray-200" />
            <div className="h-8 w-24 rounded bg-gray-200" />
            <div className="mt-1 h-4 w-20 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function PayoutDetails() {
  const { payoutId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [payout, setPayout] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Modal States ──
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch Payout Details ──
  const fetchPayoutDetails = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const payoutsData = await paymentsService.getPayoutRequests();
      const foundPayout = payoutsData.find(p => p.id === parseInt(payoutId));

      if (!foundPayout) {
        setError("Payout not found");
        setLoading(false);
        return;
      }

      setPayout(foundPayout);

      // Get provider details
      try {
        const bookings = await bookingService.listActiveBookings();
        const providerBookings = bookings.filter(b => b.providerId === foundPayout.provider_id);
        if (providerBookings.length > 0) {
          setProvider({
            name: foundPayout.provider_name || providerBookings[0].provider,
            email: providerBookings[0].providerEmail || "No email",
            phone: providerBookings[0].providerPhone || "No phone",
            category: providerBookings[0].providerCategory || "Service Provider",
            rating: providerBookings[0].providerRating || 0,
            reviews: providerBookings[0].providerReviews || 0,
          });
        } else {
          setProvider({
            name: foundPayout.provider_name || `Provider #${foundPayout.provider_id}`,
            email: "No email",
            phone: "No phone",
            category: "Service Provider",
            rating: 0,
            reviews: 0,
          });
        }
      } catch (err) {
        setProvider({
          name: foundPayout.provider_name || `Provider #${foundPayout.provider_id}`,
          email: "No email",
          phone: "No phone",
          category: "Service Provider",
          rating: 0,
          reviews: 0,
        });
      }

    } catch (err) {
      console.error("Error fetching payout details:", err);
      setError(err.message || "Failed to load payout details");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayoutDetails();
  }, [payoutId]);

  // ── Handle Back ──
  const handleBack = () => {
    navigate("/admin/bookings-payments");
  };

  // ── Handle Approve Payout ──
  const handleApprovePayout = async () => {
    setActionLoading(true);
    try {
      await paymentsService.approvePayout(payout.id);
      setPayout({ ...payout, status: "Approved" });
      setShowApproveModal(false);
      toast.success("Payout approved", "The payout was approved successfully.");
    } catch (err) {
      toast.error("Failed to approve payout", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Hold Payout ──
  const handleHoldPayout = async () => {
    if (!holdReason.trim()) {
      toast.warning("Hold reason required", "Please enter a reason for holding this payout.");
      return;
    }

    setActionLoading(true);
    try {
      await paymentsService.holdPayout(payout.id, holdReason);
      setPayout({ ...payout, status: "Held", admin_note: holdReason });
      setShowHoldModal(false);
      setHoldReason("");
      toast.info("Payout put on hold");
    } catch (err) {
      toast.error("Failed to hold payout", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Reject Payout ──
  const handleRejectPayout = async () => {
    if (!rejectReason.trim()) {
      toast.warning("Rejection reason required", "Please enter a reason for rejecting this payout.");
      return;
    }

    setActionLoading(true);
    try {
      await paymentsService.holdPayout(payout.id, `Rejected: ${rejectReason}`);
      setPayout({ ...payout, status: "Failed", admin_note: `Rejected: ${rejectReason}` });
      setShowRejectModal(false);
      setRejectReason("");
      toast.warning("Payout rejected");
    } catch (err) {
      toast.error("Failed to reject payout", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Complete Payout ──
  const handleCompletePayout = async () => {
    setActionLoading(true);
    try {
      setPayout({ ...payout, status: "Completed" });
      setShowCompleteModal(false);
      toast.success("Payout completed", "The payout was completed successfully.");
    } catch (err) {
      toast.error("Failed to complete payout", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Loading state ──
  if (loading) {
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
            <LoadingSkeleton />
          </main>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
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

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center max-w-2xl mx-auto">
              <div className="rounded-full bg-amber-100 p-4 mx-auto w-fit mb-4">
                <AlertCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Payout</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleBack}
                  className="rounded-xl border border-gray-300 px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => fetchPayoutDetails(true)}
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

  // ── No payout found ──
  if (!payout) {
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

            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center max-w-2xl mx-auto">
              <div className="rounded-full bg-gray-100 p-4 mx-auto w-fit mb-4">
                <DollarSign className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Payout Not Found</h3>
              <p className="text-gray-600 mb-6">The payout you're looking for doesn't exist.</p>
              <button
                onClick={handleBack}
                className="rounded-xl bg-[#056db3] px-6 py-2.5 text-white font-medium hover:bg-[#045a94] transition-colors"
              >
                Back to Bookings
              </button>
            </div>
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
                  Payout Details
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Full information about this payout request
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  Payout #{payout.id}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-sm font-semibold ${
                    payoutStatusStyles[payout.status] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {payout.status || "Unknown"}
                </span>
                <button
                  onClick={() => fetchPayoutDetails(true)}
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
              label="Payout Amount"
              value={payout.formatted_amount || formatCurrency(payout.amount)}
              isLoading={loading}
            />
            <SummaryCard
              icon={Wallet}
              iconBg="bg-[#dcfce7]"
              iconColor="text-[#16a34a]"
              label="Status"
              value={payout.status || "Unknown"}
              isLoading={loading}
            />
            <SummaryCard
              icon={CalendarDays}
              iconBg="bg-[#dfe6ff]"
              iconColor="text-[#056db3]"
              label="Requested Date"
              value={payout.requested_at ? formatDate(payout.requested_at) : "-"}
              isLoading={loading}
            />
            <SummaryCard
              icon={CreditCard}
              iconBg="bg-[#fef3c7]"
              iconColor="text-[#f97316]"
              label="Payment Method"
              value={payout.method || payout.payout_method || "M-Pesa"}
              isLoading={loading}
            />
          </div>

          {/* ── Main Content — Two Columns ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left Column — Payout Information */}
            <div className="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-[#056db3]" />
                <h2 className="text-lg font-bold text-gray-900">
                  Payout Information
                </h2>
              </div>

              <DetailRow label="Payout ID" value={`#${payout.id}`} />
              <DetailRow label="Provider" value={payout.provider_name || `Provider #${payout.provider_id}`} />
              <DetailRow label="Amount" value={payout.formatted_amount || formatCurrency(payout.amount)} />
              <DetailRow label="Payment Method" value={payout.method || payout.payout_method || "M-Pesa"} />
              <DetailRow label="Destination" value={payout.phone || payout.payout_destination || "Not specified"} />
              <DetailRow label="Status" value={payout.status || "Pending"} />
              <DetailRow label="Requested At" value={payout.requested_at ? formatDate(payout.requested_at) : "-"} />
              <DetailRow label="Processed At" value={payout.processed_at ? formatDate(payout.processed_at) : "Not processed yet"} isLast />

              {payout.admin_note && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-medium text-gray-700">Admin Note</p>
                  <p className="mt-1 text-sm text-gray-600">{payout.admin_note}</p>
                </div>
              )}
            </div>

            {/* Right Column — Provider Information */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg font-bold text-gray-900">Provider</h2>
                </div>

                <div className="flex flex-col items-center text-center">
                  <Avatar initials={getInitials(provider?.name || payout.provider_name)} />
                  <p className="mt-3 text-base font-bold text-gray-900">
                    {provider?.name || payout.provider_name || `Provider #${payout.provider_id}`}
                  </p>
                  <p className="text-sm font-medium text-[#056db3]">
                    {provider?.category || "Service Provider"}
                  </p>

                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(provider?.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {provider?.rating || "N/A"}
                    </span>
                    <span className="text-sm text-gray-400">
                      ({provider?.reviews || 0} reviews)
                    </span>
                  </div>

                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    {provider?.email || "No email"}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="h-4 w-4" />
                    {provider?.phone || "No phone"}
                  </div>
                  <button className="mt-4 w-full rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white">
                    View Provider Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Admin Actions ── */}
          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Eye className="h-5 w-5 text-[#056db3]" />
              <h2 className="text-lg font-bold text-gray-900">Admin Actions</h2>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {/* ── Pending Status Actions ── */}
              {payout.status === "Pending" && (
                <>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve Payout
                  </button>
                  <button
                    onClick={() => setShowHoldModal(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
                  >
                    <Flag className="h-4 w-4" />
                    Hold Payout
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Reject Payout
                  </button>
                </>
              )}

              {/* ── Approved Status Actions ── */}
              {payout.status === "Approved" && (
                <>
                  <button
                    onClick={() => setShowCompleteModal(true)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    Complete Payout
                  </button>
                  <span className="text-sm text-blue-600 font-medium py-2.5 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Waiting for completion...
                  </span>
                </>
              )}

              {/* ── Completed Status ── */}
              {payout.status === "Completed" && (
                <span className="text-sm text-green-600 font-medium py-2.5 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  ✅ Payout completed successfully
                </span>
              )}

              {/* ── Held Status ── */}
              {payout.status === "Held" && (
                <span className="text-sm text-gray-600 font-medium py-2.5 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  ⏸️ Payout on hold - Review required
                </span>
              )}

              {/* ── Failed Status ── */}
              {payout.status === "Failed" && (
                <span className="text-sm text-red-600 font-medium py-2.5 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  ❌ Payout rejected/failed
                </span>
              )}

              {/* ── Download Button ── */}
              <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>

            {/* ── Admin Notes ── */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Admin Notes
              </label>
              <textarea
                rows={4}
                placeholder="Add internal notes about this payout..."
                className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
                defaultValue={payout.admin_note || ""}
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

      {/* ── Approve Confirmation Modal ── */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprovePayout}
        title="Approve Payout"
        message={`Are you sure you want to approve this payout of ${payout?.formatted_amount || formatCurrency(payout?.amount)} to ${payout?.provider_name || `Provider #${payout?.provider_id}`}?`}
        confirmText="Approve"
        cancelText="Cancel"
        icon={CheckCircle2}
        iconColor="bg-green-100"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
        isLoading={actionLoading}
      />

      {/* ── Hold Payout Modal ── */}
      <HoldPayoutModal
        isOpen={showHoldModal}
        onClose={() => {
          setShowHoldModal(false);
          setHoldReason("");
        }}
        onConfirm={handleHoldPayout}
        holdReason={holdReason}
        setHoldReason={setHoldReason}
        isLoading={actionLoading}
        payoutAmount={payout?.formatted_amount || formatCurrency(payout?.amount)}
        providerName={payout?.provider_name || `Provider #${payout?.provider_id}`}
      />

      {/* ── Reject Confirmation Modal ── */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Reject Payout</h3>
              <p className="mt-2 text-gray-600">
                Please provide a reason for rejecting this payout of {payout?.formatted_amount || formatCurrency(payout?.amount)} to {payout?.provider_name || `Provider #${payout?.provider_id}`}.
              </p>

              <div className="mt-4 text-left">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Rejection
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejecting this payout..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                  }}
                  disabled={actionLoading}
                  className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectPayout}
                  disabled={actionLoading || !rejectReason.trim()}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Reject Payout"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Complete Confirmation Modal ── */}
      <ConfirmationModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompletePayout}
        title="Complete Payout"
        message={`Are you sure you want to mark this payout as completed? The funds of ${payout?.formatted_amount || formatCurrency(payout?.amount)} will be released to ${payout?.provider_name || `Provider #${payout?.provider_id}`}.`}
        confirmText="Complete"
        cancelText="Cancel"
        icon={Check}
        iconColor="bg-green-100"
        confirmButtonColor="bg-green-600 hover:bg-green-700"
        isLoading={actionLoading}
      />
    </div>
  );
}

export default PayoutDetails;