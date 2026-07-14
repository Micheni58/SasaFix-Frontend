// src/pages/ServiceProvider/Jobs/CompletedJobDetails.jsx - With Proper Error Handling

import { useState, useEffect } from "react";
import { 
  Mail, Phone, Calendar, Clock3, MapPin, 
  MessageSquare, Loader2, CheckCircle2, Star, Download,
  Eye
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import ratingService from "../../../api/ratingService";
import reviewService from "../../../api/reviewService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

// ─────────────────────────────────────────────
// SKELETON LOADING COMPONENT
// ─────────────────────────────────────────────

function CompletedJobSkeleton() {
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
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="h-5 w-5 rounded-full bg-gray-200 mt-1" />
                        <div className="h-5 w-32 rounded bg-gray-200" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="h-6 w-40 rounded bg-gray-200 mb-6" />
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-6 w-6 rounded bg-gray-200" />
                      ))}
                    </div>
                    <div className="h-6 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="h-4 w-full rounded bg-gray-200" />
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
                  {[...Array(3)].map((_, i) => (
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

function CompletedJobDetails() {
  const { id: bookingId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState(null);
  const [loadingReview, setLoadingReview] = useState(false);

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
          status: b.status || 'Completed',
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
            { task: 'Work Completed', completed: true },
            { task: 'Payment Released', completed: true }
          ],
          raw: b
        };
        setJob(mapped);
        
        // ── Fetch rating for this booking (silently handle 404) ──
        setLoadingReview(true);
        
        // Fetch rating
        ratingService.getBookingRating(bookingId)
          .then((ratingData) => {
            if (mounted && ratingData) {
              setRating(ratingData);
            }
          })
          .catch((err) => {
            // Silently handle 404 - no rating exists
            if (err.response?.status === 404) {
              console.info('No rating found for this booking');
            } else {
              console.warn('Rating fetch failed:', err);
            }
            setRating(null);
          });
        
        // Fetch review
        reviewService.getBookingReview(bookingId)
          .then((reviewData) => {
            if (mounted && reviewData) {
              setReview(reviewData);
            }
          })
          .catch((err) => {
            // Silently handle 404 - no review exists
            if (err.response?.status === 404) {
              console.info('No review found for this booking');
            } else {
              console.warn('Review fetch failed:', err);
            }
            setReview(null);
          })
          .finally(() => {
            if (mounted) setLoadingReview(false);
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

  // ── Handle Download Invoice ──
  const handleDownloadInvoice = () => {
    alert("📄 Invoice download feature coming soon!");
  };

  // ── Handle View More Jobs ──
  const handleViewMoreJobs = () => {
    navigate("/provider/my-jobs");
  };

  // ── Loading state with skeleton ──
  if (loading) {
    return <CompletedJobSkeleton />;
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

  // Use fetched rating and review or show "No rating yet" message
  const hasRating = rating !== null && rating !== undefined;
  const hasReview = review !== null && review !== undefined;
  const ratingScore = hasRating ? rating.score : null;
  const reviewText = hasReview ? review.comment : null;

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
                <h1 className="text-3xl font-bold text-gray-800">Completed Job</h1>
                <p className="text-gray-600 mt-2">Request ID #{job.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800">
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
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-600">{item.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* ── Client Review (with empty state) ── */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Client Review</h2>
                
                {hasRating && ratingScore ? (
                  <>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < ratingScore ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <span className="text-lg font-semibold text-gray-800">
                        {ratingScore}.0 Rating
                      </span>
                    </div>
                    {hasReview && reviewText ? (
                      <p className="text-gray-700 text-sm leading-relaxed">{reviewText}</p>
                    ) : (
                      <p className="text-gray-500 text-sm italic">No review comment provided.</p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-gray-400 mb-2">
                      <Star className="w-12 h-12 mx-auto text-gray-300" />
                    </div>
                    <p className="text-gray-500">No rating yet</p>
                    <p className="text-sm text-gray-400">The client hasn't left a rating for this job.</p>
                  </div>
                )}
              </section>

              {/* ── Payment Breakdown ── */}
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
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <p className="text-sm text-green-700 font-medium">✅ Payment released to your wallet</p>
                </div>
              </section>
            </div>

            {/* ── Sidebar - Actions ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {/* ── Download Invoice ── */}
                <button
                  onClick={handleDownloadInvoice}
                  className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white font-semibold py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download Invoice
                </button>

                {/* ── Message Client - Blue border ── */}
                <Link to={`/client/messages?client=${bookingId}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Message Client
                  </button>
                </Link>

                {/* ── View More Jobs ── */}
                <button
                  onClick={handleViewMoreJobs}
                  className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors mt-3"
                >
                  <Eye className="w-5 h-5" />
                  View More Jobs
                </button>

                {/* ── Completion Details ── */}
                <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">✅ Completion Details</p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Job completed successfully</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Client approved the work</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">✓</span>
                      <span>Payment processed</span>
                    </li>
                    {hasRating && ratingScore && (
                      <li className="flex gap-2">
                        <span className="text-green-600 font-bold">✓</span>
                        <span>{ratingScore}-star rating received</span>
                      </li>
                    )}
                    {!hasRating && (
                      <li className="flex gap-2">
                        <span className="text-gray-400 font-bold">○</span>
                        <span className="text-gray-400">Awaiting client rating</span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CompletedJobDetails;

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