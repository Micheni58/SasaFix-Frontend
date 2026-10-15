// src/api/reviewService.js

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
    bookingId: review.booking_id ?? review.bookingId,
    clientId: review.client_id ?? review.clientId,
    providerId: review.provider_id ?? review.providerId,
    comment: review.comment || "",
    providerResponse: review.provider_response ?? review.providerResponse ?? "",
    providerThankedClient: Boolean(review.provider_thanked_client ?? review.providerThankedClient),
    isFlagged: Boolean(review.is_flagged ?? review.isFlagged),
    createdAt: review.created_at ?? review.createdAt ?? null,
    updatedAt: review.updated_at ?? review.updatedAt ?? null,
    raw: review,
  };
}

function extractReviews(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["reviews", "data", "items", "results"] ) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (payload?.[key] && typeof payload[key] === "object") {
      const nested = extractReviews(payload[key]);
      if (nested.length) return nested;
    }
  }
  return [];
}

function normalizeReviews(payload) {
  return extractReviews(payload).map(normalizeReview);
}

export async function createReview(reviewData) {
  // Validate required fields
  if (!reviewData.booking_id) throw new Error("booking_id is required");
  if (!reviewData.client_id) throw new Error("client_id is required");
  if (!reviewData.provider_id) throw new Error("provider_id is required");
  if (!reviewData.comment || !reviewData.comment.trim()) {
    throw new Error("Comment is required");
  }

  const response = await client.post("/reviews/", {
    booking_id: reviewData.booking_id,
    client_id: reviewData.client_id,
    provider_id: reviewData.provider_id,
    comment: reviewData.comment.trim(),
  });
  return normalizeReview(response.data);
}

export async function getProviderReviews(providerId) {
  try {
    const response = await client.get(`/reviews/provider/${providerId}`);
    return normalizeReviews(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getClientReviews(clientId) {
  try {
    const response = await client.get(`/reviews/client/${clientId}`);
    return normalizeReviews(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getBookingReview(bookingId) {
  try {
    const response = await client.get(`/reviews/booking/${bookingId}`);
    return normalizeReview(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No review found - that's fine
    }
    throw error;
  }
}

export async function getFlaggedReviews() {
  try {
    const response = await client.get("/reviews/flagged");
    return normalizeReviews(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
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
};

export default reviewService;