// src/components/provider/ServicesTab.jsx

import { useNavigate } from "react-router-dom";
import { Clock3, Wrench, ArrowRight } from "lucide-react";

const formatPrice = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num) || num <= 0) return "—";
  return `KES ${num.toLocaleString()}`;
};

const formatDuration = (minutes) => {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return null;
  if (m < 60) return `${m} min`;
  const hours = Math.floor(m / 60);
  const rem = m % 60;
  if (rem === 0) return `${hours} hr${hours > 1 ? "s" : ""}`;
  return `${hours}h ${rem}m`;
};

const ServicesTab = ({ provider }) => {
  const navigate = useNavigate();

  const services = Array.isArray(provider?.services)
    ? provider.services.filter((s) => s && s.is_active !== false)
    : [];

  const handleBook = (service) => {
    navigate(`/client/bookings/create/${provider.id}?serviceId=${service.id}`);
  };

  return (
    <div className="rounded-b-xl border border-gray-200 border-t-0 bg-white p-5 sm:p-6">
      <h2 className="mb-5 text-xl font-bold text-gray-900">Services Offered</h2>

      {services.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white border border-gray-200">
              <Wrench className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-800">
                No fixed-price services listed yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This provider hasn't published a service catalog. You can still
                contact them for a custom quote.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-[#056db3] hover:shadow-sm"
            >
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {service.service_name}
                </h3>

                {service.description ? (
                  <p className="mt-1 text-xs text-gray-600 line-clamp-2">
                    {service.description}
                  </p>
                ) : null}

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                  {service.duration_minutes ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      ~{formatDuration(service.duration_minutes)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-base font-bold text-[#056db3]">
                  {formatPrice(service.price)}
                </span>

                <button
                  type="button"
                  onClick={() => handleBook(service)}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#056db3] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#045a94]"
                >
                  Book Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {provider.hourly_rate ? (
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-gray-700">
            Need something not on this list?{" "}
            <span className="font-semibold">
              Hourly rate: KES {Number(provider.hourly_rate).toLocaleString()}/hr
            </span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Use "Book a custom job" on this page to request this provider for a
            non-standard service.
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ServicesTab;