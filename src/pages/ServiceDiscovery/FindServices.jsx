// src/pages/ServiceDiscovery/FindServices.jsx

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, ArrowRight, Map as MapIcon } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";

import FilterSidebar from "../../components/filters/FilterSidebar";
import ProviderCard from "../../components/cards/ProviderCard";
import MapComponent from "../../components/maps/MapComponent";

import { useProviderSearch } from "../../hooks/userProviderSearch";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

// Auto-fill grid: as many columns as fit (min 280px each), stretched to fill the row.
const CARD_GRID = "grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4";

const ProviderCardSkeleton = () => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm" aria-hidden="true">
    <div className="flex items-start justify-between gap-3">
      <div className="loading-skeleton h-14 w-14 rounded-full" />
      <div className="loading-skeleton h-6 w-20 rounded-full" />
    </div>
    <div className="mt-5 space-y-3">
      <div className="loading-skeleton h-5 w-2/3 rounded" />
      <div className="loading-skeleton h-4 w-1/2 rounded" />
      <div className="loading-skeleton h-4 w-3/4 rounded" />
      <div className="loading-skeleton h-4 w-1/3 rounded" />
    </div>
    <div className="mt-6 flex items-end justify-between border-t border-gray-100 pt-4">
      <div className="space-y-2">
        <div className="loading-skeleton h-3 w-16 rounded" />
        <div className="loading-skeleton h-5 w-24 rounded" />
      </div>
      <div className="loading-skeleton h-10 w-28 rounded-md" />
    </div>
  </div>
);

const FindServices = () => {
  const {
    providers,
    premiumProviders,
    categories,
    loading,
    error,
    filters,
    total,
    totalPages,
    set,
    setLocation,
    clearLocation,
    reset,
    goToPage,
  } = useProviderSearch();

  const [searchParams] = useSearchParams();

  const [showMap, setShowMap] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  
  // Guard against infinite re-render loops if `set` is not memoized in the hook
  const lastSearchRef = useRef(null);

  useEffect(() => {
    const search = searchParams.get("search") || "";
    
    // Only sync and set if the URL search actually changed
    if (lastSearchRef.current === search) return;
    lastSearchRef.current = search;

    setSearchTerm(search);
    set("search", search);
  }, [searchParams, set]);

  const handleSearch = (event) => {
    event.preventDefault();
    set("search", searchTerm.trim());
    // Reset to page 1 on a new search to avoid empty paginated results
    set("page", 1);
  };

  const page = filters.page;

  const userLocation = filters.latitude
    ? { latitude: filters.latitude, longitude: filters.longitude }
    : null;

  return (
    <div className="service-discovery-page flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
      <Sidebar role="client" />

      <div className="flex-1 ml-0 lg:ml-72 min-w-0">
        <Navbar />

        <main className="mx-auto w-full min-w-0 max-w-[1600px] px-4 pb-6 pt-20 sm:px-6">
          {/* Header */}
          <section className="mb-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
              <h1 className="text-2xl font-bold text-gray-900">
                {filters.search
                  ? `Search Results for "${filters.search}"`
                  : "Find Services"}
              </h1>

              <p className="text-sm text-gray-500">
                {filters.search
                  ? `Showing providers matching "${filters.search}"`
                  : "Discover verified workers in your area"}
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4">
              {/* Search bar */}
              <form onSubmit={handleSearch} className="w-full lg:min-w-65 lg:flex-1">
                <label htmlFor="provider-search" className="sr-only">
                  Search services or providers
                </label>
                <div className="flex h-full items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm focus-within:border-[#056db3] focus-within:ring-2 focus-within:ring-blue-100">
                  <Search size={19} className="ml-2 shrink-0 text-gray-400" aria-hidden="true" />
                  <input
                    id="provider-search"
                    type="search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search services or providers"
                    className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  />
                  <button
                    type="submit"
                    className="h-10 shrink-0 rounded-md bg-[#056db3] px-4 text-sm font-semibold text-white transition hover:bg-[#045b96] focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-2"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Banner */}
              <Link
                to="/client/quotes/new"
                className="group flex shrink-0 items-center gap-3 rounded-xl bg-linear-to-r from-[#056db3] to-[#0a8fe8] px-4 py-2.5 text-white shadow-sm transition hover:shadow-md"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Sparkles className="h-4 w-4 text-yellow-300" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight">
                    Can't find what you need?
                  </p>
                  <p className="text-xs leading-tight text-blue-50">
                    Post a job for custom quotes
                  </p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </section>

          {/* Main Grid */}
          <div className="flex items-start gap-3 sm:gap-5">
            {/* Filter sidebar */}
            <FilterSidebar
              filters={filters}
              categories={categories}
              onSet={set}
              onSetLocation={setLocation}
              onClearLocation={clearLocation}
              onReset={reset}
            />

            {/* Content */}
            <div className="min-w-0 flex-1">
              {/* Results header + map toggle */}
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {loading ? "Loading…" : `All Workers (${total})`}
                </h2>

                <button
                  onClick={() => setShowMap(!showMap)}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition
                  ${
                    showMap
                      ? "border-[#056db3] bg-[#056db3] text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-[#056db3] hover:text-[#056db3]"
                  }`}
                >
                  <MapIcon className="h-4 w-4" aria-hidden="true" />
                  {showMap ? "List View" : "Map View"}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
                  {error}
                </div>
              )}

              <div
                className={
                  showMap ? "xl:grid xl:grid-cols-[minmax(0,1fr)_420px] xl:gap-5" : ""
                }
              >
                <div className="min-w-0">
                  {/* Premium */}
                  {premiumProviders.length > 0 && (
                    <div className="mb-8">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                          Premium Workers
                        </span>
                        <span className="text-sm text-gray-500">
                          Top-rated and highly recommended
                        </span>
                      </div>

                      <div className={CARD_GRID}>
                        {premiumProviders.map((provider) => (
                          <ProviderCard key={provider.id} provider={provider} featured />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading */}
                  {loading && (
                    <div
                      className={CARD_GRID}
                      role="status"
                      aria-label="Loading service providers"
                      aria-busy="true"
                    >
                      {Array.from({ length: 6 }).map((_, index) => (
                        <ProviderCardSkeleton key={index} />
                      ))}
                    </div>
                  )}

                  {/* Providers */}
                  {!loading && providers.length > 0 && (
                    <div className={CARD_GRID}>
                      {providers.map((provider) => (
                        <ProviderCard key={provider.id} provider={provider} />
                      ))}
                    </div>
                  )}

                  {/* Empty State */}
                  {!loading && !error && providers.length === 0 && (
                    <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                        <Search className="h-8 w-8 text-[#056db3]" aria-hidden="true" />
                      </div>

                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No providers found
                      </h3>

                      <p className="mb-5 text-gray-500">
                        {filters.search
                          ? `No providers matched "${filters.search}".`
                          : "Try changing your search or filters."}
                      </p>

                      <button
                        onClick={reset}
                        className="rounded-lg bg-[#056db3] px-5 py-2 text-white transition hover:bg-[#045b96] focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-2"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}

                  {/* Pagination */}
                  {!loading && totalPages > 1 && (
                    <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                      <PagBtn
                        label="Previous"
                        disabled={page === 1}
                        onClick={() => goToPage(page - 1)}
                      />

                      {buildPages(page, totalPages).map((item, index) =>
                        item === "..." ? (
                          <span key={`gap-${index}`} className="px-2 text-gray-400">
                            ...
                          </span>
                        ) : (
                          <PagBtn
                            key={item}
                            label={item}
                            active={item === page}
                            onClick={() => goToPage(item)}
                          />
                        )
                      )}

                      <PagBtn
                        label="Next"
                        disabled={page === totalPages}
                        onClick={() => goToPage(page + 1)}
                      />
                    </div>
                  )}
                </div>

                {/* Map */}
                {showMap && (
                  <div className="mb-6 h-96 overflow-hidden rounded-xl border border-gray-200 bg-white xl:sticky xl:top-24 xl:mb-0 xl:h-[calc(100vh-7rem)]">
                    <MapComponent providers={providers} userLocation={userLocation} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const PagBtn = ({ label, active = false, disabled = false, onClick }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition
    ${
      active
        ? "bg-[#056db3] text-white"
        : disabled
        ? "cursor-not-allowed bg-gray-100 text-gray-400"
        : "border border-gray-300 bg-white text-gray-700 hover:border-[#056db3] hover:text-[#056db3]"
    }`}
  >
    {label}
  </button>
);

const buildPages = (current, total) => {
  const pages = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || Math.abs(current - i) <= 1) {
      if (pages.length && pages[pages.length - 1] !== i - 1) {
        pages.push("...");
      }
      pages.push(i);
    }
  }

  return pages;
};

export default FindServices;