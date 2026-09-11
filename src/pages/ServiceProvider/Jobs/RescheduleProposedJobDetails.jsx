// src/pages/ServiceProvider/Jobs/RescheduleProposedJobDetails.jsx

import { useState, useEffect } from "react";
import {
  Mail, Phone, Calendar, Clock3, MapPin,
  MessageSquare, Loader2, CheckCircle2,
  Clock, AlertCircle, ArrowLeft, XCircle, CheckCircle
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

function RescheduleProposedJobSkeleton() {
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

function RescheduleProposedJobDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    bookingService.getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;

        console.log("📦 Full booking data:", b);

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

        // Get all date fields
        const currentDate = b.raw?.scheduled_date || b.scheduled_date || b.date;
        const currentStartTime = b.raw?.scheduled_start_time || b.scheduled_start_time;
        const currentEndTime = b.raw?.scheduled_end_time || b.scheduled_end_time;
        const currentTime = currentStartTime && currentEndTime ? `${currentStartTime} - ${currentEndTime}` : b.time;

        const originalDate = b.raw?.original_scheduled_date || b.originalDate;
        const originalStartTime = b.raw?.original_scheduled_start_time;
        const originalEndTime = b.raw?.original_scheduled_end_time;
        const originalTime = originalStartTime && originalEndTime 
          ? `${originalStartTime} - ${originalEndTime}` 
          : null;

        const proposedDate = b.raw?.proposed_scheduled_date || b.proposedDate;
        const proposedStartTime = b.raw?.proposed_scheduled_start_time;
        const proposedEndTime = b.raw?.proposed_scheduled_end_time;
        const proposedTime = proposedStartTime && proposedEndTime 
          ? `${proposedStartTime} - ${proposedEndTime}` 
          : null;

        const hasRescheduleHistory = !!(originalDate || proposedDate);

        console.log("🔍 rawStatus:", rawStatus);
        console.log("🔍 initiator:", initiator);
        console.log("🔍 hasRescheduleHistory:", hasRescheduleHistory);
        console.log("🔍 originalDate:", originalDate);
        console.log("🔍 proposedDate:", proposedDate);
        console.log("🔍 currentDate:", currentDate);

        // Determine state
        let pageState = "unknown";
        
        if (rawStatus === "reschedule_proposed") {
          pageState = "waiting_for_client";
        } else if (rawStatus === "reschedule_requested") {
          pageState = "waiting_for_provider";
        } else if (rawStatus === "reschedule_confirmed") {
          pageState = "confirmed";
        } else if (rawStatus === "rescheduled") {
          // If status is rescheduled but has no history, it's ambiguous
          if (!hasRescheduleHistory) {
            pageState = "applied_no_history";
          } else {
            pageState = "completed";
          }
        } else if ((b.status === "Accepted" || b.status === "accepted") && hasRescheduleHistory) {
          pageState = "confirmed";
        }

        console.log("🔍 pageState:", pageState);

        const clientName = b.client || b.clientName || b.client_full_name || b.raw?.client_full_name || `Client #${b.clientId}`;

        setJob({
          ...b,
          id: b.id || bookingId,
          service: b.service || b.service_name || '',
          description: b.details || b.description || '',
          location: b.location || '',
          status: b.status || 'Pending',
          pageState: pageState,
          // All date fields
          currentDate: currentDate,
          currentTime: currentTime,
          originalDate: originalDate,
          originalTime: originalTime,
          proposedDate: proposedDate,
          proposedTime: proposedTime,
          hasRescheduleHistory: hasRescheduleHistory,
          rescheduleReason: b.rescheduleReason || b.raw?.reschedule_reason || null,
          clientName: clientName,
          clientInitials: getInitials(clientName),
          clientPhone: b.raw?.client?.phone || b.client_phone || '',
          clientEmail: b.raw?.client?.email || b.client_email || '',
          clientId: b.clientId || b.raw?.client_id || null,
          raw: b.raw || b,
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

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccessMessage("✅ Booking cancelled successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      toast.error("Failed to cancel booking", err.message);
    }
  };

  const handleBack = () => {
    navigate("/provider/my-jobs");
  };

  if (loading) {
    return <RescheduleProposedJobSkeleton />;
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

  const pageState = job.pageState;

  // Format all dates
  const formattedOriginalDate = formatDate(job.originalDate);
  const formattedOriginalTime = formatTimeRange(job.originalTime);
  const formattedProposedDate = formatDate(job.proposedDate);
  const formattedProposedTime = formatTimeRange(job.proposedTime);
  const formattedCurrentDate = formatDate(job.currentDate);
  const formattedCurrentTime = formatTimeRange(job.currentTime);

  // Determine UI state
  let statusBadge;
  let statusMessage;
  let pageTitle;
  let badgeColor;

  if (pageState === "waiting_for_client") {
    pageTitle = "Reschedule Proposed";
    statusMessage = "You've proposed a new time. Waiting for the client to respond.";
    badgeColor = "bg-purple-50 border-purple-200 text-purple-700";
  } else if (pageState === "waiting_for_provider") {
    pageTitle = "Reschedule Request";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
        ⏳ Waiting for Your Approval
      </span>
    );
    statusMessage = "The client has requested a reschedule. Please review and respond.";
    badgeColor = "bg-amber-50 border-amber-200 text-amber-700";
  } else if (pageState === "confirmed") {
    pageTitle = "Reschedule Confirmed";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        ✅ Reschedule Confirmed
      </span>
    );
    statusMessage = "The reschedule has been confirmed. The booking has been updated to the new time.";
    badgeColor = "bg-green-50 border-green-200 text-green-700";
  } else if (pageState === "applied_no_history") {
    pageTitle = "Reschedule Applied";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
        📋 Reschedule Applied
      </span>
    );
    statusMessage = "This booking has been rescheduled. The time has been updated.";
    badgeColor = "bg-blue-50 border-blue-200 text-blue-700";
  } else if (pageState === "completed") {
    pageTitle = "Reschedule Completed";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
        ✅ Reschedule Completed
      </span>
    );
    statusMessage = "The reschedule has been completed successfully.";
    badgeColor = "bg-green-50 border-green-200 text-green-700";
  } else {
    pageTitle = "Booking Details";
    statusBadge = (
      <span className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
        {job.status || "Unknown"}
      </span>
    );
    statusMessage = "This booking is not in a reschedule state.";
    badgeColor = "bg-gray-50 border-gray-200 text-gray-700";
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

            <div className={`rounded-lg p-4 border ${badgeColor}`}>
              <p className={`text-sm flex items-center gap-2`}>
                <Clock className="h-4 w-4" />
                {statusMessage}
              </p>
              {job.rescheduleReason && (
                <p className="text-sm text-gray-600 mt-2">
                  Reason: {job.rescheduleReason}
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

                  {/* ALWAYS show Original vs Current/Proposed comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* ORIGINAL SCHEDULE - Left side */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Original Schedule</p>
                      {formattedOriginalDate && formattedOriginalTime ? (
                        <>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            {formattedOriginalDate}
                          </p>
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Clock3 className="h-4 w-4 text-gray-400" />
                            {formattedOriginalTime}
                          </p>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          <p>Original time not recorded</p>
                          <p className="text-xs mt-1 text-gray-400">This reschedule was applied without storing the original time</p>
                        </div>
                      )}
                    </div>

                    {/* RIGHT SIDE - Proposed OR Current */}
                    <div className={`rounded-lg p-4 border ${
                      pageState === "waiting_for_client" 
                        ? "bg-purple-50 border-purple-200" 
                        : pageState === "waiting_for_provider"
                        ? "bg-amber-50 border-amber-200"
                        : pageState === "confirmed" || pageState === "completed"
                        ? "bg-green-50 border-green-200"
                        : "bg-blue-50 border-blue-200"
                    }`}>
                      {pageState === "waiting_for_client" ? (
                        // SHOW PROPOSED
                        <>
                          <p className="text-sm font-medium text-purple-600 mb-2">Proposed Schedule</p>
                          {formattedProposedDate && formattedProposedTime ? (
                            <>
                              <p className="text-sm text-purple-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formattedProposedDate}
                              </p>
                              <p className="text-sm text-purple-700 flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />
                                {formattedProposedTime}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Proposed time not available</p>
                          )}
                        </>
                      ) : pageState === "waiting_for_provider" ? (
                        // SHOW PROPOSED (client proposed)
                        <>
                          <p className="text-sm font-medium text-amber-600 mb-2">Client's Proposed Schedule</p>
                          {formattedProposedDate && formattedProposedTime ? (
                            <>
                              <p className="text-sm text-amber-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {formattedProposedDate}
                              </p>
                              <p className="text-sm text-amber-700 flex items-center gap-2">
                                <Clock3 className="h-4 w-4" />
                                {formattedProposedTime}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Proposed time not available</p>
                          )}
                        </>
                      ) : (
                        // SHOW CURRENT (new schedule)
                        <>
                          <p className={`text-sm font-medium mb-2 ${
                            pageState === "confirmed" || pageState === "completed" 
                              ? "text-green-600" 
                              : "text-blue-600"
                          }`}>
                            {pageState === "confirmed" || pageState === "completed" 
                              ? "New Schedule" 
                              : "Current Schedule"}
                          </p>
                          {formattedCurrentDate && formattedCurrentTime ? (
                            <>
                              <p className={`text-sm flex items-center gap-2 ${
                                pageState === "confirmed" || pageState === "completed" 
                                  ? "text-green-700" 
                                  : "text-blue-700"
                              }`}>
                                <Calendar className="h-4 w-4" />
                                {formattedCurrentDate}
                              </p>
                              <p className={`text-sm flex items-center gap-2 ${
                                pageState === "confirmed" || pageState === "completed" 
                                  ? "text-green-700" 
                                  : "text-blue-700"
                              }`}>
                                <Clock3 className="h-4 w-4" />
                                {formattedCurrentTime}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Current time not available</p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

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
                    {job.clientInitials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{job.clientName}</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  {job.clientPhone && (
                    <a href={`tel:${job.clientPhone}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Call</span>
                    </a>
                  )}
                  {job.clientEmail && (
                    <a href={`mailto:${job.clientEmail}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  )}
                </div>
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-3">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {pageState === "waiting_for_client" && (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-4 text-center">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-purple-700">Awaiting Client Response</p>
                    <p className="text-xs text-purple-500 mt-1">The client will review your proposal</p>
                  </div>
                )}

                {pageState === "waiting_for_provider" && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
                    <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-amber-700">Awaiting Your Response</p>
                    <p className="text-xs text-amber-500 mt-1">Please review the client's request</p>
                  </div>
                )}

                {(pageState === "confirmed" || pageState === "completed") && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-700">Reschedule Complete</p>
                    <p className="text-xs text-green-500 mt-1">The booking has been updated</p>
                  </div>
                )}

                {pageState === "applied_no_history" && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-center">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-blue-700">Reschedule Applied</p>
                    <p className="text-xs text-blue-500 mt-1">The time has been updated</p>
                  </div>
                )}

                <Link to={`/provider/messages?client=${job.clientId || ''}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors mb-4">
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

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors "
                >
                  Back to My Jobs
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RescheduleProposedJobDetails;

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