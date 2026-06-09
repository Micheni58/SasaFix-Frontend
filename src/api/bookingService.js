import axios from "axios";

const API_URL = "/api"; // use relative path so Vite dev proxy forwards requests to backend

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple in-memory caches to avoid duplicate user/provider requests during a single fetch
const userCache = new Map();
const providerCache = new Map();

async function fetchUserById(id) {
  if (!id) return null;
  if (userCache.has(id)) return userCache.get(id);
  try {
    const resp = await client.get(`/users/${id}`);
    userCache.set(id, resp.data);
    return resp.data;
  } catch (e) {
    return null;
  }
}

async function fetchProviderById(id) {
  if (!id) return null;
  if (providerCache.has(id)) return providerCache.get(id);
  try {
    const resp = await client.get(`/service-providers/${id}`);
    providerCache.set(id, resp.data);
    return resp.data;
  } catch (e) {
    try {
      const resp2 = await client.get(`/providers/${id}`);
      providerCache.set(id, resp2.data);
      return resp2.data;
    } catch (_) {
      return null;
    }
  }
}

function normalizeBooking(apiBooking) {
  // Map backend booking shape to UI-friendly shape used in MyBookings
  const statusMap = {
    pending: "Upcoming",
    accepted: "Upcoming",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return {
    id: apiBooking.id,
    service: apiBooking.service_name || apiBooking.service || "",
    details: apiBooking.description || "",
    // include raw related objects when available
    client: apiBooking.client || null,
    clientId: apiBooking.client_id || apiBooking.clientId || apiBooking.client?.id || null,
    clientName:
      apiBooking.client_full_name ||
      apiBooking.client?.full_name ||
      apiBooking.client?.fullName ||
      apiBooking.client?.name ||
      apiBooking.client?.user?.full_name ||
      apiBooking.client?.user?.fullName ||
      [apiBooking.client?.first_name, apiBooking.client?.last_name].filter(Boolean).join(" ") ||
      (apiBooking.client?.user && [apiBooking.client.user.first_name, apiBooking.client.user.last_name].filter(Boolean).join(" ")) ||
      (apiBooking.client_id || apiBooking.clientId ? `Client #${apiBooking.client_id || apiBooking.clientId}` : ""),
    service_provider: apiBooking.service_provider || null,
    // Try multiple possible shapes the backend might return for provider name
    providerName:
      apiBooking.provider_full_name ||
      apiBooking.service_provider?.name ||
      apiBooking.service_provider?.full_name ||
      apiBooking.provider_full_name ||
      apiBooking.service_provider?.user?.full_name ||
      apiBooking.service_provider?.user?.fullName ||
      apiBooking.service_provider?.user?.name ||
      apiBooking.client_full_name ||
      apiBooking.serviceProvider?.name ||
      apiBooking.provider?.name ||
      apiBooking.provider_name ||
      apiBooking.service_provider_name ||
      apiBooking.providerName ||
      apiBooking.provider ||
      [apiBooking.service_provider?.first_name, apiBooking.service_provider?.last_name].filter(Boolean).join(" ") ||
      (apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider ? `Provider #${apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider}` : "Provider"),
    serviceProviderId: apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider?.id || null,
    worker:
      apiBooking.service_provider?.name ||
      apiBooking.service_provider?.full_name ||
      apiBooking.serviceProvider?.name ||
      apiBooking.provider?.name ||
      apiBooking.provider_name ||
      apiBooking.service_provider_name ||
      apiBooking.providerName ||
      apiBooking.provider ||
      [apiBooking.service_provider?.first_name, apiBooking.service_provider?.last_name].filter(Boolean).join(" ") ||
      (apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider ? `Provider #${apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider}` : "Provider"),
    initials: (() => {
      const name =
        apiBooking.service_provider?.name ||
        apiBooking.service_provider?.full_name ||
        apiBooking.service_provider?.user?.full_name ||
        apiBooking.service_provider?.user?.fullName ||
        apiBooking.serviceProvider?.name ||
        apiBooking.provider?.name ||
        apiBooking.provider_name ||
        apiBooking.service_provider_name ||
        apiBooking.providerName ||
        apiBooking.provider ||
        [apiBooking.service_provider?.first_name, apiBooking.service_provider?.last_name].filter(Boolean).join(" ") ||
        (apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider ? `P${apiBooking.service_provider_id || apiBooking.serviceProviderId || apiBooking.service_provider}` : "");
      return (
        name
          .toString()
          .split(" ")
          .map((s) => (s ? s[0] : ""))
          .slice(0, 2)
          .join("") || "--"
      );
    })(),
    date: apiBooking.scheduled_date || null,
    time:
      apiBooking.scheduled_start_time && apiBooking.scheduled_end_time
        ? `${apiBooking.scheduled_start_time} - ${apiBooking.scheduled_end_time}`
        : apiBooking.scheduled_start_time || "",
    location: apiBooking.location || "",
    status: statusMap[apiBooking.status] || apiBooking.status || "Pending",
    amount:
      typeof apiBooking.amount === "number"
        ? `KES ${apiBooking.amount.toLocaleString()}`
        : apiBooking.amount || "",
    amountRaw: apiBooking.amount,
  };
}

async function normalizeBookingAsync(apiBooking) {
  const normalized = normalizeBooking(apiBooking);

  // resolve client name if only id present
  if ((!normalized.clientName || normalized.clientName === "") && normalized.clientId) {
    const user = await fetchUserById(normalized.clientId);
    if (user) {
      normalized.client = user;
      normalized.clientName = user.full_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || `Client #${normalized.clientId}`;
    }
  }

  // resolve provider name if only id present
  if ((!normalized.providerName || normalized.providerName === "Provider" || normalized.worker === "Provider") && normalized.serviceProviderId) {
    const prov = await fetchProviderById(normalized.serviceProviderId);
    if (prov) {
      normalized.service_provider = prov;
      const name = prov.name || prov.full_name || (prov.user && (prov.user.full_name || `${prov.user.first_name || ""} ${prov.user.last_name || ""}`.trim()));
      normalized.providerName = name || `Provider #${normalized.serviceProviderId}`;
      normalized.worker = normalized.providerName;
      normalized.initials = (normalized.providerName || "")
        .toString()
        .split(" ")
        .map((s) => (s ? s[0] : ""))
        .slice(0, 2)
        .join("") || "--";
    }
  }

  return normalized;
}

export async function listClientBookings(clientId) {
  const id = clientId ?? 1;
  const resp = await client.get(`/bookings/client/${id}`);
  const list = resp.data || [];
  const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
  return results;
}

export async function listProviderBookings(providerId) {
  const id = providerId ?? 1;
  const resp = await client.get(`/bookings/provider/${id}`);
  const list = resp.data || [];
  const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
  return results;
}

export async function getBooking(bookingId) {
  const resp = await client.get(`/bookings/${bookingId}`);
  return normalizeBookingAsync(resp.data);
}

export async function listActiveBookings() {
  const resp = await client.get(`/bookings/active`);
  const list = resp.data || [];
  const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
  return results;
}

export async function createBooking(data) {
  const resp = await client.post(`/bookings`, data);
  // backend may return created booking; normalize asynchronously
  return normalizeBookingAsync(resp.data);
}

export async function listProviders() {
  try {
    const resp = await client.get(`/service-providers`);
    return resp.data || [];
  } catch (e) {
    try {
      const resp2 = await client.get(`/providers`);
      return resp2.data || [];
    } catch (_) {
      return [];
    }
  }
}

export async function getProviderAvailability(providerId) {
  if (!providerId) return null;
  try {
    const resp = await client.get(`/service-providers/${providerId}/availability`);
    return resp.data || null;
  } catch (e) {
    try {
      const resp2 = await client.get(`/providers/${providerId}/availability`);
      return resp2.data || null;
    } catch (_) {
      return null;
    }
  }
}

export default {
  listClientBookings,
  listProviderBookings,
  getBooking,
  listActiveBookings,
  createBooking,
  listProviders,
  getProviderAvailability,
};
