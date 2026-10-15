import { useState, useEffect, useCallback, useRef } from "react";
import {
  searchProviders,
  getCategories,
} from "../services/discoveryApi";
import reviewService from "../api/reviewService";
import ratingService from "../api/ratingService";

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  min_price: "",
  max_price: "",
  min_rating: "",
  latitude: null,
  longitude: null,
  radius_km: 10,
  page: 1,
  page_size: 12,
};

export const useProviderSearch = () => {
  const [providers, setProviders] = useState([]);
  const [premiumProviders, setPremiumProviders] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const debounce = useRef();

  // -----------------------------
  // Load Categories Once
  // -----------------------------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error(err);
      }
    };

    loadCategories();
  }, []);

  // -----------------------------
  // Search whenever filters change
  // -----------------------------
  useEffect(() => {
    clearTimeout(debounce.current);

    debounce.current = setTimeout(() => {
      runSearch(filters);
    }, filters.search ? 400 : 0);

    return () => clearTimeout(debounce.current);
  }, [filters]);

  const runSearch = async (params) => {
    try {
      setLoading(true);
      setError("");

      const query = {};

      Object.entries(params).forEach(([key, value]) => {
        if (
          value !== "" &&
          value !== null &&
          value !== undefined
        ) {
          query[key] = value;
        }
      });

      const data = await searchProviders(query);

      const providers = Array.isArray(data.providers) ? data.providers : [];
      const enrichedProviders = await Promise.all(providers.map(async (provider) => {
        const providerId = provider.service_provider_id || provider.provider_id || provider.id;
        const needsReviews = !Number.isFinite(Number(provider.total_reviews)) || Number(provider.total_reviews) <= 0;
        const needsRating = !Number.isFinite(Number(provider.average_rating)) || Number(provider.average_rating) <= 0;
        if (!providerId || (!needsReviews && !needsRating)) return provider;

        const [reviewsResult, ratingSummaryResult, ratingsResult] = await Promise.allSettled([
          needsReviews ? reviewService.getProviderReviews(providerId) : Promise.resolve(null),
          needsRating ? ratingService.getProviderAverageRating(providerId) : Promise.resolve(null),
          needsRating ? ratingService.getProviderRatings(providerId) : Promise.resolve(null),
        ]);

        const ratings = ratingsResult.status === "fulfilled" ? ratingsResult.value : [];
        const ratingSummary = ratingSummaryResult.status === "fulfilled" ? ratingSummaryResult.value : null;
        const ratingsAverage = ratings.length
          ? ratings.reduce((sum, rating) => sum + Number(rating.score || 0), 0) / ratings.length
          : 0;

        return {
          ...provider,
          ...(needsReviews && reviewsResult.status === "fulfilled"
            ? { total_reviews: reviewsResult.value.length }
            : {}),
          ...(needsRating
            ? { average_rating: ratingSummary?.averageScore || ratingsAverage }
            : {}),
        };
      }));

      // Premium workers should ALWAYS come from the filtered providers
      const premium =
        enrichedProviders.filter((p) => p.is_premium) ||
        data.premium_providers ||
        [];

      setProviders(enrichedProviders);
      setPremiumProviders(premium);

      setTotal(data.total || enrichedProviders.length);

      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to fetch providers."
      );

      setProviders([]);
      setPremiumProviders([]);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // Helpers
  // -----------------------------

  const set = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1,
    }));
  }, []);

  const setLocation = useCallback((lat, lng) => {
    setFilters((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      page: 1,
    }));
  }, []);

  const clearLocation = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      latitude: null,
      longitude: null,
      page: 1,
    }));
  }, []);

  const reset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const goToPage = useCallback((page) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }));
  }, []);

  return {
    providers,
    premiumProviders,
    categories,

    loading,
    error,

    total,
    totalPages,

    filters,

    set,
    setLocation,
    clearLocation,
    reset,
    goToPage,

    refresh: () => runSearch(filters),
  };
};