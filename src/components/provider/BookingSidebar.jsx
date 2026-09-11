// src/components/provider/BookingSidebar.jsx

import { useNavigate } from "react-router-dom";

const BookingSidebar = ({ provider }) => {
  const navigate = useNavigate();
  const providerId =
    provider.id || provider.provider_id || provider.service_provider_id;

  return (
    <div className="sticky top-24">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        {/* Price */}

        <p className="text-gray-500 text-sm">Starting from</p>

        <h2 className="text-3xl font-bold text-gray-900 mt-2">
          KES {provider.hourly_rate || 0}/hr
        </h2>

        {/* Buttons */}

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => navigate(`/client/bookings/create/${providerId}`)}
            className="w-full bg-blue-600 hover:bg-blue-700 transition text-white py-3 rounded-xl font-semibold text-base"
          >
            Book This Worker
          </button>

          <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition py-4 rounded-xl font-semibold text-lg">
            Message Worker
          </button>
        </div>

        {/* Divider */}

        <div className="border-t border-gray-200 my-8"></div>

        {/* Quick Information */}

        <div className="space-y-5">
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

            <span className="font-semibold text-yellow-500">
              ⭐ {provider.average_rating || "New"}
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
