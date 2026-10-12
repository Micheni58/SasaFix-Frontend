// src/components/cards/ProviderCard.jsx

import { useNavigate } from "react-router-dom";

const initials = (first = "", last = "") =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

const ProviderCard = ({ provider }) => {
  const navigate = useNavigate();

  const rating = provider.average_rating ?? 0;
  const reviews = provider.total_reviews ?? 0;

  const location =
    provider.address ||
    [provider.city, provider.country].filter(Boolean).join(", ") ||
    provider.location ||
    "Location unavailable";

  const avatar = initials(provider.first_name, provider.last_name);
  const providerId =
    provider.id || provider.provider_id || provider.service_provider_id;

  return (
    <article
      className={`flex h-[320px] min-w-0 flex-col rounded-lg border bg-white transition-shadow hover:shadow-md ${
        provider.is_premium ? "border-yellow-400" : "border-gray-200"
      }`}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#2563eb] flex items-center justify-center">
            {provider.profile_photo_url ? (
              <img
                src={provider.profile_photo_url}
                alt={`${provider.first_name || "Provider"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold text-white">{avatar}</span>
            )}
          </div>

          {provider.is_verified && (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Verified
            </span>
          )}
        </div>

        <h3 className="truncate text-base font-bold leading-tight text-gray-900">
          {provider.first_name} {provider.last_name}
        </h3>
        <p className="mt-1 truncate text-sm text-[#2563eb]">
          {provider.service_category || "Service Provider"}
        </p>

        <div className="mt-4 flex min-w-0 items-center gap-1.5 text-sm">
          <svg className="h-4 w-4 shrink-0 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="shrink-0 font-medium text-gray-800">
            {rating > 0 ? rating.toFixed(1) : "New"}
          </span>
          <span className="truncate text-gray-500">({reviews} reviews)</span>
        </div>

        <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-gray-500">
          <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0L6.343 16.657a8 8 0 1111.314 0z" />
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-gray-100 pt-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-gray-500">KES / hr</p>
            <p className="truncate text-base font-bold leading-tight text-gray-900">
              {provider.hourly_rate
                ? Number(provider.hourly_rate).toLocaleString()
                : "Not set"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate(`/providers/${providerId}`)}
            className="shrink-0 rounded-md bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:ring-offset-2"
          >
            View profile
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProviderCard;
