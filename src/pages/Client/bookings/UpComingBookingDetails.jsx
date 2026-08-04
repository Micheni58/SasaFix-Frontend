// src/pages/Client/bookings/UpcomingBookingDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock3, MapPin, MessageSquare, RotateCcw, Flag, Loader2, XCircle, CheckCircle2 } from "lucide-react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { ProviderInfoCard } from "../../../components/cards/ProviderInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";

// ─────────────────────────────────────────────
// DATE / TIME FORMATTERS
// ─────────────────────────────────────────────

// Adds ordinal suffix: 1 -> 1st, 2 -> 2nd, 3 -> 3rd, 19 -> 19th, etc.
function ordinalSuffix(day) {
  const d = Number(day);
  if (d % 10 === 1 && d % 100 !== 11) return `${d}st`;
  if (d % 10 === 2 && d % 100 !== 12) return `${d}nd`;
  if (d % 10 === 3 && d % 100 !== 13) return `${d}rd`;
  return `${d}th`;
}

// Formats a date string (e.g. "2026-08-19") into "19th August 2026"
function formatDate(dateStr) {
  if (!dateStr) return "";
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return dateStr;

  const day = ordinalSuffix(parsed.getDate());
  const month = parsed.toLocaleString("en-US", { month: "long" });
  const year = parsed.getFullYear();

  return `${day} ${month} ${year}`;
}

// Formats a 24hr time string (e.g. "09:00" or "09:00:00") into "9:00 AM"
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

// Formats a time range "start - end" (e.g. "09:00 - 10:00") into "9:00 AM - 10:00 AM"
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

function UpcomingBookingSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="animate-pulse">
            {/* Header Skeleton */}
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
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                        <div>
                          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2" />
                          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                        <div>
                          <div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2" />
                          <div className="h-5 w-24 animate-pulse rounded bg-gray-100" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2" />
                        <div className="h-5 w-48 animate-pulse rounded bg-gray-100" />
                      </div>
                    </div>
                    <div>
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-5 w-64 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-7 w-48 animate-pulse rounded bg-gray-200 mb-6" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-gray-200" />
                    <div className="flex-1">
                      <div className="h-5 w-32 animate-pulse rounded bg-gray-200 mb-2" />
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mb-6 sm:flex-row">
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                    <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                  </div>
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-5 w-5 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1">
                          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-7 w-40 animate-pulse rounded bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex justify-between items-center py-2">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                        <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                      </div>
                    ))}
                    <div className="border-t border-gray-300 pt-2" />
                    <div className="flex justify-between items-center py-2">
                      <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                      <div className="h-7 w-24 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-14 w-full animate-pulse rounded-lg bg-gray-100 mt-4" />
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="h-7 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="h-12 w-full animate-pulse rounded-lg bg-gray-200" />
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="h-5 w-32 animate-pulse rounded bg-gray-200 mb-3" />
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                        <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
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
// RESCHEDULE MODAL (FIXED)
// ─────────────────────────────────────────────

function RescheduleModal({ job, onConfirm, onCancel }) {
  const [date, setDate] = useState(job?.date || "");
  const [startTime, setStartTime] = useState(
    job?.time ? job.time.split(" - ")[0] || "" : ""
  );
  const [endTime, setEndTime] = useState(
    job?.time ? job.time.split(" - ")[1] || "" : ""
  );

  // ── FIX: Get the provider name safely ──
  const getProviderName = () => {
    if (!job) return "Provider";
    if (typeof job.worker === 'string') return job.worker;
    if (job.worker?.name) return job.worker.name;
    if (job.providerName) return job.providerName;
    if (job.worker?.providerName) return job.worker.providerName;
    return "Provider";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      alert("Please fill in all fields");
      return;
    }
    onConfirm(date, startTime, endTime);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">Reschedule Booking</h2>
          <p className="text-sm text-gray-500 mt-1">
            {job?.service || "Service"} with {getProviderName()}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">⚠️ Rescheduling this booking will:</p>
            <ul className="mt-1 list-disc list-inside text-xs">
              <li>Move it to the "Rescheduled" tab</li>
              <li>Notify the provider of the new date/time</li>
              <li>Require re-confirmation from the provider</li>
            </ul>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94] transition-colors"
            >
              Send Reschedule Request
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

function UpcomingBookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportText, setReportText] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

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

  // ── Handle Reschedule ──
  const handleReschedule = async (newDate, newStartTime, newEndTime) => {
    setActionLoading(true);
    try {
      await bookingService.rescheduleBooking(booking.id, {
        scheduled_date: newDate,
        scheduled_start_time: newStartTime,
        scheduled_end_time: newEndTime
      });
      const updated = await bookingService.getBooking(Number(bookingId));
      setBooking(updated);
      setShowRescheduleModal(false);
      window.alert("✅ Reschedule request submitted. Provider will need to accept.");
    } catch (err) {
      console.error(err);
      window.alert("Failed to submit reschedule request.");
    } finally { 
      setActionLoading(false); 
    }
  };

  // ── Handle Cancel ──
  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      setActionLoading(true);
      const updated = await bookingService.cancelBooking(booking.id);
      if (updated) {
        setBooking(updated);
        window.alert("Booking cancelled.");
      }
    } catch (err) {
      console.error(err);
      window.alert("Failed to cancel booking.");
    } finally { setActionLoading(false); }
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

  // ── Loading state ──
  if (loading) {
    return <UpcomingBookingSkeleton />;
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

  // ── Format date and time ──
  const formattedDate = formatDate(booking.date || booking.scheduled_date);
  const formattedTime = formatTimeRange(booking.time || (booking.scheduled_start_time && `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`));

  // ── Get provider name as string ──
  const providerName = typeof booking.providerName === 'string' 
    ? booking.providerName 
    : booking.worker || "Provider";

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
    worker: providerName, // Now always a string
    providerName: providerName,
    workerObj: {
      id: booking.serviceProviderId || booking.raw?.service_provider_id,
      name: providerName,
      initials: booking.initials || "--",
      trade: booking.raw?.service_provider?.service_type || null,
      rating: booking.raw?.service_provider?.rating || null,
      phone: booking.raw?.service_provider?.contact_phone || null,
      email: booking.raw?.service_provider?.contact_email || null,
    },
    timeline: [
      { task: "Booking Requested", completed: true },
      { task: "Provider Accepted", completed: true },
      { task: "Work In Progress", completed: false },
      { task: "Work Completed", completed: false },
      { task: "Payment Processed", completed: false },
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
                <h1 className="text-3xl font-bold text-gray-800">Upcoming Booking</h1>
                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                {ui.status}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <BookingInfoCard booking={ui} />
              <ProviderInfoCard worker={ui.workerObj} />
              <Timeline items={ui.timeline} />
              <PaymentDetailsCard 
                booking={ui}
                isPaid={false}
                isPaymentPending={false}
                isPaymentProcessing={false}
                isRejected={false}
                isCancelled={false}
                isCompleted={false}
              />
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                <button
                  onClick={handleMessage}
                  className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-3 px-2 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  <MessageSquare className="w-5 h-5" />
                  Message Provider
                </button>

                <button
                  onClick={() => setShowRescheduleModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-3 px-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                  Reschedule Booking
                </button>

                <button
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-500 py-3 px-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Cancel Booking
                </button>

                <button
                  onClick={() => setReportOpen(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Flag className="w-5 h-5" />
                  Report Issue
                </button>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Booking Status</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Awaiting provider confirmation</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>You can reschedule or cancel if needed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reschedule Modal ── */}
          {showRescheduleModal && (
            <RescheduleModal
              job={ui}
              onConfirm={handleReschedule}
              onCancel={() => setShowRescheduleModal(false)}
            />
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

export default UpcomingBookingDetails;