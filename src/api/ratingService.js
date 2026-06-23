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

export async function getBookingRating(bookingId) {
  const response = await client.get(`/ratings/booking/${bookingId}`);
  return normalizeRating(response.data);
}

export async function getClientRatings(clientId) {
  const response = await client.get(`/ratings/client/${clientId}`);
  return normalizeRatings(response.data);
}

export async function getRatingById(ratingId) {
  const response = await client.get(`/ratings/${ratingId}`);
  return normalizeRating(response.data);
}

export async function createRating(ratingData) {
  const response = await client.post("/ratings/", ratingData);
  return normalizeRating(response.data);
}

export async function updateRating(ratingId, score) {
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
