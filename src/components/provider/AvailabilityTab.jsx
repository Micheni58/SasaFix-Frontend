// src/components/provider/AvailabilityTab.jsx

const AvailabilityTab = ({ provider }) => {
  return (
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">

      <h2 className="text-2xl font-bold mb-6">
        Availability
      </h2>

      {!provider.availability || provider.availability.length === 0 ? (

        <div className="bg-gray-50 rounded-xl p-10 text-center">

          <p className="text-gray-500">
            No availability has been added yet.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {provider.availability.map((slot) => (

            <div
              key={slot.id}
              className="border rounded-xl p-5 flex justify-between items-center"
            >

              <div>

                <h3 className="font-semibold text-lg">
                  {slot.day_of_week}
                </h3>

                <p className="text-gray-500 mt-1">
                  {slot.start_time} - {slot.end_time}
                </p>

              </div>

              <span
                className={`px-4 py-2 rounded-full text-sm font-semibold ${
                  slot.is_booked
                    ? "bg-red-100 text-red-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {slot.is_booked ? "Booked" : "Available"}
              </span>

            </div>

          ))}

        </div>

      )}

    </div>
  );
};

export default AvailabilityTab;