// src/pages/ServiceProvider/Jobs/NewJobRequestDetails.jsx

import { useState, useEffect } from "react";
import {
  Mail, Phone, Calendar, Clock3, MapPin,
  MessageSquare, Flag, Loader2, CheckCircle2,
  RotateCcw, AlertCircle, Info
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
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
// SKELETON LOADING COMPONENT
// ─────────────────────────────────────────────

function NewJobRequestSkeleton() {
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 w-40 rounded bg-gray-200 mb-6" />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <div className="h-4 w-24 rounded bg-gray-200" />
                      <div className="h-5 w-20 rounded bg-gray-200" />
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <div className="h-4 w-32 rounded bg-gray-200" />
                      <div className="h-5 w-20 rounded bg-gray-200" />
                    </div>
                    <div className="flex justify-between items-center py-2 pt-4 border-t border-gray-200">
                      <div className="h-5 w-28 rounded bg-gray-200" />
                      <div className="h-8 w-32 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              </div>

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

function NewJobRequestDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleError, setRescheduleError] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    reason: ""
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    bookingService.getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;

        // ── Extract the raw amount from b.amountRaw ──
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

        // ── Calculate commission and earnings ──
        const commissionRate = 10;
        const commissionRaw = serviceFeeRaw * (commissionRate / 100);
        const earningsRaw = serviceFeeRaw - commissionRaw;

        const clientName = b.client || b.clientName || b.client_full_name || b.raw?.client_full_name || `Client #${b.clientId}`;

        // ── Get raw date/time for pre-filling ──
        const rawDate = b.raw?.scheduled_date || b.scheduled_date || b.date || '';
        const rawStartTime = b.raw?.scheduled_start_time || b.scheduled_start_time || (b.time ? b.time.split(" - ")[0] : '');
        const rawEndTime = b.raw?.scheduled_end_time || b.scheduled_end_time || (b.time ? b.time.split(" - ")[1] : '');

        // ── Format for input fields ──
        const dateForInput = rawDate ? new Date(rawDate).toISOString().split('T')[0] : '';
        const startTimeForInput = rawStartTime ? rawStartTime.slice(0, 5) : '';
        const endTimeForInput = rawEndTime ? rawEndTime.slice(0, 5) : '';

        const formattedDate = formatDate(rawDate);
        const formattedTime = formatTimeRange(b.time || (b.scheduled_start_time && `${b.scheduled_start_time} - ${b.scheduled_end_time}`) || '');

        // ── Get client booking count ──
        const clientBookingCount = b.clientBookingCount || b.client?.booking_count || 0;

        const mapped = {
          id: b.id || bookingId,
          service: b.service || b.service_name || '',
          description: b.details || b.description || '',
          date: formattedDate,
          time: formattedTime,
          location: b.location || '',
          status: b.status || 'New Request',
          client: {
            name: clientName,
            initials: getInitials(clientName),
            type: b.client?.type || 'Customer',
            bookings: clientBookingCount,
            phone: b.raw?.client?.phone || b.client_phone || '',
            email: b.raw?.client?.email || b.client_email || ''
          },
          clientBookingCount: clientBookingCount,
          serviceFeeDisplay: `KES ${serviceFeeRaw.toLocaleString()}`,
          serviceFeeRaw: serviceFeeRaw,
          commissionRate: commissionRate,
          commissionDisplay: `KES ${commissionRaw.toLocaleString()}`,
          commissionRaw: commissionRaw,
          earningsDisplay: `KES ${earningsRaw.toLocaleString()}`,
          earningsRaw: earningsRaw,
          timeline: b.timeline || [
            { task: 'Job Requested', completed: true },
            { task: 'Provider Review', completed: false },
            { task: 'Job Accepted', completed: false },
            { task: 'Work Completed', completed: false },
            { task: 'Payment Released', completed: false }
          ],
          // ── Store raw data for reschedule modal ──
          rawDate: dateForInput,
          rawStartTime: startTimeForInput,
          rawEndTime: endTimeForInput,
          raw: b
        };
        console.log("💰 Mapped job with payment breakdown:", mapped);
        setJob(mapped);

        // ── Pre-fill reschedule data ──
        setRescheduleData({
          date: dateForInput,
          startTime: startTimeForInput,
          endTime: endTimeForInput,
          reason: ""
        });
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
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, "accepted");
      toast.success("Job accepted", "The job has been added to your accepted jobs.");
      navigate("/provider/my-jobs");
    } catch (err) {
      toast.error("Failed to accept job", err.message);
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  const handleDecline = async () => {
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      toast.info("Job declined", "The job request has been declined.");
      navigate("/provider/my-jobs");
    } catch (err) {
      toast.error("Failed to decline job", err.message);
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  const validateTimes = (startTime, endTime) => {
    if (!startTime || !endTime) return null;
    if (endTime <= startTime) {
      return "End time must be later than start time";
    }
    return null;
  };

  const handleProposeReschedule = async () => {
    setRescheduleError(null);

    // Validate all fields are filled
    if (!rescheduleData.date || !rescheduleData.startTime || !rescheduleData.endTime) {
      setRescheduleError("Please fill in all reschedule fields");
      return;
    }

    // Validate time
    const timeError = validateTimes(rescheduleData.startTime, rescheduleData.endTime);
    if (timeError) {
      setRescheduleError(timeError);
      return;
    }

    setActionLoading(true);
    try {
      // ✅ Use proposeReschedule - sets status to RESCHEDULE_PROPOSED
      await bookingService.proposeReschedule(bookingId, {
        scheduled_date: rescheduleData.date,
        scheduled_start_time: rescheduleData.startTime,
        scheduled_end_time: rescheduleData.endTime,
        reason: rescheduleData.reason || "Provider proposed new time"
      });
      toast.success("Reschedule proposal sent", "The client will review the proposed time.");
      setShowRescheduleModal(false);
      navigate("/provider/my-jobs");
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Failed to propose reschedule";
      setRescheduleError(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => setModalType(null);

  // ── Loading state with skeleton ──
  if (loading) {
    return <NewJobRequestSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <p className="text-red-500">Error: {error}</p>
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
          {/* ── Header ── */}
          <section className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">New Job Request</h1>
                <p className="text-gray-600 mt-2">Request ID #{job.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-amber-100 text-amber-800">
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
                      <p className="text-lg text-gray-800 mt-1">{job.date}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock3 className="h-4 w-4" />
                        <span>Time</span>
                      </div>
                      <p className="text-lg text-gray-800 mt-1">{job.time}</p>
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

              {/* ── Updated Client Information with Booking Count ── */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Client Information</h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                    {job.client.initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">{job.client.name}</p>
                    <p className="text-sm text-gray-600">{job.client.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium text-[#056db3]">{job.client.bookings || job.clientBookingCount || 0}</span>
                      <span className="text-sm text-gray-500">previous bookings</span>
                    </div>
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
                    <span className="text-gray-800 font-semibold">{job.serviceFeeDisplay}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-light text-gray-700">Platform Commission ({job.commissionRate}%)</span>
                    <span className="text-red-600 font-semibold">{job.commissionDisplay}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 pt-4">
                    <span className="font-semibold text-gray-700">Your Earnings</span>
                    <span className="font-semibold text-green-600 text-2xl">{job.earningsDisplay}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
                  <p className="text-sm text-blue-700">
                    💡 You'll receive your earnings after the job is completed and approved by the client.
                  </p>
                </div>
              </section>
            </div>

            {/* ── Sidebar - Actions ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                <button
                  onClick={() => setModalType("accept")}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 border-2 border-green-600 text-white font-semibold py-2 px-2 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Accept Job
                </button>

                <button
                  onClick={() => setModalType("decline")}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center border-2 border-red-200 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  Decline Request
                </button>

                <Link to={`/provider/messages?client=${bookingId}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Message Client
                  </button>
                </Link>

                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 font-semibold py-2 px-2 rounded-lg hover:bg-purple-50 transition-colors mt-4"
                >
                  <RotateCcw className="w-5 h-5" />
                  Propose New Time
                </button>

                {/* Important Notes */}
                <div className="provider-important-notes mt-6 pt-6 border-t border-gray-200 bg-[#fdffe9] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Important Notes</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Arrive on time or notify client</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Complete job as described</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Request payment only after completion</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Maintain professionalism</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Confirm Modal ── */}
          {modalType && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {modalType === "accept" ? "Confirm Accept" : "Confirm Decline"} Job
                  </h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600">
                    {modalType === "accept"
                      ? `Are you sure you want to accept this job from ${job.client.name}?`
                      : `Are you sure you want to decline this job from ${job.client.name}? The client will be notified.`}
                  </p>
                  <div className="mt-4 rounded-lg bg-gray-50 p-4">
                    <p className="text-sm font-semibold text-gray-800">{job.service}</p>
                    <p className="mt-2 text-xs text-gray-600">
                      <span className="font-semibold">Date &amp; Time:</span> {job.date} at {job.time}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Location:</span> {job.location}
                    </p>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={modalType === "accept" ? handleAccept : handleDecline}
                      disabled={actionLoading}
                      className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                        modalType === "accept"
                          ? "bg-[#056db3] hover:bg-blue-700"
                          : "bg-red-600 hover:bg-red-700"
                      } disabled:opacity-50`}
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (modalType === "accept" ? "Yes, Accept" : "Yes, Decline")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Reschedule Modal with Pre-filled Data ── */}
          {showRescheduleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Propose New Time</h3>
                  <p className="text-sm text-gray-500 mt-1">{job.service} with {job.client.name}</p>
                </div>
                <div className="px-6 py-4">
                  {/* Current schedule info */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-700">
                      <span className="font-medium">Current:</span> {job.date} at {job.time}
                    </p>
                  </div>

                  {/* Error message */}
                  {rescheduleError && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{rescheduleError}</p>
                    </div>
                  )}

                  {/* Form fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={rescheduleData.date}
                        onChange={(e) => {
                          setRescheduleError(null);
                          setRescheduleData({...rescheduleData, date: e.target.value});
                        }}
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        Current: <span className="font-medium">{job.rawDate ? formatDate(job.rawDate) : 'Not set'}</span>
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={rescheduleData.startTime}
                          onChange={(e) => {
                            setRescheduleError(null);
                            setRescheduleData({...rescheduleData, startTime: e.target.value});
                          }}
                          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                          step="300"
                        />
                        <p className="text-xs text-gray-400 mt-1">24-hour format (e.g., 14:00)</p>
                        <p className="text-xs text-gray-400">
                          Current: <span className="font-medium">{job.rawStartTime || 'Not set'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={rescheduleData.endTime}
                          onChange={(e) => {
                            setRescheduleError(null);
                            setRescheduleData({...rescheduleData, endTime: e.target.value});
                          }}
                          className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                          step="300"
                        />
                        <p className="text-xs text-gray-400 mt-1">Must be after start time</p>
                        <p className="text-xs text-gray-400">
                          Current: <span className="font-medium">{job.rawEndTime || 'Not set'}</span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason (Optional)
                      </label>
                      <textarea
                        value={rescheduleData.reason}
                        onChange={(e) => {
                          setRescheduleError(null);
                          setRescheduleData({...rescheduleData, reason: e.target.value});
                        }}
                        placeholder="Briefly explain why you need to reschedule..."
                        className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 outline-none transition-colors"
                        rows="2"
                      />
                    </div>
                  </div>

                  {/* Info note about reschedule process */}
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-start gap-2">
                    <Info className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-purple-700">What happens next?</p>
                      <p className="text-xs text-purple-600 mt-1">
                        The client will be notified and must <strong>approve</strong> the new time. 
                        The booking will remain at the current time until the client approves.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRescheduleModal(false);
                        setRescheduleError(null);
                        setRescheduleData({
                          date: job.rawDate || "",
                          startTime: job.rawStartTime || "",
                          endTime: job.rawEndTime || "",
                          reason: ""
                        });
                      }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProposeReschedule}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-[#056db3] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Proposal"
                      )}
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

export default NewJobRequestDetails;

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