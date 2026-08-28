import { useEffect, useState } from "react";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatTime = (time) => {
  if (!time) return "-";

  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const AvailabilityTab = ({ provider }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError("");

        const providerId =
          provider.id || provider.provider_id || provider.service_provider_id;
        const response = await fetch(
          `http://localhost:8000/api/providers/${providerId}/availability`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load availability");
        }

        const data = await response.json();
        const slots = Array.isArray(data) ? data : data.availability || [];
        setAvailability(
          [...slots].sort(
            (first, second) =>
              WEEK_DAYS.indexOf(first.day_of_week) -
              WEEK_DAYS.indexOf(second.day_of_week),
          ),
        );
      } catch (err) {
        setError(err.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    if (
      provider?.id ||
      provider?.provider_id ||
      provider?.service_provider_id
    ) {
      loadAvailability();
    }
  }, [provider]);

  if (loading) {
    return (
      <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">
        <h2 className="text-2xl font-bold mb-6">Availability</h2>

        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <p className="text-gray-500">Loading availability...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">
        <h2 className="text-2xl font-bold mb-6">Availability</h2>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">
      <h2 className="text-2xl font-bold mb-6">Availability</h2>

      {availability.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <p className="text-gray-500">No availability has been added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {availability.map((slot) => (
            <div
              key={slot.id || `${slot.day_of_week}-${slot.start_time}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {slot.day_of_week}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  slot.is_available
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {slot.is_available ? "Available" : "Unavailable"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailabilityTab;
