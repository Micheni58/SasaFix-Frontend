// src/pages/Admin/AdminReportsDisputes.jsx

import { useState, useEffect } from "react";
import {
  Flag,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Timer,
  MessageSquare,
  Ban,
  Mail,
  ChevronRight,
  AlertCircle,
  Inbox,
  FileText,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import { useToast } from "../../components/ui/ToastProvider";
import Navbar from "../../components/Navbar";
import reportService from "../../api/reportService";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const REPORT_CATEGORIES = [
  "All Categories",
  "Poor service quality",
  "Provider no-show",
  "Overcharging / wrong amount",
  "Unprofessional behaviour",
  "Safety concern",
  "Fraud or scam",
  "Client no-show",
  "Client refused to pay",
  "Abusive behaviour",
  "Fake or malicious booking",
  "Other",
];

const STATUS_OPTIONS = ["All Status", "Submitted", "Under Review", "Resolved", "Dismissed"];
const PRIORITY_OPTIONS = ["All Priority", "High", "Medium", "Low"];

const STATUS_CONFIG = {
  Submitted: {
    styles: "bg-blue-100 text-blue-700",
    icon: Inbox,
    dot: "bg-blue-500",
  },
  "Under Review": {
    styles: "bg-amber-100 text-amber-700",
    icon: Clock3,
    dot: "bg-amber-500",
  },
  Resolved: {
    styles: "bg-green-100 text-green-700",
    icon: CheckCircle2,
    dot: "bg-green-500",
  },
  Dismissed: {
    styles: "bg-gray-100 text-gray-500",
    icon: XCircle,
    dot: "bg-gray-400",
  },
};

const PRIORITY_CONFIG = {
  High: { styles: "bg-red-100 text-red-700", dot: "bg-red-500" },
  Medium: { styles: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  Low: { styles: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getFullName(user) {
  if (!user) return "Unknown User";
  if (typeof user === 'string') return user;
  return `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Unknown User";
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {[...Array(8)].map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 rounded bg-gray-200 animate-pulse" style={{ width: `${60 + (i * 13) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

function SkeletonStatCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="absolute inset-x-0 top-0 h-1 bg-gray-200" />
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 animate-pulse" />
      <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
      <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200" />
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub, accent, iconBg, isLoading }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      {isLoading ? (
        <div className="h-8 w-20 animate-pulse rounded bg-gray-200" />
      ) : (
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      )}
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// STATUS + PRIORITY BADGES
// ─────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["Submitted"];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${cfg.styles}`}>
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG["Low"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.styles}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {priority}
    </span>
  );
}

// ─────────────────────────────────────────────
// REPORT DETAIL MODAL (Centered)
// ─────────────────────────────────────────────

function ReportDetailModal({ report, onClose, onStatusChange, onPriorityChange, onResolve, onDismiss, actionLoading }) {
  const [resolveNote, setResolveNote] = useState(report?.resolution_note || "");
  const [dismissNote, setDismissNote] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    setResolveNote(report?.resolution_note || "");
    setDismissNote("");
    setActiveTab("details");
  }, [report?.id]);

  if (!report) return null;

  const canResolve = report.status !== "Resolved" && report.status !== "Dismissed";
  const canDismiss = report.status !== "Resolved" && report.status !== "Dismissed";

  const reporterName = getFullName(report.reporter);
  const reportedName = getFullName(report.reported_user);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <Flag className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm">Report #{report.id}</p>
              <p className="text-xs text-gray-400">Booking #{report.booking_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Badges row */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 bg-gray-50 shrink-0 flex-wrap">
          <StatusBadge status={report.status} />
          <PriorityBadge priority={report.priority} />
          {report.previous_reports >= 3 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-3 w-3" />
              Repeat offender
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          {["details", "action"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "border-b-2 border-[#056db3] text-[#056db3]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab === "details" ? "Report Details" : "Take Action"}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {activeTab === "details" && (
            <div className="space-y-5">

              {/* Category */}
              <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-xs text-red-500 font-medium mb-0.5">Category</p>
                <p className="text-sm font-semibold text-red-800">{report.category}</p>
              </div>

              {/* Description */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Reporter's description
                </p>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">{report.description}</p>
                </div>
              </div>

              {/* People */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Reported by</p>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-[#056db3]">
                      {getInitials(reporterName)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{reporterName}</p>
                  </div>
                  <p className="text-xs text-gray-400 break-all">{report.reporter?.email || "No email"}</p>
                  <p className="text-xs text-gray-400 capitalize">Role: {report.reporter_role}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Reported against</p>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                      {getInitials(reportedName)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{reportedName}</p>
                  </div>
                  <p className="text-xs text-gray-400 break-all">{report.reported_user?.email || "No email"}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted</p>
                <p className="text-sm text-gray-700">{formatDate(report.created_at)}</p>
              </div>

              {/* Previous reports warning */}
              {report.previous_reports > 0 && (
                <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                  report.previous_reports >= 3
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                    report.previous_reports >= 3 ? "text-red-500" : "text-amber-500"
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      report.previous_reports >= 3 ? "text-red-800" : "text-amber-800"
                    }`}>
                      {report.previous_reports} previous report{report.previous_reports > 1 ? "s" : ""} against this user
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      report.previous_reports >= 3 ? "text-red-600" : "text-amber-600"
                    }`}>
                      {report.previous_reports >= 3
                        ? "Account flagged — consider suspension"
                        : "Review user's history before resolving"}
                    </p>
                  </div>
                </div>
              )}

              {/* Resolution note if already resolved/dismissed */}
              {report.resolution_note && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resolution note</p>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800 leading-relaxed">{report.resolution_note}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "action" && (
            <div className="space-y-5">

              {/* Change status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Update status</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Submitted", "Under Review", "Resolved", "Dismissed"].map((s) => (
                    <button
                      key={s}
                      onClick={() => onStatusChange(report.id, s)}
                      disabled={report.status === s || actionLoading}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all text-left flex items-center gap-2 ${
                        report.status === s
                          ? "border-[#056db3] bg-blue-50 text-[#056db3]"
                          : "border-gray-200 bg-white text-gray-600 hover:border-[#056db3] hover:text-[#056db3]"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${STATUS_CONFIG[s]?.dot}`} />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change priority */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Set priority</p>
                <div className="flex gap-2">
                  {["High", "Medium", "Low"].map((p) => (
                    <button
                      key={p}
                      onClick={() => onPriorityChange(report.id, p)}
                      disabled={report.priority === p || actionLoading}
                      className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all ${
                        report.priority === p
                          ? PRIORITY_CONFIG[p].styles + " border-transparent"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick actions */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quick actions</p>
                <div className="space-y-2">
                  <a
                    href={`mailto:${report.reporter?.email}?subject=Regarding your report #${report.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-[#056db3] hover:text-[#056db3] hover:bg-blue-50 transition-all"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    Email the reporter
                  </a>
                  <a
                    href={`mailto:${report.reported_user?.email}?subject=Report filed against your account #${report.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-[#056db3] hover:text-[#056db3] hover:bg-blue-50 transition-all"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    Email the reported user
                  </a>
                  <button
                    onClick={() => onStatusChange(report.id, "Under Review")}
                    disabled={report.status === "Under Review" || actionLoading}
                    className="w-full flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 hover:bg-amber-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Clock3 className="h-4 w-4 shrink-0" />
                    Mark as under review
                  </button>
                  <button
                    onClick={() => window.open(`/admin/users?userId=${report.reported_user?.id}`, "_blank")}
                    className="w-full flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hover:bg-red-100 transition-all"
                  >
                    <Ban className="h-4 w-4 shrink-0" />
                    Go to user account
                    <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                  </button>
                </div>
              </div>

              {/* Resolve */}
              {canResolve && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resolve report</p>
                  <textarea
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                    rows={3}
                    placeholder="Describe the action taken (e.g. refund issued, warning issued)..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20 transition-colors resize-none"
                  />
                  <button
                    onClick={() => onResolve(report.id, resolveNote)}
                    disabled={!resolveNote.trim() || actionLoading}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}
                    Mark as resolved
                  </button>
                </div>
              )}

              {/* Dismiss */}
              {canDismiss && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Dismiss report</p>
                  <textarea
                    value={dismissNote}
                    onChange={(e) => setDismissNote(e.target.value)}
                    rows={2}
                    placeholder="Reason for dismissal..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20 transition-colors resize-none"
                  />
                  <button
                    onClick={() => onDismiss(report.id, dismissNote)}
                    disabled={!dismissNote.trim() || actionLoading}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    Dismiss as unfounded
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function AdminReportsDisputes() {
  const toast = useToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const showToast = (msg, ok = true) => {
    if (ok) toast.success(msg);
    else toast.error("Action failed", msg);
  };

  // ── Fetch reports and summary ──
  const fetchData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setIsFiltering(true);
    }
    setError(null);

    try {
      const filters = {};
      if (statusFilter !== "All Status") filters.status = statusFilter;
      if (priorityFilter !== "All Priority") filters.priority = priorityFilter;
      if (categoryFilter !== "All Categories") filters.category = categoryFilter;

      const [reportsData, summaryData] = await Promise.all([
        reportService.getAllReports(filters),
        reportService.getReportSummary(),
      ]);

      // Log the data to debug
      console.log("📊 Reports data:", reportsData);
      console.log("📊 Summary data:", summaryData);

      setReports(reportsData || []);
      setSummary(summaryData);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Unable to load reports. Please try again later.");
      setReports([]);
    } finally {
      setLoading(false);
      setIsFiltering(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Filter reports (client-side search) ──
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const reporterName = getFullName(r.reporter).toLowerCase();
    const reportedName = getFullName(r.reported_user).toLowerCase();

    const matchSearch =
      !search ||
      String(r.id).includes(q) ||
      String(r.booking_id).includes(q) ||
      reporterName.includes(q) ||
      reportedName.includes(q) ||
      r.category?.toLowerCase().includes(q);

    return matchSearch;
  });

  const hasFilters =
    search || statusFilter !== "All Status" || priorityFilter !== "All Priority" || categoryFilter !== "All Categories";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setPriorityFilter("All Priority");
    setCategoryFilter("All Categories");
    fetchData();
  };

  // ── Handle filter changes ──
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    fetchData();
  };

  const handlePriorityChange = (value) => {
    setPriorityFilter(value);
    fetchData();
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    fetchData();
  };

  // ── Stats ──
  const openCount = summary?.submitted || 0;
  const reviewCount = summary?.under_review || 0;
  const resolvedCount = summary?.resolved || 0;
  const highPriorityCount = summary?.high_priority_open || 0;
  const totalReports = summary?.total || 0;

  // ── Actions ──
  const handleStatusUpdate = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const updated = await reportService.updateStatus(id, newStatus);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      const newSummary = await reportService.getReportSummary();
      setSummary(newSummary);
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      showToast(err.message || "Failed to update status", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityUpdate = async (id, newPriority) => {
    setActionLoading(true);
    try {
      const updated = await reportService.updatePriority(id, newPriority);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      showToast(`Priority set to "${newPriority}"`);
    } catch (err) {
      showToast(err.message || "Failed to update priority", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (id, note) => {
    setActionLoading(true);
    try {
      const updated = await reportService.resolveReport(id, note);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      const newSummary = await reportService.getReportSummary();
      setSummary(newSummary);
      showToast("Report marked as resolved");
    } catch (err) {
      showToast(err.message || "Failed to resolve report", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async (id, note) => {
    setActionLoading(true);
    try {
      const updated = await reportService.dismissReport(id, note);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedReport?.id === id) {
        setSelectedReport(updated);
      }
      const newSummary = await reportService.getReportSummary();
      setSummary(newSummary);
      showToast("Report dismissed");
    } catch (err) {
      showToast(err.message || "Failed to dismiss report", false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Empty State Component ──
  const EmptyState = ({ icon: Icon, title, description, color, iconColor }) => {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className={`rounded-full ${color} p-6 mb-6`}>
          <Icon className={`h-16 w-16 ${iconColor}`} />
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-500 max-w-md">{description}</p>
      </div>
    );
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="admin" />
        <div className="flex-1 ml-0 lg:ml-72 min-w-0">
          <Navbar />
          <main className="pt-24 px-4 sm:px-6 pb-10 max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-10 w-10 rounded-xl bg-gray-200 animate-pulse" />
                <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="h-5 w-72 animate-pulse rounded bg-gray-200 mt-1" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <SkeletonStatCard key={i} />
              ))}
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {["Report", "Booking", "Reporter", "Reported", "Category", "Priority", "Status", "Submitted", ""].map((h) => (
                        <th key={h} className="px-4 py-3.5 text-left">
                          <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <SkeletonRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isUpdating = isFiltering || refreshing;

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72 min-w-0">
        <Navbar />
        <main className="pt-24 px-4 sm:px-6 pb-10 max-w-7xl mx-auto">
          {/* ── Page Header ── */}
          <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                  <Flag className="h-5 w-5 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Reports & Disputes</h1>
                {highPriorityCount > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    {highPriorityCount} high priority
                  </span>
                )}
              </div>
              <p className="text-gray-500 ml-13 pl-0.5">
                Review and resolve reports filed by clients and service providers.
              </p>
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={isUpdating}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-[#056db3] hover:text-[#056db3] transition-colors disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Inbox}
              value={openCount}
              label="Open reports"
              sub="Need attention"
              accent="bg-blue-500"
              iconBg="bg-blue-50 text-blue-600"
              isLoading={isUpdating}
            />
            <StatCard
              icon={Timer}
              value={reviewCount}
              label="Under review"
              sub="In progress"
              accent="bg-amber-500"
              iconBg="bg-amber-50 text-amber-600"
              isLoading={isUpdating}
            />
            <StatCard
              icon={CheckCircle2}
              value={resolvedCount}
              label="Resolved"
              sub="This month"
              accent="bg-green-500"
              iconBg="bg-green-50 text-green-600"
              isLoading={isUpdating}
            />
            <StatCard
              icon={ShieldAlert}
              value={highPriorityCount}
              label="High priority"
              sub="Needs same-day response"
              accent="bg-red-500"
              iconBg="bg-red-50 text-red-600"
              isLoading={isUpdating}
            />
          </div>

          {/* ── Filters ── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-opacity duration-200">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              {/* Search */}
              <div className="relative flex-1 min-w-50">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by report ID, client, provider, or booking..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#f8fafc] pl-10 pr-4 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors placeholder:text-gray-400"
                />
              </div>

              {/* Status */}
              <div className="relative min-w-35">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors disabled:opacity-50"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div className="relative min-w-35">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  disabled={isUpdating}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors disabled:opacity-50"
                >
                  {PRIORITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="relative min-w-40">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  disabled={isUpdating}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors disabled:opacity-50"
                >
                  {REPORT_CATEGORIES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  disabled={isUpdating}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#056db3] hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}

              {/* Loading indicator for filters */}
              {isFiltering && (
                <div className="flex items-center gap-2 text-sm text-[#056db3]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </div>
              )}
            </div>
          </div>

          {/* Result count with loading state */}
          <div className="mb-4 px-1 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
              <span className="font-semibold text-gray-700">{reports.length}</span> reports
            </p>
            {isFiltering && (
              <span className="text-xs text-[#056db3] animate-pulse">Loading...</span>
            )}
          </div>

          {/* ── Table ── */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden transition-opacity duration-200">
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="rounded-full bg-red-50 p-6 mb-6">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Unable to load reports</h3>
                <p className="text-gray-500 max-w-md mb-4">{error}</p>
                <button
                  onClick={() => fetchData()}
                  className="rounded-xl bg-[#056db3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045a94] transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : reports.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No reports found"
                description="No reports have been submitted yet. They'll appear here when users flag issues."
                color="bg-blue-50"
                iconColor="text-blue-500"
              />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No reports match your filters"
                description="Try adjusting your search or clear the filters to see all reports."
                color="bg-amber-50"
                iconColor="text-amber-500"
              />
            ) : (
              <div className={`overflow-x-auto transition-opacity duration-200 ${isFiltering ? 'opacity-60' : 'opacity-100'}`}>
                <table className="w-full min-w-200">
                  <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {["Report", "Booking", "Reporter", "Reported", "Category", "Priority", "Status", "Submitted", ""].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 tracking-wide whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((r) => {
                      const reporterName = getFullName(r.reporter);
                      const reportedName = getFullName(r.reported_user);
                      const isRepeatOffender = r.previous_reports >= 3;

                      return (
                        <tr
                          key={r.id}
                          onClick={() => setSelectedReport(r)}
                          className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                        >
                          {/* Report ID */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono font-semibold text-gray-700">
                                #{r.id}
                              </span>
                              {isRepeatOffender && (
                                <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" title="Repeat offender" />
                              )}
                            </div>
                          </td>

                          {/* Booking */}
                          <td className="px-4 py-4">
                            <span className="text-sm font-mono text-[#056db3] font-medium">
                              #{r.booking_id}
                            </span>
                          </td>

                          {/* Reporter */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#056db3]">
                                {getInitials(reporterName)}
                              </div>
                              <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                {reporterName}
                              </span>
                            </div>
                          </td>

                          {/* Reported */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
                                {getInitials(reportedName)}
                              </div>
                              <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                {reportedName}
                              </span>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-600 whitespace-nowrap">
                              {r.category}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="px-4 py-4">
                            <PriorityBadge priority={r.priority} />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <StatusBadge status={r.status} />
                          </td>

                          {/* Submitted */}
                          <td className="px-4 py-4">
                            <span className="text-sm text-gray-400 whitespace-nowrap">
                              {timeAgo(r.created_at)}
                            </span>
                          </td>

                          {/* Arrow */}
                          <td className="px-4 py-4">
                            <ChevronRight className="h-4 w-4 text-gray-300" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Detail Modal (Centered) ── */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusChange={handleStatusUpdate}
          onPriorityChange={handlePriorityUpdate}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
          actionLoading={actionLoading}
        />
      )}

    </div>
  );
}

export default AdminReportsDisputes;