// src/pages/admin/BookingsAndPayments.jsx - Fully Updated with All Fixes

import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  Search,
  Wallet,
  Loader2,
  AlertCircle,
  Eye,
  BookOpen,
  DollarSign,
  RefreshCw,
  Inbox,
  TrendingUp,
  X,
  Flag,
  AlertTriangle,
} from "lucide-react";

import bookingService from "../../api/bookingService";
import paymentsService from "../../api/paymentsService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusOptions = ["All Status", "Pending", "Accepted", "In Progress", "Completed", "Approved", "Paid", "Rescheduled", "Cancelled"];
const payoutStatusOptions = ["All Status", "Pending", "Approved", "Processing", "Completed", "Failed", "Held"];
const timeOptions = ["All Time", "This Week", "This Month", "This Quarter"];

const bookingStatusStyles = {
  "Pending": "bg-yellow-100 text-yellow-700",
  "Accepted": "bg-blue-100 text-blue-700",
  "InProgress": "bg-amber-100 text-amber-700",
  "Completed": "bg-green-100 text-green-700",
  "Approved": "bg-green-100 text-green-700",
  "Paid": "bg-emerald-100 text-emerald-700",
  "Rescheduled": "bg-purple-100 text-purple-700",
  "Cancelled": "bg-red-100 text-red-700",
  "New Requests": "bg-purple-100 text-purple-700",
  "Rejected": "bg-red-100 text-red-700",
};

const payoutStatusStyles = {
  "Pending": "bg-yellow-100 text-yellow-700",
  "Approved": "bg-blue-100 text-blue-700",
  "Processing": "bg-purple-100 text-purple-700",
  "Completed": "bg-green-100 text-green-700",
  "Failed": "bg-red-100 text-red-700",
  "Held": "bg-gray-100 text-gray-700",
};

function formatDate(date) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
// SKELETON LOADERS
// ─────────────────────────────────────────────

function SkeletonStatCard() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-10 w-10 rounded-2xl bg-gray-200 animate-pulse" />
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-3">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-3 py-3">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </td>
      <td className="px-3 py-3">
        <div className="h-8 w-16 animate-pulse rounded-lg bg-gray-200" />
      </td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-175 table-auto">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <SkeletonTableRow key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkeletonFilters() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
        <div className="flex flex-wrap gap-3 md:ml-auto">
          <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-40 animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-28 animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
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
// REJECT PAYOUT MODAL
// ─────────────────────────────────────────────

function RejectPayoutModal({
  isOpen,
  onClose,
  onConfirm,
  rejectReason,
  setRejectReason,
  isLoading,
  payoutAmount,
  providerName,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Reject Payout</h3>
          <p className="mt-2 text-gray-600">
            Please provide a reason for rejecting this payout of {payoutAmount} to {providerName}.
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
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading || !rejectReason.trim()}
              className="flex-1 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Reject Payout"
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

function StatCard({ icon: Icon, iconBg, label, value, sub, isLoading, isEmpty }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}>
        <Icon className="h-6 w-6" />
      </div>
      {isLoading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-[1.5rem] font-bold leading-none text-gray-900">{value}</p>
      )}
      <p className="mt-2 font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
      {isEmpty && !isLoading && (
        <p className="mt-1 text-xs text-gray-400">No data yet</p>
      )}
    </div>
  );
}

function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  onAction,
  isFiltered = false,
  onClearFilters,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-blue-50 p-6 mb-6">
        <Icon className="h-16 w-16 text-[#056db3]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      {isFiltered && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-[#056db3] hover:underline font-medium"
        >
          Clear filters and try again
        </button>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 rounded-lg bg-[#056db3] px-6 py-3 text-white font-semibold hover:bg-[#045a94] transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function BookingsAndPayments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("All Bookings");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("All Time");

  // ── State ──
  const [bookings, setBookings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCommission: 0,
    pendingPayouts: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // ── Modal States ──
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showHoldModal, setShowHoldModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [holdReason, setHoldReason] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch Data ──
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);

    try {
      // ── Fetch ALL bookings from admin endpoint ──
      let allBookings = [];
      let totalRevenue = 0;
      let totalCommission = 0;

      try {
        const resp = await fetch("/api/bookings/admin/all");
        if (resp.ok) {
          const data = await resp.json();
          allBookings = Array.isArray(data) ? data : [];
          
          // Calculate revenue and commission from ALL bookings
          allBookings.forEach((b) => {
            const status = b.status || "";
            const completedStatuses = ["Completed", "COMPLETED", "Paid", "PAID", "Approved", "APPROVED", "completed", "paid", "approved"];
            
            if (completedStatuses.includes(status)) {
              let amount = b.amount || b.amountRaw || 0;
              if (typeof amount === "string" && amount.includes("KES")) {
                amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
              }
              totalRevenue += Number(amount);
              totalCommission += Number(amount) * 0.1;
            }
          });
        } else {
          // Fallback: use bookingService
          const bookingsData = await bookingService.listActiveBookings();
          allBookings = bookingsData || [];
          
          allBookings.forEach((b) => {
            const status = b.status || "";
            const completedStatuses = ["Completed", "COMPLETED", "Paid", "PAID", "Approved", "APPROVED", "completed", "paid", "approved"];
            
            if (completedStatuses.includes(status)) {
              let amount = b.amountRaw || b.amount || 0;
              if (typeof amount === "string" && amount.includes("KES")) {
                amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
              }
              totalRevenue += Number(amount);
              totalCommission += Number(amount) * 0.1;
            }
          });
        }
      } catch (bookingErr) {
        console.warn("Bookings endpoint not available:", bookingErr);
        // Try fallback
        try {
          const bookingsData = await bookingService.listActiveBookings();
          allBookings = bookingsData || [];
          
          allBookings.forEach((b) => {
            const status = b.status || "";
            const completedStatuses = ["Completed", "COMPLETED", "Paid", "PAID", "Approved", "APPROVED", "completed", "paid", "approved"];
            
            if (completedStatuses.includes(status)) {
              let amount = b.amountRaw || b.amount || 0;
              if (typeof amount === "string" && amount.includes("KES")) {
                amount = parseFloat(amount.replace(/[^0-9.]/g, "")) || 0;
              }
              totalRevenue += Number(amount);
              totalCommission += Number(amount) * 0.1;
            }
          });
        } catch (e2) {
          allBookings = [];
        }
      }

      // ── Fetch payouts ──
      let payoutsData = [];
      let pendingPayoutsTotal = 0;
      try {
        const response = await fetch("/api/payouts/admin/all");
        if (response.ok) {
          const data = await response.json();
          payoutsData = Array.isArray(data) ? data : [];
          
          // Calculate pending payouts
          payoutsData.forEach((p) => {
            if (p.status === "pending" || p.status === "Pending" || p.status === "PENDING") {
              pendingPayoutsTotal += Number(p.amount) || 0;
            }
          });
        } else {
          // Fallback to paymentsService
          const statsData = await paymentsService.getAdminStats();
          pendingPayoutsTotal = statsData.total_pending_amount || 0;
          
          const payouts = await paymentsService.getPayoutRequests();
          payoutsData = payouts || [];
        }
      } catch (payoutErr) {
        console.warn("Payouts endpoint not available:", payoutErr);
        try {
          const statsData = await paymentsService.getAdminStats();
          pendingPayoutsTotal = statsData.total_pending_amount || 0;
        } catch (e2) {
          pendingPayoutsTotal = 0;
        }
      }

      // ── Transform bookings ──
      const formattedBookings = (allBookings || []).map((b) => {
        const status = b.status || "Pending";
        const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        return {
          id: b.id,
          client: b.client_full_name || b.client || b.clientName || `Client #${b.client_id}`,
          provider: b.provider_full_name || b.providerName || b.worker || `Provider #${b.service_provider_id}`,
          service: b.service_name || b.service || "Service Not Specified",
          date: b.scheduled_date || b.date || null,
          amount: b.amount || b.amountRaw || 0,
          commission: (b.amount || b.amountRaw || 0) * 0.1,
          status: statusDisplay,
          providerId: b.service_provider_id || b.serviceProviderId,
          clientId: b.client_id || b.clientId,
          bookingDate: b.created_at || b.createdAt,
          description: b.description || b.details || "",
          location: b.location || "",
          scheduledDate: b.scheduled_date || b.date,
          lastUpdated: b.updated_at || b.updatedAt,
          clientEmail: b.client_email || "",
          clientPhone: b.client_phone || "",
          providerEmail: b.provider_email || "",
          providerPhone: b.provider_phone || "",
          providerCategory: b.provider_category || "",
          providerRating: b.provider_rating || 0,
          providerReviews: b.provider_reviews || 0,
          providerPayout: (b.amount || b.amountRaw || 0) * 0.9,
          mpesaRef: b.mpesa_reference || "",
          initials: getInitials(b.provider_full_name || b.providerName || b.worker),
          clientInitials: getInitials(b.client_full_name || b.client || b.clientName),
        };
      });

      // ── Transform payouts ──
      const formattedPayouts = (payoutsData || []).map((p) => {
        const status = p.status || "Pending";
        const statusDisplay = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
        
        return {
          id: p.id,
          provider_id: p.provider_id,
          provider: p.provider_name || `Provider #${p.provider_id}`,
          amount: p.amount || 0,
          jobsCompleted: p.jobs_completed || p.jobsCount || 0,
          requestDate: p.requested_at || p.created_at || p.requestDate,
          status: statusDisplay,
          providerId: p.provider_id,
          phone: p.phone || p.payout_destination,
          method: p.payout_method || "mpesa",
          admin_note: p.admin_note,
          processed_at: p.processed_at,
          formatted_amount: p.formatted_amount || formatCurrency(p.amount),
        };
      });

      setBookings(formattedBookings);
      setPayouts(formattedPayouts);
      setStats({
        totalRevenue: Math.round(totalRevenue),
        totalCommission: Math.round(totalCommission),
        pendingPayouts: Math.round(pendingPayoutsTotal),
      });

    } catch (err) {
      console.error("Error fetching data:", err);
      if (err.response && err.response.status !== 404) {
        setError(err.message || "Failed to load data");
      } else {
        setBookings([]);
        setPayouts([]);
        setStats({
          totalRevenue: 0,
          totalCommission: 0,
          pendingPayouts: 0,
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filter Bookings ──
  const filteredBookings = useMemo(() => {
    return bookings.filter((row) => {
      const matchesSearch =
        (row.client || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.provider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (row.service || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

      let matchesTime = true;
      if (timeFilter !== "All Time" && row.date) {
        const bookingDate = new Date(row.date);
        const now = new Date();
        if (timeFilter === "This Week") {
          const weekAgo = new Date(now);
          weekAgo.setDate(now.getDate() - 7);
          matchesTime = bookingDate >= weekAgo;
        } else if (timeFilter === "This Month") {
          matchesTime = bookingDate.getMonth() === now.getMonth() &&
                        bookingDate.getFullYear() === now.getFullYear();
        } else if (timeFilter === "This Quarter") {
          const currentQuarter = Math.floor(now.getMonth() / 3);
          const bookingQuarter = Math.floor(bookingDate.getMonth() / 3);
          matchesTime = bookingQuarter === currentQuarter &&
                        bookingDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesTime;
    });
  }, [bookings, searchTerm, statusFilter, timeFilter]);

  // ── Filter Payouts ──
  const filteredPayouts = useMemo(() => {
    return payouts.filter((row) => {
      const matchesSearch =
        (row.provider || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatCurrency(row.amount).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "All Status" || row.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchTerm, statusFilter]);

  // ── Clear Filters ──
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setTimeFilter("All Time");
  };

  // ── Navigate to Booking Details ──
  const viewBookingDetails = (booking) => {
    navigate(`/admin/bookings-payments/${booking.id}`);
  };

  // ── Navigate to Payout Details ──
  const viewPayoutDetails = (payout) => {
    navigate(`/admin/payouts/${payout.id}`);
  };

  // ── Handle Approve Payout ──
  const handleApprovePayout = async () => {
    setActionLoading(true);
    try {
      await paymentsService.approvePayout(selectedPayout.id);
      
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: "Approved" } : p
        )
      );
      
      // Refresh stats
      const statsData = await paymentsService.getAdminStats();
      setStats((prev) => ({
        ...prev,
        pendingPayouts: statsData.total_pending_amount || 0,
      }));

      setShowApproveModal(false);
      setSelectedPayout(null);
      alert("✅ Payout approved successfully!");
    } catch (err) {
      alert("Failed to approve payout: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Hold Payout ──
  const handleHoldPayout = async () => {
    if (!holdReason.trim()) {
      alert("Please enter a reason for holding this payout");
      return;
    }

    setActionLoading(true);
    try {
      await paymentsService.holdPayout(selectedPayout.id, holdReason);
      
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: "Held", admin_note: holdReason } : p
        )
      );

      setShowHoldModal(false);
      setSelectedPayout(null);
      setHoldReason("");
      alert("⏸️ Payout put on hold");
    } catch (err) {
      alert("Failed to hold payout: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Handle Reject Payout ──
  const handleRejectPayout = async () => {
    if (!rejectReason.trim()) {
      alert("Please enter a reason for rejecting this payout");
      return;
    }

    setActionLoading(true);
    try {
      await paymentsService.holdPayout(selectedPayout.id, `Rejected: ${rejectReason}`);
      
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id ? { ...p, status: "Failed", admin_note: `Rejected: ${rejectReason}` } : p
        )
      );

      setShowRejectModal(false);
      setSelectedPayout(null);
      setRejectReason("");
      alert("❌ Payout rejected");
    } catch (err) {
      alert("Failed to reject payout: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Check if data exists ──
  const hasBookings = bookings.length > 0;
  const hasPayouts = payouts.length > 0;
  const hasFilteredBookings = filteredBookings.length > 0;
  const hasFilteredPayouts = filteredPayouts.length > 0;
  const isFiltering = searchTerm !== "" || statusFilter !== "All Status" || timeFilter !== "All Time";

  // ── Count pending payouts for badge ──
  const pendingPayoutsCount = payouts.filter(p => 
    p.status === "Pending" || p.status === "pending"
  ).length;

  // ── Loading state with skeletons ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72 min-w-0">
          <Navbar />
          <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full overflow-x-hidden">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="h-9 w-64 animate-pulse rounded bg-gray-200" />
                <div className="mt-1 h-5 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <div className="mb-6 border-b border-gray-200">
              <div className="flex gap-6 md:gap-8">
                <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
                <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
            <SkeletonFilters />
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <SkeletonTable />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-8 text-center max-w-2xl mx-auto">
              <AlertCircle className="mx-auto h-16 w-16 text-amber-500" />
              <h3 className="mt-4 text-xl font-semibold text-amber-700">Unable to Load Data</h3>
              <p className="mt-2 text-amber-600">{error}</p>
              <button
                onClick={() => fetchData()}
                className="mt-6 rounded-lg bg-[#056db3] px-6 py-2.5 text-white hover:bg-[#045a94] transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main List View ──
  return (
    <div className="flex min-h-screen bg-[#f8fafc] overflow-hidden">
      <Sidebar role="admin" />
      <div className="flex-1 ml-72 min-w-0">
        <Navbar />
        <main className="pt-24 px-6 pb-6 max-w-7xl mx-auto w-full overflow-x-hidden">
          {/* ── Page Header ── */}
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
                Bookings &amp; Payments
              </h1>
              <p className="mt-1 text-sm md:text-base text-gray-600">
                Manage bookings and process provider payouts
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* ── Stats Cards ── */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={TrendingUp}
              iconBg="bg-[#dfe6ff] text-[#5b38f2]"
              label="Total Revenue"
              value={formatCurrency(stats.totalRevenue)}
              isLoading={loading}
              isEmpty={stats.totalRevenue === 0}
            />
            <StatCard
              icon={Wallet}
              iconBg="bg-[#dcfce7] text-[#16a34a]"
              label="Commission This Month"
              value={formatCurrency(stats.totalCommission)}
              isLoading={loading}
              sub="Platform earnings (10%)"
              isEmpty={stats.totalCommission === 0}
            />
            <StatCard
              icon={Clock3}
              iconBg="bg-[#fef3c7] text-[#f97316]"
              label="Pending Payouts"
              value={formatCurrency(stats.pendingPayouts)}
              isLoading={loading}
              sub="Awaiting approval"
              isEmpty={stats.pendingPayouts === 0}
            />
          </div>

          {/* ── Tabs ── */}
          <div className="mb-6 border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-6 md:gap-8 min-w-max">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("All Bookings");
                  setStatusFilter("All Status");
                }}
                className={`border-b-2 pb-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === "All Bookings"
                    ? "border-[#056db3] text-[#056db3]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                All Bookings
                <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {bookings.length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("Payout Requests");
                  setStatusFilter("All Status");
                }}
                className={`flex items-center gap-2 border-b-2 pb-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === "Payout Requests"
                    ? "border-[#056db3] text-[#056db3]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>Payout Requests</span>
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#fde7b2] px-2 text-xs font-semibold text-[#d97706]">
                  {pendingPayoutsCount}
                </span>
              </button>
            </div>
          </div>

          {/* ── Filters ── */}
          <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1 min-w-0">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={
                    activeTab === "All Bookings"
                      ? "Search bookings by client, provider, or service..."
                      : "Search providers by name or amount..."
                  }
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#056db3] focus:border-2"
                />
              </div>

              <div className="flex flex-wrap gap-3 md:ml-auto">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-12 min-w-35 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
                  >
                    {(activeTab === "All Bookings" ? statusOptions : payoutStatusOptions).map(
                      (option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {activeTab === "All Bookings" && (
                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                    <select
                      value={timeFilter}
                      onChange={(event) => setTimeFilter(event.target.value)}
                      className="h-12 min-w-35 appearance-none rounded-xl border border-gray-200 bg-white pl-9 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2"
                    >
                      {timeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(searchTerm || statusFilter !== "All Status" || timeFilter !== "All Time") && (
                  <button
                    onClick={clearFilters}
                    className="h-12 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              {activeTab === "All Bookings" ? (
                // ── BOOKINGS TABLE ──
                !hasBookings ? (
                  <EmptyState
                    icon={BookOpen}
                    title="No Bookings Yet"
                    description="There are no bookings in the system yet. Once clients start booking services, they will appear here."
                    actionText="Refresh"
                    onAction={() => fetchData(true)}
                  />
                ) : !hasFilteredBookings && isFiltering ? (
                  <EmptyState
                    icon={Search}
                    title="No Matching Bookings"
                    description="We couldn't find any bookings matching your filters. Try adjusting your search terms."
                    isFiltered={true}
                    onClearFilters={clearFilters}
                  />
                ) : (
                  <table className="w-full min-w-200 table-auto">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Client
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Provider
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Service
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Commission
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-800 truncate max-w-30">
                            {row.client}
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-800 truncate max-w-30">
                            {row.provider}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-800 truncate max-w-30">
                            {row.service}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(row.date)}
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                            {formatCurrency(row.amount)}
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-[#16a34a] whitespace-nowrap">
                            {formatCurrency(row.commission)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                bookingStatusStyles[row.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => viewBookingDetails(row)}
                              className="inline-flex items-center gap-1 text-sm text-[#056db3] hover:underline"
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                // ── PAYOUTS TABLE ──
                !hasPayouts ? (
                  <EmptyState
                    icon={DollarSign}
                    title="No Payout Requests"
                    description="Providers haven't requested any payouts yet. Payout requests will appear here once providers submit them."
                    actionText="Refresh"
                    onAction={() => fetchData(true)}
                  />
                ) : !hasFilteredPayouts && isFiltering ? (
                  <EmptyState
                    icon={Search}
                    title="No Matching Payouts"
                    description="We couldn't find any payouts matching your filters. Try adjusting your search terms."
                    isFiltered={true}
                    onClearFilters={clearFilters}
                  />
                ) : (
                  <table className="w-full min-w-175 table-auto">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Provider
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Jobs
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Request Date
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayouts.map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-b from-[#b517ff] to-[#6f10f4] text-sm font-bold text-white shrink-0">
                                {getInitials(row.provider)}
                              </div>
                              <span className="text-sm font-medium text-gray-800 truncate max-w-37.5">
                                {row.provider}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {row.formatted_amount || formatCurrency(row.amount)}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {row.jobsCompleted || 0}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(row.requestDate)}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                payoutStatusStyles[row.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                onClick={() => viewPayoutDetails(row)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[#056db3] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#045a94]"
                              >
                                <Eye className="h-3 w-3" />
                                View
                              </button>
                              {row.status === "Pending" && (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedPayout(row);
                                      setShowApproveModal(true);
                                    }}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPayout(row);
                                      setShowHoldModal(true);
                                      setHoldReason("");
                                    }}
                                    disabled={actionLoading}
                                    className="rounded-lg bg-yellow-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-yellow-600 disabled:opacity-50"
                                  >
                                    <Flag className="h-3 w-3" />
                                    Hold
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedPayout(row);
                                      setShowRejectModal(true);
                                      setRejectReason("");
                                    }}
                                    disabled={actionLoading}
                                    className="rounded-lg bg-red-500 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-red-600 disabled:opacity-50"
                                  >
                                    <X className="h-3 w-3" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {row.status === "Approved" && (
                                <span className="text-xs text-blue-600 font-medium">Processing</span>
                              )}
                              {row.status === "Completed" && (
                                <span className="text-xs text-green-600 font-medium">✓ Paid</span>
                              )}
                              {row.status === "Failed" && (
                                <span className="text-xs text-red-600 font-medium">Failed</span>
                              )}
                              {row.status === "Held" && (
                                <span className="text-xs text-gray-600 font-medium">On Hold</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Approve Confirmation Modal ── */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedPayout(null);
        }}
        onConfirm={handleApprovePayout}
        title="Approve Payout"
        message={`Are you sure you want to approve this payout of ${selectedPayout?.formatted_amount || formatCurrency(selectedPayout?.amount)} to ${selectedPayout?.provider}?`}
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
          setSelectedPayout(null);
          setHoldReason("");
        }}
        onConfirm={handleHoldPayout}
        holdReason={holdReason}
        setHoldReason={setHoldReason}
        isLoading={actionLoading}
        payoutAmount={selectedPayout?.formatted_amount || formatCurrency(selectedPayout?.amount)}
        providerName={selectedPayout?.provider}
      />

      {/* ── Reject Payout Modal ── */}
      <RejectPayoutModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedPayout(null);
          setRejectReason("");
        }}
        onConfirm={handleRejectPayout}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        isLoading={actionLoading}
        payoutAmount={selectedPayout?.formatted_amount || formatCurrency(selectedPayout?.amount)}
        providerName={selectedPayout?.provider}
      />
    </div>
  );
}

export default BookingsAndPayments;