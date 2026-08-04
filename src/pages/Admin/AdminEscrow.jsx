// src/pages/Admin/AdminEscrow.jsx - Admin Escrow Management Page

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock3,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import paymentsService from "../../api/paymentsService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusOptions = ["All Status", "PENDING", "COMPLETED", "RELEASED", "FAILED"];

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
  RELEASED: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const statusIcons = {
  PENDING: Clock3,
  COMPLETED: CheckCircle2,
  RELEASED: CheckCircle2,
  FAILED: XCircle,
};

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "KES 0";
  return `KES ${Number(amount).toLocaleString()}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-KE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
      <div className="mb-4 h-11 w-11 rounded-xl bg-gray-200 animate-pulse" />
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

function SkeletonTableRow() {
  return (
    <tr className="border-b border-gray-100">
      <td className="px-4 py-3.5">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      </td>
      <td className="px-4 py-3.5">
        <div className="h-8 w-20 animate-pulse rounded-lg bg-gray-200" />
      </td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {[...Array(8)].map((_, i) => (
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

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StatCard({ icon: Icon, iconBg, accent, label, value, sub, isLoading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      {isLoading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="font-mono text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-blue-50 p-6 mb-6">
        <Icon className="h-14 w-14 text-[#056db3]" />
      </div>
      <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md">{description}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
// RELEASE MODAL
// ─────────────────────────────────────────────

function ReleaseModal({ isOpen, onClose, onConfirm, transaction, isLoading }) {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <Wallet className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800">Release Funds</h3>
          <p className="mt-2 text-gray-600">
            Are you sure you want to release <strong>{formatCurrency(transaction.net_amount)}</strong> to <strong>{transaction.provider_name}</strong>?
          </p>
          <div className="mt-4 rounded-xl bg-gray-50 border border-gray-100 p-4 text-left">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Booking</span>
              <span className="font-mono font-medium text-gray-800">#{transaction.booking_id}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Gross amount</span>
              <span className="font-mono font-medium text-gray-800">{formatCurrency(transaction.gross_amount)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Commission (10%)</span>
              <span className="font-mono font-medium text-gray-800">{formatCurrency(transaction.gross_amount - transaction.net_amount)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 mt-1 pt-2 text-sm">
              <span className="font-medium text-gray-700">Provider receives</span>
              <span className="font-mono font-bold text-green-600">{formatCurrency(transaction.net_amount)}</span>
            </div>
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
              disabled={isLoading}
              className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Release Funds"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function AdminEscrow() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total_in_escrow: 0,
    total_released: 0,
    pending_count: 0,
    completed_count: 0,
    released_count: 0,
  });

  // Modal states
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ── Fetch Escrow Data ──
  const fetchEscrowData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [transactionsData, summaryData] = await Promise.all([
        paymentsService.getEscrowTransactions(),
        paymentsService.getEscrowSummary(),
      ]);

      setTransactions(transactionsData || []);
      setStats({
        total_in_escrow: summaryData.total_in_escrow || 0,
        total_released: summaryData.total_released || 0,
        pending_count: summaryData.pending_count || 0,
        completed_count: summaryData.completed_count || 0,
        released_count: summaryData.released_count || 0,
      });
    } catch (err) {
      console.error("Error fetching escrow data:", err);
      setError(err.message || "Failed to load escrow data");
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEscrowData();
  }, []);

  // ── Handle Release ──
  const handleRelease = async () => {
    if (!selectedTransaction) return;

    setActionLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const adminId = storedUser.id || 9;

      await paymentsService.releaseEscrowFunds(selectedTransaction.id, adminId);
      alert("✅ Funds released successfully!");

      setShowReleaseModal(false);
      setSelectedTransaction(null);
      await fetchEscrowData(true);
    } catch (err) {
      alert("Failed to release funds: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Filter Transactions ──
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.provider_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.booking_id?.toString().includes(searchTerm) ||
      t.id?.toString().includes(searchTerm);

    const matchesStatus = statusFilter === "All Status" || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "All Status";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
  };

  // ── Get Status Badge ──
  const getStatusBadge = (status) => {
    const styles = statusStyles[status] || "bg-gray-100 text-gray-700";
    const Icon = statusIcons[status] || Clock3;
    return (
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
        <Icon className="h-3 w-3" />
        {status || "UNKNOWN"}
      </span>
    );
  };

  const statCards = [
    {
      label: "Total in escrow",
      value: formatCurrency(stats.total_in_escrow),
      icon: Wallet,
      iconBg: "bg-blue-50 text-[#056db3]",
      accent: "bg-[#056db3]",
      sub: `${stats.completed_count} completed, ${stats.pending_count} pending`,
    },
    {
      label: "Total released",
      value: formatCurrency(stats.total_released),
      icon: TrendingUp,
      iconBg: "bg-green-50 text-green-600",
      accent: "bg-green-500",
      sub: `${stats.released_count} releases`,
    },
    {
      label: "Pending release",
      value: stats.completed_count,
      icon: Clock3,
      iconBg: "bg-amber-50 text-amber-600",
      accent: "bg-amber-500",
      sub: "Awaiting admin action",
    },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-8">
                <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonStatCard key={i} />
                ))}
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <SkeletonTable />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* ── Page Header ── */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">Escrow Management</h1>
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#056db3]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </span>
                </div>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  Manage funds held in escrow and release payments to providers
                </p>
              </div>
              <button
                onClick={() => fetchEscrowData(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-[#056db3] hover:text-[#056db3] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {statCards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  iconBg={card.iconBg}
                  accent={card.accent}
                  sub={card.sub}
                  isLoading={loading}
                />
              ))}
            </div>

            {/* ── Filters ── */}
            <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by booking ID, provider, or transaction ID..."
                    className="h-12 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pl-11 pr-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-[#056db3] focus:border-2 focus:bg-white"
                  />
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-700" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-12 min-w-40 appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-9 pr-9 text-sm text-gray-700 outline-none transition-colors focus:border-[#056db3] focus:border-2 focus:bg-white"
                  >
                    {statusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#056db3] hover:bg-blue-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>

            {/* ── Results summary ── */}
            <p className="mb-4 px-1 text-sm text-gray-500">
              Showing <span className="font-mono font-semibold text-gray-700">{filteredTransactions.length}</span> of{" "}
              <span className="font-mono font-semibold text-gray-700">{transactions.length}</span> transactions
            </p>

            {/* ── Transactions Table ── */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {error ? (
                <div className="p-10 text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-2 text-red-600">{error}</p>
                  <button
                    onClick={() => fetchEscrowData()}
                    className="mt-4 rounded-xl bg-[#056db3] px-4 py-2 text-white hover:bg-[#045a94]"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No Escrow Transactions"
                  description={searchTerm || statusFilter !== "All Status"
                    ? "No transactions match your filters. Try adjusting your search."
                    : "There are no escrow transactions yet. Payments will appear here once clients pay for bookings."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          ID
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Booking
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Provider
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Amount
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Net (provider)
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Created
                        </th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.map((t) => (
                        <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 text-sm font-mono text-gray-500">
                            #{t.id}
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-sm font-mono font-medium text-[#056db3]">
                              #{t.booking_id}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-xs font-bold text-white">
                                {getInitials(t.provider_name)}
                              </div>
                              <span className="text-sm font-medium text-gray-800">
                                {t.provider_name || `Provider #${t.provider_id}`}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-800">
                            {formatCurrency(t.gross_amount)}
                          </td>
                          <td className="px-4 py-4 text-sm font-mono font-semibold text-green-600">
                            {formatCurrency(t.net_amount)}
                          </td>
                          <td className="px-4 py-4">
                            {getStatusBadge(t.status)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-500">
                            {formatDate(t.created_at)}
                          </td>
                          <td className="px-4 py-4">
                            {t.status === "COMPLETED" && (
                              <button
                                onClick={() => {
                                  setSelectedTransaction(t);
                                  setShowReleaseModal(true);
                                }}
                                className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                              >
                                <Wallet className="h-3.5 w-3.5" />
                                Release
                              </button>
                            )}
                            {t.status === "RELEASED" && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-green-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Released
                              </span>
                            )}
                            {t.status === "PENDING" && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-yellow-600">
                                <Clock3 className="h-3.5 w-3.5" />
                                Pending
                              </span>
                            )}
                            {t.status === "FAILED" && (
                              <span className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-red-600">
                                <XCircle className="h-3.5 w-3.5" />
                                Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Release Modal ── */}
      <ReleaseModal
        isOpen={showReleaseModal}
        onClose={() => {
          setShowReleaseModal(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleRelease}
        transaction={selectedTransaction}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default AdminEscrow;