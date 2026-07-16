// src/pages/Client/bookings/ApprovedBookingDetails.jsx - WITH REVIEW CARD

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Flag, Loader2, Wallet, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import bookingService from "../../../api/bookingService";
import paymentsService from "../../../api/paymentsService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { ProviderInfoCard } from "../../../components/cards/ProviderInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";
import { ReviewCard } from "../../../components/cards/ReviewCard";

// ─────────────────────────────────────────────
// SKELETON LOADER COMPONENTS
// ─────────────────────────────────────────────

function SkeletonCard() {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
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

function SkeletonReviewCard() {
    return (
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-1">
                <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
                <div className="h-7 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="h-4 w-64 animate-pulse rounded bg-gray-100 mb-5"></div>
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4"></div>
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
            <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 mt-4"></div>
        </section>
    );
}

function SkeletonSidebar() {
    return (
        <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
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

function ApprovedBookingDetails() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportText, setReportText] = useState("");

    // ── Payment States ──
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        phone_number: "",
        amount: "",
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    // ── Manual Callback States ──
    const [checkoutRequestId, setCheckoutRequestId] = useState(null);
    const [testMode, setTestMode] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const fetchBooking = async () => {
            try {
                const b = await bookingService.getBooking(Number(bookingId));
                if (!mounted) return;
                setBooking(b);

                try {
                    const response = await fetch(`/api/transactions/booking/${bookingId}`);
                    const data = await response.json();
                    if (mounted && data && data.length > 0) {
                        setTransactionStatus(data[0].status);
                        if (data[0].checkout_request_id) {
                            setCheckoutRequestId(data[0].checkout_request_id);
                        }
                    }
                } catch (e) {
                    // Silently handle
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchBooking();
        return () => { mounted = false; };
    }, [bookingId]);

    // ── Handle Payment (with Manual Callback for Testing) ──
    const handlePayment = async () => {
        const phone = paymentData.phone_number.trim();
        const amount = parseFloat(paymentData.amount);

        if (!phone) {
            setPaymentError("Please enter your M-Pesa phone number");
            return;
        }

        const cleanPhone = phone.replace(/\s/g, '');
        if (!cleanPhone.match(/^254[0-9]{9}$/)) {
            setPaymentError("Phone number must be in format: 2547XXXXXXXX");
            return;
        }

        if (!amount || amount <= 0) {
            setPaymentError("Please enter a valid amount");
            return;
        }

        const clientId = booking?.client_id || booking?.raw?.client_id;
        const providerId = booking?.serviceProviderId || booking?.raw?.service_provider_id;
        const bookingIdNum = parseInt(bookingId);

        if (!clientId || !providerId) {
            setPaymentError("Missing required information. Please refresh.");
            return;
        }

        setPaymentLoading(true);
        setPaymentError(null);

        try {
            const payload = {
                phone_number: cleanPhone,
                amount: amount,
                booking_id: bookingIdNum,
                client_id: clientId,
                provider_id: providerId,
                commission_rate: 10,
            };

            console.log("📤 Sending payment payload:", payload);

            const result = await paymentsService.initiateSTKPush(payload);

            const checkoutId = result.checkout_request_id;
            setCheckoutRequestId(checkoutId);

            console.log("✅ STK Push result:", result);

            alert(
                `✅ STK Push sent!\n\n` +
                `Checkout ID: ${checkoutId}\n` +
                `Amount: KES ${amount.toLocaleString()}\n\n` +
                `📱 In TEST MODE, the transaction will auto-complete in 3 seconds.`
            );

            setShowPaymentModal(false);
            setPaymentData({ phone_number: "", amount: "" });

            // 🔥 AUTO-COMPLETE TRANSACTION (TEST MODE ONLY)
            if (testMode && checkoutId) {
                console.log("⏳ Auto-completing transaction in 3 seconds...");

                setTimeout(async () => {
                    try {
                        console.log("🔄 Triggering manual callback for:", checkoutId);

                        await paymentsService.triggerManualCallback(
                            checkoutId,
                            0, // 0 = Success
                            amount
                        );

                        console.log("✅ Transaction auto-completed successfully!");

                        const updated = await bookingService.getBooking(Number(bookingId));
                        setBooking(updated);

                        const response = await fetch(`/api/transactions/booking/${bookingId}`);
                        const data = await response.json();
                        if (data && data.length > 0) {
                            setTransactionStatus(data[0].status);
                        }

                        alert("✅ Payment completed successfully! (Test Mode)");

                    } catch (callbackErr) {
                        console.error("❌ Auto-complete failed:", callbackErr);
                        alert("⚠️ Auto-complete failed. Please click 'Complete Payment (Manual)' button below.");
                    }
                }, 3000);
            }

        } catch (err) {
            console.error("❌ Payment error:", err);
            setPaymentError(err.message || "Payment failed. Please try again.");
        } finally {
            setPaymentLoading(false);
        }
    };

    // ── Handle Manual Callback ──
    const handleManualComplete = async () => {
        if (!checkoutRequestId) {
            alert("No checkout request ID found. Please initiate a payment first.");
            return;
        }

        try {
            setPaymentLoading(true);
            const amount = parseFloat(paymentData.amount) || booking?.amountRaw || 100;

            await paymentsService.triggerManualCallback(
                checkoutRequestId,
                0, // 0 = Success
                amount
            );
            alert("✅ Transaction completed manually!");

            const updated = await bookingService.getBooking(Number(bookingId));
            setBooking(updated);

            const response = await fetch(`/api/transactions/booking/${bookingId}`);
            const data = await response.json();
            if (data && data.length > 0) {
                setTransactionStatus(data[0].status);
            }

            setCheckoutRequestId(null);

        } catch (err) {
            alert("Failed to complete transaction: " + err.message);
        } finally {
            setPaymentLoading(false);
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
                                <SkeletonReviewCard />
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

    const isPaid = transactionStatus === "COMPLETED" || transactionStatus === "RELEASED";
    const isPaymentPending = !isPaid;

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
            { task: "Approved", completed: true },
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
                                <h1 className="text-3xl font-bold text-gray-800">Approved Booking</h1>
                                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {ui.status}
                                </span>
                                {isPaid ? (
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-700 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Payment Complete
                                    </span>
                                ) : (
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-700 flex items-center gap-2">
                                        ⏳ Payment Pending
                                    </span>
                                )}
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
                                isPaid={isPaid}
                                isPaymentPending={!isPaid}
                                isPaymentProcessing={false}
                                isRejected={false}
                                isCancelled={false}
                                isCompleted={false}
                                isApproved={true}
                            />

                            {/* ── Review section — only once payment is complete ── */}
                            {isPaid && (
                                <ReviewCard
                                    bookingId={ui.id}
                                    providerId={ui.worker.id}
                                    providerName={ui.worker.name}
                                    booking={booking}
                                />
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-6 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
                                <h2 className="text-xl font-bold text-gray-800">Payment Action</h2>

                                {!isPaid && (
                                    <>
                                        {/* ── Pay Now Button ── */}
                                        <button
                                            onClick={() => {
                                                const defaultAmount = booking?.amountRaw || booking?.raw?.amount || 100;
                                                setShowPaymentModal(true);
                                                setPaymentError(null);
                                                setPaymentData({
                                                    phone_number: "254708374149",
                                                    amount: defaultAmount.toString(),
                                                });
                                            }}
                                            className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-3 px-2 rounded-xl hover:bg-[#045a94] transition-colors"
                                        >
                                            <Wallet className="w-5 h-5" />
                                            Complete Payment
                                        </button>

                                        {/* ── Manual Complete Button (appears after payment initiated) ── */}
                                        {checkoutRequestId && (
                                            <button
                                                onClick={handleManualComplete}
                                                disabled={paymentLoading}
                                                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2 px-2 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                                            >
                                                {paymentLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                                                Complete Payment (Manual)
                                            </button>
                                        )}

                                        {checkoutRequestId && (
                                            <p className="text-xs text-gray-500 text-center">
                                                Checkout ID: {checkoutRequestId.substring(0, 15)}...
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                                            <p className="font-medium">📱 Test Instructions:</p>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>Use test number: <strong>254708374149</strong></li>
                                                <li>Transaction auto-completes in 3 seconds</li>
                                                <li>Or click "Complete Payment (Manual)"</li>
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {isPaid && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                        <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-green-700">✅ Payment Completed</p>
                                        <p className="text-xs text-green-600 mt-1">This booking is complete.</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleMessage}
                                    className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-2 px-2 rounded-xl hover:bg-[#045a94] transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Message Provider
                                </button>

                                <button
                                    onClick={() => setReportOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-2 px-2 rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    <Flag className="w-5 h-5" />
                                    Report Issue
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800 mb-3">Payment Status</p>
                                    {isPaid ? (
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex gap-2">
                                                <span className="text-green-600 font-bold">•</span>
                                                <span>Payment completed successfully</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-green-600 font-bold">•</span>
                                                <span>Funds held in escrow</span>
                                            </li>
                                        </ul>
                                    ) : (
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex gap-2">
                                                <span className="text-amber-600 font-bold">•</span>
                                                <span>Payment pending - Please complete payment</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-amber-600 font-bold">•</span>
                                                <span>Funds will be held in escrow until completion</span>
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Payment Modal ── */}
                    {showPaymentModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-800">Complete Payment</h2>
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPaymentError(null);
                                            setPaymentData({ phone_number: "", amount: "" });
                                        }}
                                        className="rounded-lg p-1 hover:bg-gray-100"
                                    >
                                        <XCircle className="h-6 w-6 text-gray-500" />
                                    </button>
                                </div>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter your M-Pesa number and amount to complete the payment.
                                </p>

                                {paymentError && (
                                    <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                        <AlertCircle className="inline h-4 w-4 mr-1" />
                                        {paymentError}
                                    </div>
                                )}

                                <div className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Amount (KES)
                                        </label>
                                        <input
                                            type="number"
                                            value={paymentData.amount}
                                            onChange={(e) =>
                                                setPaymentData({
                                                    ...paymentData,
                                                    amount: e.target.value,
                                                })
                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                            placeholder="Enter amount"
                                            min="1"
                                            step="1"
                                        />
                                        <p className="mt-1 text-xs text-gray-400">
                                            Test amounts: 1, 10, 100, 1000
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            M-Pesa Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={paymentData.phone_number}
                                            onChange={(e) =>
                                                setPaymentData({
                                                    ...paymentData,
                                                    phone_number: e.target.value,
                                                })
                                            }
                                            placeholder="e.g., 254708374149"
                                            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                        />
                                        <p className="mt-1 text-xs text-gray-400">
                                            Test number: 254708374149 (sandbox)
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPaymentError(null);
                                            setPaymentData({ phone_number: "", amount: "" });
                                        }}
                                        className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handlePayment}
                                        disabled={paymentLoading}
                                        className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                                    >
                                        {paymentLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Pay Now"
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Report Modal ── */}
                    {reportOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                            <div className="w-full max-w-lg rounded-2xl bg-white shadow-lg p-6">
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

export default ApprovedBookingDetails;