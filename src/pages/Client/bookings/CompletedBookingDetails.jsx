// src/pages/Client/bookings/CompletedBookingDetails.jsx - WITH PAYMENT & REVIEWS (UPDATED)

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare, Flag, Loader2, Wallet, CheckCircle2,
  XCircle, AlertCircle, CreditCard, ArrowLeft
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import paymentsService from "../../../api/paymentsService";
import reportService from "../../../api/reportService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { ProviderInfoCard } from "../../../components/cards/ProviderInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";
import { ReviewCard } from "../../../components/cards/ReviewCard";
import { useToast } from "../../../components/ui/ToastProvider";

// ─────────────────────────────────────────────
// DATE / TIME FORMATTERS
// ─────────────────────────────────────────────

function ordinalSuffix(day) {
  const d = Number(day);
  if (d % 10 === 1 && d % 100 !== 11) return `${d}st`;
  if (d % 10 === 2 && d % 100 !== 12) return `${d}nd`;
  if (d % 10 === 3 && d % 100 !== 13) return `${d}rd`;
  return `${d}th`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  const day = ordinalSuffix(parsed.getDate());
  const month = parsed.toLocaleString("en-US", { month: "long" });
  const year = parsed.getFullYear();

  return `${day} ${month} ${year}`;
}

function formatTime(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;

  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours)) return timeStr;

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return `${hours}:${minutes} ${period}`;
}

function formatTimeRange(timeStr) {
  if (!timeStr) return "";
  if (timeStr.includes(" - ")) {
    const [start, end] = timeStr.split(" - ");
    return `${formatTime(start.trim())} - ${formatTime(end.trim())}`;
  }
  return formatTime(timeStr);
}

// ─────────────────────────────────────────────
// REPORT CATEGORIES (Client reporting provider)
// ─────────────────────────────────────────────

const REPORT_CATEGORIES = [
  { value: "Poor service quality", label: "Poor service quality" },
  { value: "Provider no-show", label: "Provider no-show" },
  { value: "Overcharging / wrong amount", label: "Overcharging / wrong amount" },
  { value: "Unprofessional behaviour", label: "Unprofessional behaviour" },
  { value: "Safety concern", label: "Safety concern" },
  { value: "Fraud or scam", label: "Fraud or scam" },
  { value: "Other", label: "Other" },
];

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
// REPORT MODAL
// ─────────────────────────────────────────────

function ReportModal({ isOpen, onClose, onSubmit, loading, booking }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError("Please select a category");
      return;
    }

    if (!description || description.length < 10) {
      setError("Please provide a detailed description (minimum 10 characters)");
      return;
    }

    onSubmit({
      category,
      description,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-gray-200 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-800">Report Issue</h3>
          <p className="text-sm text-gray-500 mt-1">
            Report a problem with this booking or provider
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Booking info */}
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Booking:</span> {booking?.service || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Provider:</span> {booking?.providerName || "N/A"}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setError(null);
                setCategory(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Select a category...</option>
              {REPORT_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setError(null);
                setDescription(e.target.value);
              }}
              rows={4}
              placeholder="Please describe the issue in detail..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Minimum 10 characters
            </p>
          </div>

          {/* Info note */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">What happens next?</p>
              <p className="text-xs mt-1">Our admin team will review your report and take appropriate action. You'll be notified of any updates.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Report"}
            </button>
          </div>
        </form>
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
    const toast = useToast();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [transactionStatus, setTransactionStatus] = useState(null);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);

    // ── Payment States ──
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        phone_number: "",
        amount: "",
    });
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState(null);
    const [checkoutRequestId, setCheckoutRequestId] = useState(null);
    const [transactionId, setTransactionId] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);

        const fetchBooking = async () => {
            try {
                const b = await bookingService.getBooking(Number(bookingId));
                if (!mounted) return;
                setBooking(b);

                // Check if already paid - redirect to paid page
                if (b.status === "Paid" || b.status === "paid") {
                    navigate(`/client/my-bookings/paid/${bookingId}`);
                    return;
                }

                // Check transaction status
                try {
                    const response = await fetch(`/api/transactions/booking/${bookingId}`);
                    const data = await response.json();
                    if (mounted && data && data.length > 0) {
                        const transaction = data[0];
                        const status = transaction.status;
                        setTransactionStatus(status);
                        if (transaction.checkout_request_id) {
                            setCheckoutRequestId(transaction.checkout_request_id);
                        }
                        if (transaction.id) {
                            setTransactionId(transaction.id);
                        }
                        if (status === "SUCCESS") {
                            navigate(`/client/my-bookings/paid/${bookingId}`);
                            return;
                        }
                    }
                } catch (e) {
                    // Silently handle - no transaction yet
                }
            } catch (err) {
                console.error("Error fetching booking:", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchBooking();
        return () => { mounted = false; };
    }, [bookingId, navigate]);

    useEffect(() => {
        if (!transactionId || transactionStatus !== "PENDING") return;

        let isMounted = true;

        const pollStatus = async () => {
            try {
                const result = await paymentsService.checkTransactionStatus(transactionId);
                if (!isMounted) return;
                setTransactionStatus(result.status);
                if (result.status === "PENDING") {
                    setTimeout(pollStatus, 3000);
                    return;
                }
                if (result.status === "SUCCESS") {
                    await bookingService.updateBookingStatus(bookingId, "paid");
                    navigate(`/client/my-bookings/paid/${bookingId}`);
                    return;
                }
                if (result.status === "FAILED") {
                    setPaymentError("Payment failed. Please try again or retry the STK push.");
                }
            } catch (err) {
                if (!isMounted) return;
                setPaymentError(err.message || "Failed to update payment status.");
            }
        };

        pollStatus();

        return () => {
            isMounted = false;
        };
    }, [transactionId, transactionStatus, bookingId, navigate]);

    // ── Handle Report Submission ──
    // The backend derives who is being reported from the booking + authenticated user.
    // No reported_user_id is sent from the frontend — it's resolved server-side.
    const handleSubmitReport = async (reportData) => {
        setReportLoading(true);
        try {
            await reportService.createOrUpdateReport({
                booking_id: booking.id,
                category: reportData.category,
                description: reportData.description,
            });
            
            setReportOpen(false);
            toast.success("Report submitted", "Our team will review it shortly.");
        } catch (err) {
            console.error("Error submitting report:", err);
            const errorMsg = err.response?.data?.detail || err.message || "Failed to submit report. Please try again.";
            toast.error("Report submission failed", errorMsg);
        } finally {
            setReportLoading(false);
        }
    };

    // ── Handle Payment ──
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
        const bookingIdNum = parseInt(bookingId, 10);

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

            const result = await paymentsService.initiateSTKPush(payload);
            const checkoutId = result.checkout_request_id;
            setCheckoutRequestId(checkoutId);
            setTransactionId(result.transaction_id);
            setTransactionStatus(result.status || "PENDING");

            setShowPaymentModal(false);
            setPaymentData({ phone_number: "", amount: "" });

            if (result.status === "SUCCESS") {
                await bookingService.updateBookingStatus(bookingId, "paid");
                toast.success("Payment completed", "Your payment was successful.");
                navigate(`/client/my-bookings/paid/${bookingId}`);
                return;
            }

            toast.info("STK Push sent", `Complete the KES ${amount.toLocaleString()} payment by entering your M-Pesa PIN.`);

        } catch (err) {
            console.error("❌ Payment error:", err);
            setPaymentError(err.message || "Payment failed. Please try again.");
        } finally {
            setPaymentLoading(false);
        }
    };

    // ── Handle Message ──
    const handleMessage = () => {
        navigate(`/client/messages?provider=${booking?.serviceProviderId}`);
    };

    // ── Handle Back ──
    const handleBack = () => {
        navigate("/client/my-bookings");
    };

    // ── Loading State with Skeletons ──
    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="flex-1 ml-0 lg:ml-72">
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
                <div className="flex-1 ml-0 lg:ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Booking not found.</p>
                    </main>
                </div>
            </div>
        );
    }

    const isPaid = transactionStatus === "SUCCESS" || booking.status === "Paid" || booking.status === "paid";

    // ── Format date and time ──
    const formattedDate = formatDate(booking.date || booking.scheduled_date);
    const formattedTime = formatTimeRange(booking.time || (booking.scheduled_start_time && `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`));

    const ui = {
        id: booking.id,
        service: booking.service || booking.service_name,
        description: booking.details || booking.description,
        date: formattedDate,
        time: formattedTime,
        location: booking.location,
        status: booking.status,
        serviceFee: booking.amountRaw ? `KES ${booking.amountRaw.toLocaleString()}` : "KES 0",
        commission: `KES ${Math.round((booking.amountRaw || 0) * 0.1).toLocaleString()}`,
        totalPaid: `KES ${Math.round(booking.amountRaw || 0).toLocaleString()}`,
        commissionRate: 0.1,
        providerName: booking.providerName || booking.worker || "Provider",
        worker: {
            id: booking.serviceProviderId || booking.raw?.service_provider_id,
            name: booking.providerName || booking.worker || "Provider",
            initials: booking.initials || "--",
            trade: booking.raw?.service_provider?.service_category || null,
            rating: booking.raw?.service_provider?.average_rating || null,
            phone: booking.raw?.service_provider?.contact_phone || null,
            email: booking.raw?.service_provider?.contact_email || null,
            user_id: booking.providerUserId || booking.raw?.provider_user_id,
        },
        timeline: [
            { task: "Booking Requested", completed: true },
            { task: "Provider Accepted", completed: true },
            { task: "Work In Progress", completed: true },
            { task: "Work Completed", completed: true },
            { task: "Payment Pending", completed: isPaid },
        ],
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="client" />
            <div className="flex-1 ml-0 lg:ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">
                    {/* ── Back Button ── */}
                    <button
                        onClick={handleBack}
                        className="mb-4 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to My Bookings
                    </button>

                    <section className="mb-8">
                        <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Completed Work</h1>
                                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                                    {ui.status}
                                </span>
                                {isPaid ? (
                                    <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-2">
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

                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-center gap-3">
                            <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            <p className="text-sm text-blue-700">
                                The provider has completed the work. Please complete payment to finalize the booking.
                            </p>
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
                                isCompleted={true}
                                isApproved={false}
                            />
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
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 px-2 rounded-xl hover:bg-emerald-700 transition-colors"
                                        >
                                            <CreditCard className="w-5 h-5" />
                                            Pay Now
                                        </button>

                                        {checkoutRequestId && (
                                            <p className="text-sm text-gray-700 text-center">
                                                Checkout ID: {checkoutRequestId.substring(0, 15)}...
                                            </p>
                                        )}

                                        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-xl">
                                            <p className="font-medium">📱 Payment Instructions:</p>
                                            <ul className="list-disc pl-4 mt-1 space-y-1">
                                                <li>Enter your M-Pesa PIN on your phone when prompted.</li>
                                                <li>Payment status will update automatically.</li>
                                                <li>If the payment fails, retry the STK push.</li>
                                            </ul>
                                        </div>
                                    </>
                                )}

                                {isPaid && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                        <p className="text-sm font-semibold text-emerald-700">✅ Payment Completed</p>
                                        <p className="text-xs text-emerald-600 mt-1">Redirecting to paid page...</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleMessage}
                                    className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-2 px-2 rounded-lg hover:bg-[#045a94] transition-colors"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                    Message Provider
                                </button>

                                <button
                                    onClick={() => setReportOpen(true)}
                                    className="w-full flex items-center justify-center gap-2 border-2 border-red-500 text-red-500 py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Flag className="w-5 h-5" />
                                    Report Issue
                                </button>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm font-semibold text-gray-800 mb-3">Payment Status</p>
                                    {isPaid ? (
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex gap-2">
                                                <span className="text-emerald-600 font-bold">•</span>
                                                <span>Payment completed successfully</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-emerald-600 font-bold">•</span>
                                                <span>Provider paid instantly via M-Pesa</span>
                                            </li>
                                        </ul>
                                    ) : (
                                        <ul className="space-y-2 text-sm text-gray-700">
                                            <li className="flex gap-2">
                                                <span className="text-amber-600 font-bold">•</span>
                                                <span>Payment pending - Please complete payment on your phone</span>
                                            </li>
                                            <li className="flex gap-2">
                                                <span className="text-amber-600 font-bold">•</span>
                                                <span>Payment is processed instantly via M-Pesa</span>
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
                                        className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center"
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
                    <ReportModal
                        isOpen={reportOpen}
                        onClose={() => setReportOpen(false)}
                        onSubmit={handleSubmitReport}
                        loading={reportLoading}
                        booking={ui}
                    />
                </main>
            </div>
        </div>
    );
}

export default CompletedBookingDetails;