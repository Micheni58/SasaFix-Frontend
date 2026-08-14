import { useState, useEffect, useCallback, useRef } from "react";
import {
  searchProviders,
  getCategories,
} from "../services/discoveryApi";

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

      const providers = data.providers || [];

      // Premium workers should ALWAYS come from the filtered providers
      const premium =
        providers.filter((p) => p.is_premium) ||
        data.premium_providers ||
        [];

      setProviders(providers);
      setPremiumProviders(premium);

      setTotal(data.total || providers.length);

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