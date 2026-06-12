import axios from "axios";

const API_URL = "/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function normalizeReview(review) {
  return {
    id: review.id,
    bookingId: review.booking_id,
    clientId: review.client_id,
    providerId: review.provider_id,
    comment: review.comment || "",
    providerResponse: review.provider_response || "",
    providerThankedClient: Boolean(review.provider_thanked_client),
    isFlagged: Boolean(review.is_flagged),
    createdAt: review.created_at || null,
    updatedAt: review.updated_at || null,
    raw: review,
  };
}

function normalizeReviews(reviews) {
  return (reviews || []).map(normalizeReview);
}

function normalizeRating(rating) {
  return {
    id: rating.id,
    bookingId: rating.booking_id,
    clientId: rating.client_id,
    providerId: rating.provider_id,
    score: Number(rating.score || 0),
    createdAt: rating.created_at || null,
    updatedAt: rating.updated_at || null,
    raw: rating,
  };
}

function normalizeRatings(ratings) {
  return (ratings || []).map(normalizeRating);
}

export async function createReview(reviewData) {
  const response = await client.post("/reviews/", reviewData);
  return normalizeReview(response.data);
}

export async function getProviderReviews(providerId) {
  const response = await client.get(`/reviews/provider/${providerId}`);
  return normalizeReviews(response.data);
}

export async function getClientReviews(clientId) {
  const response = await client.get(`/reviews/client/${clientId}`);
  return normalizeReviews(response.data);
}

export async function getBookingReview(bookingId) {
  const response = await client.get(`/reviews/booking/${bookingId}`);
  return normalizeReview(response.data);
}

export async function getFlaggedReviews() {
  const response = await client.get("/reviews/flagged");
  return normalizeReviews(response.data);
}

export async function getReviewById(reviewId) {
  const response = await client.get(`/reviews/${reviewId}`);
  return normalizeReview(response.data);
}

export async function respondToReview(reviewId, providerResponse) {
  const response = await client.patch(`/reviews/${reviewId}/respond`, {
    provider_response: providerResponse,
  });
  return normalizeReview(response.data);
}

export async function thankClientForReview(reviewId) {
  const response = await client.patch(`/reviews/${reviewId}/thank`);
  return normalizeReview(response.data);
}

export async function flagReview(reviewId, isFlagged) {
  const response = await client.patch(`/reviews/${reviewId}/flag`, {
    is_flagged: isFlagged,
  });
  return normalizeReview(response.data);
}

export async function getProviderRatings(providerId) {
  const response = await client.get(`/ratings/provider/${providerId}`);
  return normalizeRatings(response.data);
}

export async function getProviderAverageRating(providerId) {
    const response = await client.get(`/ratings/provider/${providerId}/average`);
    return {
        providerId: response.data.provider_id,
        averageScore: Number(response.data.average_score || 0),
        totalRatings: Number(response.data.total_ratings || 0),
        raw: response.data,
    };
}

const reviewService = {
  createReview,
  getProviderReviews,
  getClientReviews,
  getBookingReview,
  getFlaggedReviews,
  getReviewById,
  respondToReview,
  thankClientForReview,
  flagReview,
  getProviderRatings,
  getProviderAverageRating,
};

export default reviewService;
