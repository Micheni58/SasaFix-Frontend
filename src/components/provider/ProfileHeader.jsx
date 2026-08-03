// src/components/provider/ProfileHeader.jsx

const ProfileHeader = ({ provider }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-8 py-8">

      <div className="flex items-center gap-8">

        {/* Avatar */}

        <div className="w-32 h-32 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden flex-shrink-0">

          {provider.profile_photo_url ? (
            <img
              src={provider.profile_photo_url}
              alt={`${provider.first_name} ${provider.last_name}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-5xl font-bold">
              {provider.first_name?.charAt(0)}
              {provider.last_name?.charAt(0)}
            </span>
          )}

        </div>

        {/* Provider Information */}

        <div className="flex-1">

          {/* Name + Badge */}

          <div className="flex items-center gap-4 flex-wrap">

            <h1 className="text-5xl font-bold text-gray-900">

              {provider.first_name} {provider.last_name}

            </h1>

            {provider.is_verified && (
              <span className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold">
                ✓ Verified Professional
              </span>
            )}

          </div>

          {/* Category */}

          <p className="text-blue-600 text-3xl mt-3 font-medium">

            {provider.service_category}

          </p>

          {/* Details Row */}

          <div className="flex flex-wrap items-center gap-6 mt-5 text-gray-500">

            <span>
              {provider.location || "Location unavailable"}
            </span>

            <span>
              Joined {provider.member_since || "-"}
            </span>

            <span>
              {provider.total_jobs_completed || 0} jobs completed
            </span>

            <span>
              Responds in {provider.response_time_minutes || "-"} mins
            </span>

          </div>

          {/* Rating */}

          <div className="flex items-center gap-3 mt-6">

            <div className="text-yellow-400 text-2xl">
              ★★★★★
            </div>

            <span className="text-xl font-semibold text-gray-800">
              {provider.average_rating || "New"}
            </span>

            <span className="text-gray-500 text-lg">
              ({provider.total_reviews || 0} reviews)
            </span>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfileHeader;