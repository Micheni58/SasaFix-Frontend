import { useEffect, useState } from "react";

const AvailabilityTab = ({ provider }) => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAvailability = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:8000/api/providers/${provider.id}/availability`,
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Failed to load availability");
        }

        const data = await response.json();
        setAvailability(data);
      } catch (err) {
        setError(err.message || "Failed to load availability");
      } finally {
        setLoading(false);
      }
    };

    if (provider?.id) {
      loadAvailability();
    }
  }, [provider?.id]);

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
        <div className="space-y-4">
          {availability.map((slot) => (
            <div
              key={slot.id}
              className="border rounded-xl p-5 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold text-lg">{slot.day_of_week}</h3>

                <p className="text-gray-500 mt-1">
                  {slot.start_time} - {slot.end_time}
                </p>
              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
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
