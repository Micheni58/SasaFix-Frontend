// src/pages/ServiceDiscovery/ProviderProfilePage.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ChevronLeft, MessageSquarePlus } from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

import { getProvider } from "../../services/discoveryApi";
import bookingService from "../../api/bookingService";
import ratingService from "../../api/ratingService";
import reviewService from "../../api/reviewService";

import ProfileHeader from "../../components/provider/ProfileHeader";
import BookingSidebar from "../../components/provider/BookingSidebar";
import ProviderTabs from "../../components/provider/ProviderTabs";
import OverviewTab from "../../components/provider/OverviewTab";
import ServicesTab from "../../components/provider/ServicesTab";
import ReviewsTab from "../../components/provider/ReviewsTab";
import AvailabilityTab from "../../components/provider/AvailabilityTab";

const ProviderProfileSkeleton = () => (
  <div className="provider-public-profile flex min-h-screen overflow-x-hidden bg-gray-50">
    <Sidebar role="client" />
    <div className="min-w-0 flex-1 ml-0 lg:ml-72">
      <Navbar />
      <main className="px-4 pb-6 pt-24 sm:px-6" role="status" aria-label="Loading provider profile" aria-busy="true">
        <div className="loading-skeleton mb-5 h-4 w-36 rounded" />
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="loading-skeleton h-20 w-20 shrink-0 rounded-full sm:h-24 sm:w-24" />
            <div className="w-full flex-1 space-y-3">
              <div className="loading-skeleton h-7 w-2/3 max-w-sm rounded" />
              <div className="loading-skeleton h-4 w-1/3 max-w-xs rounded" />
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="loading-skeleton h-4 w-28 rounded" />
                <div className="loading-skeleton h-4 w-36 rounded" />
                <div className="loading-skeleton h-4 w-24 rounded" />
              </div>
              <div className="loading-skeleton h-4 w-40 rounded" />
            </div>
          </div>
        </section>
        <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 sm:mt-8 lg:grid-cols-3 lg:gap-6">
          <section className="lg:col-span-2">
            <div className="flex gap-7 rounded-t-xl border border-gray-200 bg-white px-5 py-4">
              {["w-16", "w-14", "w-12", "w-20"].map((width, index) => (
                <div key={index} className={`loading-skeleton h-4 ${width} rounded`} />
              ))}
            </div>
            <div className="space-y-5 rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
              <div className="loading-skeleton h-6 w-28 rounded" />
              <div className="space-y-2">
                <div className="loading-skeleton h-4 w-full rounded" />
                <div className="loading-skeleton h-4 w-5/6 rounded" />
                <div className="loading-skeleton h-4 w-2/3 rounded" />
              </div>
              <div className="loading-skeleton h-6 w-56 rounded" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="loading-skeleton h-20 rounded-lg" />
                ))}
              </div>
            </div>
          </section>
          <aside className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="loading-skeleton h-4 w-24 rounded" />
            <div className="loading-skeleton mt-3 h-8 w-40 rounded" />
            <div className="loading-skeleton mt-6 h-12 w-full rounded-xl" />
            <div className="loading-skeleton mt-3 h-12 w-full rounded-xl" />
            <div className="my-6 border-t border-gray-200" />
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex justify-between gap-4">
                  <div className="loading-skeleton h-4 w-24 rounded" />
                  <div className="loading-skeleton h-4 w-16 rounded" />
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
);

const ProviderProfilePage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    let active = true;

    const loadProvider = async () => {
      try {
        setLoading(true);
        setError("");
        setProvider(null);

        const data = await getProvider(providerId);
        if (!active) return;

        const id = data.id || data.provider_id || data.service_provider_id;
        const [ratingResult, reviewResult, bookingResult] = await Promise.allSettled([
          id ? ratingService.getProviderAverageRating(id) : Promise.resolve(null),
          id ? reviewService.getProviderReviews(id) : Promise.resolve([]),
          id ? bookingService.listProviderBookings(id) : Promise.resolve([]),
        ]);

        if (!active) return;

        const profile = { ...data };
        if (ratingResult.status === "fulfilled" && ratingResult.value) {
          const average = Number(ratingResult.value.averageScore);
          if (Number.isFinite(average) && average > 0) profile.average_rating = average;
        }

        const reviews = reviewResult.status === "fulfilled" ? reviewResult.value : [];
        profile.total_reviews = reviewResult.status === "fulfilled"
          ? reviews.length
          : Number(profile.total_reviews || 0);

        const bookings = bookingResult.status === "fulfilled" ? bookingResult.value : [];
        const completedJobs = bookings.filter((booking) =>
          ["completed", "approved", "paid"].includes(
            String(booking.status || "").trim().toLowerCase(),
          ),
        ).length;
        profile.total_jobs_completed = Math.max(
          Number(profile.total_jobs_completed || 0),
          completedJobs,
        );

        setProvider(profile);
      } catch (err) {
        if (active) setError(err.message || "Failed to load provider.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProvider();

    return () => {
      active = false;
    };
  }, [providerId]);

  if (loading) {
    return <ProviderProfileSkeleton />;
  }

  if (error || !provider) {
    return (
      <div className="provider-public-profile flex min-h-screen overflow-x-hidden bg-gray-50">
        <Sidebar role="client" />
        <div className="min-w-0 flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="px-4 pb-6 pt-24 sm:px-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-red-600">
              {error || "Provider not found"}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-public-profile flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
      <Sidebar role="client" />

      <div className="min-w-0 flex-1 ml-0 lg:ml-72">
        <Navbar />

        <main className="min-w-0 px-4 pb-6 pt-24 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/client/find-services")}
            className="group mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-[#056db3]"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Find Services
          </button>
          <ProfileHeader provider={provider} />

          <div className="mt-5 grid min-w-0 grid-cols-1 items-start gap-5 sm:mt-8 lg:grid-cols-3 lg:gap-6">
            <div className="lg:col-span-2">
              <ProviderTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />

              {activeTab === "overview" && (
                <OverviewTab provider={provider} />
              )}

              {activeTab === "services" && (
                <ServicesTab provider={provider} />
              )}

              {activeTab === "reviews" && (
                <ReviewsTab provider={provider} />
              )}

              {activeTab === "availability" && (
                <AvailabilityTab provider={provider} />
              )}
            </div>

            <div className="space-y-4">
              {/* Existing booking sidebar */}
              <BookingSidebar provider={provider} />

              {/* NEW: Request custom quote card */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">
                  Have a custom job?
                </h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Need something that's not on the list? Send a direct request for a quote to {provider.first_name}.
                </p>
                <Link
                  to={`/client/quotes/new?providerId=${provider.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#056db3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#045a94] focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-2"
                >
                  <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                  Request Custom Quote
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProviderProfilePage;