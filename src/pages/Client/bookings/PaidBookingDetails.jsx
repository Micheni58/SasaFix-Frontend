// src/pages/Client/bookings/PaidBookingDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { 
  MessageSquare, 
  Flag, 
  Loader2, 
  CheckCircle2, 
  CreditCard,
  Download,
  ArrowLeft
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { ProviderInfoCard } from "../../../components/cards/ProviderInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";
import { ReviewCard } from "../../../components/cards/ReviewCard";
import { SasaFixReceipt } from "../../../components/SasaFixReceipt";
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
// SKELETON LOADER
// ─────────────────────────────────────────────

function PaidBookingSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="animate-pulse">
            <section className="mb-8">
              <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                <div>
                  <div className="h-9 w-64 animate-pulse rounded bg-gray-200 mb-2" />
                  <div className="h-5 w-32 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6" />
                  <div className="space-y-6">
                    <div>
                      <div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-6 w-48 animate-pulse rounded bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      {[0, 1].map((i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                          <div>
                            <div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2" />
                            <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6" />
                    <div className="h-24 w-full animate-pulse rounded bg-gray-100" />
                  </div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-28 w-full animate-pulse rounded-lg bg-gray-100" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DOWNLOAD BUTTON
// ─────────────────────────────────────────────

/**
 * Wraps PDFDownloadLink so it only mounts after the booking data is ready.
 * PDFDownloadLink needs a stable document prop — avoid passing it inline
 * before `ui` exists, or react-pdf will throw.
 */
function ReceiptDownloadButton({ ui, role = "client" }) {
  const fileName = `SasaFix-Receipt-${role}-Booking-${ui.id}.pdf`;

  return (
    <PDFDownloadLink
      document={<SasaFixReceipt booking={ui} role={role} />}
      fileName={fileName}
    >
      {({ loading: pdfLoading, error }) => (
        <button
          disabled={pdfLoading}
          className="w-full flex items-center justify-center gap-2 border-2 border-emerald-600 text-emerald-600 py-2 px-2 rounded-lg hover:bg-emerald-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pdfLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Receipt...
            </>
          ) : error ? (
            <>
              <Download className="w-5 h-5" />
              Retry Download
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download Receipt
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function PaidBookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleMessage = () => {
    navigate(`/client/messages?provider=${booking?.serviceProviderId}`);
  };

  const handleBack = () => {
    navigate("/client/my-bookings");
  };

  const submitReport = async () => {
    if (!reportText) {
      toast.warning("Report reason required", "Please add a reason for the report.");
      return;
    }
    setReportText("");
    setReportOpen(false);
    toast.success("Report submitted", "Our team will review it.");
  };

  if (loading) return <PaidBookingSkeleton />;

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

  // ── Format date and time ──
  const formattedDate = formatDate(booking.date || booking.scheduled_date);
  const formattedTime = formatTimeRange(
    booking.time ||
    (booking.scheduled_start_time &&
      `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`)
  );

  const ui = {
    id: booking.id,
    service: booking.service || booking.service_name,
    description: booking.details || booking.description,
    date: formattedDate,
    time: formattedTime,
    location: booking.location,
    status: booking.status,
    amountRaw: booking.amountRaw || 0,
    serviceFee: booking.amountRaw
      ? `KES ${booking.amountRaw.toLocaleString()}`
      : "KES 0",
    commission: `KES ${Math.round((booking.amountRaw || 0) * 0.1).toLocaleString()}`,
    totalPaid: `KES ${Math.round(booking.amountRaw || 0).toLocaleString()}`,
    commissionRate: 0.1,
    isPremium: booking.raw?.service_provider?.is_premium || false,
    paidAt: booking.paidAt || booking.raw?.paid_at || new Date().toISOString(),
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
      { task: "Booking Requested", completed: true },
      { task: "Provider Accepted", completed: true },
      { task: "Work In Progress", completed: true },
      { task: "Work Completed", completed: true },
      { task: "Payment Processed", completed: true },
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

          {/* ── Header ── */}
          <section className="mb-8">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Payment Completed</h1>
                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Paid
              </span>
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              <p className="text-sm text-emerald-700">
                Payment of <strong>{ui.serviceFee}</strong> has been processed successfully.
                Thank you for using SasaFix!
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Main Content ── */}
            <div className="lg:col-span-2 space-y-6">
              <BookingInfoCard booking={ui} />
              <ProviderInfoCard worker={ui.worker} />
              <Timeline items={ui.timeline} />
              <PaymentDetailsCard
                booking={ui}
                isPaid={true}
                isPaymentPending={false}
                isPaymentProcessing={false}
                isRejected={false}
                isCancelled={false}
                isCompleted={true}
                isApproved={false}
              />
              <ReviewCard
                bookingId={ui.id}
                providerId={ui.worker.id}
                providerName={ui.worker.name}
                booking={booking}
              />
            </div>

            {/* ── Sidebar ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {/* ── Payment Confirmation ── */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-emerald-700">Payment Complete</p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Paid on {new Date(ui.paidAt).toLocaleDateString()} at{" "}
                    {new Date(ui.paidAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* ── Download Receipt (PDF) ── */}
                <ReceiptDownloadButton ui={ui} role="client" />

                {/* ── Message Provider ── */}
                <button
                  onClick={handleMessage}
                  className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors mt-2"
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

                {/* ── Payment Summary ── */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Payment Summary</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Payment processed successfully</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Service completed</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Leave a review to help others</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

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

export default PaidBookingDetails;