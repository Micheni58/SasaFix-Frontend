// src/components/provider/ReviewsTab.jsx

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import bookingService from "../../api/bookingService";
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

const getEntityName = (entity) => {
  if (!entity || typeof entity !== "object") return "";

  const candidates = [
    entity.full_name,
    entity.fullName,
    entity.name,
    [entity.first_name, entity.last_name].filter(Boolean).join(" "),
  ];

  return candidates.find((candidate) => {
    const name = String(candidate || "").trim();
    return name && !/^client\s*#?\s*\d+$/i.test(name);
  })?.trim() || "";
};

const getReviewerName = (review, user, booking) => {
  const candidates = [
    getEntityName(user?.user || user?.data?.user || user?.data || user),
    getEntityName(review.raw?.client),
    getEntityName(booking?.client),
    [review.raw?.client_first_name, review.raw?.client_last_name].filter(Boolean).join(" "),
    [booking?.client_first_name, booking?.client_last_name].filter(Boolean).join(" "),
    review.raw?.client_name,
    review.raw?.client_full_name,
    booking?.client_full_name,
    booking?.client_name,
  ];
  const name = candidates.find((candidate) => {
    const value = String(candidate || "").trim();
    return value && !/^client\s*#?\s*\d+$/i.test(value);
  });

  return String(name || `Client #${review.clientId}`).trim();
};

const ReviewSkeleton = () => (
  <article className="rounded-lg border border-gray-200 p-3 sm:p-4" aria-hidden="true">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <div className="loading-skeleton h-4 w-36 rounded" />
        <div className="loading-skeleton h-3 w-24 rounded" />
      </div>
      <div className="loading-skeleton h-4 w-24 rounded" />
    </div>
    <div className="mt-3 space-y-2">
      <div className="loading-skeleton h-4 w-full rounded" />
      <div className="loading-skeleton h-4 w-5/6 rounded" />
      <div className="loading-skeleton h-4 w-2/3 rounded" />
    </div>
  </article>
);

const ReviewsTab = ({ provider }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const providerId =
      provider.id || provider.provider_id || provider.service_provider_id;

    const loadReviews = async () => {
      try {
        const [providerReviews, ratings] = await Promise.all([
          reviewService.getProviderReviews(providerId),
          ratingService.getProviderRatings(providerId),
        ]);
        const clientIds = [...new Set(providerReviews.map((review) => review.clientId).filter(Boolean))];
        const clients = await Promise.all(clientIds.map((clientId) => bookingService.getUserById(clientId)));
        if (!mounted) return;

        const clientsById = new Map(clientIds.map((clientId, index) => [String(clientId), clients[index]]));
        const ratingsByBooking = new Map(
          ratings.map((rating) => [String(rating.bookingId), rating.score]),
        );
        const enrichedReviews = await Promise.all(providerReviews.map(async (review) => {
          const user = clientsById.get(String(review.clientId));
          let booking = null;
          if (getReviewerName(review, user) === `Client #${review.clientId}` && review.bookingId) {
            booking = await bookingService.getBooking(review.bookingId);
          }

          return {
            ...review,
            reviewerName: getReviewerName(review, user, booking?.raw),
            rating: ratingsByBooking.get(String(review.bookingId)) || 0,
          };
        }));
        if (!mounted) return;
        setReviews(enrichedReviews);
        setError("");
      } catch {
        if (mounted) setError("Unable to load reviews right now.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadReviews();

    return () => {
      mounted = false;
    };
  }, [provider]);

  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold">Reviews</h2>

      <div className="rounded-lg bg-gray-50 p-5 text-center">
        <Star className="mx-auto mb-3 h-7 w-7 fill-yellow-400 text-yellow-400" aria-hidden="true" />

        <p className="text-2xl font-bold text-gray-900">
          {Number(provider.average_rating) > 0 ? Number(provider.average_rating).toFixed(1) : "New"}
        </p>

        <p className="text-gray-500 mt-2">
          {loading ? Number(provider.total_reviews || 0) : reviews.length} Reviews
        </p>
      </div>

      {loading && (
        <div className="mt-6 space-y-3" role="status" aria-label="Loading provider reviews" aria-busy="true">
          {Array.from({ length: 3 }).map((_, index) => <ReviewSkeleton key={index} />)}
        </div>
      )}

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
        <div className="mt-6 space-y-3">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-lg border border-gray-200 p-3 sm:p-4">
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
              <p className="mt-3 text-sm leading-5 text-gray-600 whitespace-pre-line">
                {review.comment || "No comment provided."}
              </p>
              {review.providerResponse && (
                <div className="provider-review-response mt-3 rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
                  <p className="text-xs font-semibold text-blue-800">Provider response</p>
                  <p className="mt-1 text-sm leading-5 text-blue-700">{review.providerResponse}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
