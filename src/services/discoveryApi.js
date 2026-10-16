// src/services/discoveryApi.js

const API_URL = `${(import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "")}/discovery`;

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

  const payload = await response.json();
  const data = payload?.data || payload;
  const providers = data.providers || data.items || data.results || [];

  return {
    ...data,
    providers: providers.map((provider) => ({
      ...provider,
      id: provider.id ?? provider.provider_id ?? provider.service_provider_id,
      provider_id: provider.provider_id ?? provider.id,
      service_provider_id: provider.service_provider_id ?? provider.id,
      average_rating:
        provider.average_rating ?? provider.averageRating ?? provider.average_score ?? provider.averageScore,
      total_reviews:
        provider.total_reviews ?? provider.totalReviews ?? provider.review_count ?? provider.reviewCount ??
        (Array.isArray(provider.reviews) ? provider.reviews.length : undefined),
      total_jobs_completed:
        provider.total_jobs_completed ?? provider.totalJobsCompleted ?? provider.completed_jobs ?? provider.completedJobs,
    })),
    total: data.total ?? data.count,
    total_pages: data.total_pages ?? data.totalPages,
  };
}

/**
 * Single provider
 */
export async function getProvider(providerId) {
  const response = await fetch(`${API_URL}/providers/${providerId}`);

  if (!response.ok) {
    throw new Error("Provider not found.");
  }

  const payload = await response.json();
  const provider = payload?.provider || payload?.data?.provider || payload?.data || payload;
  const location =
    [provider.address, provider.city, provider.country]
      .filter(Boolean)
      .join(", ") ||
    provider.location ||
    "";

  return {
    ...provider,
    id: provider.id ?? provider.provider_id ?? provider.service_provider_id,
    provider_id: provider.provider_id ?? provider.id,
    service_provider_id: provider.service_provider_id ?? provider.id,
    member_since: provider.member_since ?? provider.memberSince ?? provider.created_at ?? provider.createdAt,
    average_rating: provider.average_rating ?? provider.averageRating ?? provider.average_score ?? provider.averageScore,
    total_reviews: provider.total_reviews ?? provider.totalReviews ?? provider.review_count ?? provider.reviewCount,
    total_jobs_completed:
      provider.total_jobs_completed ?? provider.totalJobsCompleted ?? provider.completed_jobs ?? provider.completedJobs,
    location,
  };
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