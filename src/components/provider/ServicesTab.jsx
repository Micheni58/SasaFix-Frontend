// src/components/provider/ServicesTab.jsx

const ServicesTab = ({ provider }) => {
  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold">Services Offered</h2>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-blue-700">
          {provider.service_category}
        </h3>

        <p className="text-gray-600 mt-3">
          This professional offers <strong>{provider.service_category}</strong>{" "}
          services.
        </p>

        <div className="mt-5 flex items-center justify-between gap-4">
          <span className="text-gray-500">Hourly Rate</span>

          <span className="text-lg font-bold text-blue-600">
            KES {provider.hourly_rate}/hr
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;
