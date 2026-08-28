// src/pages/Admin/AdminTransactions.jsx - Admin Transaction Monitoring

import { useState, useEffect } from "react";
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
  DollarSign,
  Users,
  Receipt,
  Eye,
  RotateCcw,
  Download,
  X,
  FileText,
} from "lucide-react";
import transactionService from "../../api/transactionService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const statusOptions = ["All Status", "PENDING", "COMPLETED", "FAILED"];

const statusStyles = {
  PENDING: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-green-100 text-green-700",
  SUCCESS: "bg-green-100 text-green-700",
  PAID: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

const statusIcons = {
  PENDING: Clock3,
  COMPLETED: CheckCircle2,
  SUCCESS: CheckCircle2,
  PAID: CheckCircle2,
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

function downloadCSV(transactions) {
  if (transactions.length === 0) return;

  const headers = ["ID", "Booking", "Client", "Provider", "Gross", "Commission", "Net", "Status", "M-Pesa Ref", "Created"];
  const rows = transactions.map((t) => [
    t.id,
    t.bookingId,
    t.clientName || `Client #${t.clientId}`,
    t.providerName || `Provider #${t.providerId}`,
    t.grossAmount,
    t.commissionAmount,
    t.netAmount,
    t.status,
    t.mpesaReference || "",
    t.createdAt || "",
  ]);

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell ?? ""}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
      <td className="px-4 py-3.5"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
        </div>
      </td>
      <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" /></td>
      <td className="px-4 py-3.5"><div className="h-4 w-24 animate-pulse rounded bg-gray-200" /></td>
    </tr>
  );
}

function SkeletonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {[...Array(9)].map((_, i) => (
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

// ── Transaction Detail Modal ──
function DetailModal({ transaction, onClose }) {
  if (!transaction) return null;
  const t = transaction;

  const rows = [
    ["Transaction ID", `#${t.id}`],
    ["Booking ID", `#${t.bookingId}`],
    ["Client", t.clientName || `Client #${t.clientId}`],
    ["Provider", t.providerName || `Provider #${t.providerId}`],
    ["Type", t.type],
    ["Status", t.status],
    ["Gross amount", formatCurrency(t.grossAmount)],
    ["Commission rate", t.commissionRate ? `${t.commissionRate}%` : "—"],
    ["Commission amount", formatCurrency(t.commissionAmount)],
    ["Net amount (provider)", formatCurrency(t.netAmount)],
    ["Payer phone", t.payerPhone || "—"],
    ["M-Pesa reference", t.mpesaReference || "—"],
    ["Checkout request ID", t.checkoutRequestId || "—"],
    ["Merchant request ID", t.merchantRequestId || "—"],
    ["Paid at", formatDate(t.paidAt)],
    ["Created at", formatDate(t.createdAt)],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#056db3]" />
            <h3 className="text-lg font-bold text-gray-800">Transaction details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 pr-4 text-gray-500">{label}</td>
                  <td className="py-2.5 font-mono font-medium text-gray-800 text-right">{value}</td>
                </tr>
              ))}
              {t.resolutionNote && (
                <tr>
                  <td className="py-2.5 pr-4 text-gray-500 align-top">Resolution note</td>
                  <td className="py-2.5 font-medium text-gray-800 text-right">{t.resolutionNote}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Retry Confirm Modal ──
function RetryModal({ transaction, onClose, onConfirm, isLoading }) {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 mb-4">
          <RotateCcw className="h-7 w-7 text-[#056db3]" />
        </div>
        <h3 className="text-center text-xl font-bold text-gray-800">Retry payout?</h3>
        <p className="mt-2 text-center text-gray-600">
          This will re-attempt the B2C payout of <strong>{formatCurrency(transaction.netAmount)}</strong> to{" "}
          <strong>{transaction.providerName || `Provider #${transaction.providerId}`}</strong> for booking #{transaction.bookingId}.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex flex-1 items-center justify-center rounded-xl bg-[#056db3] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#045a94] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Retry payout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Resolve Modal ──
function ResolveModal({ transaction, note, onNoteChange, onClose, onConfirm, isLoading }) {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-gray-800">Mark as resolved</h3>
        <p className="mt-2 text-sm text-gray-600">
          Record how this failed payout for booking #{transaction.bookingId} was resolved outside the system (e.g. corrected the provider's number, sent manually).
        </p>
        <textarea
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          rows={4}
          placeholder="What did you do to resolve this?"
          className="mt-4 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
        />
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading || !note.trim()}
            className="flex flex-1 items-center justify-center rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Mark resolved"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [summary, setSummary] = useState({
    counts: { pending: 0, completed: 0, failed: 0, total: 0 },
    totals: { total_gross: 0, total_commission: 0, total_net: 0 },
  });

  // ── Action state ──
  const [detailTransaction, setDetailTransaction] = useState(null);
  const [retryTransaction, setRetryTransaction] = useState(null);
  const [resolveTransactionTarget, setResolveTransactionTarget] = useState(null);
  const [resolveNote, setResolveNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ── Fetch Transactions ──
  const fetchTransactions = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [transactionsData, summaryData] = await Promise.all([
        transactionService.getAllTransactions(),
        transactionService.getTransactionSummary(),
      ]);

      setTransactions(transactionsData.transactions || []);
      setSummary(summaryData || {
        counts: { pending: 0, completed: 0, failed: 0, total: 0 },
        totals: { total_gross: 0, total_commission: 0, total_net: 0 },
      });
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transaction data");
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // ── Filter Transactions ──
  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.bookingId?.toString().includes(searchTerm) ||
      t.id?.toString().includes(searchTerm) ||
      t.mpesaReference?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || (t.status || "").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter !== "All Status";

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
  };

  const getStatusBadge = (status) => {
    const key = (status || "").toUpperCase();
    const styles = statusStyles[key] || "bg-gray-100 text-gray-700";
    const Icon = statusIcons[key] || Clock3;
    return (
      <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
        <Icon className="h-3 w-3" />
        {key || "UNKNOWN"}
      </span>
    );
  };

  // ── Retry handler ──
  const handleRetryConfirm = async () => {
    if (!retryTransaction) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await transactionService.retryPayout(retryTransaction.id);
      setRetryTransaction(null);
      await fetchTransactions(true);
    } catch (err) {
      setActionError(err.message || "Failed to retry payout");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Resolve handler ──
  const handleResolveConfirm = async () => {
    if (!resolveTransactionTarget || !resolveNote.trim()) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await transactionService.resolveTransaction(resolveTransactionTarget.id, resolveNote.trim());
      setResolveTransactionTarget(null);
      setResolveNote("");
      await fetchTransactions(true);
    } catch (err) {
      setActionError(err.message || "Failed to mark as resolved");
    } finally {
      setActionLoading(false);
    }
  };

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(summary.totals?.total_gross || 0),
      icon: DollarSign,
      iconBg: "bg-green-50 text-green-600",
      accent: "bg-green-500",
      sub: `${summary.counts?.completed || 0} completed transactions`,
    },
    {
      label: "Total Commission",
      value: formatCurrency(summary.totals?.total_commission || 0),
      icon: TrendingUp,
      iconBg: "bg-blue-50 text-[#056db3]",
      accent: "bg-[#056db3]",
      sub: `${summary.counts?.pending || 0} pending`,
    },
    {
      label: "Total Paid to Providers",
      value: formatCurrency(summary.totals?.total_net || 0),
      icon: Users,
      iconBg: "bg-purple-50 text-purple-600",
      accent: "bg-purple-500",
      sub: `${summary.counts?.failed || 0} failed`,
    },
  ];

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-0 lg:ml-72">
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
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="max-w-7xl mx-auto">
            {/* ── Page Header ── */}
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-900">Transaction Monitor</h1>
                  <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#056db3]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Admin
                  </span>
                </div>
                <p className="mt-2 text-gray-600 max-w-2xl">
                  Monitor all platform transactions, payments, and payouts.
                </p>
              </div>
              <button
                onClick={() => fetchTransactions(true)}
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
                    placeholder="Search by booking ID, provider, client, or M-Pesa reference..."
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
                <button
                  onClick={() => downloadCSV(filteredTransactions)}
                  disabled={filteredTransactions.length === 0}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-[#056db3] hover:text-[#056db3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
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
                    onClick={() => fetchTransactions()}
                    className="mt-4 rounded-xl bg-[#056db3] px-4 py-2 text-white hover:bg-[#045a94]"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Transactions"
                  description={searchTerm || statusFilter !== "All Status"
                    ? "No transactions match your filters. Try adjusting your search."
                    : "There are no transactions yet. Payments will appear here once clients pay for bookings."}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">ID</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Booking</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Client</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Provider</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Gross</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Commission</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Net</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredTransactions.map((t) => {
                        const isFailed = (t.status || "").toUpperCase() === "FAILED";
                        return (
                          <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-mono text-gray-500">#{t.id}</td>
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono font-medium text-[#056db3]">#{t.bookingId}</span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#056db3]">
                                  {getInitials(t.clientName)}
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  {t.clientName || `Client #${t.clientId}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                                  {getInitials(t.providerName)}
                                </div>
                                <span className="text-sm font-medium text-gray-800">
                                  {t.providerName || `Provider #${t.providerId}`}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm font-mono font-semibold text-gray-800">
                              {formatCurrency(t.grossAmount)}
                            </td>
                            <td className="px-4 py-4 text-sm font-mono font-semibold text-[#056db3]">
                              {formatCurrency(t.commissionAmount)}
                            </td>
                            <td className="px-4 py-4 text-sm font-mono font-semibold text-green-600">
                              {formatCurrency(t.netAmount)}
                            </td>
                            <td className="px-4 py-4">{getStatusBadge(t.status)}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-1 whitespace-nowrap">
                                <button
                                  onClick={() => setDetailTransaction(t)}
                                  className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#056db3] transition-colors"
                                  title="View details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {isFailed && (
                                  <>
                                    <button
                                      onClick={() => setRetryTransaction(t)}
                                      className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#056db3] transition-colors"
                                      title="Retry payout"
                                    >
                                      <RotateCcw className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setResolveTransactionTarget(t);
                                        setResolveNote("");
                                      }}
                                      className="rounded-lg p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                                      title="Mark resolved"
                                    >
                                      <CheckCircle2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <DetailModal transaction={detailTransaction} onClose={() => setDetailTransaction(null)} />

      <RetryModal
        transaction={retryTransaction}
        onClose={() => { setRetryTransaction(null); setActionError(null); }}
        onConfirm={handleRetryConfirm}
        isLoading={actionLoading}
      />

      <ResolveModal
        transaction={resolveTransactionTarget}
        note={resolveNote}
        onNoteChange={setResolveNote}
        onClose={() => { setResolveTransactionTarget(null); setResolveNote(""); setActionError(null); }}
        onConfirm={handleResolveConfirm}
        isLoading={actionLoading}
      />

      {/* ── Action error toast ── */}
      {actionError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg">
          <AlertCircle className="h-4 w-4" />
          {actionError}
          <button onClick={() => setActionError(null)} className="ml-2 text-red-400 hover:text-red-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminTransactions;