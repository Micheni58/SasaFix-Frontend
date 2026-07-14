// src/pages/ServiceProvider/Jobs/MyJobs.jsx - Fixed Client Names & Initials

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock3,
    MapPin,
    RefreshCw,
    Briefcase,
    Inbox,
    CheckCircle,
    XCircle,
    EllipsisVertical,
    MessageSquare,
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

const tabs = ["New Requests", "Accepted", "In Progress", "Completed", "Cancelled"];

// Unified status palette — amber flags "needs your action" (New Requests),
// sky/indigo track the job lifecycle, green/red are the two end states.
const statusStyles = {
    "New Requests": "bg-amber-100 text-amber-800",
    Accepted: "bg-sky-100 text-sky-800",
    "In Progress": "bg-indigo-100 text-indigo-800",
    Completed: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
};

const emptyStateConfigs = {
    "New Requests": {
        icon: Inbox,
        title: "No New Requests",
        description: "You don't have any new job requests at the moment. When clients request your services, they'll appear here.",
        color: "bg-amber-50",
        iconColor: "text-amber-500",
    },
    "Accepted": {
        icon: CheckCircle,
        title: "No Accepted Jobs",
        description: "You haven't accepted any jobs yet. Check your new requests and accept the ones that suit you.",
        color: "bg-sky-50",
        iconColor: "text-sky-500",
    },
    "In Progress": {
        icon: Briefcase,
        title: "No Jobs In Progress",
        description: "You don't have any jobs currently in progress. Accept a job to start working on it.",
        color: "bg-indigo-50",
        iconColor: "text-indigo-500",
    },
    "Completed": {
        icon: CheckCircle,
        title: "No Completed Jobs",
        description: "You haven't completed any jobs yet. Start accepting and completing jobs to build your portfolio.",
        color: "bg-green-50",
        iconColor: "text-green-500",
    },
    "Cancelled": {
        icon: XCircle,
        title: "No Cancelled Jobs",
        description: "You don't have any cancelled jobs. Keep up the good work!",
        color: "bg-red-50",
        iconColor: "text-red-500",
    },
};

function formatJobDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateStr));
}

function getJobDetailsPath(job) {
    const status = (job.status || "").toString().toLowerCase();

    if (status.includes("accepted")) {
        return `/provider/my-jobs/accepted/${job.id}`;
    }

    if (status.includes("progress")) {
        return `/provider/my-jobs/in-progress/${job.id}`;
    }

    if (status.includes("completed")) {
        return `/provider/my-jobs/completed/${job.id}`;
    }
    if(status.includes("cancelled")){
        return `/provider/my-jobs/cancelled/${job.id}`;     
    }
    
    return `/provider/my-jobs/new/${job.id}`;
}

// ─────────────────────────────────────────────
// HELPER: Get Client Name
// ─────────────────────────────────────────────

function getClientName(job) {
    if (job.client && job.client !== "Client" && !job.client.includes("Client #")) {
        return job.client;
    }
    if (job.clientName && job.clientName !== "Client" && !job.clientName.includes("Client #")) {
        return job.clientName;
    }
    if (job.raw?.client_full_name) {
        return job.raw.client_full_name;
    }
    if (job.raw?.client_name) {
        return job.raw.client_name;
    }
    if (job.clientObj?.full_name) {
        return job.clientObj.full_name;
    }
    if (job.clientObj?.name) {
        return job.clientObj.name;
    }
    if (job.clientObj?.first_name && job.clientObj?.last_name) {
        return `${job.clientObj.first_name} ${job.clientObj.last_name}`;
    }
    if (job.clientId || job.raw?.client_id) {
        return `Client #${job.clientId || job.raw?.client_id}`;
    }
    return "Unknown Client";
}

// ─────────────────────────────────────────────
// HELPER: Get Client Initials
// ─────────────────────────────────────────────

function getClientInitials(job) {
    const fullName = getClientName(job);
    return getInitials(fullName);
}

// ─────────────────────────────────────────────
// EMPTY STATE COMPONENT
// ─────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description, color, iconColor }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`rounded-full ${color} p-6 mb-6`}>
                <Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-500 max-w-md">{description}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// SKELETON — modern loading state, matches the
// pulse-skeleton pattern used on the dashboards
// ─────────────────────────────────────────────

function RowSkeleton() {
    return (
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
            <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
                <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-1/6 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
        </div>
    );
}

function JobsSkeleton() {
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">
                    <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div className="space-y-2">
                            <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />
                            <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
                        </div>
                        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
                    </section>

                    <section className="mb-6 flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                        {tabs.map((tab) => (
                            <div key={tab} className="h-8 w-28 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                        ))}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <RowSkeleton key={i} />
                        ))}
                    </section>
                </main>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function MyJobs() {
    const [activeTab, setActiveTab] = useState("New Requests");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const navigate = useNavigate();

    // ── Fetch Jobs ──
    const fetchJobs = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const providerId = userData.provider_id;

        if (!providerId) {
            setLoading(false);
            return;
        }

        try {
            const data = await bookingService.listProviderBookings(providerId);
            setJobs(data || []);
        } catch (err) {
            console.info("No bookings available");
            setJobs([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const filteredJobs = jobs.filter((job) => job.status === activeTab);

    const tabCounts = tabs.reduce((acc, tab) => {
        acc[tab] = jobs.filter((job) => job.status === tab).length;
        return acc;
    }, {});

    const handleAccept = (job) => {
        setSelectedJob(job);
        setModalType("accept");
    };

    const handleDecline = (job) => {
        setSelectedJob(job);
        setModalType("decline");
    };

    const confirmAction = async () => {
        if (!selectedJob) return;
        try {
            if (modalType === "accept") {
                await bookingService.updateBookingStatus(selectedJob.id, "accepted");
                setJobs((prev) =>
                    prev.map((j) =>
                        j.id === selectedJob.id ? { ...j, status: "Accepted" } : j
                    )
                );
            } else {
                await bookingService.cancelBooking(selectedJob.id);
                setJobs((prev) =>
                    prev.map((j) =>
                        j.id === selectedJob.id ? { ...j, status: "Cancelled" } : j
                    )
                );
            }
        } catch (err) {
            console.error("Action failed:", err);
        } finally {
            setModalType(null);
            setSelectedJob(null);
        }
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedJob(null);
    };

    const getEmptyState = (tab) => {
        return emptyStateConfigs[tab] || emptyStateConfigs["New Requests"];
    };

    // ── Loading state ──
    if (loading) {
        return <JobsSkeleton />;
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">
                    {/* ── Page Header ── */}
                    <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold text-gray-800">My Jobs</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your service requests and bookings
                            </p>
                        </div>
                        <button
                            onClick={() => fetchJobs(true)}
                            disabled={refreshing}
                            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </section>

                    {/* ── Tabs ── */}
                    <section className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex items-center gap-2 whitespace-nowrap border-b-[3px] px-6 py-3.5 text-base transition-colors ${
                                        activeTab === tab
                                            ? "border-[#056db3] bg-blue-50 text-[#056db3]"
                                            : "border-transparent text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    <span>{tab}</span>
                                    <span
                                        className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                            activeTab === tab
                                                ? "bg-[#056db3] text-white"
                                                : "bg-gray-100 text-gray-600"
                                        }`}
                                    >
                                        {tabCounts[tab]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── Refreshing overlay strip ── */}
                    {refreshing && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-[#056db3]">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Refreshing jobs...
                        </div>
                    )}

                    {/* ── Table ── */}
                    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            {filteredJobs.length === 0 ? (
                                <EmptyState
                                    icon={getEmptyState(activeTab).icon}
                                    title={getEmptyState(activeTab).title}
                                    description={getEmptyState(activeTab).description}
                                    color={getEmptyState(activeTab).color}
                                    iconColor={getEmptyState(activeTab).iconColor}
                                />
                            ) : (
                                <table className="w-full table-auto min-w-200">
                                    <thead className="border-b border-gray-200 bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Client
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Service
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Date & Time
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Location
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Status
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Earnings
                                            </th>
                                            <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredJobs.map((job) => {
                                            const clientName = getClientName(job);
                                            const clientInitials = getClientInitials(job);

                                            return (
                                                <tr key={job.id} className="border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                                                                {clientInitials}
                                                            </div>
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {clientName}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm font-semibold text-gray-800">{job.service}</p>
                                                        <p className="mt-1 text-xs text-gray-500 truncate max-w-40">{job.details}</p>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="space-y-1 text-gray-600">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-sm">{formatJobDate(job.date)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock3 className="h-3.5 w-3.5 text-gray-400" />
                                                                <span className="text-sm">{job.time}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-sm max-w-32 truncate">{job.location}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span
                                                            className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                                                                statusStyles[job.status] || "bg-gray-100 text-gray-700"
                                                            }`}
                                                        >
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-bold font-mono text-gray-800">{job.amount}</span>
                                                    </td>
                                                    <td className="px-4 py-4 relative">
                                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                                            <Link
                                                                to={getJobDetailsPath(job)}
                                                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#056db3] hover:bg-blue-50 transition-colors"
                                                            >
                                                                View
                                                            </Link>
                                                            <button
                                                                onClick={() => setOpenMenuId(openMenuId === job.id ? null : job.id)}
                                                                className="p-2 rounded-md hover:bg-gray-100"
                                                                aria-label="More actions"
                                                            >
                                                                <EllipsisVertical className="h-4 w-4 text-gray-600" />
                                                            </button>
                                                        </div>
                                                        {openMenuId === job.id && (
                                                            <div className="absolute right-2 top-full z-40 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                                <button
                                                                    onClick={() => {
                                                                        navigate(`/client/messages?client=${job.clientId || job.raw?.client_id || ''}`);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                >
                                                                    <MessageSquare className="w-4 h-4 text-gray-600" />
                                                                    Message
                                                                </button>
                                                                {job.status !== 'Completed' && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!window.confirm('Cancel this booking?')) return;
                                                                            try {
                                                                                await bookingService.cancelBooking(job.id);
                                                                                setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: 'Cancelled' } : j)));
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                                window.alert('Failed to cancel');
                                                                            } finally {
                                                                                setOpenMenuId(null);
                                                                            }
                                                                        }}
                                                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                )}
                                                                {job.status === 'New Requests' && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('accept');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-sm text-[#056db3] hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('decline');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                                                                        >
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </section>

                    {/* ── Confirm Modal ── */}
                    {modalType && selectedJob && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {modalType === "accept" ? "Accept Job" : "Decline Job"}
                                    </h2>
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-sm text-gray-600">
                                        {modalType === "accept"
                                            ? `Are you sure you want to accept this job from ${getClientName(selectedJob)}?`
                                            : `Are you sure you want to decline this job from ${getClientName(selectedJob)}? The client will be notified.`}
                                    </p>
                                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm font-semibold text-gray-800">{selectedJob.service}</p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {formatJobDate(selectedJob.date)} at {selectedJob.time}
                                        </p>
                                        <p className="text-xs text-gray-600">{selectedJob.location}</p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAction}
                                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                                            modalType === "accept"
                                                ? "bg-[#056db3] hover:bg-blue-700"
                                                : "bg-red-600 hover:bg-red-700"
                                        }`}
                                    >
                                        {modalType === "accept" ? "Yes, Accept" : "Yes, Decline"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default MyJobs;

// ─────────────────────────────────────────────
// HELPER: Get Initials from Name
// ─────────────────────────────────────────────

function getInitials(name) {
    if (!name) return "--";
    if (name.length <= 2 && name === name.toUpperCase()) {
        return name;
    }
    const normalized = name.toString().trim().replace(/\s+/g, " ");
    const parts = normalized.split(" ").filter(Boolean);
    if (parts.length === 0) return "--";
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}