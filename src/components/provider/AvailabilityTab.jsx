import { useEffect, useState } from "react";
import bookingService from "../../api/bookingService";

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

const AvailabilitySkeleton = () => (
  <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4" aria-hidden="true">
    <div className="space-y-2">
      <div className="loading-skeleton h-4 w-24 rounded" />
      <div className="loading-skeleton h-3 w-36 rounded" />
    </div>
    <div className="loading-skeleton h-6 w-24 rounded-full" />
  </div>
);

const AvailabilityTab = ({ provider }) => {
  const providerId = provider.id || provider.provider_id || provider.service_provider_id;
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await bookingService.getProviderAvailability(providerId);
        if (!active) return;
        const slots = Array.isArray(data)
          ? data
          : data?.availability || data?.data?.availability || data?.data || [];
        setAvailability(
          (Array.isArray(slots) ? slots : [])
            .map((slot) => ({
              ...slot,
              day_of_week: slot.day_of_week ?? slot.dayOfWeek ?? slot.day,
              start_time: slot.start_time ?? slot.startTime,
              end_time: slot.end_time ?? slot.endTime,
              is_available: slot.is_available ?? slot.isAvailable,
            }))
            .sort((first, second) =>
              WEEK_DAYS.indexOf(first.day_of_week) - WEEK_DAYS.indexOf(second.day_of_week),
            ),
        );
      } catch (err) {
        if (active) setError(err.message || "Failed to load availability");
      } finally {
        if (active) setLoading(false);
      }
    };

    if (providerId) loadAvailability();
    else {
      setAvailability([]);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [providerId]);

  if (loading) {
    return (
      <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Availability</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="status" aria-label="Loading provider availability" aria-busy="true">
          {Array.from({ length: 6 }).map((_, index) => <AvailabilitySkeleton key={index} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
        <h2 className="mb-5 text-xl font-bold">Availability</h2>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold">Availability</h2>

      {availability.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-6 text-center">
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
