// src/components/provider/OverviewTab.jsx
import { Star } from "lucide-react";

const OverviewTab = ({ provider }) => {
  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      {/* About */}

      <section className="mb-10">
        <h2 className="mb-4 text-xl font-bold text-gray-900">About</h2>

        <p className="leading-7 text-gray-600">
          {provider.bio || "This provider hasn't added a bio yet."}
        </p>
      </section>

      {/* Professional Information */}

      <section>
        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Professional Information
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Service Category</p>

            <p className="mt-2 text-lg font-semibold">
              {provider.service_category || "-"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Years of Experience</p>

            <p className="mt-2 text-lg font-semibold">
              {provider.years_of_experience || 0} Years
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Hourly Rate</p>

            <p className="mt-2 text-lg font-semibold">
              KES {provider.hourly_rate || 0}/hr
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Location</p>

            <p className="mt-2 text-lg font-semibold">
              {provider.location || "Not provided"}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Jobs Completed</p>

            <p className="mt-2 text-lg font-semibold">
              {provider.total_jobs_completed || 0}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-gray-500 text-sm">Average Rating</p>

            <p className="mt-2 flex items-center gap-1.5 text-base font-semibold">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
              {provider.average_rating || "New"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
