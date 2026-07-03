// src/pages/ServiceProvider/Jobs/MyJobs.jsx - Clean Empty State

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock3,
    MapPin,
    Loader2,
    RefreshCw,
    Briefcase,
    Inbox,
    UserPlus,
    CheckCircle,
    XCircle,
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

const tabs = ["New Requests", "Accepted", "In Progress", "Completed", "Cancelled"];

const statusStyles = {
    "New Requests": "bg-amber-100 text-amber-800",
    Accepted: "bg-sky-100 text-sky-800",
    "In Progress": "bg-blue-100 text-blue-800",
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
        color: "bg-blue-50",
        iconColor: "text-blue-500",
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

    return `/provider/my-jobs/new/${job.id}`;
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
// MAIN COMPONENT
// ─────────────────────────────────────────────

function MyJobs() {
    const [activeTab, setActiveTab] = useState("New Requests");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalType, setModalType] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    // ── Fetch Jobs ──
    const fetchJobs = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        // Get provider_id from localStorage
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
            // Silently handle - just set empty array
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
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4">
                            <Loader2 className="h-12 w-12 animate-spin text-[#056db3]" />
                            <p className="text-gray-500">Loading your jobs...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
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
                                    className={`flex items-center gap-2 border-b-[3px] px-6 py-3.5 text-base transition-colors ${
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
                                        {filteredJobs.map((job) => (
                                            <tr key={job.id} className="border-b border-gray-100 align-middle hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                                                            {job.clientInitials}
                                                        </div>
                                                        <span className="text-sm font-semibold text-gray-800">
                                                            {job.client}
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
                                                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[job.status]}`}>
                                                        {job.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm font-bold text-gray-800">{job.amount}</span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                                        {job.status === "New Requests" && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleAccept(job)}
                                                                    className="rounded-lg bg-[#056db3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                                                                >
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDecline(job)}
                                                                    className="rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors"
                                                                >
                                                                    Decline
                                                                </button>
                                                            </>
                                                        )}
                                                        {job.status === "In Progress" && (
                                                            <button
                                                                onClick={async () => {
                                                                    try {
                                                                        await bookingService.updateBookingStatus(job.id, "completed");
                                                                        setJobs((prev) =>
                                                                            prev.map((j) =>
                                                                                j.id === job.id ? { ...j, status: "Completed" } : j
                                                                            )
                                                                        );
                                                                    } catch (err) {
                                                                        console.error("Failed to complete job:", err);
                                                                    }
                                                                }}
                                                                className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                        <Link
                                                            to={getJobDetailsPath(job)}
                                                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#056db3] hover:bg-blue-50 transition-colors"
                                                        >
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
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
                                            ? `Are you sure you want to accept this job from ${selectedJob.client}?`
                                            : `Are you sure you want to decline this job from ${selectedJob.client}? The client will be notified.`}
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