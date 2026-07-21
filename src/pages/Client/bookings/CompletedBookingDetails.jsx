// src/pages/Client/bookings/CompletedBookingDetails.jsx - WITH SKELETON LOADERS

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Flag, Loader2, ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { ProviderInfoCard } from "../../../components/cards/ProviderInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";

// ─────────────────────────────────────────────
// SKELETON LOADER COMPONENTS
// ─────────────────────────────────────────────

function SkeletonCard() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6"></div>
            <div className="space-y-6">
                <div>
                    <div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2"></div>
                    <div className="h-6 w-48 animate-pulse rounded bg-gray-100"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
                        <div>
                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2"></div>
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100"></div>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
                        <div>
                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2"></div>
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100"></div>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2"></div>
                        <div className="h-5 w-48 animate-pulse rounded bg-gray-100"></div>
                    </div>
                </div>
                <div>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200 mb-2"></div>
                    <div className="h-5 w-64 animate-pulse rounded bg-gray-100"></div>
                </div>
            </div>
        </section>
    );
}

function SkeletonProviderCard() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200 mb-6"></div>
            <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200"></div>
                <div className="flex-1">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200 mb-2"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100"></div>
                </div>
            </div>
            <div className="flex flex-col gap-3 mb-6 sm:flex-row">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200"></div>
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>
        </section>
    );
}

function SkeletonTimeline() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6"></div>
            <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-start gap-4">
                        <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200"></div>
                        <div className="flex-1">
                            <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function SkeletonPaymentDetails() {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6"></div>
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-5 w-20 animate-pulse rounded bg-gray-200"></div>
                    </div>
                ))}
                <div className="border-t border-gray-300 pt-2"></div>
                <div className="flex justify-between items-center py-2">
                    <div className="h-5 w-28 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-7 w-24 animate-pulse rounded bg-gray-200"></div>
                </div>
            </div>
            <div className="h-14 w-full animate-pulse rounded-lg bg-gray-100 mt-4"></div>
        </section>
    );
}

function SkeletonSidebar() {
    return (
        <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="h-7 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
            <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200"></div>
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 mb-3"></div>
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function CompletedBookingDetails() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [reportOpen, setReportOpen] = useState(false);
    const [reportText, setReportText] = useState("");

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        
        const fetchBooking = async () => {
            try {
                const b = await bookingService.getBooking(Number(bookingId));
                if (!mounted) return;
                setBooking(b);
            } catch (err) {
                console.error("Error fetching booking:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        
        fetchBooking();
        return () => { mounted = false; };
    }, [bookingId]);

    // ── Handle Approve Work ──
    const handleApproveWork = async () => {
        if (!window.confirm("Have you reviewed the completed work and are you satisfied? This will approve the work and proceed to payment.")) {
            return;
        }

        setActionLoading(true);
        try {
            await bookingService.updateBookingStatus(bookingId, "approved");
            const updated = await bookingService.getBooking(Number(bookingId));
            setBooking(updated);
            window.alert("✅ Work approved! Please proceed with payment.");
            // Navigate to approved page
            // /client/my-bookings/approved/:bookingId
            navigate(`/client/my-bookings/approved/${bookingId}`);
        } catch (err) {
            console.error(err);
            window.alert("Failed to approve work: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Handle Reject Work ──
    const handleRejectWork = async () => {
        if (!rejectReason.trim()) {
            window.alert("Please provide a reason for rejecting the work.");
            return;
        }

        setActionLoading(true);
        try {
            await bookingService.updateBookingStatus(bookingId, "rejected", rejectReason);
            const updated = await bookingService.getBooking(Number(bookingId));
            setBooking(updated);
            setShowRejectModal(false);
            setRejectReason("");
            window.alert("❌ Work rejected. No payment will be processed.");
            // Navigate to rejected page
            navigate(`/client/bookings/rejected/${bookingId}`);
        } catch (err) {
            console.error(err);
            window.alert("Failed to reject work: " + err.message);
        } finally {
            setActionLoading(false);
        }
    };

    // ── Handle Message ──
    const handleMessage = () => {
        navigate(`/client/messages?provider=${booking?.serviceProviderId}`);
    };

    // ── Submit Report ──
    const submitReport = async () => {
        if (!reportText) {
            window.alert("Please add a reason for the report.");
            return;
        }
        setReportText("");
        setReportOpen(false);
        window.alert("Report submitted. Our team will review it.");
    };

    // ── Loading State with Skeletons ──
    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6">
                        <section className="mb-8">
                            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                                <div>
                                    <div className="h-9 w-64 animate-pulse rounded bg-gray-200 mb-2"></div>
                                    <div className="h-5 w-32 animate-pulse rounded bg-gray-100"></div>
                                </div>
                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200"></div>
                                    <div className="h-10 w-36 animate-pulse rounded-full bg-gray-200"></div>
                                </div>
                            </div>
                        </section>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <SkeletonCard />
                                <SkeletonProviderCard />
                                <SkeletonTimeline />
                                <SkeletonPaymentDetails />
                            </div>
                            <div className="lg:col-span-1">
                                <SkeletonSidebar />
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Booking not found.</p>
                    </main>
                </div>
            </div>
        );
    }

    const ui = {
        id: booking.id,
        service: booking.service || booking.service_name,
        description: booking.details || booking.description,
        date: booking.date || booking.scheduled_date,
        time: booking.time || (booking.scheduled_start_time && `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`),
        location: booking.location,
        status: booking.status,
        serviceFee: booking.amountRaw ? `KES ${booking.amountRaw.toLocaleString()}` : "KES 0",
        commission: `KES ${Math.round((booking.amountRaw || 0) * 0.1).toLocaleString()}`,
        totalPaid: `KES ${Math.round(booking.amountRaw || 0).toLocaleString()}`,
        commissionRate: 0.1,
        worker: {
            id: booking.serviceProviderId || booking.raw?.service_provider_id,
            name: booking.providerName || booking.worker || "Provider",
            initials: booking.initials || "--",
            trade: booking.raw?.service_provider?.service_type || null,
            rating: booking.raw?.service_provider?.rating || null,
            phone: booking.raw?.service_provider?.contact_phone || null,
            email: booking.raw?.service_provider?.contact_email || null,
        },
        timeline: [
            { task: "Requested", completed: true },
            { task: "Scheduled", completed: true },
            { task: "In Progress", completed: true },
            { task: "Completed", completed: true },
            { task: "Approved", completed: false },
        ],
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="client" />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">
                    <section className="mb-8">
                        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Work Completed</h1>
                                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {ui.status}
                                </span>
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-700 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Awaiting Review
                                </span>
                            </div>
                        </div>
                    </section>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <BookingInfoCard booking={ui} />
                            <ProviderInfoCard worker={ui.worker} />
                            <Timeline items={ui.timeline} />
                            <PaymentDetailsCard 
                                booking={ui}
                                isPaid={false}
                                isPaymentPending={false}
                                isPaymentProcessing={false}
                                isRejected={false}
                                isCancelled={false}
                                isCompleted={true}
                                isApproved={false}
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">Review Work</h2>

                                {/* ── Approve Work Button ── */}
                                <button
                                    onClick={handleApproveWork}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ThumbsUp className="w-5 h-5" />}
                                    Approve Work
                                </button>

                                {/* ── Reject Work Button ── */}
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-red-400 text-red-600 py-3 px-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    <ThumbsDown className="w-5 h-5" />
                                    Reject Work
                                </button>

                                {/* ── Message Provider ── */}
                                <button
                                    onClick={handleMessage}
                                    className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Message Provider
                                </button>

                                {/* ── Report Issue ── */}
                                <button
                                    onClick={() => setReportOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <Flag className="w-5 h-5" />
                                    Report Issue
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800 mb-3">Review Notes</p>
                                    <ul className="space-y-2 text-sm text-gray-700">
                                        <li className="flex gap-2">
                                            <span className="text-[#056db3] font-bold">•</span>
                                            <span>Review the work carefully before approving</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-[#056db3] font-bold">•</span>
                                            <span>Approval means you're satisfied with the work</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <span className="text-[#056db3] font-bold">•</span>
                                            <span>Rejection requires a reason for the provider</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Reject Modal ── */}
                    {showRejectModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-red-800 mb-2">Reject Work</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Please provide a reason for rejecting this work. This will help the provider understand and improve.
                                </p>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={4}
                                    className="w-full rounded-xl border border-red-200 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    placeholder="Explain why the work is being rejected..."
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            setShowRejectModal(false);
                                            setRejectReason("");
                                        }}
                                        className="px-4 py-2 rounded-lg border border-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleRejectWork}
                                        disabled={actionLoading}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Reject"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Report Modal ── */}
                    {reportOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="w-full max-w-lg rounded-xl bg-white shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Issue</h3>
                                <textarea
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    rows={6}
                                    className="w-full rounded-xl border border-blue-200 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Describe the issue..."
                                />
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setReportOpen(false)}
                                        className="px-4 py-2 rounded-lg border border-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitReport}
                                        className="px-4 py-2 rounded-lg bg-[#056db3] text-white"
                                    >
                                        Submit Report
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

export default CompletedBookingDetails;