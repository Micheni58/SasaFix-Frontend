// src/components/provider/OverviewTab.jsx

const OverviewTab = ({ provider }) => {
  return (
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">

      {/* About */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          About
        </h2>

        <p className="text-gray-600 leading-8">
          {provider.bio || "This provider hasn't added a bio yet."}
        </p>

      </section>

      {/* Professional Information */}

      <section>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Professional Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Service Category
            </p>

            <p className="mt-2 text-lg font-semibold">
              {provider.service_category || "-"}
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Years of Experience
            </p>

            <p className="mt-2 text-lg font-semibold">
              {provider.years_of_experience || 0} Years
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Hourly Rate
            </p>

            <p className="mt-2 text-lg font-semibold">
              KES {provider.hourly_rate || 0}/hr
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Location
            </p>

            <p className="mt-2 text-lg font-semibold">
              {provider.location || "Not provided"}
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Jobs Completed
            </p>

            <p className="mt-2 text-lg font-semibold">
              {provider.total_jobs_completed || 0}
            </p>

          </div>

          <div className="bg-gray-50 rounded-xl p-5">

            <p className="text-gray-500 text-sm">
              Average Rating
            </p>

            <p className="mt-2 text-lg font-semibold">
              ⭐ {provider.average_rating || "New"}
            </p>

          </div>

        </div>

      </section>

    </div>
  );
};

export default OverviewTab;