// src/components/provider/ReviewsTab.jsx

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import reviewService from "../../api/reviewService";
import ratingService from "../../api/ratingService";

const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const getReviewerName = (review) =>
  review.raw?.client_name ||
  review.raw?.client_full_name ||
  review.raw?.client?.name ||
  `Client #${review.clientId}`;

const ReviewsTab = ({ provider }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const providerId =
      provider.id || provider.provider_id || provider.service_provider_id;

    Promise.all([
      reviewService.getProviderReviews(providerId),
      ratingService.getProviderRatings(providerId),
    ])
      .then(([providerReviews, ratings]) => {
        if (!mounted) return;
        const ratingsByBooking = new Map(
          ratings.map((rating) => [String(rating.bookingId), rating.score]),
        );
        setReviews(
          providerReviews.map((review) => ({
            ...review,
            reviewerName: getReviewerName(review),
            rating: ratingsByBooking.get(String(review.bookingId)) || 0,
          })),
        );
        setError("");
      })
      .catch(() => {
        if (mounted) setError("Unable to load reviews right now.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [provider]);

  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold">Reviews</h2>

      <div className="rounded-lg bg-gray-50 p-5 text-center">
        <Star className="mx-auto mb-3 h-7 w-7 fill-yellow-400 text-yellow-400" aria-hidden="true" />

        <p className="text-2xl font-bold">{provider.average_rating || "New"}</p>

        <p className="text-gray-500 mt-2">
          {provider.total_reviews || 0} Reviews
        </p>
      </div>

      {loading && <p className="mt-8 text-gray-500">Loading reviews...</p>}

      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 text-center">
          <h3 className="text-base font-semibold">No reviews yet</h3>
          <p className="text-gray-500 mt-3">
            Reviews from completed bookings will appear here.
          </p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {review.reviewerName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                {review.rating > 0 && (
                  <span className="inline-flex gap-0.5 text-yellow-500" aria-label={`${review.rating} out of 5 stars`}>
                    {Array.from({ length: review.rating }, (_, index) => (
                      <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
                    ))}
                  </span>
                )}
              </div>
              <p className="mt-4 text-gray-600 whitespace-pre-line">
                {review.comment || "No comment provided."}
              </p>
              {review.providerResponse && (
                <p className="mt-4 border-l-2 border-blue-500 pl-4 text-sm text-gray-600">
                  {review.providerResponse}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
