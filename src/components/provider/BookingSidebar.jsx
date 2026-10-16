// src/components/provider/BookingSidebar.jsx

import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import { formatMemberSince } from "../../utils/providerProfile";

const BookingSidebar = ({ provider }) => {
  const navigate = useNavigate();
  const providerId =
    provider.id || provider.provider_id || provider.service_provider_id;

  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        {/* Price */}

        <p className="text-gray-500 text-sm">Starting from</p>

        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          KES {provider.hourly_rate || 0}/hr
        </h2>

        {/* Buttons */}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={() => navigate(`/client/bookings/create/${providerId}`)}
            className="w-full rounded-xl bg-[#056db3] py-3 text-base font-semibold text-white transition hover:bg-[#045b96] focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-2"
          >
            Book This Worker
          </button>

          <button type="button" className="w-full rounded-xl border-2 border-[#056db3] py-3 text-sm font-semibold text-[#056db3] transition hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[#056db3] focus:ring-offset-2">
            Message Worker
          </button>
        </div>

        {/* Divider */}

        <div className="my-6 border-t border-gray-200"></div>

        {/* Quick Information */}

        <div className="space-y-4 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Response Time</span>

            <span className="font-semibold text-gray-800">
              {provider.response_time_minutes
                ? `${provider.response_time_minutes} mins`
                : "-"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Completed Jobs</span>

            <span className="font-semibold text-gray-800">
              {provider.total_jobs_completed ?? 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Member Since</span>

            <span className="font-semibold text-gray-800">
              {formatMemberSince(provider.member_since)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Rating</span>

            <span className="inline-flex items-center gap-1 font-semibold text-yellow-600">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              {Number(provider.average_rating) > 0 ? Number(provider.average_rating).toFixed(1) : "New"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Reviews</span>

            <span className="font-semibold text-gray-800">
              {provider.total_reviews ?? 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
