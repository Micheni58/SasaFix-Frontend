// src/pages/Admin/AdminReportsDisputes.jsx

import { useState, useEffect } from "react";
import {
  Flag,
  Search,
  Filter,
  ChevronDown,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  XCircle,
  X,
  Loader2,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  Users,
  Timer,
  MessageSquare,
  Ban,
  Mail,
  FileText,
  ChevronRight,
  AlertCircle,
  Inbox,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

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
// MOCK DATA — replace with API calls
// ─────────────────────────────────────────────

const MOCK_REPORTS = [
  {
    id: "RPT-001",
    bookingId: 1042,
    clientName: "Aisha Mwangi",
    clientEmail: "aisha.m@gmail.com",
    providerName: "James Otieno",
    providerEmail: "james.o@gmail.com",
    providerId: 24,
    category: "Provider no-show",
    description:
      "The provider confirmed the booking but never arrived. I waited for 2 hours and tried calling multiple times with no response.",
    status: "Submitted",
    priority: "High",
    submittedAt: "2026-09-06T09:14:00Z",
    resolutionNote: null,
    previousReports: 2,
  },
  {
    id: "RPT-002",
    bookingId: 1038,
    clientName: "Kevin Njoroge",
    clientEmail: "kevin.n@gmail.com",
    providerName: "Grace Wanjiku",
    providerEmail: "grace.w@gmail.com",
    providerId: 17,
    category: "Overcharging / wrong amount",
    description:
      "I was quoted KES 2,500 for the job but was charged KES 4,000 at completion. The provider claimed extra materials were used but gave no receipt.",
    status: "Under Review",
    priority: "Medium",
    submittedAt: "2026-09-05T14:30:00Z",
    resolutionNote: null,
    previousReports: 0,
  },
  {
    id: "RPT-003",
    bookingId: 1031,
    clientName: "Fatuma Hassan",
    clientEmail: "fatuma.h@gmail.com",
    providerName: "Peter Kamau",
    providerEmail: "peter.k@gmail.com",
    providerId: 9,
    category: "Poor service quality",
    description:
      "The plumbing repair was done poorly. The pipe started leaking again within 24 hours and the provider is not responding to my messages.",
    status: "Resolved",
    priority: "Medium",
    submittedAt: "2026-09-03T11:00:00Z",
    resolutionNote:
      "Provider was issued a formal warning. Client offered a partial refund of KES 800 from the commission reserve.",
    previousReports: 1,
  },
  {
    id: "RPT-004",
    bookingId: 1029,
    clientName: "Brian Ochieng",
    clientEmail: "brian.o@gmail.com",
    providerName: "Samuel Mwenda",
    providerEmail: "samuel.m@gmail.com",
    providerId: 33,
    category: "Fraud or scam",
    description:
      "The provider asked me to pay directly via M-Pesa outside the platform to avoid the commission. I refused but want this reported.",
    status: "Under Review",
    priority: "High",
    submittedAt: "2026-09-04T16:45:00Z",
    resolutionNote: null,
    previousReports: 3,
  },
  {
    id: "RPT-005",
    bookingId: 1021,
    clientName: "Mercy Wambua",
    clientEmail: "mercy.w@gmail.com",
    providerName: "David Ngugi",
    providerEmail: "david.n@gmail.com",
    providerId: 41,
    category: "Unprofessional behaviour",
    description:
      "The provider was rude and dismissive during the job. He made inappropriate comments and left the work area extremely messy.",
    status: "Dismissed",
    priority: "Low",
    submittedAt: "2026-09-01T08:20:00Z",
    resolutionNote:
      "Report reviewed. Provider's account of events was corroborated by booking chat logs. No policy violation found.",
    previousReports: 0,
  },
  {
    id: "RPT-006",
    bookingId: 1055,
    clientName: "Cynthia Akinyi",
    clientEmail: "cynthia.a@gmail.com",
    providerName: "James Otieno",
    providerEmail: "james.o@gmail.com",
    providerId: 24,
    category: "Safety concern",
    description:
      "The electrician worked without proper safety equipment and left exposed wires after the job. This is a serious hazard.",
    status: "Submitted",
    priority: "High",
    submittedAt: "2026-09-07T07:55:00Z",
    resolutionNote: null,
    previousReports: 2,
  },
];

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

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────

function StatCard({ icon: Icon, value, label, sub, accent, iconBg }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
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
  const [resolveNote, setResolveNote] = useState(report?.resolutionNote || "");
  const [dismissNote, setDismissNote] = useState("");
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    setResolveNote(report?.resolutionNote || "");
    setDismissNote("");
    setActiveTab("details");
  }, [report?.id]);

  if (!report) return null;

  const canResolve = report.status !== "Resolved" && report.status !== "Dismissed";
  const canDismiss = report.status !== "Resolved" && report.status !== "Dismissed";

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
              <p className="font-bold text-gray-900 text-sm">{report.id}</p>
              <p className="text-xs text-gray-400">Booking #{report.bookingId}</p>
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
          {report.previousReports >= 3 && (
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
                  Client's description
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
                      {getInitials(report.clientName)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{report.clientName}</p>
                  </div>
                  <p className="text-xs text-gray-400 break-all">{report.clientEmail}</p>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Reported against</p>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-600">
                      {getInitials(report.providerName)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">{report.providerName}</p>
                  </div>
                  <p className="text-xs text-gray-400 break-all">{report.providerEmail}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Submitted</p>
                <p className="text-sm text-gray-700">{formatDate(report.submittedAt)}</p>
              </div>

              {/* Previous reports warning */}
              {report.previousReports > 0 && (
                <div className={`rounded-xl border px-4 py-3 flex items-start gap-3 ${
                  report.previousReports >= 3
                    ? "border-red-200 bg-red-50"
                    : "border-amber-200 bg-amber-50"
                }`}>
                  <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                    report.previousReports >= 3 ? "text-red-500" : "text-amber-500"
                  }`} />
                  <div>
                    <p className={`text-sm font-semibold ${
                      report.previousReports >= 3 ? "text-red-800" : "text-amber-800"
                    }`}>
                      {report.previousReports} previous report{report.previousReports > 1 ? "s" : ""} against this provider
                    </p>
                    <p className={`text-xs mt-0.5 ${
                      report.previousReports >= 3 ? "text-red-600" : "text-amber-600"
                    }`}>
                      {report.previousReports >= 3
                        ? "Account flagged — consider suspension"
                        : "Review provider's history before resolving"}
                    </p>
                  </div>
                </div>
              )}

              {/* Resolution note if already resolved/dismissed */}
              {report.resolutionNote && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Resolution note</p>
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm text-green-800 leading-relaxed">{report.resolutionNote}</p>
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
                    href={`mailto:${report.clientEmail}?subject=Regarding your report ${report.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-[#056db3] hover:text-[#056db3] hover:bg-blue-50 transition-all"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    Email the client
                  </a>
                  <a
                    href={`mailto:${report.providerEmail}?subject=Report filed against your account - ${report.id}`}
                    className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 hover:border-[#056db3] hover:text-[#056db3] hover:bg-blue-50 transition-all"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    Email the provider
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
                    onClick={() => window.open(`/admin/users?provider=${report.providerId}`, "_blank")}
                    className="w-full flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 hover:bg-red-100 transition-all"
                  >
                    <Ban className="h-4 w-4 shrink-0" />
                    Go to provider account
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
                    placeholder="Describe the action taken (e.g. refund issued, provider warned)..."
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
  const [reports, setReports] = useState(MOCK_REPORTS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [priorityFilter, setPriorityFilter] = useState("All Priority");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch reports (replace mock with real API) ──
  const fetchReports = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    // TODO: replace with real API call
    // const data = await reportService.getAllReports();
    // setReports(data);
    if (showRefresh) {
      setTimeout(() => setRefreshing(false), 600);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // ── Filter ──
  const filtered = reports.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      r.id.toLowerCase().includes(q) ||
      r.clientName.toLowerCase().includes(q) ||
      r.providerName.toLowerCase().includes(q) ||
      String(r.bookingId).includes(q) ||
      r.category.toLowerCase().includes(q);

    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    const matchPriority = priorityFilter === "All Priority" || r.priority === priorityFilter;
    const matchCategory = categoryFilter === "All Categories" || r.category === categoryFilter;

    return matchSearch && matchStatus && matchPriority && matchCategory;
  });

  const hasFilters =
    search || statusFilter !== "All Status" || priorityFilter !== "All Priority" || categoryFilter !== "All Categories";

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setPriorityFilter("All Priority");
    setCategoryFilter("All Categories");
  };

  // ── Stats ──
  const openCount = reports.filter((r) => r.status === "Submitted").length;
  const reviewCount = reports.filter((r) => r.status === "Under Review").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;
  const highPriorityCount = reports.filter((r) => r.priority === "High" && r.status !== "Resolved" && r.status !== "Dismissed").length;

  // ── Actions ──
  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(true);
    try {
      // TODO: await reportService.updateStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }
      showToast(`Status updated to "${newStatus}"`);
    } catch {
      showToast("Failed to update status", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    setActionLoading(true);
    try {
      // TODO: await reportService.updatePriority(id, newPriority);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, priority: newPriority } : r))
      );
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => ({ ...prev, priority: newPriority }));
      }
      showToast(`Priority set to "${newPriority}"`);
    } catch {
      showToast("Failed to update priority", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async (id, note) => {
    setActionLoading(true);
    try {
      // TODO: await reportService.resolve(id, note);
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Resolved", resolutionNote: note } : r
        )
      );
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => ({ ...prev, status: "Resolved", resolutionNote: note }));
      }
      showToast("Report marked as resolved");
    } catch {
      showToast("Failed to resolve report", false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismiss = async (id, note) => {
    setActionLoading(true);
    try {
      // TODO: await reportService.dismiss(id, note);
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: "Dismissed", resolutionNote: note } : r
        )
      );
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => ({ ...prev, status: "Dismissed", resolutionNote: note }));
      }
      showToast("Report dismissed");
    } catch {
      showToast("Failed to dismiss report", false);
    } finally {
      setActionLoading(false);
    }
  };

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
                Review and resolve client reports against service providers.
              </p>
            </div>
            <button
              onClick={() => fetchReports(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-[#056db3] hover:text-[#056db3] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
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
            />
            <StatCard
              icon={Timer}
              value={reviewCount}
              label="Under review"
              sub="In progress"
              accent="bg-amber-500"
              iconBg="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon={CheckCircle2}
              value={resolvedCount}
              label="Resolved"
              sub="This month"
              accent="bg-green-500"
              iconBg="bg-green-50 text-green-600"
            />
            <StatCard
              icon={ShieldAlert}
              value={highPriorityCount}
              label="High priority"
              sub="Needs same-day response"
              accent="bg-red-500"
              iconBg="bg-red-50 text-red-600"
            />
          </div>

          {/* ── Filters ── */}
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Priority */}
              <div className="relative min-w-35">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors"
                >
                  {PRIORITY_OPTIONS.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {/* Category */}
              <div className="relative min-w-40">
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-[#f8fafc] pl-4 pr-9 text-sm text-gray-700 outline-none focus:border-[#056db3] focus:border-2 focus:bg-white transition-colors"
                >
                  {REPORT_CATEGORIES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="shrink-0 flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-500 hover:text-[#056db3] hover:bg-blue-50 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className="mb-4 px-1 text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
            <span className="font-semibold text-gray-700">{reports.length}</span> reports
          </p>

          {/* ── Table ── */}
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {error ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
                <p className="text-gray-700 font-medium">{error}</p>
                <button
                  onClick={() => fetchReports()}
                  className="mt-4 rounded-xl bg-[#056db3] px-4 py-2 text-sm text-white hover:bg-[#045a94]"
                >
                  Try again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="rounded-full bg-gray-100 p-6 mb-4">
                  <Flag className="h-10 w-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-700 mb-1">No reports found</h3>
                <p className="text-sm text-gray-400 max-w-sm">
                  {hasFilters
                    ? "No reports match your filters. Try adjusting your search."
                    : "No reports have been submitted yet. They'll appear here when clients flag issues."}
                </p>
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-sm text-[#056db3] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-200">
                  <thead className="border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
                    <tr>
                      {["Report", "Booking", "Client", "Provider", "Category", "Priority", "Status", "Submitted", ""].map((h) => (
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
                    {loading
                      ? [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                      : filtered.map((r) => (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedReport(r)}
                            className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                          >
                            {/* Report ID */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-gray-700">
                                  {r.id}
                                </span>
                                {r.previousReports >= 3 && (
                                  <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" title="Repeat offender" />
                                )}
                              </div>
                            </td>

                            {/* Booking */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-mono text-[#056db3] font-medium">
                                #{r.bookingId}
                              </span>
                            </td>

                            {/* Client */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-[#056db3]">
                                  {getInitials(r.clientName)}
                                </div>
                                <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                  {r.clientName}
                                </span>
                              </div>
                            </td>

                            {/* Provider */}
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2.5">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[10px] font-bold text-purple-600">
                                  {getInitials(r.providerName)}
                                </div>
                                <span className="text-sm text-gray-800 font-medium whitespace-nowrap">
                                  {r.providerName}
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
                                {timeAgo(r.submittedAt)}
                              </span>
                            </td>

                            {/* Arrow */}
                            <td className="px-4 py-4">
                              <ChevronRight className="h-4 w-4 text-gray-300" />
                            </td>
                          </tr>
                        ))}
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
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onResolve={handleResolve}
          onDismiss={handleDismiss}
          actionLoading={actionLoading}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg transition-all ${
            toast.ok ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {toast.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

export default AdminReportsDisputes;