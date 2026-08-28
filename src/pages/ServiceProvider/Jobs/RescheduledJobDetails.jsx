// src/pages/ServiceProvider/Jobs/RescheduledJobDetails.jsx

import { useState, useEffect } from "react";
import {
  Mail, Phone, Calendar, Clock3, MapPin,
  MessageSquare, Flag, Loader2, CheckCircle2,
  RotateCcw, CheckCircle, XCircle, AlertCircle, Clock
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

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
// SKELETON LOADING COMPONENT
// ─────────────────────────────────────────────

function RescheduledJobSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="animate-pulse">
            {/* ── Header Skeleton ── */}
            <section className="mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-3">
                  <div className="h-8 w-48 rounded bg-gray-200" />
                  <div className="h-4 w-32 rounded bg-gray-200" />
                </div>
                <div className="h-8 w-28 rounded-full bg-gray-200" />
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* ── Main Content Skeleton ── */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 w-32 rounded bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    <div>
                      <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
                      <div className="h-6 w-48 rounded bg-gray-200" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="h-4 w-16 rounded bg-gray-200 mb-2" />
                        <div className="h-6 w-32 rounded bg-gray-200" />
                      </div>
                      <div>
                        <div className="h-4 w-16 rounded bg-gray-200 mb-2" />
                        <div className="h-6 w-32 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div>
                      <div className="h-4 w-20 rounded bg-gray-200 mb-2" />
                      <div className="h-6 w-48 rounded bg-gray-200" />
                    </div>
                    <div>
                      <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
                      <div className="h-6 w-full rounded bg-gray-200" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 w-40 rounded bg-gray-200 mb-6" />
                  <div className="flex items-center gap-4 mb-6">
                    <div className="h-16 w-16 rounded-full bg-gray-200" />
                    <div className="space-y-2">
                      <div className="h-5 w-32 rounded bg-gray-200" />
                      <div className="h-4 w-24 rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="flex gap-3 mb-6">
                    <div className="h-10 w-24 rounded-lg bg-gray-200" />
                    <div className="h-10 w-24 rounded-lg bg-gray-200" />
                  </div>
                  <div className="h-12 w-full rounded-lg bg-gray-200" />
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 w-40 rounded bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 mt-1" />
                        <div className="h-5 w-32 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Sidebar Skeleton ── */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="h-6 w-24 rounded bg-gray-200 mb-4" />
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-12 w-full rounded-lg bg-gray-200" />
                  ))}
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
// MAIN COMPONENT
// ─────────────────────────────────────────────

function RescheduledJobDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    startTime: "",
    endTime: ""
  });
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    bookingService.getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;

        // ── Extract the raw amount ──
        let serviceFeeRaw = 0;

        if (b.amountRaw !== undefined && b.amountRaw !== null) {
          serviceFeeRaw = typeof b.amountRaw === 'string' ? parseFloat(b.amountRaw) : b.amountRaw;
        } else if (b.raw?.amount !== undefined && b.raw?.amount !== null) {
          serviceFeeRaw = typeof b.raw.amount === 'string' ? parseFloat(b.raw.amount) : b.raw.amount;
        } else if (b.amount !== undefined && b.amount !== null && typeof b.amount === 'number') {
          serviceFeeRaw = b.amount;
        } else if (b.amount && typeof b.amount === 'string' && b.amount.includes('KES')) {
          const clean = b.amount.replace(/[^0-9.]/g, '');
          serviceFeeRaw = parseFloat(clean) || 0;
        }

        if (isNaN(serviceFeeRaw) || serviceFeeRaw <= 0) {
          serviceFeeRaw = 0;
        }

        const commissionRate = 10;
        const commissionRaw = serviceFeeRaw * (commissionRate / 100);
        const earningsRaw = serviceFeeRaw - commissionRaw;

        const clientName = b.client || b.clientName || b.client_full_name || b.raw?.client_full_name || `Client #${b.clientId}`;

        // ── Determine whether the client has accepted the rescheduling offer ──
        // Supports a few possible backend field names/shapes so this keeps working
        // regardless of exact API naming.
        const rawBooking = b.raw || {};
        const clientAcceptedReschedule = Boolean(
          rawBooking.client_accepted_reschedule ??
          rawBooking.reschedule_confirmed ??
          rawBooking.reschedule_accepted_by_client ??
          (rawBooking.status && rawBooking.status.toString().toLowerCase() === "accepted" && rawBooking.previous_status === "rescheduled") ??
          false
        );

        const mapped = {
          id: b.id || bookingId,
          service: b.service || b.service_name || '',
          description: b.details || b.description || '',
          date: b.date || b.scheduled_date || '',
          time: b.time || b.scheduled_start_time || '',
          location: b.location || '',
          status: b.status || 'Rescheduled',
          clientAcceptedReschedule,
          client: {
            name: clientName,
            initials: getInitials(clientName),
            phone: b.raw?.client?.phone || b.client_phone || '',
            email: b.raw?.client?.email || b.client_email || ''
          },
          serviceFee: `KES ${serviceFeeRaw.toLocaleString()}`,
          serviceFeeRaw: serviceFeeRaw,
          commissionRate: commissionRate,
          commission: `KES ${commissionRaw.toLocaleString()}`,
          commissionRaw: commissionRaw,
          earnings: `KES ${earningsRaw.toLocaleString()}`,
          earningsRaw: earningsRaw,
          timeline: [
            { task: 'Job Requested', completed: true },
            { task: 'Job Rescheduled', completed: true },
            { task: 'Awaiting Confirmation', completed: !clientAcceptedReschedule ? false : true },
            { task: 'Work Started', completed: false },
            { task: 'Work Completed', completed: false },
            { task: 'Payment Released', completed: false }
          ],
          raw: b
        };
        setJob(mapped);
      })
      .catch((e) => {
        console.error(e);
        if (!mounted) return;
        setError(e.message || 'Failed to load booking');
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, [bookingId]);

  const handleAccept = async () => {
    if (!window.confirm("Accept this rescheduled booking? The client will be notified.")) return;
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, "ACCEPTED");
      setSuccessMessage("✅ Booking accepted successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to accept: " + err.message);
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Decline this rescheduled booking? The client will be notified.")) return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccessMessage("✅ Booking declined successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to decline: " + err.message);
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  const handleReschedule = async () => {
    if (!rescheduleData.date || !rescheduleData.startTime || !rescheduleData.endTime) {
      alert("Please fill in all reschedule fields");
      return;
    }

    setActionLoading(true);
    try {
      await bookingService.rescheduleBooking(bookingId, {
        scheduled_date: rescheduleData.date,
        scheduled_start_time: rescheduleData.startTime,
        scheduled_end_time: rescheduleData.endTime
      });
      setSuccessMessage("✅ Reschedule request sent to client!");
      setShowRescheduleModal(false);
      setRescheduleData({ date: "", startTime: "", endTime: "" });
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to reschedule: " + err.message);
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

  const closeModal = () => setModalType(null);

  // ── Loading state with skeleton ──
  if (loading) {
    return <RescheduledJobSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Error: {error}</p>
              <button
                onClick={() => navigate("/provider/my-jobs")}
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

  if (!job) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <p className="text-gray-500">No booking found.</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          {/* ── Success Message ── */}
          {successMessage && (
            <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800 border border-green-200 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              {successMessage}
            </div>
          )}

          {/* ── Header ── */}
          <section className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Rescheduled Job</h1>
                <p className="text-gray-600 mt-2">Request ID #{job.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                {job.status}
              </span>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Main Content ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Summary */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Job Summary</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="text-lg text-gray-800 mt-1">{job.service}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Date</span>
                      </div>
                      <p className="text-lg text-gray-800 mt-1">{formatDate(job.date)}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock3 className="h-4 w-4" />
                        <span>Time</span>
                      </div>
                      <p className="text-lg text-gray-800 mt-1">{formatTimeRange(job.time)}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-lg text-gray-800 mt-1">{job.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-800 mt-1">{job.description}</p>
                  </div>
                </div>
              </section>

              {/* Client Information */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Client Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                    {job.client.initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{job.client.name}</p>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  <a href={`tel:${job.client.phone}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call</span>
                  </a>
                  <a href={`mailto:${job.client.email}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email</span>
                  </a>
                </div>
                <button className="w-full px-4 py-2 border-2 border-[#056db3] text-[#056db3] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  View Client Profile
                </button>
              </section>

              {/* Job Status Timeline */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Job Status Timeline</h2>
                <div className="space-y-4">
                  {job.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${item.completed ? "text-green-600" : "text-gray-800"}`}>
                          {item.task}
                        </p>
                        {item.task === 'Awaiting Confirmation' && !job.clientAcceptedReschedule && (
                          <p className="text-sm text-purple-600">Waiting for client confirmation</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Payment Breakdown */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Breakdown</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-light text-gray-700">Service Fee</span>
                    <span className="text-gray-800 font-semibold">{job.serviceFee}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-light text-gray-700">Platform Commission ({job.commissionRate}%)</span>
                    <span className="text-red-600 font-semibold">{job.commission}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-4">
                    <span className="font-semibold text-gray-700">Your Earnings</span>
                    <span className="font-semibold text-green-600 text-2xl">{job.earnings}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-purple-50 border border-purple-200 p-3">
                  <p className="text-sm text-purple-700">
                    💡 This job is currently rescheduled. Once confirmed, you can start working.
                  </p>
                </div>
              </section>
            </div>

            {/* ── Sidebar - Actions ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {/* ── Accept / Decline only render once the CLIENT has accepted the reschedule offer ── */}
                {job.clientAcceptedReschedule ? (
                  <>
                    {/* ── Accept - Green button ── */}
                    <button
                      onClick={handleAccept}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 border-2 border-green-600 text-white font-semibold py-2 px-2 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                      Accept Booking
                    </button>

                    {/* ── Decline - Red button ── */}
                    <button
                      onClick={handleDecline}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 text-red-600 border-2 border-red-300 font-semibold py-2 px-2 rounded-lg hover:bg-red-100 hover:border-red-700 transition-colors disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                      Decline Booking
                    </button>
                  </>
                ) : (
                  <div className="rounded-lg bg-purple-50 border border-purple-200 p-3 flex items-start gap-2">
                    <Clock className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <p className="text-sm text-purple-700">
                      Waiting for the client to confirm the new schedule. You'll be able to accept or decline once they respond.
                    </p>
                  </div>
                )}

                {/* ── Message Client - Blue border ── */}
                <Link to={`/provider/messages?client=${bookingId}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Message Client
                  </button>
                </Link>

                {/* ── Request Reschedule - Purple border ── */}
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-purple-500 text-purple-600 font-semibold py-2 px-2 rounded-lg hover:bg-purple-50 transition-colors mt-4"
                >
                  <RotateCcw className="w-5 h-5" />
                  Reschedule Again
                </button>

                {/* ── Cancel Booking - Red border ── */}
                <button
                  onClick={handleCancel}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                  Cancel Booking
                </button>

                {/* ── Back to My Jobs - Grey border ── */}
                <button
                  onClick={() => navigate("/provider/my-jobs")}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors mt-4"
                >
                  Back to My Jobs
                </button>

                {/* Important Notes */}
                <div className="mt-6 pt-6 border-t border-gray-200 bg-[#fdffe9] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Important Notes</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Review the new schedule carefully</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Accept or decline once the client confirms</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>You can reschedule again if needed</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Work starts after client confirms</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reschedule Modal ── */}
          {showRescheduleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Reschedule Again</h3>
                  <p className="text-sm text-gray-500 mt-1">{job.service}</p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-4">Propose a new date and time:</p>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                      <input
                        type="date"
                        value={rescheduleData.date}
                        onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={rescheduleData.startTime}
                        onChange={(e) => setRescheduleData({...rescheduleData, startTime: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={rescheduleData.endTime}
                        onChange={(e) => setRescheduleData({...rescheduleData, endTime: e.target.value})}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3] outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRescheduleModal(false);
                        setRescheduleData({ date: "", startTime: "", endTime: "" });
                      }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Send Request"}
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

export default RescheduledJobDetails;

// ── Helper function for initials ──
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