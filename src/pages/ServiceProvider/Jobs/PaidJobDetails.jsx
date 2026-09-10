// src/pages/Provider/PaidJobDetails.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Star,
  User,
  Wallet,
} from "lucide-react";
import bookingService from "../../../api/bookingService";
import ratingService from "../../../api/ratingService";
import reviewService from "../../../api/reviewService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { BookingInfoCard } from "../../../components/cards/BookingInfoCard";
import { PaymentDetailsCard } from "../../../components/cards/PaymentDetailsCard";
import { Timeline } from "../../../components/cards/Timeline";
import { SasaFixReceipt } from "../../../components/SasaFixReceipt";
import { useToast } from "../../../components/ui/ToastProvider";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatDate(value) {
  if (!value) return "Date not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
}

function formatTime(value) {
  if (!value) return "Time not set";
  const formatOne = (time) => {
    const [hours, minutes] = time.trim().split(":");
    const hour = Number(hours);
    if (Number.isNaN(hour) || minutes === undefined) return time;
    return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
  };
  return value.includes(" - ")
    ? value.split(" - ").map(formatOne).join(" - ")
    : formatOne(value);
}

function initials(name) {
  return (name || "Client")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────

function PageShell({ children }) {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="ml-72 flex-1">
        <Navbar />
        <main className="px-6 pb-6 pt-24">{children}</main>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// JOB REVIEW CARD
// ─────────────────────────────────────────────

function JobReviewCard({ rating, review, loading }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-bold text-gray-800">Client Rating & Review</h2>
      <p className="mb-5 text-sm text-gray-500">Feedback left for this specific job.</p>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-16 rounded bg-gray-100" />
        </div>
      ) : rating || review ? (
        <>
          {rating ? (
            <div className="mb-4 flex items-center gap-3">
              <div className="flex gap-1" aria-label={`${rating.score} out of 5 stars`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${star <= rating.score ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <span className="font-semibold text-gray-800">{rating.score.toFixed(1)} / 5</span>
            </div>
          ) : (
            <p className="mb-4 text-sm italic text-gray-500">No star rating was submitted.</p>
          )}
          {review?.comment ? (
            <blockquote className="rounded-lg border-l-4 border-[#056db3] bg-blue-50 px-4 py-3 text-sm leading-relaxed text-gray-700">
              “{review.comment}”
            </blockquote>
          ) : (
            <p className="text-sm italic text-gray-500">The client gave a rating without a written review.</p>
          )}
        </>
      ) : (
        <div className="py-5 text-center">
          <Star className="mx-auto mb-2 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-600">No rating yet</p>
          <p className="mt-1 text-sm text-gray-400">The client has not reviewed this job yet.</p>
        </div>
      )}
    </section>
  );
}

// ─────────────────────────────────────────────
// RECEIPT DOWNLOAD BUTTON
// ─────────────────────────────────────────────

function ReceiptDownloadButton({ ui }) {
  const fileName = `SasaFix-Receipt-provider-Booking-${ui.id}.pdf`;
  const toast = useToast();

  const handleDownload = (error) => {
    if (error) {
      toast.error("Receipt download failed", "Please try again.");
      return;
    }

    toast.info("Preparing receipt", "Your PDF download will begin shortly.");
  };

  return (
    <PDFDownloadLink
      document={<SasaFixReceipt booking={ui} role="provider" />}
      fileName={fileName}
    >
      {({ loading: pdfLoading, error }) => (
        <button
          onClick={() => handleDownload(error)}
          disabled={pdfLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 px-3 py-2 text-emerald-600 transition-colors hover:bg-emerald-50 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pdfLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating Receipt...
            </>
          ) : error ? (
            <>
              <Download className="h-5 w-5" />
              Retry Download
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              Download Receipt
            </>
          )}
        </button>
      )}
    </PDFDownloadLink>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function PaidJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(null);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(true);

  useEffect(() => {
    let active = true;

    bookingService
      .getBooking(Number(id))
      .then((booking) => {
        if (active) setJob(booking);
      })
      .catch((error) => console.error("Could not load paid job:", error))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    setReviewLoading(true);

    Promise.all([
      ratingService.getBookingRating(Number(id)),
      reviewService.getBookingReview(Number(id)),
    ])
      .then(([ratingData, reviewData]) => {
        if (!active) return;
        setRating(ratingData);
        setReview(reviewData);
      })
      .catch((error) => console.warn("Could not load job review:", error))
      .finally(() => {
        if (active) setReviewLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <div className="space-y-6 animate-pulse">
          <div className="h-10 w-64 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="h-72 rounded-xl bg-gray-200" />
              <div className="h-56 rounded-xl bg-gray-200" />
            </div>
            <div className="h-80 rounded-xl bg-gray-200" />
          </div>
        </div>
      </PageShell>
    );
  }

  if (!job) {
    return <PageShell><p className="text-center text-gray-500">Job not found.</p></PageShell>;
  }

  const amount = Number(job.amountRaw || 0);
  const platformFee = Math.round(amount * 0.1);
  const clientName = job.clientName || job.client || job.raw?.client_full_name || "Client";
  const clientId = job.clientId || job.raw?.client_id;
  const clientEmail = job.raw?.client_email || job.raw?.client?.email;
  const clientPhone = job.raw?.client_phone || job.raw?.client?.phone_number;
  const paidAt = job.paidAt || job.raw?.paid_at;

  // ── Build UI object for receipt ──
  const ui = {
    id: job.id,
    service: job.service || "Service",
    description: job.details || "No description provided.",
    date: formatDate(job.date || job.scheduled_date),
    time: formatTime(job.time || `${job.scheduled_start_time || ""} - ${job.scheduled_end_time || ""}`),
    location: job.location || "Location not provided",
    amountRaw: amount,
    serviceFee: `KES ${amount.toLocaleString()}`,
    commission: `KES ${platformFee.toLocaleString()}`,
    totalPaid: `KES ${(amount - platformFee).toLocaleString()}`,
    commissionRate: 0.1,
    isPremium: job.raw?.service_provider?.is_premium || false,
    paidAt: paidAt || new Date().toISOString(),
    worker: {
      id: job.serviceProviderId || job.raw?.service_provider_id,
      name: job.providerName || job.worker || "Provider",
      initials: job.initials || initials(job.providerName || job.worker || "Provider"),
      trade: job.raw?.service_provider?.service_type || null,
      rating: job.raw?.service_provider?.rating || null,
      phone: job.raw?.service_provider?.contact_phone || null,
      email: job.raw?.service_provider?.contact_email || null,
    },
  };

  const booking = {
    service: job.service || "Service",
    description: job.details || "No description provided.",
    date: formatDate(job.date || job.scheduled_date),
    time: formatTime(job.time || `${job.scheduled_start_time || ""} - ${job.scheduled_end_time || ""}`),
    location: job.location || "Location not provided",
    serviceFee: `KES ${amount.toLocaleString()}`,
    commission: `KES ${platformFee.toLocaleString()}`,
    totalPaid: `KES ${(amount - platformFee).toLocaleString()}`,
    commissionRate: 0.1,
  };

  return (
    <PageShell>
      <button
        onClick={() => navigate("/provider/my-jobs")}
        className="mb-4 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Jobs
      </button>

      <section className="mb-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Payment Received</h1>
            <p className="mt-2 text-gray-600">Job #{job.id}</p>
          </div>
          <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> Paid
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <Wallet className="h-5 w-5 shrink-0" />
          Payment has been processed. Your payout is <strong>{booking.totalPaid}</strong> after the platform fee.
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <BookingInfoCard booking={booking} />

          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-bold text-gray-800">Client Details</h2>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-[#056db3]">
                {initials(clientName)}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-gray-800">{clientName}</p>
                <div className="mt-3 space-y-2 text-sm text-gray-600">
                  {clientEmail && <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{clientEmail}</p>}
                  {clientPhone && <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{clientPhone}</p>}
                  {!clientEmail && !clientPhone && <p className="flex items-center gap-2"><User className="h-4 w-4" />Client contact details are unavailable.</p>}
                </div>
              </div>
            </div>
          </section>

          <Timeline items={[
            { task: "Booking Requested", completed: true },
            { task: "Job Accepted", completed: true },
            { task: "Work Completed", completed: true },
            { task: "Payment Processed", completed: true },
          ]} />

          <JobReviewCard
            rating={rating}
            review={review}
            loading={reviewLoading}
          />

          <PaymentDetailsCard
            booking={booking}
            isPaid
            isPaymentPending={false}
            isPaymentProcessing={false}
            isRejected={false}
            isCancelled={false}
            isCompleted={false}
            isApproved
          />
        </div>

        <aside className="h-fit space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-6">
          <h2 className="text-xl font-bold text-gray-800">Actions</h2>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
            <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-500" />
            <p className="text-sm font-semibold text-emerald-700">Payment Complete</p>
            {paidAt && <p className="mt-1 text-xs text-emerald-600">Paid on {new Date(paidAt).toLocaleDateString()}</p>}
          </div>

          {/* ── Download Receipt (PDF) ── */}
          <ReceiptDownloadButton booking={job} ui={ui} />

          <button
            onClick={() => navigate(`/provider/messages?client=${clientId || ""}`)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#056db3] px-3 py-2 text-white transition-colors hover:bg-[#045ca0] mt-2"
          >
            <MessageSquare className="h-5 w-5" /> Message Client
          </button>

          {/* ── Payment Summary ── */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-800 mb-3">Payout Summary</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex justify-between">
                <span>Service Fee</span>
                <span className="font-medium">{booking.serviceFee}</span>
              </li>
              <li className="flex justify-between text-gray-500">
                <span>Platform Fee (10%)</span>
                <span>- {booking.commission}</span>
              </li>
              <li className="flex justify-between border-t border-gray-200 pt-2 font-bold text-emerald-600">
                <span>Net Payout</span>
                <span>{booking.totalPaid}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}