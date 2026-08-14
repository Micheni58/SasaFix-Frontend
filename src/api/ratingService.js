// src/api/ratingService.js

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

export async function getProviderRatings(providerId) {
  try {
    const response = await client.get(`/ratings/provider/${providerId}`);
    return normalizeRatings(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getProviderAverageRating(providerId) {
  try {
    const response = await client.get(`/ratings/provider/${providerId}/average`);
    return {
      providerId: response.data.provider_id,
      averageScore: Number(response.data.average_score || 0),
      totalRatings: Number(response.data.total_ratings || 0),
      raw: response.data,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        providerId: providerId,
        averageScore: 0,
        totalRatings: 0,
      };
    }
    throw error;
  }
}

export async function getBookingRating(bookingId) {
  try {
    const response = await client.get(`/ratings/booking/${bookingId}`);
    return normalizeRating(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No rating found - that's fine
    }
    throw error;
  }
}

export async function getClientRatings(clientId) {
  try {
    const response = await client.get(`/ratings/client/${clientId}`);
    return normalizeRatings(response.data);
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    throw error;
  }
}

export async function getRatingById(ratingId) {
  const response = await client.get(`/ratings/${ratingId}`);
  return normalizeRating(response.data);
}

export async function createRating(ratingData) {
  // Validate required fields
  if (!ratingData.booking_id) throw new Error("booking_id is required");
  if (!ratingData.client_id) throw new Error("client_id is required");
  if (!ratingData.provider_id) throw new Error("provider_id is required");
  if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
    throw new Error("Score must be between 1 and 5");
  }

  const response = await client.post("/ratings/", {
    booking_id: ratingData.booking_id,
    client_id: ratingData.client_id,
    provider_id: ratingData.provider_id,
    score: ratingData.score,
  });
  return normalizeRating(response.data);
}

export async function updateRating(ratingId, score) {
  if (score < 1 || score > 5) {
    throw new Error("Score must be between 1 and 5");
  }
  const response = await client.patch(`/ratings/${ratingId}`, { score });
  return normalizeRating(response.data);
}

export async function deleteRating(ratingId) {
  await client.delete(`/ratings/${ratingId}`);
}

const ratingService = {
  getProviderRatings,
  getProviderAverageRating,
  getBookingRating,
  getClientRatings,
  getRatingById,
  createRating,
  updateRating,
  deleteRating,
};

export default ratingService;