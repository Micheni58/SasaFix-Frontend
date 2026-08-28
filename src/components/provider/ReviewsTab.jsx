// src/components/provider/ReviewsTab.jsx

import { useEffect, useState } from "react";
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
    const providerId = provider.id || provider.provider_id || provider.service_provider_id;

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
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">

      <h2 className="text-2xl font-bold mb-6">
        Reviews
      </h2>

      <div className="bg-gray-50 rounded-xl p-8 text-center">

        <h3 className="text-5xl mb-3">
          ⭐
        </h3>

        <p className="text-3xl font-bold">
          {provider.average_rating || "New"}
        </p>

        <p className="text-gray-500 mt-2">
          {provider.total_reviews || 0} Reviews
        </p>

      </div>

      {loading && <p className="mt-8 text-gray-500">Loading reviews...</p>}

      {error && <p className="mt-8 text-red-600">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <div className="mt-8 bg-white border rounded-xl p-8 text-center">
          <h3 className="font-semibold text-xl">No reviews yet</h3>
          <p className="text-gray-500 mt-3">
            Reviews from completed bookings will appear here.
          </p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="mt-8 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="border rounded-xl p-6">
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
                  <span className="text-yellow-500">{"★".repeat(review.rating)}</span>
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