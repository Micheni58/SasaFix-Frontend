import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Filter,
  MapPin,
  Search,
  Star,
  UserRound,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

import adminProvidersService from "../../services/adminProvidersService";

import ServiceProvidersSkeleton from "../../components/admin/ServiceProviders/ServiceProviderSkeleton";


const formatEarnings = (value) => {
  const amount = Number(value || 0);

  if (!amount) {
    return "-";
  }

  return `KES ${new Intl.NumberFormat(
    "en-KE",
    {
      maximumFractionDigits: 0,
    }
  ).format(amount)}`;
};


const getInitials = (provider) => {
  return `${provider.first_name?.charAt(0) || ""}${
    provider.last_name?.charAt(0) || ""
  }`.toUpperCase();
};


const normalizeStatus = (status) => {
  const value = String(
    status || "pending"
  ).toLowerCase();

  if (value === "verified") {
    return "verified";
  }

  if (value === "rejected") {
    return "rejected";
  }

  return "pending";
};


const VerificationBadge = ({ status }) => {
  const normalized =
    normalizeStatus(status);

  if (normalized === "verified") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#d9f8e7] px-3 py-1 text-xs font-medium text-[#159447]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
        Rejected
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-[#fff3bd] px-3 py-1 text-xs font-medium text-[#c98500]">
      Pending
    </span>
  );
};


const PlanBadge = ({ plan }) => {
  const premium =
    String(plan || "").toLowerCase() ===
    "premium";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
        premium
          ? "bg-[#eee6ff] text-[#6d28d9]"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {premium ? "Premium" : "Basic"}
    </span>
  );
};


const ServiceProvidersManagement = () => {
  const [providers, setProviders] =
    useState([]);

  const [activeTab, setActiveTab] =
    useState("all");

  const [verification, setVerification] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await adminProvidersService.getProviders(
          {
            verification: "all",
          }
        );

      setProviders(
        Array.isArray(data)
          ? data
          : data.service_providers ||
              data.providers ||
              []
      );
    } catch (err) {
      console.error(
        "Failed to load service providers:",
        err
      );

      setError(
        err.message ||
          "Failed to load service providers."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProviders();
  }, []);


  const pendingCount = useMemo(() => {
    return providers.filter(
      (provider) =>
        normalizeStatus(
          provider.verification_status
        ) === "pending"
    ).length;
  }, [providers]);


  const filteredProviders = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return providers.filter(
      (provider) => {
        const status =
          normalizeStatus(
            provider.verification_status
          );

        const matchesTab =
          activeTab === "all"
            ? true
            : status === "pending";

        const matchesVerification =
          verification === "all"
            ? true
            : status === verification;

        const fullName =
          `${provider.first_name || ""} ${
            provider.last_name || ""
          }`
            .trim()
            .toLowerCase();

        const category =
          String(
            provider.service_category ||
              provider.category ||
              ""
          ).toLowerCase();

        return (
          matchesTab &&
          matchesVerification &&
          (!query ||
            fullName.includes(query) ||
            category.includes(query))
        );
      }
    );
  }, [
    providers,
    activeTab,
    verification,
    search,
  ]);


  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />

      <div className="ml-72 flex-1">
        <Navbar />

        <main className="px-8 pb-10 pt-24">
          {loading ? (
            <ServiceProvidersSkeleton />
          ) : (
            <>
              {/* PAGE HEADING */}
              <div className="mb-7">
                <h1 className="text-[30px] font-bold tracking-tight text-[#0f172a]">
                  Service Providers Management
                </h1>

                <p className="mt-1 text-[16px] text-slate-500">
                  Manage and verify service providers on the platform
                </p>
              </div>


              {/* ERROR */}
              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* TABS */}
              <div className="mb-6 flex items-end gap-8 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("all")
                  }
                  className={`relative pb-4 text-sm font-medium ${
                    activeTab === "all"
                      ? "text-[#5b00ff]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  All Providers ({providers.length})

                  {activeTab === "all" && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#5b00ff]" />
                  )}
                </button>


                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("pending")
                  }
                  className={`relative pb-4 text-sm font-medium ${
                    activeTab === "pending"
                      ? "text-[#5b00ff]"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Pending Verification (
                  {pendingCount}
                  )

                  {pendingCount > 0 && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
                  )}

                  {activeTab === "pending" && (
                    <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#5b00ff]" />
                  )}
                </button>
              </div>


              {/* SEARCH + FILTER */}
              <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value
                        )
                      }
                      placeholder="Search by name or category..."
                      className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#5b00ff]"
                    />
                  </div>


                  <Filter className="h-5 w-5 text-slate-400" />


                  <select
                    value={verification}
                    onChange={(event) =>
                      setVerification(
                        event.target.value
                      )
                    }
                    className="h-12 w-40 rounded-lg border border-slate-300 bg-white px-4 text-sm text-slate-700 outline-none focus:border-[#5b00ff]"
                  >
                    <option value="all">
                      All Verification
                    </option>

                    <option value="verified">
                      Verified
                    </option>

                    <option value="pending">
                      Pending
                    </option>

                    <option value="rejected">
                      Rejected
                    </option>
                  </select>
                </div>
              </div>


              {/* PROVIDERS TABLE */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1100px]">
                    <thead className="bg-slate-50">
                      <tr>
                        {[
                          "Provider",
                          "Category",
                          "Location",
                          "Verification",
                          "Rating",
                          "Jobs",
                          "Earnings",
                          "Plan",
                        ].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500"
                            >
                              {heading}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>


                    <tbody>
                      {filteredProviders.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={8}
                            className="px-6 py-14 text-center text-sm text-slate-500"
                          >
                            No service providers found.
                          </td>
                        </tr>
                      ) : (
                        filteredProviders.map(
                          (provider) => {
                            const status =
                              normalizeStatus(
                                provider.verification_status
                              );

                            return (
                              <tr
                                key={
                                  provider.provider_id ||
                                  provider.id
                                }
                                className="border-t border-slate-200 transition-colors hover:bg-slate-50"
                              >
                                {/* PROVIDER */}
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    {provider.profile_photo_url ? (
                                      <img
                                        src={
                                          provider.profile_photo_url
                                        }
                                        alt=""
                                        className="h-10 w-10 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6800ff] text-sm font-semibold text-white">
                                        {getInitials(
                                          provider
                                        ) || (
                                          <UserRound className="h-5 w-5" />
                                        )}
                                      </div>
                                    )}

                                    <span className="whitespace-nowrap text-sm font-medium text-[#0f172a]">
                                      {
                                        provider.first_name
                                      }{" "}
                                      {
                                        provider.last_name
                                      }
                                    </span>
                                  </div>
                                </td>


                                {/* CATEGORY */}
                                <td className="px-6 py-4 text-sm text-[#17345f]">
                                  {provider.service_category ||
                                    provider.category ||
                                    "-"}
                                </td>


                                {/* LOCATION */}
                                <td className="px-6 py-4">
                                  <span className="inline-flex items-center gap-1 whitespace-nowrap text-sm text-slate-600">
                                    <MapPin className="h-4 w-4" />

                                    {provider.location ||
                                      "Location unavailable"}
                                  </span>
                                </td>


                                {/* VERIFICATION */}
                                <td className="px-6 py-4">
                                  <VerificationBadge
                                    status={
                                      status
                                    }
                                  />
                                </td>


                                {/* RATING */}
                                <td className="px-6 py-4">
                                  {provider.rating !==
                                    null &&
                                  provider.rating !==
                                    undefined &&
                                  Number(
                                    provider.rating
                                  ) > 0 ? (
                                    <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                                      <Star className="h-4 w-4 fill-[#ffc107] text-[#ffc107]" />

                                      {Number(
                                        provider.rating
                                      ).toFixed(1)}
                                    </span>
                                  ) : (
                                    <span className="text-sm text-slate-500">
                                      -
                                    </span>
                                  )}
                                </td>


                                {/* JOBS */}
                                <td className="px-6 py-4 text-sm font-medium text-[#0f172a]">
                                  {provider.jobs ??
                                    0}
                                </td>


                                {/* EARNINGS */}
                                <td className="px-6 py-4 text-sm text-[#0f172a]">
                                  {formatEarnings(
                                    provider.earnings
                                  )}
                                </td>


                                {/* PLAN */}
                                <td className="px-6 py-4">
                                  <PlanBadge
                                    plan={
                                      provider.plan
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          }
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};


export default ServiceProvidersManagement;