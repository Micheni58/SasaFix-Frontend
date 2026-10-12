// src/components/provider/BookingSidebar.jsx

import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const BookingSidebar = ({ provider }) => {
  const navigate = useNavigate();
  const providerId =
    provider.id || provider.provider_id || provider.service_provider_id;

  return (
    <div className="sticky top-24">
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
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold text-base"
          >
            Book This Worker
          </button>

          <button type="button" className="w-full rounded-lg border border-blue-600 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-50">
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
              {provider.total_jobs_completed || 0}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Member Since</span>

            <span className="font-semibold text-gray-800">
              {provider.member_since || "-"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Rating</span>

            <span className="inline-flex items-center gap-1 font-semibold text-yellow-600">
              <Star className="h-4 w-4 fill-current" aria-hidden="true" />
              {provider.average_rating || "New"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-500">Reviews</span>

            <span className="font-semibold text-gray-800">
              {provider.total_reviews || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSidebar;
