import axios from "axios";

const API_URL = "/api";

const client = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add auth token to every request
client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function normalizeBooking(apiBooking) {
    const statusMap = {
        pending: "New Requests",
        accepted: "Accepted",
        in_progress: "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
    };

    const providerName = apiBooking.provider_full_name || "Provider";
    const clientName = apiBooking.client_full_name || "Client";

    return {
        id: apiBooking.id,
        service: apiBooking.service_name || "",
        details: apiBooking.description || "",
        worker: providerName,
        providerName: providerName,
        client: clientName,
        clientName: clientName,
        clientId: apiBooking.client_id || null,
        serviceProviderId: apiBooking.service_provider_id || null,
        initials: providerName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("") || "--",
        clientInitials: clientName
            .split(" ")
            .map((s) => s[0])
            .slice(0, 2)
            .join("") || "--",
        date: apiBooking.scheduled_date || null,
        time:
            apiBooking.scheduled_start_time && apiBooking.scheduled_end_time
                ? `${apiBooking.scheduled_start_time} - ${apiBooking.scheduled_end_time}`
                : apiBooking.scheduled_start_time || "",
        location: apiBooking.location || "",
        status: statusMap[apiBooking.status] || apiBooking.status || "New Requests",
        amount:
            typeof apiBooking.amount === "number"
                ? `KES ${apiBooking.amount.toLocaleString()}`
                : apiBooking.amount || "",
        amountRaw: apiBooking.amount,
        raw: apiBooking,
    };
}

// simple in-memory cache for users to avoid repeated network calls
const userCache = new Map();

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

async function normalizeBookingAsync(apiBooking) {
    const normalized = normalizeBooking(apiBooking);
    // if client name not provided, try fetching user by clientId
    if ((normalized.client === 'Client' || !normalized.client || normalized.client.toString().toLowerCase().startsWith('client #')) && normalized.clientId) {
        const user = await fetchUserById(normalized.clientId);
        if (user) {
            normalized.client = user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || `Client #${normalized.clientId}`;
            normalized.clientName = normalized.client;
            normalized.clientInitials = (normalized.client || '').split(' ').map(s=>s[0]).slice(0,2).join('') || '--';
            normalized.clientObj = user;
        }
    }
    return normalized;
}

export async function listClientBookings(clientId) {
    const resp = await client.get(`/bookings/client/${clientId}`);
    const list = resp.data || [];
    const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
    return results;
}

export async function listProviderBookings(providerId) {
    try {
        const resp = await client.get(`/bookings/provider/${providerId}`);
        const list = resp.data || [];
        const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
        return results;
    } catch (e) {
        // If provider-specific endpoint not available or returns 404, fallback to active bookings filtered by provider id
        try {
            const active = await listActiveBookings(); // already normalized
            return (active || []).filter((b) => Number(b.serviceProviderId) === Number(providerId));
        } catch (e2) {
            return [];
        }
    }
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

export async function updateBookingStatus(bookingId, newStatus) {
    const resp = await client.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
    });
    return normalizeBooking(resp.data);
}

export async function cancelBooking(bookingId) {
    const resp = await client.patch(`/bookings/${bookingId}/cancel`);
    return normalizeBooking(resp.data);
}

export async function rescheduleBooking(bookingId, data) {
    const resp = await client.patch(`/bookings/${bookingId}/reschedule`, data);
    return normalizeBooking(resp.data);
}

export async function listProviders() {
    // backend does not reliably expose provider listing in this project; avoid noisy probe requests
    return [];
}

export async function getProviderAvailability(providerId) {
    // Availability endpoints are not implemented on backend; return null to avoid 404s
    return null;
}

export default {
    listClientBookings,
    listProviderBookings,
    getBooking,
    listActiveBookings,
    updateBookingStatus,
    cancelBooking,
    rescheduleBooking,
    listProviders,
    getProviderAvailability,
};