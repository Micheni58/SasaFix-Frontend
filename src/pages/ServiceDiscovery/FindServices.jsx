// src/pages/ServiceDiscovery/FindServices.jsx

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import FilterSidebar from "../../components/filters/FilterSidebar";
import ProviderCard from "../../components/cards/ProviderCard";
import MapComponent from "../../components/maps/MapComponent";

import { useProviderSearch } from "../../hooks/userProviderSearch";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

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

  useEffect(() => {
    const search = searchParams.get("search");

    setSearchTerm(search || "");
    set("search", search || "");
  }, [searchParams, set]);

  const handleSearch = (event) => {
    event.preventDefault();
    set("search", searchTerm.trim());
  };

  const page = filters.page;

  return (
    <div className="service-discovery-page flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
    <Sidebar role="client" />

    <div className="flex-1 ml-0 lg:ml-72 min-w-0">
      <Navbar />

      <main className="min-w-0 px-4 pb-6 pt-24 sm:px-6">
        <section className="mb-8">
          <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-900">
          {filters.search
            ? `Search Results for "${filters.search}"`
            : "Find Services"}
        </h1>

        <p className="mt-2 text-base text-gray-600">
          {filters.search
            ? `Showing providers matching "${filters.search}"`
            : "Discover verified workers in your area"}
        </p>
      </div>

        <form onSubmit={handleSearch} className="max-w-2xl">
          <label htmlFor="provider-search" className="sr-only">
            Search services or providers
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm focus-within:border-[#056db3] focus-within:ring-2 focus-within:ring-blue-100">
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
        </section>

      {/* Main */}
      <div className="flex items-start gap-3 sm:gap-5">

        {/* Sidebar */}
        <FilterSidebar
          filters={filters}
          categories={categories}
          onSet={set}
          onSetLocation={setLocation}
          onClearLocation={clearLocation}
          onReset={reset}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* Toggle */}
          <div className="flex justify-end mb-5">

            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition

              ${
                showMap
                  ? "bg-[#056db3] text-white border-[#056db3]"
                  : "bg-white border-gray-300 text-gray-700 hover:border-[#056db3] hover:text-[#056db3]"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 20l-5-2.5V6l5 2m0 12l6-3m-6 3V8m6 9l5 2.5V7l-5-2m0 11V5m0 0L9 8"
                />
              </svg>

              {showMap ? "List View" : "Map View"}
            </button>

          </div>

          {/* Map */}

          {showMap && (
            <div className="h-96 rounded-xl overflow-hidden border border-gray-200 bg-white mb-6">

              <MapComponent
                providers={providers}
                userLocation={
                  filters.latitude
                    ? {
                        latitude: filters.latitude,
                        longitude: filters.longitude,
                      }
                    : null
                }
              />

            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">

              {error}

            </div>
          )}

          {/* Premium */}

          {premiumProviders.length > 0 && (

            <div className="mb-8">

              <div className="flex items-center gap-3 mb-4">

                <span className="rounded-full border border-yellow-300 bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                  Premium Workers
                </span>

                <span className="text-sm text-gray-500">
                  Top-rated and highly recommended
                </span>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

                {premiumProviders.map((provider) => (

                  <ProviderCard
                    key={provider.id}
                    provider={provider}
                    featured
                  />

                ))}

              </div>

            </div>

          )}

          {/* All Workers */}

          {!loading && (

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-gray-900">

                All Workers ({total})

              </h2>

            </div>

          )}

          {/* Loading */}

          {loading && (
            <div
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {providers.map((provider) => (

                <ProviderCard
                  key={provider.id}
                  provider={provider}
                />

              ))}

            </div>

          )}
                    {/* Empty State */}

          {!loading && !error && providers.length === 0 && (

              <div className="rounded-xl border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">

                <svg
                  className="h-8 w-8 text-[#056db3]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.2-5.2m2.2-5.3a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No providers found
              </h3>

              <p className="text-gray-500 mb-5">
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

            <div className="flex justify-center items-center gap-2 mt-10">

              <PagBtn
                label="Previous"
                disabled={page === 1}
                onClick={() => goToPage(page - 1)}
              />

              {buildPages(page, totalPages).map((item, index) =>

                item === "..."

                  ? (

                    <span
                      key={index}
                      className="px-2 text-gray-400"
                    >
                      ...
                    </span>

                  )

                  : (

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

      </div>

      </main>

    </div>
   </div>

  );

};

const PagBtn = ({
  label,
  active = false,
  disabled = false,
  onClick,
}) => (

  <button
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded-lg text-sm font-medium transition

    ${
      active
        ? "bg-[#056db3] text-white"
        : disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-white border border-gray-300 text-gray-700 hover:border-[#056db3] hover:text-[#056db3]"
    }`}
  >

    {label}

  </button>

);

const buildPages = (current, total) => {

  const pages = [];

  for (let i = 1; i <= total; i++) {

    if (
      i === 1 ||
      i === total ||
      Math.abs(current - i) <= 1
    ) {

      if (
        pages.length &&
        pages[pages.length - 1] !== i - 1
      ) {
        pages.push("...");
      }

      pages.push(i);

    }

  }

  return pages;

};

export default FindServices;