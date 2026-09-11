// src/pages/Client/bookings/UpcomingBookingDetails.jsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock3, MapPin, MessageSquare, RotateCcw, Flag, Loader2, XCircle, CheckCircle2, AlertCircle, ArrowLeft, Clock } from "lucide-react";
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

function UpcomingBookingSkeleton() {
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
                    <div><div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2" /><div className="h-6 w-48 animate-pulse rounded bg-gray-100" /></div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                        <div><div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2" /><div className="h-5 w-24 animate-pulse rounded bg-gray-100" /></div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                        <div><div className="h-4 w-12 animate-pulse rounded bg-gray-200 mb-2" /><div className="h-5 w-24 animate-pulse rounded bg-gray-100" /></div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
                      <div className="flex-1"><div className="h-4 w-16 animate-pulse rounded bg-gray-200 mb-2" /><div className="h-5 w-48 animate-pulse rounded bg-gray-100" /></div>
                    </div>
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
// RESCHEDULE MODAL - WITH PRE-FILLED DATA
// ─────────────────────────────────────────────

function RescheduleModal({ job, onConfirm, onCancel, loading, error }) {
  const [date, setDate] = useState(job?.rawDate || "");
  const [startTime, setStartTime] = useState(job?.rawStartTime || "");
  const [endTime, setEndTime] = useState(job?.rawEndTime || "");
  const [reason, setReason] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!date || !startTime || !endTime) {
      setLocalError("Please fill in all fields");
      return;
    }
    
    if (endTime <= startTime) {
      setLocalError("End time must be later than start time");
      return;
    }
    
    onConfirm(date, startTime, endTime, reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-800">Request Reschedule</h2>
          <p className="text-sm text-gray-500 mt-1">
            {job?.service || "Service"} with {job?.worker || "Provider"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Current schedule info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Current:</span> {job?.date} at {job?.time}
            </p>
          </div>

          {/* Error message */}
          {(localError || error) && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{localError || error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setLocalError(null);
                setDate(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
              min={new Date().toISOString().split('T')[0]}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Current: <span className="font-medium">{job?.rawDate ? formatDate(job.rawDate) : 'Not set'}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  setLocalError(null);
                  setStartTime(e.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                step="300"
                required
              />
              <p className="text-xs text-gray-400 mt-1">24-hour format (e.g., 14:00)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => {
                  setLocalError(null);
                  setEndTime(e.target.value);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                step="300"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Must be after start time</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Reschedule (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly explain why you need to reschedule..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-blue-100"
              rows="2"
            />
          </div>

          <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 text-sm text-purple-700 flex items-start gap-2">
            <Clock className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">What happens next?</p>
              <p className="text-xs mt-1">The provider will be notified and must approve the new time. The booking will remain at the current time until approved.</p>
            </div>
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
              disabled={loading}
              className="flex-1 rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94] transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Request"}
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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const fetchBooking = async () => {
      try {
        const b = await bookingService.getBooking(Number(bookingId));
        if (!mounted) return;
        
        const rawDate = b.raw?.scheduled_date || b.scheduled_date || b.date || '';
        const rawStartTime = b.raw?.scheduled_start_time || b.scheduled_start_time || (b.time ? b.time.split(" - ")[0] : '');
        const rawEndTime = b.raw?.scheduled_end_time || b.scheduled_end_time || (b.time ? b.time.split(" - ")[1] : '');
        
        const dateForInput = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
        const startTimeForInput = rawStartTime ? rawStartTime.slice(0, 5) : '';
        const endTimeForInput = rawEndTime ? rawEndTime.slice(0, 5) : '';
        
        b.rawDate = dateForInput;
        b.rawStartTime = startTimeForInput;
        b.rawEndTime = endTimeForInput;
        
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

  const handleReschedule = async (newDate, newStartTime, newEndTime, reason) => {
    setActionLoading(true);
    setRescheduleError(null);
    try {
      await bookingService.requestReschedule(booking.id, {
        scheduled_date: newDate,
        scheduled_start_time: newStartTime,
        scheduled_end_time: newEndTime,
        reason: reason || "Client requested reschedule"
      });
      setShowRescheduleModal(false);
      alert("Reschedule request sent to provider. They will confirm shortly.");
      const updated = await bookingService.getBooking(Number(bookingId));
      setBooking(updated);
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.detail || err.message || "Failed to submit reschedule request. Please try again.";
      setRescheduleError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      const updated = await bookingService.cancelBooking(booking.id);
      if (updated) {
        setBooking(updated);
        setShowCancelModal(false);
        alert("Booking cancelled successfully.");
        navigate("/client/my-bookings");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    navigate(`/client/messages?provider=${booking?.serviceProviderId}`);
  };

  const handleBack = () => {
    navigate("/client/my-bookings");
  };

  if (loading) {
    return <UpcomingBookingSkeleton />;
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-500">Booking not found.</p>
              <button
                onClick={() => navigate("/client/my-bookings")}
                className="mt-4 px-4 py-2 bg-[#056db3] text-white rounded-lg hover:bg-[#045a94]"
              >
                Back to My Bookings
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isReschedulePending = booking.status === 'Reschedule Requested' || booking.status === 'Reschedule Proposed';
  const isRescheduleRequested = booking.status === 'Reschedule Requested';
  const isRescheduleProposed = booking.status === 'Reschedule Proposed';
  
  // Check if booking can be rescheduled (only PENDING, ACCEPTED, IN_PROGRESS)
  const canReschedule = ['Pending', 'Accepted', 'In Progress'].includes(booking.status);

  const providerName = typeof booking.providerName === 'string'
    ? booking.providerName
    : booking.worker || "Provider";

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
    worker: providerName,
    providerName: providerName,
    rawDate: booking.rawDate,
    rawStartTime: booking.rawStartTime,
    rawEndTime: booking.rawEndTime,
    workerObj: {
      id: booking.serviceProviderId || booking.raw?.service_provider_id,
      name: providerName,
      initials: booking.initials || "--",
      trade: booking.raw?.service_provider?.service_type || null,
      rating: booking.raw?.service_provider?.rating || null,
      phone: booking.raw?.service_provider?.contact_phone || null,
      email: booking.raw?.service_provider?.contact_email || null,
    },
    timeline: isReschedulePending ? [
      { task: "Booking Requested", completed: true },
      { task: "Provider Accepted", completed: true },
      { task: "Reschedule Requested", completed: true },
      { task: "Awaiting Response", completed: false },
      { task: "Work Started", completed: false },
      { task: "Work Completed", completed: false },
    ] : [
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
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
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
                <h1 className="text-3xl font-bold text-gray-800">Upcoming Booking</h1>
                <p className="text-gray-600 mt-2">Booking #{ui.id}</p>
              </div>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isReschedulePending ? 'bg-purple-100 text-purple-800' :
                ui.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                ui.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {isReschedulePending ? 'Awaiting Response' : ui.status}
              </span>
            </div>

            {isReschedulePending && (
              <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
                <p className="text-sm text-purple-700 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {isRescheduleRequested ? 
                    "You've requested a reschedule. Waiting for the provider to respond." :
                    "The provider has proposed a new time. Please review and respond."}
                </p>
                {booking.proposedDate && (
                  <p className="text-sm text-purple-600 mt-2">
                    Proposed: {formatDate(booking.proposedDate)} at {formatTimeRange(booking.proposedTime)}
                  </p>
                )}
              </div>
            )}
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

                {isReschedulePending ? (
                  <>
                    {isRescheduleProposed && (
                      <>
                        <button
                          onClick={async () => {
                            try {
                              await bookingService.acceptReschedule(booking.id);
                              alert("Reschedule accepted! The booking has been updated.");
                              const updated = await bookingService.getBooking(Number(bookingId));
                              setBooking(updated);
                            } catch (err) {
                              alert("Failed to accept reschedule.");
                            }
                          }}
                          disabled={actionLoading}
                          className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                          Accept New Time
                        </button>
                        <button
                          onClick={async () => {
                            if (window.confirm("Decline this reschedule? The booking will remain at the original time.")) {
                              try {
                                await bookingService.declineReschedule(booking.id);
                                alert("Reschedule declined. Booking remains at original time.");
                                const updated = await bookingService.getBooking(Number(bookingId));
                                setBooking(updated);
                              } catch (err) {
                                alert("Failed to decline reschedule.");
                              }
                            }
                          }}
                          disabled={actionLoading}
                          className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-500 py-3 px-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                          Decline
                        </button>
                      </>
                    )}
                    {isRescheduleRequested && (
                      <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-center">
                        <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-sm text-purple-700">
                          Waiting for provider to respond to your reschedule request.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleMessage}
                      className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-3 px-2 rounded-lg hover:bg-blue-900 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5" />
                      Message Provider
                    </button>

                    {canReschedule && (
                      <button
                        onClick={() => {
                          setRescheduleError(null);
                          setShowRescheduleModal(true);
                        }}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-3 px-2 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RotateCcw className="w-5 h-5" />}
                        Request Reschedule
                      </button>
                    )}

                    {!canReschedule && booking.status !== 'Reschedule Requested' && booking.status !== 'Reschedule Proposed' && (
                      <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-center">
                        <p className="text-xs text-gray-500">Rescheduling is not available for bookings with "{booking.status}" status.</p>
                      </div>
                    )}

                    <button
                      onClick={() => setShowCancelModal(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-500 py-3 px-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Cancel Booking
                    </button>
                  </>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Booking Status</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>{isReschedulePending ? 'Awaiting response on reschedule request' : 'Provider has accepted the booking'}</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>{isReschedulePending ? 'You can message the provider for updates' : 'You can request a reschedule if needed'}</span>
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
              onCancel={() => {
                setShowRescheduleModal(false);
                setRescheduleError(null);
              }}
              loading={actionLoading}
              error={rescheduleError}
            />
          )}

          {/* ── Cancel Confirmation Modal ── */}
          {showCancelModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Confirm Cancel</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to cancel this booking?
                  </p>
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">{ui.service}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">Date:</span> {ui.date} at {ui.time}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Location:</span> {ui.location}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Provider:</span> {ui.providerName}
                    </p>
                  </div>
                  <p className="text-xs text-red-500 mt-3">
                    This action cannot be undone. The provider will be notified.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Cancel"}
                    </button>
                  </div>
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