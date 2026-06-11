import { useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, MessageCircle } from "lucide-react";
import bookingService from "../../api/bookingService";
import reviewService from "../../api/reviewService";

const reviewFilters = ["Most Recent", "Highest Rated", "Lowest Rated", "Unanswered"];

function getStoredProviderId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return Number(user.provider_id ?? user.service_provider_id ?? user.id ?? localStorage.getItem("userId") ?? 1);
  } catch {
    return Number(localStorage.getItem("userId") || 1);
  }
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "--";
}

function formatDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSummary(comment) {
  if (!comment) return "";
  const sentence = comment.split(".")[0];
  return sentence.length > 80 ? `${sentence.slice(0, 77)}...` : sentence;
}

function Reviews() {
  const [activeFilter, setActiveFilter] = useState("Most Recent");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const providerId = getStoredProviderId();

    async function loadReviews() {
      try {
        const [providerReviews, providerRatings] = await Promise.all([
          reviewService.getProviderReviews(providerId),
          reviewService.getProviderRatings(providerId).catch(() => []),
        ]);

        const ratingsByBookingId = new Map(
          providerRatings.map((rating) => [Number(rating.bookingId), rating])
        );

        const enrichedReviews = await Promise.all(
          providerReviews.map(async (review) => {
            const rating = ratingsByBookingId.get(Number(review.bookingId));
            let booking = null;

            try {
              booking = await bookingService.getBooking(review.bookingId);
            } catch {
              booking = null;
            }

            const clientName = booking?.clientName || `Client #${review.clientId}`;

            return {
              id: review.id,
              initials: getInitials(clientName),
              name: clientName,
              date: formatDate(review.createdAt),
              rating: Math.round(rating?.score || 0),
              summary: getSummary(review.comment),
              body: review.comment,
              response: review.providerResponse,
              thanked: review.providerThankedClient,
              createdAt: review.createdAt,
            };
          })
        );

        if (!mounted) return;
        setReviews(enrichedReviews);
        setError(null);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReviews();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredReviews = useMemo(() => {
    const sortedReviews = [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (activeFilter === "Highest Rated") {
      return [...reviews].sort((a, b) => b.rating - a.rating);
    }
    if (activeFilter === "Lowest Rated") {
      return [...reviews].sort((a, b) => a.rating - b.rating);
    }
    if (activeFilter === "Unanswered") {
      return reviews.filter((review) => !review.response);
    }
    return sortedReviews;
  }, [activeFilter, reviews]);

  const ratingBreakdown = useMemo(() => {
    const total = reviews.length || 1;
    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      return {
        stars,
        count,
        percent: Math.round((count / total) * 100),
      };
    });
  }, [reviews]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  const handleReply = async (reviewId) => {
    try {
      const updated = await reviewService.respondToReview(reviewId, replyText);
      setReviews((items) =>
        items.map((review) =>
          review.id === reviewId
            ? { ...review, response: updated.providerResponse }
            : review
        )
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleThank = async (reviewId) => {
    try {
      await reviewService.thankClientForReview(reviewId);
      setReviews((items) =>
        items.map((review) =>
          review.id === reviewId ? { ...review, thanked: true } : review
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reviews and Ratings</h1>
        <p className="mt-2 text-gray-600 max-w-2xl">
          Manage your reputation and respond to client feedback
        </p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Overall score</p>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-5xl font-bold text-gray-900">{averageRating}</span>
            <div className="flex items-center gap-1 text-yellow-500">
              {[...Array(Math.round(Number(averageRating)))].map((_, index) => (
                <Star key={index} className="h-5 w-5" fill="yellow" stroke="none" />
              ))}
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500">Based on {reviews.length} reviews</p>
        </div>

        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Rating Breakdown</h2>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#056db3]">
              {reviews.length} reviews
            </span>
          </div>
          <div className="mt-6 space-y-4">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center gap-3">
                <span className="w-16 text-sm font-medium text-gray-700">{item.stars} stars</span>
                <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-3 rounded-full bg-yellow-400" style={{ width: `${item.percent}%` }} />
                </div>
                <span className="w-12 text-right text-sm font-medium text-gray-700">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Client Reviews</h2>
            <p className="mt-1 text-sm text-gray-500">Filter reviews and respond to feedback directly.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
            >
              {reviewFilters.map((filter) => (
                <option key={filter} value={filter}>
                  {filter}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5">
          {(loading || error || filteredReviews.length === 0) && (
            <div className="py-8 text-center text-sm text-gray-500">
              {loading ? "Loading reviews..." : error ? "Unable to load reviews" : "No reviews"}
            </div>
          )}

          {filteredReviews.map((review) => (
            <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#dbeafe] text-lg font-bold text-[#1e40af]">
                    {review.initials}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{review.name}</p>
                    <p className="mt-1 text-sm text-gray-500">{review.date}</p>
                    <p className="mt-2 text-sm font-medium text-gray-700">{review.summary}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-yellow-800">
                  {[...Array(review.rating)].map((_, index) => (
                    <Star key={index} className="h-4 w-4" fill="yellow" stroke="none" />
                  ))}
                </div>
              </div>

              <p className="mt-5 text-gray-700">{review.body}</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MessageCircle className="h-4 w-4" />
                  <span>{review.response ? "Responded" : "Waiting for reply"}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleThank(review.id)}
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    <ThumbsUp className="h-4 w-4" /> {review.thanked ? "Thanked" : "Thank"}
                  </button>
                  <button
                    onClick={() => setReplyingTo(review.id)}
                    className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white hover:bg-[#045ca0]"
                  >
                    Respond
                  </button>
                </div>
              </div>

              {review.response && (
                <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold">Your response</p>
                  <p className="mt-2 text-sm leading-6">{review.response}</p>
                </div>
              )}

              {replyingTo === review.id && (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your response..."
                    className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#056db3]"
                    rows={3}
                  />
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleReply(review.id)}
                      className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white hover:bg-[#045ca0]"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Reviews;
