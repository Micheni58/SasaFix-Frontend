// src/components/provider/ServicesTab.jsx

const ServicesTab = ({ provider }) => {
  return (
    <div className="bg-white rounded-b-xl border border-gray-200 border-t-0 p-8">
      <h2 className="text-2xl font-bold mb-6">Services Offered</h2>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-blue-700">
          {provider.service_category}
        </h3>

        <p className="text-gray-600 mt-3">
          This professional offers <strong>{provider.service_category}</strong>{" "}
          services.
        </p>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-gray-500">Hourly Rate</span>

          <span className="text-2xl font-bold text-blue-600">
            KES {provider.hourly_rate}/hr
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServicesTab;
