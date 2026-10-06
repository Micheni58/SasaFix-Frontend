import { useEffect, useMemo, useState } from "react";
import { Star, ThumbsUp, MessageCircle, Loader2 } from "lucide-react";
import bookingService from "../../api/bookingService";
import reviewService from "../../api/reviewService";
import ratingService from "../../api/ratingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ui/ToastProvider";

const reviewFilters = ["Most Recent", "Highest Rated", "Lowest Rated", "Unanswered"];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStoredProviderId() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return Number(user.provider_id ?? user.service_provider_id ?? 1);
    } catch {
        return 1;
    }
}

function getInitials(name) {
    return (name || "")
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

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StarDisplay({ count, size = "h-4 w-4" }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`${size} ${
                        star <= count
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                    }`}
                />
            ))}
        </div>
    );
}

// ── SKELETON LOADER COMPONENTS ──

function SkeletonStarDisplay() {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            ))}
        </div>
    );
}

function SkeletonSummaryCard() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
            <div className="mt-4 flex items-center gap-4">
                <div className="h-12 w-16 animate-pulse rounded bg-gray-200"></div>
                <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
            </div>
            <div className="mt-3 h-4 w-40 animate-pulse rounded bg-gray-200"></div>
        </div>
    );
}

function SkeletonBreakdown() {
    return (
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
                <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200"></div>
            </div>
            <div className="mt-6 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="h-4 w-14 animate-pulse rounded bg-gray-200"></div>
                        <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                            <div className="h-2.5 w-3/4 animate-pulse rounded-full bg-gray-200"></div>
                        </div>
                        <div className="h-4 w-8 animate-pulse rounded bg-gray-200"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SkeletonReviewCard() {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200"></div>
                    <div className="flex-1">
                        <div className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-1 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
                        <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200"></div>
                    </div>
                </div>
                <SkeletonStarDisplay />
            </div>

            {/* Body */}
            <div className="mt-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-gray-200"></div>
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200"></div>
                </div>
            </div>
        </div>
    );
}

function SkeletonReviewsList() {
    return (
        <div className="space-y-5">
            {[1, 2, 3].map((i) => (
                <SkeletonReviewCard key={i} />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function Reviews() {
    const toast = useToast();
    const [activeFilter, setActiveFilter] = useState("Most Recent");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalRatings, setTotalRatings] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const providerId = getStoredProviderId();

        async function loadData() {
            try {
                const [providerReviews, providerRatings, averageData] = await Promise.all([
                    reviewService.getProviderReviews(providerId),
                    ratingService.getProviderRatings(providerId),
                    ratingService.getProviderAverageRating(providerId),
                ]);

                if (!mounted) return;

                setAverageRating(averageData.averageScore);
                setTotalRatings(averageData.totalRatings);

                const ratingsByBookingId = new Map(
                    providerRatings.map((r) => [Number(r.bookingId), r])
                );

                const enriched = await Promise.all(
                    providerReviews.map(async (review) => {
                        const rating = ratingsByBookingId.get(Number(review.bookingId));

                        let clientName = `Client #${review.clientId}`;
                        try {
                            const booking = await bookingService.getBooking(review.bookingId);
                            if (booking?.clientName) clientName = booking.clientName;
                        } catch {
                            // booking fetch failed — use fallback name
                        }

                        return {
                            id: review.id,
                            bookingId: review.bookingId,
                            initials: getInitials(clientName),
                            name: clientName,
                            date: formatDate(review.createdAt),
                            rating: rating ? Math.round(rating.score) : 0,
                            ratingScore: rating ? rating.score : 0,
                            summary: getSummary(review.comment),
                            body: review.comment,
                            response: review.providerResponse || null,
                            thanked: review.providerThankedClient,
                            isFlagged: review.isFlagged,
                            createdAt: review.createdAt,
                        };
                    })
                );

                if (!mounted) return;
                setReviews(enriched);
                setError(null);
            } catch (err) {
                console.error("Failed to load reviews:", err);
                if (!mounted) return;
                setError("Failed to load reviews. Please try again.");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadData();
        return () => { mounted = false; };
    }, []);

    const filteredReviews = useMemo(() => {
        const copy = [...reviews];
        if (activeFilter === "Highest Rated") return copy.sort((a, b) => b.ratingScore - a.ratingScore);
        if (activeFilter === "Lowest Rated") return copy.sort((a, b) => a.ratingScore - b.ratingScore);
        if (activeFilter === "Unanswered") return copy.filter((r) => !r.response);
        return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [activeFilter, reviews]);

    const ratingBreakdown = useMemo(() => {
        const total = reviews.length || 1;
        return [5, 4, 3, 2, 1].map((stars) => {
            const count = reviews.filter((r) => r.rating === stars).length;
            return {
                stars,
                count,
                percent: Math.round((count / total) * 100),
            };
        });
    }, [reviews]);

    const handleReply = async (reviewId) => {
        if (!replyText.trim()) {
            toast.warning("Response is empty", "Write a response before sending it.");
            return;
        }
        try {
            const updated = await reviewService.respondToReview(reviewId, replyText.trim());
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === reviewId
                        ? { ...r, response: updated.providerResponse }
                        : r
                )
            );
            setReplyingTo(null);
            setReplyText("");
            toast.success("Response sent", "Your reply has been added to the review.");
        } catch (err) {
            console.error("Failed to send response:", err);
            toast.error("Response failed", err.message || "Unable to send your response.");
        }
    };

    const handleThank = async (reviewId) => {
        try {
            await reviewService.thankClientForReview(reviewId);
            setReviews((prev) =>
                prev.map((r) =>
                    r.id === reviewId ? { ...r, thanked: true } : r
                )
            );
            toast.success("Client thanked", "Your appreciation has been recorded.");
        } catch (err) {
            console.error("Failed to thank client:", err);
            toast.error("Could not thank client", err.message || "Please try again.");
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="flex-1 ml-0 lg:ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Reviews and Ratings</h1>
                        <p className="mt-2 text-gray-600">
                            Manage your reputation and respond to client feedback
                        </p>
                    </div>

                    {/* Summary Cards */}
                    <div className="mb-8 grid gap-6 lg:grid-cols-3">
                        {loading ? (
                            <>
                                <SkeletonSummaryCard />
                                <SkeletonBreakdown />
                            </>
                        ) : (
                            <>
                                {/* Overall Score */}
                                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                                        Overall Score
                                    </p>
                                    <div className="mt-4 flex items-center gap-4">
                                        <span className="text-5xl font-bold text-gray-900">
                                            {averageRating.toFixed(1)}
                                        </span>
                                        <StarDisplay count={Math.round(averageRating)} size="h-6 w-6" />
                                    </div>
                                    <p className="mt-3 text-sm text-gray-500">
                                        Based on {totalRatings} rating{totalRatings !== 1 ? "s" : ""}
                                    </p>
                                </div>

                                {/* Rating Breakdown */}
                                <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-gray-900">Rating Breakdown</h2>
                                        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#056db3]">
                                            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="mt-6 space-y-3">
                                        {ratingBreakdown.map((item) => (
                                            <div key={item.stars} className="flex items-center gap-3">
                                                <span className="w-14 text-sm font-medium text-gray-600">
                                                    {item.stars} stars
                                                </span>
                                                <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                                                    <div
                                                        className="h-2.5 rounded-full bg-yellow-400 transition-all duration-300"
                                                        style={{ width: `${item.percent}%` }}
                                                    />
                                                </div>
                                                <span className="w-8 text-right text-sm text-gray-600">
                                                    {item.count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Reviews List */}
                    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Client Reviews</h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Filter and respond to client feedback
                                </p>
                            </div>
                            {!loading && (
                                <select
                                    value={activeFilter}
                                    onChange={(e) => setActiveFilter(e.target.value)}
                                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#056db3]"
                                >
                                    {reviewFilters.map((f) => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            )}
                            {loading && (
                                <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200"></div>
                            )}
                        </div>

                        {/* Loading / Error / Empty */}
                        {loading && <SkeletonReviewsList />}

                        {!loading && error && (
                            <div className="py-10 text-center text-sm text-red-500">{error}</div>
                        )}

                        {!loading && !error && filteredReviews.length === 0 && (
                            <div className="py-10 text-center text-sm text-gray-500">
                                No reviews found.
                            </div>
                        )}

                        {/* Review Cards */}
                        {!loading && !error && filteredReviews.length > 0 && (
                            <div className="space-y-5">
                                {filteredReviews.map((review) => (
                                    <div
                                        key={review.id}
                                        className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                                    >
                                        {/* Review Header */}
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-base font-bold text-blue-700">
                                                    {review.initials}
                                                </div>
                                                <div>
                                                    <p className="text-base font-semibold text-gray-900">
                                                        {review.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">{review.date}</p>
                                                    <p className="mt-1 text-sm font-medium text-gray-700">
                                                        {review.summary}
                                                    </p>
                                                </div>
                                            </div>
                                            <StarDisplay count={review.rating} />
                                        </div>

                                        {/* Review Body */}
                                        <p className="mt-4 text-sm leading-6 text-gray-700">{review.body}</p>

                                        {/* Actions */}
                                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MessageCircle className="h-4 w-4" />
                                                <span>
                                                    {review.response ? "Responded" : "No response yet"}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => !review.thanked && handleThank(review.id)}
                                                    disabled={review.thanked}
                                                    className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                                                        review.thanked
                                                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    <ThumbsUp className="h-4 w-4" />
                                                    {review.thanked ? "Thanked" : "Thank"}
                                                </button>
                                                {!review.response && (
                                                    <button
                                                        onClick={() => setReplyingTo(review.id)}
                                                        className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white hover:bg-[#045ca0]"
                                                    >
                                                        Respond
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Existing Response */}
                                        {review.response && (
                                            <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                                                <p className="text-sm font-semibold text-blue-800">
                                                    Your response
                                                </p>
                                                <p className="mt-1 text-sm leading-6 text-blue-700">
                                                    {review.response}
                                                </p>
                                            </div>
                                        )}

                                        {/* Reply Box */}
                                        {replyingTo === review.id && (
                                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                                <textarea
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your response..."
                                                    className="w-full rounded-lg border border-gray-200 p-3 text-sm focus:outline-none focus:border-[#056db3]"
                                                    rows={3}
                                                />
                                                <div className="mt-3 flex gap-2">
                                                    <button
                                                        onClick={() => handleReply(review.id)}
                                                        disabled={!replyText.trim()}
                                                        className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white hover:bg-[#045ca0] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Send Response
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setReplyingTo(null);
                                                            setReplyText("");
                                                        }}
                                                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Reviews;