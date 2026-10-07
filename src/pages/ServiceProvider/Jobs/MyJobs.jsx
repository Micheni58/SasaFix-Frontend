// src/pages/ServiceProvider/MyJobs.jsx

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
    Clock,
    MessageCircle,
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { useToast } from "../../../components/ui/ToastProvider";

// ── Tabs - Clean structure ──
const tabs = ["New Requests", "Accepted", "In Progress", "Completed", "Rescheduled", "Paid", "Cancelled"];

// ── Status Colors ──
const statusStyles = {
    "New Requests": "bg-amber-100 text-amber-800",
    "Pending": "bg-amber-100 text-amber-800",
    "Accepted": "bg-sky-100 text-sky-800",
    "In Progress": "bg-indigo-100 text-indigo-800",
    "Completed": "bg-green-100 text-green-800",
    "Rescheduled": "bg-purple-100 text-purple-800",
    "Reschedule Requested": "bg-purple-100 text-purple-800",
    "Reschedule Proposed": "bg-purple-100 text-purple-800",
    "Reschedule Confirmed": "bg-purple-100 text-purple-800",
    "Paid": "bg-emerald-100 text-emerald-800",
    "Cancelled": "bg-red-100 text-red-800",
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
    "Paid": {
        icon: CheckCircle,
        title: "No Paid Jobs",
        description: "Paid jobs will appear here after a client's payment has been processed.",
        color: "bg-emerald-50",
        iconColor: "text-emerald-500",
    },
    "Rescheduled": {
        icon: Clock,
        title: "No Pending Reschedules",
        description: "You don't have any pending reschedule requests. Reschedules that need your action or are waiting for client approval will appear here.",
        color: "bg-purple-50",
        iconColor: "text-purple-500",
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

// ── FIXED: Routing logic for reschedules ──
function getJobDetailsPath(job) {
    const status = job.status || "Pending";
    const rawStatus = (job.raw?.status ?? job.status ?? "pending")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");

    const initiator = (job.rescheduleInitiatedBy || job.raw?.reschedule_initiated_by || "")
        .toString()
        .trim()
        .toLowerCase();

    const isProviderInitiated = ["provider", "service_provider", "service-provider"].includes(initiator);
    const isClientInitiated = ["client", "customer"].includes(initiator);

    // Check if this booking has reschedule history
    // ── IF STATUS IS ACCEPTED, IN_PROGRESS, COMPLETED, or PAID → GO TO REGULAR DETAILS PAGE ──
    const regularStatuses = ["Accepted", "accepted", "In Progress", "in_progress", "Completed", "completed", "Paid", "paid"];
    if (regularStatuses.includes(status)) {
        if (status === "Accepted" || status === "accepted") {
            return `/provider/my-jobs/accepted/${job.id}`;
        }
        if (status === "In Progress" || status === "in_progress") {
            return `/provider/my-jobs/in-progress/${job.id}`;
        }
        if (status === "Completed" || status === "completed") {
            return `/provider/my-jobs/completed/${job.id}`;
        }
        if (status === "Paid" || status === "paid") {
            return `/provider/my-jobs/paid/${job.id}`;
        }
    }

    // ── NEW REQUESTS / PENDING ──
    if (status === "New Requests" || status === "Pending" || status === "pending") {
        return `/provider/my-jobs/new/${job.id}`;
    }

    // ── PROVIDER INITIATED RESCHEDULE (PENDING) ──
    if (isProviderInitiated && rawStatus === "reschedule_proposed") {
        return `/provider/my-jobs/reschedule-proposed/${job.id}`;
    }

    // ── CLIENT INITIATED RESCHEDULE (PENDING) ──
    if (isClientInitiated && rawStatus === "reschedule_requested") {
        return `/provider/my-jobs/reschedule-requested/${job.id}`;
    }

    // ── PENDING RESCHEDULE STATES (fallback) ──
    if (rawStatus === "reschedule_proposed") {
        return `/provider/my-jobs/reschedule-proposed/${job.id}`;
    }
    if (rawStatus === "reschedule_requested") {
        return `/provider/my-jobs/reschedule-requested/${job.id}`;
    }

    // ── RESCHEDULED / CONFIRMED (without clear initiator) ──
    if (rawStatus === "rescheduled" || rawStatus === "reschedule_confirmed") {
        // If status is Accepted, go to accepted page
        if (status === "Accepted" || status === "accepted") {
            return `/provider/my-jobs/accepted/${job.id}`;
        }
        return `/provider/my-jobs/reschedule-proposed/${job.id}`;
    }

    // ── REGULAR STATUS ROUTES ──
    const routeMap = {
        "New Requests": `/provider/my-jobs/new/${job.id}`,
        "Pending": `/provider/my-jobs/new/${job.id}`,
        "Accepted": `/provider/my-jobs/accepted/${job.id}`,
        "Upcoming": `/provider/my-jobs/accepted/${job.id}`,
        "In Progress": `/provider/my-jobs/in-progress/${job.id}`,
        "Completed": `/provider/my-jobs/completed/${job.id}`,
        "Paid": `/provider/my-jobs/paid/${job.id}`,
        "Cancelled": `/provider/my-jobs/cancelled/${job.id}`,
    };

    return routeMap[status] || `/provider/my-jobs/${job.id}`;
}

// ── FIXED: Check if a booking is currently in a PENDING reschedule state ──
function isRescheduleRelated(job) {
    const status = job.status || "Pending";
    const rawStatus = (job.raw?.status ?? job.status ?? "pending")
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/-/g, "_");
    
    // Terminal statuses - these should NOT show in Rescheduled tab
    const terminalStatuses = ["in_progress", "completed", "paid", "accepted"];
    
    // PENDING reschedule statuses - these SHOULD show in Rescheduled tab
    const pendingRescheduleStatuses = [
        "reschedule_requested",
        "reschedule_proposed",
    ];
    
    // Only show if status is a pending reschedule status
    if (pendingRescheduleStatuses.includes(rawStatus)) return true;
    
    // For "rescheduled" status, only show if not in a terminal state
    if (rawStatus === "rescheduled" || rawStatus === "reschedule_confirmed") {
        if (terminalStatuses.includes(status.toLowerCase())) {
            return false;
        }
        return true;
    }
    
    // Check if it has reschedule history AND is not in a terminal state
    if (job.raw?.original_scheduled_date || job.originalDate) {
        if (terminalStatuses.includes(status.toLowerCase())) {
            return false;
        }
        return true;
    }
    
    return false;
}

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

function getClientInitials(job) {
    const fullName = getClientName(job);
    return getInitials(fullName);
}

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

// ── Updated getStatusSubtext ──
function getStatusSubtext(job) {
    const status = job.status || "Pending";
    const rawStatus = job.raw?.status || status;
    const initiator = (job.rescheduleInitiatedBy || job.raw?.reschedule_initiated_by || "")
        .toString()
        .trim()
        .toLowerCase();
    const hasRescheduleHistory = !!(job.raw?.original_scheduled_date || job.originalDate);

    if (rawStatus === "reschedule_requested") {
        return "Waiting for your approval";
    }
    if (rawStatus === "reschedule_proposed") {
        return "Waiting for client approval";
    }
    if (hasRescheduleHistory && status === "Accepted") {
        if (initiator === "provider") {
            return " Reschedule accepted - you proposed it";
        }
        if (initiator === "client") {
            return " Reschedule accepted - client requested it";
        }
        return "Reschedule accepted";
    }
    return null;
}

function EmptyState({ icon: _Icon, title, description, color, iconColor }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className={`rounded-full ${color} p-6 mb-6`}>
                <_Icon className={`h-16 w-16 ${iconColor}`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-500 max-w-md">{description}</p>
        </div>
    );
}

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
        <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="min-w-0 flex-1 ml-0 lg:ml-72">
                <Navbar />
                <main className="min-w-0 pt-24 px-6 pb-6">
                    <div className="mx-auto w-full min-w-0 max-w-5xl">
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
                    </div>
                </main>
            </div>
        </div>
    );
}

function RescheduleModal({ job, onConfirm, onCancel }) {
    const toast = useToast();
    const [date, setDate] = useState(job.date || "");
    const [startTime, setStartTime] = useState(
        job.time ? job.time.split(" - ")[0] || "" : ""
    );
    const [endTime, setEndTime] = useState(
        job.time ? job.time.split(" - ")[1] || "" : ""
    );
    const [reason, setReason] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!date || !startTime || !endTime) {
            toast.warning("Missing reschedule details", "Please fill in all fields.");
            return;
        }
        onConfirm(date, startTime, endTime, reason);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="text-lg font-bold text-gray-800">Propose New Time</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {job.service} with {getClientName(job)}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                            New Date *
                        </label>
                        <input
                            id="reschedule-date"
                            name="reschedule-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="reschedule-start-time" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time *
                            </label>
                            <input
                                id="reschedule-start-time"
                                name="reschedule-start-time"
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="reschedule-end-time" className="block text-sm font-medium text-gray-700 mb-1">
                                End Time *
                            </label>
                            <input
                                id="reschedule-end-time"
                                name="reschedule-end-time"
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="reschedule-reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason (Optional)
                        </label>
                        <textarea
                            id="reschedule-reason"
                            name="reschedule-reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Briefly explain why you need to reschedule..."
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                            rows="2"
                        />
                    </div>

                    <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                        <p className="font-medium"> This will send a reschedule proposal to the client.</p>
                        <p className="text-xs mt-1">The client will need to confirm the new time.</p>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition-colors"
                        >
                            Send Proposal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MyJobs() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState("New Requests");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchJobs = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const providerId = userData.provider_id;

        if (!providerId) {
            setError("Your provider account could not be identified. Please sign in again.");
            setLoading(false);
            return;
        }

        try {
            const data = await bookingService.listProviderBookings(providerId);
            setJobs(data || []);
        } catch (err) {
            setError(err.message || "Failed to fetch jobs");
            setJobs([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // ── FIXED: Filter jobs based on active tab ──
    const filteredJobs = jobs.filter((job) => {
        const status = job.status || "Pending";
        
        // For "New Requests" tab, show Pending and New Requests
        if (activeTab === "New Requests") {
            return status === "Pending" || status === "New Requests";
        }
        
        // For "Rescheduled" tab, show pending reschedules
        if (activeTab === "Rescheduled") {
            return isRescheduleRelated(job);
        }
        
        return status === activeTab;
    });

    // ── FIXED: Tab counts ──
    const tabCounts = tabs.reduce((acc, tab) => {
        if (tab === "New Requests") {
            acc[tab] = jobs.filter((job) => {
                const status = job.status || "Pending";
                return status === "Pending" || status === "New Requests";
            }).length;
        } else if (tab === "Rescheduled") {
            acc[tab] = jobs.filter((job) => {
                const status = job.status || "Pending";
                const rawStatus = (job.raw?.status ?? job.status ?? "pending")
                    .toString()
                    .trim()
                    .toLowerCase()
                    .replace(/\s+/g, "_")
                    .replace(/-/g, "_");
                
                // Terminal statuses - these should NOT show in Rescheduled tab
                const terminalStatuses = ["in_progress", "completed", "paid", "accepted"];
                
                // PENDING reschedule statuses
                const pendingRescheduleStatuses = [
                    "reschedule_requested",
                    "reschedule_proposed",
                ];
                
                if (pendingRescheduleStatuses.includes(rawStatus)) return true;
                
                if (rawStatus === "rescheduled" || rawStatus === "reschedule_confirmed") {
                    if (terminalStatuses.includes(status.toLowerCase())) {
                        return false;
                    }
                    return true;
                }
                
                if (job.raw?.original_scheduled_date || job.originalDate) {
                    if (terminalStatuses.includes(status.toLowerCase())) {
                        return false;
                    }
                    return true;
                }
                
                return false;
            }).length;
        } else {
            acc[tab] = jobs.filter((job) => job.status === tab).length;
        }
        return acc;
    }, {});

    const handleRescheduleConfirm = async (newDate, newStartTime, newEndTime, reason) => {
        if (!selectedJob) return;
        setError(null);
        try {
            await bookingService.proposeReschedule(selectedJob.id, {
                scheduled_date: newDate,
                scheduled_start_time: newStartTime,
                scheduled_end_time: newEndTime,
                reason: reason || "Provider proposed new time"
            });
            await fetchJobs(true);
            setModalType(null);
            setSelectedJob(null);
        } catch (err) {
            console.error(" Reschedule failed:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Failed to reschedule. Please try again.";
            setError(errorMessage);
            toast.error("Failed to reschedule", errorMessage);
        }
    };

    const confirmAction = async () => {
        if (!selectedJob) return;
        setError(null);
        try {
            if (modalType === "accept") {
                await bookingService.updateBookingStatus(selectedJob.id, "accepted");
                await fetchJobs(true);
            } else if (modalType === "decline") {
                await bookingService.cancelBooking(selectedJob.id);
                await fetchJobs(true);
            }
        } catch (err) {
            console.error(" Action failed:", err);
            const errorMessage = err.response?.data?.detail || err.message || "Action failed. Please try again.";
            setError(errorMessage);
            toast.error("Action failed", errorMessage);
        } finally {
            setModalType(null);
            setSelectedJob(null);
        }
    };

    const closeModal = () => {
        setModalType(null);
        setSelectedJob(null);
        setError(null);
    };

    const getEmptyState = (tab) => {
        return emptyStateConfigs[tab] || emptyStateConfigs["New Requests"];
    };

    if (loading) {
        return <JobsSkeleton />;
    }

    return (
        <div className="flex min-h-screen w-full overflow-x-hidden bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="min-w-0 flex-1 ml-0 lg:ml-72">
                <Navbar />
                <main className="min-w-0 pt-24 px-6 pb-6">
                    <div className="mx-auto w-full min-w-0 max-w-5xl">
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

                    {error && (
                        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 border border-red-200">
                            <p className="font-semibold">Error:</p>
                            <p>{error}</p>
                        </div>
                    )}

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
                                        {tabCounts[tab] || 0}
                                    </span>
                                    {tab === "New Requests" && tabCounts[tab] > 0 && (
                                        <span className="ml-1 text-xs text-amber-600 font-medium animate-pulse">
                                            ({tabCounts[tab]} new)
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </section>

                    {refreshing && (
                        <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-[#056db3]">
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Refreshing jobs...
                        </div>
                    )}

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
                                            const statusSubtext = getStatusSubtext(job);
                                            const hasRescheduleHistory = !!(job.raw?.original_scheduled_date || job.originalDate);
                                            const isProviderInitiated = ["provider", "service_provider", "service-provider"].includes(
                                                (job.rescheduleInitiatedBy || job.raw?.reschedule_initiated_by || "").toString().trim().toLowerCase()
                                            );
                                            const isClientInitiated = ["client", "customer"].includes(
                                                (job.rescheduleInitiatedBy || job.raw?.reschedule_initiated_by || "").toString().trim().toLowerCase()
                                            );

                                            // Determine if this is a pending reschedule that needs action
                                            const isPendingClientRequest = job.status === "Reschedule Requested" && isClientInitiated;
                                            const isPendingProviderProposal = job.status === "Reschedule Proposed" && isProviderInitiated;
                                            
                                            // If status is Accepted and has reschedule history, show as confirmed
                                            const isAcceptedReschedule = job.status === "Accepted" && hasRescheduleHistory;
                                            
                                            // Check if this is a new request
                                            const isNewRequest = job.status === "Pending" || job.status === "New Requests";

                                            return (
                                                <tr key={job.id} className={`border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors ${isNewRequest ? "bg-amber-50/30" : ""}`}>
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
                                                            {hasRescheduleHistory && job.raw?.proposed_scheduled_date && (
                                                                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    <span>Rescheduled to {formatJobDate(job.raw.proposed_scheduled_date)}</span>
                                                                </div>
                                                            )}
                                                            {statusSubtext && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Clock className="h-3 w-3 text-purple-500" />
                                                                    <span className="text-xs text-purple-600 font-medium">{statusSubtext}</span>
                                                                </div>
                                                            )}
                                                            {isAcceptedReschedule && (
                                                                <div className="flex items-center gap-1 mt-1 text-xs text-green-600">
                                                                    <CheckCircle className="h-3 w-3" />
                                                                    <span>Reschedule confirmed </span>
                                                                </div>
                                                            )}
                                                            {isNewRequest && (
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <Inbox className="h-3 w-3 text-amber-500" />
                                                                    <span className="text-xs text-amber-600 font-medium">New request - needs your response</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-center gap-2 text-gray-600">
                                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                                            <span className="text-sm max-w-32 truncate">{job.location}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex flex-col items-start gap-0.5">
                                                            <span
                                                                className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                                                                    statusStyles[job.status] || "bg-gray-100 text-gray-700"
                                                                } ${isAcceptedReschedule ? "bg-green-50 text-green-700" : ""} ${isNewRequest ? "border-2 border-amber-400 bg-amber-100 text-amber-800" : ""}`}
                                                            >
                                                                {job.status}
                                                                {isAcceptedReschedule && (
                                                                    <CheckCircle className="ml-1 inline h-3 w-3" aria-label="Reschedule confirmed" />
                                                                )}
                                                            </span>
                                                            {statusSubtext && (
                                                                <span className="text-xs text-purple-600 font-medium">
                                                                    {statusSubtext}
                                                                </span>
                                                            )}
                                                            {isAcceptedReschedule && (
                                                                <span className="text-xs text-green-600 font-medium">
                                                                    Ready to start work
                                                                </span>
                                                            )}
                                                            {isNewRequest && (
                                                                <span className="text-xs text-amber-600 font-medium">
                                                                    Awaiting your response
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <span className="text-sm font-bold font-mono text-gray-800">{job.amount}</span>
                                                    </td>
                                                    <td className="px-4 py-4 relative">
                                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                                            <Link
                                                                to={getJobDetailsPath(job)}
                                                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                                                    isNewRequest
                                                                        ? "border-2 border-amber-500 text-amber-700 "
                                                                        : isPendingClientRequest
                                                                        ? "border-2 border-amber-500 text-amber-700 hover:bg-amber-200"
                                                                        : isPendingProviderProposal
                                                                        ? "border-2 border-purple-500 text-purple-700 hover:bg-purple-200"
                                                                        : isAcceptedReschedule
                                                                        ? "border-2 border-green-700  text-green-700 hover:bg-green-50"
                                                                        : hasRescheduleHistory
                                                                        ? "text-green-700 hover:bg-green-200"
                                                                        : "text-[#056db3] hover:bg-blue-50"
                                                                }`}
                                                            >
                                                                {isNewRequest ? "Respond" : isPendingClientRequest ? "Respond" : isAcceptedReschedule ? "Start Work" : "View"}
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
                                                            <div className="absolute right-0 top-full z-40 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                                                                <button
                                                                    onClick={() => {
                                                                        navigate(`/provider/messages?client=${job.clientId || job.raw?.client_id || ''}`);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <MessageCircle className="h-4 w-4 text-gray-600" />
                                                                    Message
                                                                </button>

                                                                {isNewRequest && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('accept');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-gray-50"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                            Accept
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('decline');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {job.status === "Reschedule Requested" && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('accept');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-gray-50"
                                                                        >
                                                                            <CheckCircle className="h-4 w-4" />
                                                                            Accept New Time
                                                                        </button>
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedJob(job);
                                                                                setModalType('decline');
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                                                        >
                                                                            <XCircle className="h-4 w-4" />
                                                                            Decline
                                                                        </button>
                                                                    </>
                                                                )}

                                                                {/* Show "Propose New Time" only for Accepted/In Progress bookings without pending reschedule */}
                                                                {(job.status === "Accepted" || job.status === "In Progress") && !hasRescheduleHistory && !isNewRequest && (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedJob(job);
                                                                            setModalType("reschedule");
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:bg-gray-50"
                                                                    >
                                                                        <Clock className="h-4 w-4" />
                                                                        Propose New Time
                                                                    </button>
                                                                )}

                                                                {job.status !== "Completed" &&
                                                                 job.status !== "Cancelled" &&
                                                                 job.status !== "Paid" && (
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (!window.confirm('Cancel this booking?')) return;
                                                                            try {
                                                                                await bookingService.cancelBooking(job.id);
                                                                                await fetchJobs(true);
                                                                            } catch (e) {
                                                                                console.error(e);
                                                                                toast.error("Failed to cancel booking", "Please try again.");
                                                                            } finally {
                                                                                setOpenMenuId(null);
                                                                            }
                                                                        }}
                                                                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-50"
                                                                    >
                                                                        Cancel
                                                                    </button>
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

                    {modalType === "reschedule" && selectedJob && (
                        <RescheduleModal
                            job={selectedJob}
                            onConfirm={handleRescheduleConfirm}
                            onCancel={closeModal}
                        />
                    )}

                    {(modalType === "accept" || modalType === "decline") && selectedJob && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                            <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                                <div className="border-b border-gray-200 px-6 py-4">
                                    <h2 className="text-lg font-bold text-gray-800">
                                        {modalType === "accept" ? "Accept Job" : "Decline Job"}
                                    </h2>
                                    {selectedJob.status === "Reschedule Requested" && (
                                        <p className="text-sm text-purple-600 mt-1">
                                            This will accept the client's reschedule request
                                        </p>
                                    )}
                                    {selectedJob.status === "Pending" && (
                                        <p className="text-sm text-amber-600 mt-1">
                                            This will accept the job request from the client
                                        </p>
                                    )}
                                </div>
                                <div className="px-6 py-4">
                                    <p className="text-sm text-gray-600">
                                        {modalType === "accept"
                                            ? selectedJob.status === "Reschedule Requested"
                                                ? `Are you sure you want to accept the reschedule request from ${getClientName(selectedJob)}? The booking will be updated to the new time.`
                                                : selectedJob.status === "Pending"
                                                ? `Are you sure you want to accept this job request from ${getClientName(selectedJob)}?`
                                                : `Are you sure you want to accept this job from ${getClientName(selectedJob)}?`
                                            : `Are you sure you want to decline this job from ${getClientName(selectedJob)}? The client will be notified.`}
                                    </p>
                                    <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                        <p className="text-sm font-semibold text-gray-800">{selectedJob.service}</p>
                                        <p className="mt-1 text-xs text-gray-600">
                                            {formatJobDate(selectedJob.date)} at {selectedJob.time}
                                        </p>
                                        <p className="text-xs text-gray-600">{selectedJob.location}</p>
                                        {selectedJob.status === "Reschedule Requested" && selectedJob.raw?.proposed_scheduled_date && (
                                            <div className="mt-2 pt-2 border-t border-gray-200">
                                                <p className="text-xs font-medium text-purple-600">Proposed: {formatJobDate(selectedJob.raw.proposed_scheduled_date)} at {selectedJob.raw.proposed_scheduled_start_time} - {selectedJob.raw.proposed_scheduled_end_time}</p>
                                                {selectedJob.raw?.reschedule_reason && (
                                                    <p className="text-xs text-gray-500 mt-1">Reason: {selectedJob.raw.reschedule_reason}</p>
                                                )}
                                            </div>
                                        )}
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
                    </div>
                </main>
            </div>
        </div>
    );
}

export default MyJobs;