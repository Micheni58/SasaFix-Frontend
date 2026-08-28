// src/components/cards/ProviderCard.jsx

import { useNavigate } from "react-router-dom";

const initials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  const rating = provider.average_rating ?? 0;
  const reviews = provider.total_reviews ?? 0;

  const location =
    provider.city && provider.country
      ? `${provider.city}, ${provider.country}`
      : provider.city ||
        provider.country ||
        "Location unavailable";

  const avatar = initials(
    provider.first_name,
    provider.last_name
  );

  return (
    <div
      className={`relative flex flex-col bg-white rounded-xl border transition-all duration-200 hover:shadow-md h-[350px]

      ${
        provider.is_premium
          ? "border-yellow-400"
          : "border-gray-200"
      }`}
    >
      {/* Card Body */}

      <div className="p-5 flex flex-col flex-1">

        {/* Header */}

        <div className="flex justify-between items-start mb-5">

          {/* Avatar */}

          <div className="w-16 h-16 rounded-full bg-[#2563eb] flex items-center justify-center overflow-hidden">

            {provider.profile_photo_url ? (

              <img
                src={provider.profile_photo_url}
                alt={provider.first_name}
                className="w-full h-full object-cover"
              />

            ) : (

              <span className="text-white text-2xl font-bold">

                {avatar}

              </span>

            )}

          </div>

          {/* Verified */}

          {provider.is_verified && (

            <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full">

              <svg
                className="w-3.5 h-3.5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>

              <span className="text-[12px] font-medium text-blue-600">

                Verified

              </span>

            </div>

          )}

        </div>

        {/* Name */}

        <h3 className="text-[17px] font-bold text-gray-900 leading-tight">

          {provider.first_name} {provider.last_name}

        </h3>

        {/* Category */}

        <p className="text-[15px] text-[#2563eb] mt-1">

          {provider.service_category || "Service Provider"}

        </p>

        {/* Rating */}

        <div className="flex items-center gap-1 mt-4">

          <svg
            className="w-4 h-4 text-yellow-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>

          <span className="font-medium text-gray-800">

            {rating > 0 ? rating.toFixed(1) : "New"}

          </span>

          <span className="text-gray-500 text-sm">

            ({reviews} reviews)

          </span>

        </div>
F
        {/* Location */}

        <div className="flex items-center gap-2 mt-3">

          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z"
            />

            <path
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />

          </svg>

          <span className="text-sm text-gray-500">

            {location}

          </span>

        </div>
                {/* Skills */}

        <div className="flex gap-2 flex-wrap mt-4">

          <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">

            {provider.primary_skill ||
              provider.service_category ||
              "Service"}

          </span>

          {provider.secondary_skill && (

            <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">

              {provider.secondary_skill}

            </span>

          )}

        </div>

        {/* Footer */}

        <div className="flex items-end justify-between mt-4">

          {/* Price */}

          <div className="flex-shrink-0">

            <p className="text-xs font-semibold text-gray-700 uppercase">
              KES
            </p>

            <p className="text-[14px] font-bold text-gray-900 leading-tight whitespace-nowrap">

              {provider.hourly_rate
                ? Number(provider.hourly_rate).toLocaleString()
                : "--"}

              <span className="font-medium text-gray-700">
                /hr
              </span>

            </p>

          </div>

          {/* View Profile */}

          <button
            onClick={() =>
              navigate(`/providers/${provider.id}`)
            }
            className="
              w-[92px]
              h-[50px]
              rounded-lg
              bg-[#2563EB]
              hover:bg-[#1D4ED8]
              text-white
              text-sm
              font-medium
              leading-5
              flex
              items-center
              justify-center
              flex-shrink-0
              transition
            "
          >
            <span className="text-center">
              View
              <br />
              Profile
            </span>
          </button>

        </div>

      </div>

    </div>

  );

};

export default ProviderCard;