// src/pages/ServiceProvider/Jobs/InProgressJobDetails.jsx - Updated

import { useState, useEffect } from "react";
import { 
  Mail, Phone, Calendar, Clock3, MapPin, 
  MessageSquare, Flag, Loader2, CheckCircle2,
  RotateCcw, AlertTriangle
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

// ─────────────────────────────────────────────
// SKELETON LOADING COMPONENT
// ─────────────────────────────────────────────

function InProgressJobSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
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
                    {[...Array(4)].map((_, i) => (
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
                  {[...Array(4)].map((_, i) => (
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

function InProgressJobDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

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
        
        const mapped = {
          id: b.id || bookingId,
          service: b.service || b.service_name || '',
          description: b.details || b.description || '',
          date: b.date || b.scheduled_date || '',
          time: b.time || b.scheduled_start_time || '',
          location: b.location || '',
          status: b.status || 'In Progress',
          client: {
            name: clientName,
            initials: getInitials(clientName),
            phone: b.raw?.client?.phone || b.client_phone || '',
            email: b.raw?.client?.email || b.client_email || ''
          },
          serviceFeeDisplay: `KES ${serviceFeeRaw.toLocaleString()}`,
          serviceFeeRaw: serviceFeeRaw,
          commissionRate: commissionRate,
          commissionDisplay: `KES ${commissionRaw.toLocaleString()}`,
          commissionRaw: commissionRaw,
          earningsDisplay: `KES ${earningsRaw.toLocaleString()}`,
          earningsRaw: earningsRaw,
          timeline: b.timeline || [
            { task: 'Job Requested', completed: true },
            { task: 'Job Accepted', completed: true },
            { task: 'Work Started', completed: true },
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

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, "completed");
      alert("✅ Job marked as completed!");
      navigate("/provider/my-jobs");
    } catch (err) {
      alert("Failed to complete job: " + err.message);
    } finally {
      setActionLoading(false);
      setModalType(null);
    }
  };

  const handleReportIssue = async () => {
    if (!reportReason.trim()) {
      alert("Please describe the issue");
      return;
    }

    setActionLoading(true);
    try {
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: 1,
          type: "report",
          title: `Issue Report: Booking #${bookingId}`,
          body: `Provider reported: ${reportReason}`,
          related_booking_id: bookingId
        })
      });
      alert("✅ Issue reported to admin");
      setShowReportModal(false);
      setReportReason("");
    } catch (err) {
      alert("Failed to report issue: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => setModalType(null);

  // ── Loading state with skeleton ──
  if (loading) {
    return <InProgressJobSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-72">
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
        <div className="flex-1 ml-72">
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
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          {/* ── Header ── */}
          <section className="mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Job In Progress</h1>
                <p className="text-gray-600 mt-2">Request ID #{job.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
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
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Payment Breakdown (FIXED) ── */}
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

                {/* ── Mark as Completed - Green with border ── */}
                <button
                  onClick={() => setModalType("complete")}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 border-2 border-green-600 text-white font-semibold py-2 px-2 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  Mark as Completed
                </button>

                {/* ── Message Client - Blue border ── */}
                <Link to={`/client/messages?client=${bookingId}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Message Client
                  </button>
                </Link>

                {/* ── Cancel Button with Warning ── */}
                <button
                  onClick={() => setShowCancelWarning(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-50 transition-colors mt-3"
                >
                  <AlertTriangle className="w-5 h-5" />
                  Cancel Job
                </button>

                {/* ── Report Issue ── */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Flag className="w-5 h-5" />
                  Report Issue
                </button>

                {/* Important Notes */}
                <div className="mt-6 pt-6 border-t border-gray-200 bg-[#fdffe9] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">Important Notes</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Keep client updated on progress</span>
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
                  <h3 className="text-lg font-bold text-gray-800">Confirm Mark as Completed</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Are you sure you want to mark this job as completed? Please ensure all work has been finished and the client is satisfied.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={closeModal}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Yes, Mark Completed"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Cancel Warning Modal ── */}
          {showCancelWarning && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Cannot Cancel</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="flex items-center gap-3 mb-4 text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                    <AlertTriangle className="w-8 h-8" />
                    <p className="text-sm font-medium">This job is currently In Progress</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Jobs in progress cannot be cancelled right now. Please contact support if you need assistance.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Alternatively, you can mark the job as completed or report an issue.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <button
                    onClick={() => setShowCancelWarning(false)}
                    className="w-full rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Report Issue Modal ── */}
          {showReportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
              <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-800">Report Issue</h3>
                </div>
                <div className="px-6 py-4">
                  <p className="text-sm text-gray-600 mb-4">Describe the issue you're experiencing:</p>
                  <textarea
                    rows={4}
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue in detail..."
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3] outline-none"
                  />
                </div>
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowReportModal(false);
                        setReportReason("");
                      }}
                      className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReportIssue}
                      disabled={actionLoading}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : "Submit Report"}
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

export default InProgressJobDetails;

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