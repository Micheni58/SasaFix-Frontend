// src/pages/Client/bookings/RescheduleProposedDetails.jsx

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock3,
  MapPin,
  MessageSquare,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
  User,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { useToast } from "../../../components/ui/ToastProvider";

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

function RescheduleProposedSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="animate-pulse">
            <section className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                  <div className="h-8 w-48 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="h-8 w-28 rounded-full bg-gray-200" />
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function RescheduleProposedDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    bookingService
      .getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;
        if (!b) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        const rawStatus = (b?.raw?.status ?? b?.status ?? "")
          .toString()
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/-/g, "_");

        const initiator = (b?.raw?.reschedule_initiated_by || b?.rescheduleInitiatedBy || "")
          .toString()
          .trim()
          .toLowerCase();
        const isClientInitiated = ["client", "customer"].includes(initiator);

        // If client initiated or status is requested, redirect to requested page
        if (isClientInitiated || rawStatus === "reschedule_requested") {
          navigate(`/client/my-bookings/reschedule-requested/${bookingId}`, { replace: true });
          return;
        }

        setBooking(b);
      })
      .catch((e) => {
        console.error("Error fetching booking:", e);
        if (!mounted) return;
        setError(e.message || "Failed to load booking");
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [bookingId, navigate]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await bookingService.acceptReschedule(bookingId);
      setShowAcceptModal(false);
      toast.success("Reschedule accepted", "The booking has been updated.");
      navigate("/client/my-bookings", { state: { rescheduleUpdated: true } });
    } catch (err) {
      console.error("Accept failed:", err);
      toast.error("Failed to accept reschedule", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await bookingService.declineReschedule(bookingId);
      setShowDeclineModal(false);
      toast.info("Reschedule declined", "The booking remains at the original time.");
      navigate("/client/my-bookings", { state: { rescheduleUpdated: true } });
    } catch (err) {
      console.error("Decline failed:", err);
      toast.error("Failed to decline reschedule", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/client/my-bookings");
  };

  if (loading) return <RescheduleProposedSkeleton />;

  if (error || !booking) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Error: {error || "Booking not found"}</p>
              <button
                onClick={handleBack}
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

  const providerName = booking.providerName || booking.worker || "Provider";
  const formattedDate = formatDate(booking.date || booking.scheduled_date);
  const formattedTime = formatTimeRange(booking.time || (booking.scheduled_start_time && `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`));

  // Get proposed date/time from booking
  const proposedDate = booking.raw?.proposed_scheduled_date || booking.proposedDate;
  const proposedStartTime = booking.raw?.proposed_scheduled_start_time || booking.proposedStartTime;
  const proposedEndTime = booking.raw?.proposed_scheduled_end_time || booking.proposedEndTime;
  const proposedTime = proposedStartTime && proposedEndTime 
    ? `${proposedStartTime} - ${proposedEndTime}` 
    : null;
  const rescheduleReason = booking.raw?.reschedule_reason || booking.rescheduleReason;

  // Get original dates if stored
  const originalDate = booking.raw?.original_scheduled_date || booking.originalDate;
  const originalTime = booking.raw?.original_scheduled_start_time && booking.raw?.original_scheduled_end_time
    ? `${booking.raw.original_scheduled_start_time} - ${booking.raw.original_scheduled_end_time}`
    : null;

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
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Reschedule Proposal</h1>
                <p className="text-gray-600 mt-2">Booking #{booking.id}</p>
              </div>
              
            </div>

            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p className="text-sm text-purple-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                The provider has proposed a new time. Please review and respond.
              </p>
              {proposedDate && proposedTime && (
                <p className="text-sm text-purple-600 mt-2">
                  <span className="font-medium">Proposed:</span> {formatDate(proposedDate)} at {formatTimeRange(proposedTime)}
                </p>
              )}
              {rescheduleReason && (
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Reason:</span> {rescheduleReason}
                </p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="text-lg text-gray-800 mt-1">{booking.service || "N/A"}</p>
                  </div>
                  
                  {/* Original vs Proposed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Original Schedule</p>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(originalDate || booking.date || booking.scheduled_date)}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock3 className="h-4 w-4 text-gray-400" />
                          {formatTimeRange(originalTime || booking.time)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm font-medium text-purple-600 mb-2">Proposed Schedule</p>
                      <div className="space-y-1">
                        <p className="flex items-center gap-2 text-sm text-purple-700">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          {formatDate(proposedDate || booking.proposedDate)}
                        </p>
                        <p className="flex items-center gap-2 text-sm text-purple-700">
                          <Clock3 className="h-4 w-4 text-purple-400" />
                          {formatTimeRange(proposedTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="text-lg text-gray-800 mt-1">{booking.location || "N/A"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Provider
                    </p>
                    <p className="text-lg text-gray-800 mt-1">{providerName}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Service Fee</p>
                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {booking.amountRaw ? `KES ${booking.amountRaw.toLocaleString()}` : "KES 0"}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                <button
                  onClick={() => setShowAcceptModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2  border-2 border-green-700 text-green-700 font-semibold py-2 px-2 rounded-lg hover:bg-green-100 hover:border-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Accept New Time
                </button>

                <button
                  onClick={() => setShowDeclineModal(true)}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                  Decline
                </button>

                <Link to={`/client/messages?provider=${booking.serviceProviderId}`}>
                  <button className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Message Provider
                  </button>
                </Link>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to My Bookings
                </button>
              </div>
            </div>
          </div>

          {/* ── Accept Confirmation Modal ── */}
          {showAcceptModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Confirm Accept</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to accept this reschedule proposal?
                  </p>
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">{booking.service || "Service"}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">Current:</span> {formatDate(originalDate || booking.date)} at {formatTimeRange(originalTime || booking.time)}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Proposed:</span> {formatDate(proposedDate)} at {formatTimeRange(proposedTime)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Provider:</span> {providerName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    The booking will be updated to the new time immediately.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowAcceptModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Accept"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Decline Confirmation Modal ── */}
          {showDeclineModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Confirm Decline</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    Are you sure you want to decline this reschedule proposal?
                  </p>
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">{booking.service || "Service"}</p>
                    <p className="mt-1 text-xs text-gray-600">
                      <span className="font-medium">Current:</span> {formatDate(originalDate || booking.date)} at {formatTimeRange(originalTime || booking.time)}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Proposed:</span> {formatDate(proposedDate)} at {formatTimeRange(proposedTime)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      <span className="font-medium">Provider:</span> {providerName}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    The booking will remain at the original time and the provider will be notified.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeclineModal(false)}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDecline}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Yes, Decline"}
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

export default RescheduleProposedDetails;