import React from "react";

const MapComponent = ({ providers = [], userLocation = null }) => {
  return (
    <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center rounded-xl">

      {/* Map Icon */}
      <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-5">
        <svg
          className="w-10 h-10 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"
          />
          <path
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        Map View
      </h2>

      <p className="text-gray-500 text-center max-w-md mb-6 px-4">
        Google Maps integration has not been configured yet.
        Once a Google Maps API key is added, nearby service
        providers will appear here.
      </p>

      <div className="bg-white rounded-lg shadow border px-6 py-4">

        <p className="text-sm text-gray-700">
          Providers Loaded:
          <span className="font-semibold ml-2">
            {providers.length}
          </span>
        </p>

        {userLocation ? (
          <p className="text-sm text-green-600 mt-2">
            ✓ User location detected
          </p>
        ) : (
          <p className="text-sm text-orange-500 mt-2">
            No location selected
          </p>
        )}

      </div>

      {providers.length > 0 && (
        <div className="mt-8 w-full max-w-2xl">

          <h3 className="font-semibold text-gray-700 mb-3 text-center">
            Loaded Providers
          </h3>

          <div className="grid grid-cols-2 gap-3">

            {providers.slice(0, 6).map((provider) => (
              <div
                key={provider.id}
                className="bg-white border rounded-lg p-3"
              >
                <p className="font-medium">
                  {provider.first_name} {provider.last_name}
                </p>

                <p className="text-sm text-gray-500">
                  {provider.service_category}
                </p>

                <p className="text-xs text-blue-600">
                  {provider.location}
                </p>
              </div>
            ))}

          </div>

        </div>
      )}
    </div>
  );
};

export default MapComponent;