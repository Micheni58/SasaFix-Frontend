// src/pages/ServiceDiscovery/ProviderProfilePage.jsx

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="client" />

        <div className="flex-1 ml-72">
          <Navbar />

          <main className="pt-24 px-8">
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
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar role="client" />

        <div className="flex-1 ml-72">
          <Navbar />

          <main className="pt-24 px-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-red-600">
              {error || "Provider not found"}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar role="client" />

      <div className="flex-1 ml-72">
        <Navbar />

        <main className="pt-24 px-8 pb-12">

          {/* Header */}

          <ProfileHeader provider={provider} />

          {/* Main Content */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

            {/* Left */}

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

            {/* Right */}

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