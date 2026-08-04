// src/services/discoveryApi.js

const API_URL = "http://127.0.0.1:8000/api/discovery";

/**
 * Search providers
 */
export async function searchProviders(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== null &&
      value !== undefined &&
      value !== "" &&
      value !== false
    ) {
      query.append(key, value);
    }
  });

  const response = await fetch(`${API_URL}/providers?${query.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to load providers.");
  }

  return await response.json();
}

/**
 * Single provider
 */
export async function getProvider(providerId) {
  const response = await fetch(`${API_URL}/providers/${providerId}`);

  if (!response.ok) {
    throw new Error("Provider not found.");
  }

  return await response.json();
}

/**
 * Categories
 */
export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    return { categories: [] };
  }

  return await response.json();
}

/**
 * Google Places autocomplete
 */
export async function getLocationSuggestions(query) {
  if (!query || query.length < 2) {
    return { suggestions: [] };
  }

  const response = await fetch(
    `${API_URL}/location-autocomplete?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    return { suggestions: [] };
  }

  return await response.json();
}

/**
 * Geocode address
 */
export async function geocodeAddress(address) {
  const response = await fetch(`${API_URL}/geocode`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ address }),
  });

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

/**
 * Provider availability
 */
export async function getProviderAvailability(providerId) {
  const response = await fetch(
    `${API_URL}/providers/${providerId}/availability`
  );

  if (!response.ok) {
    return [];
  }

  return await response.json();
}