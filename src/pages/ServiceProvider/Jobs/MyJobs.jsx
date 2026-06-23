import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    Calendar,
    Clock3,
    MapPin,
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

function formatJobDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date(dateStr));
}

function MyJobs() {
    const [activeTab, setActiveTab] = useState("New Requests");
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [selectedJob, setSelectedJob] = useState(null);

    useEffect(() => {
        // Get provider_id from localStorage set during login
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const providerId = userData.provider_id;

        if (!providerId) {
            setError("Provider profile not found. Please log in again.");
            setLoading(false);
            return;
        }

        bookingService
            .listProviderBookings(providerId)
            .then((data) => setJobs(data || []))
            .catch((err) => {
                console.error(err);
                setError("Failed to load jobs. Please try again.");
            })
            .finally(() => setLoading(false));
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

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Loading jobs...</p>
                    </main>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-red-500">{error}</p>
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
      <section className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">My Jobs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your service requests and bookings
        </p>
      </section>

            {/* Tabs */}
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

            {/* Table */}
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto">
                        <thead className="border-b border-gray-200 bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Client</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Service</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Date & Time</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Location</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Status</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Earnings</th>
                                <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJobs.map((job) => (
                                <tr key={job.id} className="border-b border-gray-100 align-middle">
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
                                            <span className="text-sm max-w-32">{job.location}</span>
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
                                                        className="rounded-lg bg-[#056db3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        onClick={() => handleDecline(job)}
                                                        className="rounded-lg border border-red-400 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                                                    >
                                                        Decline
                                                    </button>
                                                </>
                                            )}
                                            {job.status === "In Progress" && (
                                                <button
                                                    onClick={async () => {
                                                        await bookingService.updateBookingStatus(job.id, "completed");
                                                        setJobs((prev) =>
                                                            prev.map((j) =>
                                                                j.id === job.id ? { ...j, status: "Completed" } : j
                                                            )
                                                        );
                                                    }}
                                                    className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                                                >
                                                    Complete
                                                </button>
                                            )}
                                            <Link
                                                to={`/provider/my-jobs/${job.id}`}
                                                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#056db3] hover:bg-blue-50"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredJobs.length === 0 && (
                    <div className="px-6 py-10 text-center text-sm text-gray-500">
                        No {activeTab.toLowerCase()} found.
                    </div>
                )}
            </section>

            {/* Confirm Modal */}
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
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
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