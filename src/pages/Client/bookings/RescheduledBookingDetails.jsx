// src/pages/Client/Bookings/RescheduledBookingDetails.jsx

import { useState, useEffect } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Clock3,
  MapPin,
  MessageSquare,
  Loader2,
  CheckCircle2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

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

function RescheduledBookingSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
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

              <div className="lg:col-span-1">
                <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="h-6 w-24 rounded bg-gray-200 mb-4" />
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-12 w-full rounded-lg bg-gray-200"
                    />
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

function RescheduledBookingDetails() {
  // ── FIX: Use "bookingId" to match the route parameter ──
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let mounted = true;

    // ── Check if bookingId is undefined ──
    if (!bookingId) {
      console.error("❌ No booking ID found in URL parameters");
      setError("Invalid booking ID");
      setLoading(false);
      return;
    }

    console.log("🔍 Fetching booking with ID:", bookingId);
    setLoading(true);

    bookingService
      .getBooking(bookingId)
      .then((b) => {
        if (!mounted) return;

        console.log("📦 Raw booking data:", b);

        if (!b) {
          setError("Booking not found");
          setLoading(false);
          return;
        }

        // ── Extract service fee ──
        let serviceFeeRaw = 0;
        if (b.amountRaw !== undefined && b.amountRaw !== null) {
          serviceFeeRaw =
            typeof b.amountRaw === "string"
              ? parseFloat(b.amountRaw)
              : b.amountRaw;
        } else if (b.raw?.amount !== undefined && b.raw?.amount !== null) {
          serviceFeeRaw =
            typeof b.raw.amount === "string"
              ? parseFloat(b.raw.amount)
              : b.raw.amount;
        } else if (
          b.amount !== undefined &&
          b.amount !== null &&
          typeof b.amount === "number"
        ) {
          serviceFeeRaw = b.amount;
        } else if (
          b.amount &&
          typeof b.amount === "string" &&
          b.amount.includes("KES")
        ) {
          const clean = b.amount.replace(/[^0-9.]/g, "");
          serviceFeeRaw = parseFloat(clean) || 0;
        }
        if (isNaN(serviceFeeRaw) || serviceFeeRaw <= 0) serviceFeeRaw = 0;

        // ── Extract provider name ──
        const providerName =
          b.providerName ||
          b.worker ||
          b.provider_full_name ||
          b.raw?.provider_full_name ||
          b.raw?.provider_name ||
          "Provider";

        // ── Extract date and time ──
        const dateValue =
          b.date || b.scheduled_date || b.raw?.scheduled_date || "";
        const timeValue =
          b.time || b.scheduled_start_time || b.raw?.scheduled_start_time || "";

        const mapped = {
          id: b.id || bookingId,
          service:
            b.service || b.service_name || b.raw?.service_name || "Service",
          description: b.details || b.description || b.raw?.description || "",
          date: dateValue,
          time: timeValue,
          location: b.location || b.raw?.location || "",
          status: b.status || b.raw?.status || "Rescheduled",
          provider: {
            name: providerName,
            initials: getInitials(providerName),
            phone:
              b.providerPhone ||
              b.raw?.provider?.phone ||
              b.raw?.service_provider?.phone ||
              "",
            email:
              b.providerEmail ||
              b.raw?.provider?.email ||
              b.raw?.service_provider?.email ||
              "",
          },
          serviceFee: `KES ${serviceFeeRaw.toLocaleString()}`,
          serviceFeeRaw: serviceFeeRaw,
          timeline: [
            { task: "Booking Requested", completed: true },
            { task: "Provider Proposed New Time", completed: true },
            { task: "Awaiting Your Response", completed: false },
            { task: "Work Started", completed: false },
            { task: "Work Completed", completed: false },
          ],
          raw: b,
        };

        console.log("✅ Mapped booking data:", mapped);
        setBooking(mapped);
      })
      .catch((e) => {
        console.error("❌ Error fetching booking:", e);
        if (!mounted) return;
        setError(e.message || "Failed to load booking");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [bookingId]);

  const handleAccept = async () => {
    if (
      !window.confirm("Accept the new date and time proposed by the provider?")
    )
      return;
    setActionLoading(true);
    try {
      await bookingService.updateBookingStatus(bookingId, "ACCEPTED");
      setSuccessMessage("✅ New schedule accepted!");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/client/my-bookings");
    } catch (err) {
      alert("Failed to accept: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDecline = async () => {
    if (
      !window.confirm(
        "Decline this rescheduled time? This will cancel the booking.",
      )
    )
      return;
    setActionLoading(true);
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccessMessage("✅ Reschedule declined.");
      setTimeout(() => setSuccessMessage(null), 5000);
      navigate("/client/my-bookings");
    } catch (err) {
      alert("Failed to decline: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <RescheduledBookingSkeleton />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-72">
          <Navbar />
          <main className="pt-24 px-6 pb-6 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-500">Error: {error}</p>
              <p className="text-sm text-gray-500 mt-2">
                Booking ID: {bookingId || "Not provided"}
              </p>
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

  if (!booking) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
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
      <Sidebar role="client" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
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
                <h1 className="text-3xl font-bold text-gray-800">
                  New Time Proposed
                </h1>
                <p className="text-gray-600 mt-2">Booking ID #{booking.id}</p>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-semibold bg-purple-100 text-purple-800">
                {booking.status}
              </span>
            </div>

            <div className="rounded-lg bg-purple-50 border border-purple-200 p-4">
              <p className="text-sm text-purple-700">
                Your service provider has proposed a new date and time for this
                booking. Please review the details below and accept or decline.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Main Content ── */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Booking Summary
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Service Type</p>
                    <p className="text-lg text-gray-800 mt-1">
                      {booking.service}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>Proposed Date</span>
                      </div>
                      <p className="text-lg text-gray-800 mt-1">
                        {formatDate(booking.date) || "N/A"}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock3 className="h-4 w-4" />
                        <span>Proposed Time</span>
                      </div>
                      <p className="text-lg text-gray-800 mt-1">
                        {formatTimeRange(booking.time) || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Location</span>
                    </div>
                    <p className="text-lg text-gray-800 mt-1">
                      {booking.location || "N/A"}
                    </p>
                  </div>
                  {booking.description && (
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="text-gray-800 mt-1">
                        {booking.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Service Fee</p>
                    <p className="text-lg text-gray-800 mt-1 font-semibold">
                      {booking.serviceFee}
                    </p>
                  </div>
                </div>
              </section>

              {/* Provider Information */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Provider Information
                </h2>
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                    {booking.provider.initials}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-800">
                      {booking.provider.name}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mb-6">
                  {booking.provider.phone && (
                    <a
                      href={`tel:${booking.provider.phone}`}
                      className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span className="text-sm font-medium">Call</span>
                    </a>
                  )}
                  {booking.provider.email && (
                    <a
                      href={`mailto:${booking.provider.email}`}
                      className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm font-medium">Email</span>
                    </a>
                  )}
                </div>
                <button className="w-full px-4 py-2 border-2 border-[#056db3] text-[#056db3] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  View Provider Profile
                </button>
              </section>

              {/* Timeline */}
              <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Booking Status Timeline
                </h2>
                <div className="space-y-4">
                  {booking.timeline.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="shrink-0 mt-1">
                        {item.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p
                          className={`font-medium ${item.completed ? "text-green-600" : "text-gray-800"}`}
                        >
                          {item.task}
                        </p>
                        {item.task === "Awaiting Your Response" && (
                          <p className="text-sm text-purple-600">
                            Accept or decline to move forward
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Sidebar - Actions ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Actions</h2>

                {/* ── Accept - Green button ── */}
                <button
                  onClick={handleAccept}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 border-2 border-green-600 text-white font-semibold py-2 px-2 rounded-lg hover:bg-green-700 hover:border-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-5 h-5" />
                  )}
                  Accept New Time
                </button>

                {/* ── Decline - Red button ── */}
                <button
                  onClick={handleDecline}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 text-red-600 border-2 border-red-300 font-semibold py-2 px-2 rounded-lg hover:bg-red-100 hover:border-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  Decline
                </button>

                {/* ── Message Provider - Blue border ── */}
                <Link to={`/client/messages?provider=${bookingId}`}>
                  <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Message Provider
                  </button>
                </Link>

                {/* ── Back to My Bookings - Grey border ── */}
                <button
                  onClick={() => navigate("/client/my-bookings")}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors mt-4"
                >
                  Back to My Bookings
                </button>

                {/* Important Notes */}
                <div className="mt-6 pt-6 border-t border-gray-200 bg-[#fdffe9] rounded-2xl p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-3">
                    Important Notes
                  </p>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Review the new date and time carefully</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>Declining will cancel this booking</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>
                        Message the provider if you need a different time
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-[#056db3] font-bold">•</span>
                      <span>The provider is notified once you respond</span>
                    </li>
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

export default RescheduledBookingDetails;

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
