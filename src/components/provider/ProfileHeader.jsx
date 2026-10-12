// src/components/provider/ProfileHeader.jsx
import { BadgeCheck, Star } from "lucide-react";

const formatJoinedDate = (dateValue) => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? dateValue : date.toLocaleDateString();
};

const ProfileHeader = ({ provider }) => {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6">
        {/* Avatar */}

        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 sm:h-24 sm:w-24">
          {provider.profile_photo_url ? (
            <img
              src={provider.profile_photo_url}
              alt={`${provider.first_name} ${provider.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-white sm:text-3xl">
              {provider.first_name?.charAt(0)}
              {provider.last_name?.charAt(0)}
            </span>
          )}
        </div>

        {/* Provider Information */}

        <div className="min-w-0 flex-1">
          {/* Name + Badge */}

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-800">
              {provider.first_name} {provider.last_name}
            </h1>

            {provider.is_verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600">
                <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                Verified Professional
              </span>
            )}
          </div>

          {/* Category */}

          <p className="mt-1 text-base font-medium text-blue-600">
            {provider.service_category}
          </p>

          {/* Details Row */}

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
            <span>{provider.location || "Location unavailable"}</span>

            <span>Joined {formatJoinedDate(provider.member_since)}</span>

            <span>{provider.total_jobs_completed || 0} jobs completed</span>

            <span>
              Responds in {provider.response_time_minutes || "-"} mins
            </span>
          </div>

          {/* Rating */}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-0.5 text-yellow-400" aria-label="Provider rating">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="h-4 w-4 fill-current" aria-hidden="true" />
              ))}
            </div>

            <span className="text-sm font-semibold text-gray-800">
              {provider.average_rating || "New"}
            </span>

            <span className="text-gray-500 text-sm">
              ({provider.total_reviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileHeader;
