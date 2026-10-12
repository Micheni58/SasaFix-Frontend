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
    <div className="flex min-h-screen bg-[#f8fafc]">
    <Sidebar role="client" />

    <div className="flex-1 ml-0 lg:ml-72 min-w-0">
      <Navbar />

      <main className="px-6 pb-6 pt-24">
        <section className="mb-8">
          <div className="mb-5">
        <h1 className="text-3xl font-bold text-gray-800">
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
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
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
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white border-gray-300 hover:border-blue-500"
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

                <span className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
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

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {Array.from({ length: 6 }).map((_, index) => (

                <div
                  key={index}
                  className="h-72 bg-white border border-gray-200 rounded-xl animate-pulse"
                />

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

            <div className="bg-white border border-gray-200 rounded-xl py-16 px-6 text-center">

              <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">

                <svg
                  className="w-8 h-8 text-blue-500"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
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
        ? "bg-blue-600 text-white"
        : disabled
        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
        : "bg-white border border-gray-300 hover:border-blue-500"
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