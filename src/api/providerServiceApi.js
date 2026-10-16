// src/api/providerServiceApi.js

import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

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

/** Public: list a provider's active services. */
export async function listProviderServices(providerId) {
  try {
    const response = await client.get(`/providers/${providerId}/services/`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
}

/** Owner-only: list all services including inactive ones. */
export async function listAllProviderServices(providerId) {
  try {
    const response = await client.get(`/providers/${providerId}/services/all`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
}

/** Owner-only: create a service. */
export async function createProviderService(providerId, payload) {
  const body = {
    service_name: (payload.service_name || payload.serviceName || "").trim(),
    description: (payload.description || "").trim() || null,
    price: Number(payload.price),
    duration_minutes:
      payload.duration_minutes ?? payload.durationMinutes ?? null,
  };

  const response = await client.post(
    `/providers/${providerId}/services/`,
    body,
  );
  return response.data;
}

/** Owner-only: update a service. */
export async function updateProviderService(providerId, serviceId, payload) {
  const body = {};

  if (payload.service_name !== undefined || payload.serviceName !== undefined) {
    const name = payload.service_name ?? payload.serviceName;
    body.service_name = (name || "").trim();
  }

  if (payload.description !== undefined) {
    body.description = (payload.description || "").trim() || null;
  }

  if (payload.price !== undefined) {
    body.price = Number(payload.price);
  }

  if (
    payload.duration_minutes !== undefined ||
    payload.durationMinutes !== undefined
  ) {
    body.duration_minutes =
      payload.duration_minutes ?? payload.durationMinutes ?? null;
  }

  if (payload.is_active !== undefined || payload.isActive !== undefined) {
    body.is_active = payload.is_active ?? payload.isActive;
  }

  const response = await client.patch(
    `/providers/${providerId}/services/${serviceId}`,
    body,
  );
  return response.data;
}

/** Owner-only: soft delete a service. */
export async function deleteProviderService(providerId, serviceId) {
  await client.delete(`/providers/${providerId}/services/${serviceId}`);
}

const providerServiceApi = {
  listProviderServices,
  listAllProviderServices,
  createProviderService,
  updateProviderService,
  deleteProviderService,
};

export default providerServiceApi;