// src/pages/Client/bookings/RescheduleRequestedDetails.jsx

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock3,
  MapPin,
  MessageSquare,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Clock,
  User,
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

function RescheduleRequestedSkeleton() {
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

function RescheduleRequestedDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const isProviderInitiated = ["provider", "service_provider", "service-provider"].includes(initiator);
        const isClientInitiated = ["client", "customer"].includes(initiator);

        // If provider initiated or status is proposed, redirect to proposed page
        if (isProviderInitiated || (!isProviderInitiated && !isClientInitiated && rawStatus === "reschedule_proposed")) {
          navigate(`/client/my-bookings/reschedule-proposed/${bookingId}`, { replace: true });
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

  const handleBack = () => {
    navigate("/client/my-bookings", { state: { rescheduleUpdated: true } });
  };

  if (loading) return <RescheduleRequestedSkeleton />;

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
                <h1 className="text-3xl font-bold text-gray-800">Reschedule Request</h1>
                <p className="text-gray-600 mt-2">Booking #{booking.id}</p>
              </div>
             
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                You've requested a reschedule. Waiting for the provider to respond.
              </p>
              
              {rescheduleReason && (
                <p className="text-sm text-gray-500 mt-1">
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
              <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-xl font-bold text-gray-800">Status</h2>

                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-center">
                  <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-amber-700">Awaiting Provider Response</p>
                  <p className="text-xs text-amber-500 mt-1">The provider will review your request</p>
                </div>

                <Link to={`/client/messages?provider=${booking.serviceProviderId}`}>
                  <button className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white py-3 px-2 rounded-lg hover:bg-blue-900 transition-colors mb-2">
                    <MessageSquare className="w-5 h-5" />
                    Message Provider
                  </button>
                </Link>

                <button
                  onClick={handleBack}
                  className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to My Bookings
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default RescheduleRequestedDetails;