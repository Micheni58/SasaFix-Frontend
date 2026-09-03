// src/pages/ServiceProvider/Jobs/RescheduleRequestedJobDetails.jsx

import { useState, useEffect } from "react";
import {
  Mail, Phone, Calendar, Clock3, MapPin,
  MessageSquare, Loader2, CheckCircle2,
  CheckCircle, XCircle, AlertCircle, Clock, ArrowLeft
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

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

function RescheduleRequestedJobSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
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

function RescheduleRequestedJobDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    bookingService.getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;

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
        
        const isProviderInitiated = ["provider", "service_provider", "service-provider"].includes(initiator);
        const isClientInitiated = ["client", "customer"].includes(initiator);

        // Check if this booking has reschedule history
        const hasRescheduleHistory = !!(b?.raw?.original_scheduled_date || b?.originalDate);

        // If provider initiated, redirect to proposed page
        if (isProviderInitiated && hasRescheduleHistory) {
          navigate(`/provider/my-jobs/reschedule-proposed/${bookingId}`, { replace: true });
          return;
        }

        // If status is reschedule_proposed (provider initiated), redirect
        if (rawStatus === "reschedule_proposed") {
          navigate(`/provider/my-jobs/reschedule-proposed/${bookingId}`, { replace: true });
          return;
        }

        // If client requested and waiting for provider
        if (isClientInitiated && rawStatus === "reschedule_requested") {
          setJob({
            ...b,
            isWaitingForProvider: true,
            isConfirmed: false,
          });
          return;
        }

        // If client initiated and provider already accepted
        if (isClientInitiated && (b.status === "Accepted" || b.status === "accepted") && hasRescheduleHistory) {
          setJob({
            ...b,
            isWaitingForProvider: false,
            isConfirmed: true,
          });
          return;
        }

        // Fallback for reschedule_requested
        if (rawStatus === "reschedule_requested") {
          setJob({
            ...b,
            isWaitingForProvider: true,
            isConfirmed: false,
          });
          return;
        }

        // Default
        setJob({
          ...b,
          isWaitingForProvider: false,
          isConfirmed: false,
        });
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError(e.message || 'Failed to load booking');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [bookingId, navigate]);

  const handleAccept = async () => {
    if (!window.confirm("Accept this reschedule request? The client will be notified.")) return;
    setActionLoading(true);
    try {
      await bookingService.acceptReschedule(bookingId);
      setSuccessMessage("✅ Reschedule accepted successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to accept: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Decline this reschedule request? The client will be notified.")) return;
    setActionLoading(true);
    try {
      await bookingService.declineReschedule(bookingId);
      setSuccessMessage("✅ Reschedule declined. Booking remains at original time.");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to decline: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccessMessage("✅ Booking cancelled successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to cancel: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/provider/my-jobs");
  };

  if (loading) {
    return <RescheduleRequestedJobSkeleton />;
  }

  if (error || !job) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
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
                Back to My Jobs
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const isWaitingForProvider = job.isWaitingForProvider;
  const isConfirmed = job.isConfirmed;

  // Get the current scheduled date/time
  const currentDate = job.raw?.scheduled_date || job.scheduled_date || job.date;
  const currentStartTime = job.raw?.scheduled_start_time || job.scheduled_start_time || (job.time ? job.time.split(" - ")[0] : '');
  const currentEndTime = job.raw?.scheduled_end_time || job.scheduled_end_time || (job.time ? job.time.split(" - ")[1] : '');
  const currentTime = currentStartTime && currentEndTime ? `${currentStartTime} - ${currentEndTime}` : job.time;

  const formattedCurrentDate = formatDate(currentDate);
  const formattedCurrentTime = formatTimeRange(currentTime);

  // Get original dates
  const originalDate = job.originalDate || job.raw?.original_scheduled_date;
  const originalStartTime = job.raw?.original_scheduled_start_time;
  const originalEndTime = job.raw?.original_scheduled_end_time;
  const originalTime = originalStartTime && originalEndTime 
    ? `${originalStartTime} - ${originalEndTime}` 
    : null;
  const formattedOriginalDate = formatDate(originalDate);
  const formattedOriginalTime = formatTimeRange(originalTime);

  // Get proposed dates
  const proposedDate = job.proposedDate || job.raw?.proposed_scheduled_date;
  const proposedStartTime = job.raw?.proposed_scheduled_start_time;
  const proposedEndTime = job.raw?.proposed_scheduled_end_time;
  const proposedTime = proposedStartTime && proposedEndTime 
    ? `${proposedStartTime} - ${proposedEndTime}` 
    : null;
  const formattedProposedDate = formatDate(proposedDate);
  const formattedProposedTime = formatTimeRange(proposedTime);

  const clientName = job.client?.name || job.clientName || "Client";

  // Determine page state
  let statusBadge;
  let statusMessage;
  let pageTitle;
  let showActions = false;

  if (isWaitingForProvider) {
    pageTitle = "Reschedule Request";
 
    statusMessage = "The client has requested a reschedule. Please review and respond.";
    showActions = true;
  } else if (isConfirmed) {
    pageTitle = "Reschedule Confirmed";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        ✅ Reschedule Confirmed
      </span>
    );
    statusMessage = "You have accepted the client's reschedule request. The booking has been updated to the new time.";
    showActions = false;
  } else {
    pageTitle = "Booking Details";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
        {job.status || "Unknown"}
      </span>
    );
    statusMessage = "This booking is not in a reschedule state.";
    showActions = false;
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <button
            onClick={handleBack}
            className="mb-4 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Jobs
          </button>

          {successMessage && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {successMessage}
            </div>
          )}

          <section className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{pageTitle}</h1>
                <p className="text-gray-600 mt-2">Booking #{job.id}</p>
              </div>
              {statusBadge}
            </div>

            <div className={`rounded-lg p-4 ${
              isWaitingForProvider 
                ? "bg-amber-50 border border-amber-200" 
                : isConfirmed 
                ? "bg-green-50 border border-green-200"
                : "bg-gray-50 border border-gray-200"
            }`}>
              <p className={`text-sm flex items-center gap-2 ${
                isWaitingForProvider 
                  ? "text-amber-700" 
                  : isConfirmed 
                  ? "text-green-700"
                  : "text-gray-700"
              }`}>
                {isWaitingForProvider ? <Clock className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                {statusMessage}
              </p>
            
              {isConfirmed && formattedProposedDate && formattedProposedTime && (
                <p className="text-sm text-green-600 mt-2">
                  New time: {formattedProposedDate} at {formattedProposedTime}
                </p>
              )}
              {job.raw?.reschedule_reason && (
                <p className="text-sm text-gray-600 mt-2">
                  Reason: {job.raw.reschedule_reason}
                </p>
              )}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Job Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Service</p>
                    <p className="text-lg text-gray-800 mt-1">{job.service}</p>
                  </div>
                  
                  {/* Show original vs proposed/current */}
                  {formattedOriginalDate && formattedOriginalTime && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Original Schedule</p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formattedOriginalDate}
                        </p>
                        <p className="text-sm text-gray-700 flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-gray-400" />
                          {formattedOriginalTime}
                        </p>
                      </div>
                      <div className={`rounded-lg p-4 border ${
                        isConfirmed 
                          ? "bg-green-50 border-green-200"
                          : isWaitingForProvider
                          ? "bg-amber-50 border-amber-200"
                          : "bg-gray-50 border-gray-200"
                      }`}>
                        <p className={`text-sm font-medium mb-2 ${
                          isConfirmed 
                            ? "text-green-600"
                            : isWaitingForProvider
                            ? "text-amber-600"
                            : "text-gray-600"
                        }`}>
                          {isConfirmed ? "New Schedule" : "Client's Proposed Schedule"}
                        </p>
                        <p className={`text-sm flex items-center gap-2 ${
                          isConfirmed 
                            ? "text-green-700"
                            : isWaitingForProvider
                            ? "text-amber-700"
                            : "text-gray-700"
                        }`}>
                          <Calendar className="h-4 w-4" />
                          {isConfirmed ? formattedCurrentDate : (formattedProposedDate || "Not set")}
                        </p>
                        <p className={`text-sm flex items-center gap-2 ${
                          isConfirmed 
                            ? "text-green-700"
                            : isWaitingForProvider
                            ? "text-amber-700"
                            : "text-gray-700"
                        }`}>
                          <Clock3 className="h-4 w-4" />
                          {isConfirmed ? formattedCurrentTime : (formattedProposedTime || "Not set")}
                        </p>
                        {isWaitingForProvider && job.raw?.reschedule_reason && (
                          <p className="text-xs text-amber-600 mt-2">
                            Reason: {job.raw.reschedule_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Show current schedule if no reschedule history */}
                  {!formattedOriginalDate && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date
                        </p>
                        <p className="text-lg text-gray-800 mt-1">{formattedCurrentDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          Time
                        </p>
                        <p className="text-lg text-gray-800 mt-1">{formattedCurrentTime}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Location
                    </p>
                    <p className="text-lg text-gray-800 mt-1">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-800 mt-1">{job.description}</p>
                  </div>
                </div>
              </section>

              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Client Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                    {job.client?.initials || getInitials(clientName)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{clientName}</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  {job.client?.phone && (
                    <a href={`tel:${job.client.phone}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Call</span>
                    </a>
                  )}
                  {job.client?.email && (
                    <a href={`mailto:${job.client.email}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {isWaitingForProvider && (
                  <>
                    <button
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-green-700  hover:bg-green-100 text-green-700 font-semibold py-2 px-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Accept New Time
                    </button>

                    <button
                      onClick={handleDecline}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Decline
                    </button>

                    <div className="rounded-lg bg-gray-50 border border-gray-100 p-3 text-sm text-gray-700">
                      <p className="font-medium">⚠️ What happens next:</p>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• <strong>Accept:</strong> Booking will be updated to the new time</li>
                        <li>• <strong>Decline:</strong> Booking will remain at the original time</li>
                      </ul>
                    </div>
                  </>
                )}

                {isConfirmed && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Reschedule Confirmed</p>
                    <p className="text-xs text-green-500 mt-1">The booking has been updated to the new time</p>
                  </div>
                )}

                <Link to={`/provider/messages?client=${job.clientId || ''}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Message Client
                  </button>
                </Link>

                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Booking
                </button>

                
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RescheduleRequestedJobDetails;

function getInitials(name) {
  if (!name) return "--";
  const normalized = name.toString().trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}