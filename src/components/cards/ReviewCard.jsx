// src/components/cards/ReviewCard.jsx

import { useState, useEffect } from "react";
import { Star, Send, Loader2, AlertCircle, CheckCircle2, PenLine } from "lucide-react";
import ratingService from "../../api/ratingService";
import reviewService from "../../api/reviewService";

// ── Star Picker Component ──
function StarPicker({ value, onChange, disabled }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 disabled:cursor-not-allowed transition-transform hover:scale-110"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            className={`h-8 w-8 transition-colors ${
              (hovered || value) >= n
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// ── Skeleton Loader ──
function SkeletonReviewCard() {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-5 w-5 animate-pulse rounded bg-gray-200"></div>
        <div className="h-7 w-32 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="h-4 w-64 animate-pulse rounded bg-gray-100 mb-5"></div>
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4"></div>
      <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100"></div>
      <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200 mt-4"></div>
    </section>
  );
}

// ── Main Review Card Component ──
export function ReviewCard({ bookingId, providerId, providerName, booking }) {
  const [loading, setLoading] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [existingRating, setExistingRating] = useState(null);
  const [score, setScore] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // ── Fetch existing review/rating ──
  useEffect(() => {
    let mounted = true;

    const fetchExisting = async () => {
      try {
        // Fetch review
        const review = await reviewService.getBookingReview(bookingId);
        if (mounted && review?.id) {
          setExistingReview(review);
          setComment(review.comment || "");
        }
      } catch (e) {
        // 404 is expected when no review exists
        if (e.response?.status !== 404) {
          console.error("Error fetching review:", e);
        }
      }

      try {
        // Fetch rating
        const rating = await ratingService.getBookingRating(bookingId);
        if (mounted && rating?.id) {
          setExistingRating(rating);
          setScore(rating.score || 0);
        }
      } catch (e) {
        // 404 is expected when no rating exists
        if (e.response?.status !== 404) {
          console.error("Error fetching rating:", e);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchExisting();
    return () => { mounted = false; };
  }, [bookingId]);

  // ── Handle Submit ──
  const handleSubmit = async () => {
    if (score < 1) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Get client_id from booking or localStorage
      const clientId = booking?.client_id || booking?.raw?.client_id;
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const fallbackClientId = storedUser?.id || storedUser?.client_id;
      const finalClientId = clientId || fallbackClientId;

      if (!finalClientId) {
        setError("Client ID not found. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      // Submit rating
      await ratingService.createRating({
        booking_id: bookingId,
        client_id: finalClientId,
        provider_id: providerId,
        score: score,
      });

      // Submit review if comment exists
      if (comment.trim()) {
        await reviewService.createReview({
          booking_id: bookingId,
          client_id: finalClientId,
          provider_id: providerId,
          comment: comment.trim(),
        });
      }

      setSubmitted(true);
      setError(null);

    } catch (err) {
      console.error("Submit error:", err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(err.message || "Failed to submit review. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading State ──
  if (loading) {
    return <SkeletonReviewCard />;
  }

  const alreadyReviewed = Boolean(existingRating?.id) || submitted;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-1">
        <PenLine className="w-5 h-5 text-[#056db3]" />
        <h2 className="text-xl font-bold text-gray-800">Your Review</h2>
      </div>
      <p className="text-sm text-gray-500 mb-5">
        {alreadyReviewed
          ? `Thanks for your feedback on ${providerName || "your provider"}.`
          : `How was your experience with ${providerName || "your provider"}?`}
      </p>

      {alreadyReviewed ? (
        // ── Already Reviewed View ──
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={`h-5 w-5 ${
                  (existingRating?.score || score) >= n
                    ? "fill-amber-400 text-amber-400"
                    : "fill-transparent text-gray-300"
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-semibold text-gray-700">
              {(existingRating?.score || score).toFixed(1)} / 5
            </span>
          </div>
          {(existingReview?.comment || comment) && (
            <p className="text-sm text-gray-700">{existingReview?.comment || comment}</p>
          )}
          <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#056db3]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Review submitted
          </p>
        </div>
      ) : (
        // ── Review Form ──
        <>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate your experience
            </label>
            <StarPicker value={score} onChange={setScore} disabled={submitting} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your review (optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
              rows={4}
              placeholder="Tell other clients about your experience..."
              className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20 disabled:opacity-60 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#056db3] py-3 px-4 font-semibold text-white hover:bg-[#045a94] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit review
          </button>
        </>
      )}
    </section>
  );
}

export default ReviewCard;