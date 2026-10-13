// src/pages/ServiceDiscovery/ProviderProfilePage.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

import { getProvider } from "../../services/discoveryApi";

import ProfileHeader from "../../components/provider/ProfileHeader";
import BookingSidebar from "../../components/provider/BookingSidebar";
import ProviderTabs from "../../components/provider/ProviderTabs";
import OverviewTab from "../../components/provider/OverviewTab";
import ServicesTab from "../../components/provider/ServicesTab";
import ReviewsTab from "../../components/provider/ReviewsTab";
import AvailabilityTab from "../../components/provider/AvailabilityTab";

const ProviderProfilePage = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const loadProvider = async () => {
      try {
        setLoading(true);

        const data = await getProvider(providerId);

        setProvider(data);
      } catch (err) {
        setError(err.message || "Failed to load provider.");
      } finally {
        setLoading(false);
      }
    };

    loadProvider();
  }, [providerId]);

  if (loading) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
        <Sidebar role="client" />

        <div className="min-w-0 flex-1 ml-0 lg:ml-72">
          <Navbar />

          <main className="px-4 pb-6 pt-24 sm:px-6">
            <div className="bg-white rounded-xl p-10 text-center shadow-sm">
              Loading provider...
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="flex min-h-screen overflow-x-hidden bg-gray-50">
        <Sidebar role="client" />

        <div className="min-w-0 flex-1 ml-0 lg:ml-72">
          <Navbar />

          <main className="px-4 pb-6 pt-24 sm:px-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-red-600">
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

            <div>

              <BookingSidebar provider={provider} />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default ProviderProfilePage;