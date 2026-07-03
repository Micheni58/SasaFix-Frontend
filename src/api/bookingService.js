// src/api/bookingService.js - Silent 404 Handling

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

// src/api/bookingService.js - Fixed listClientBookings

export async function listClientBookings(clientId) {
    try {
        const resp = await client.get(`/bookings/client/${clientId}`);
        const list = resp.data || [];
        const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
        return results;
    } catch (error) {
        // If endpoint returns 404 or error, return empty array
        if (error.response && error.response.status === 404) {
            console.info("No bookings found for this client");
            return [];
        }
        // Fallback: try to get all bookings and filter by client ID
        try {
            const allBookings = await listActiveBookings();
            return (allBookings || []).filter((b) => Number(b.clientId) === Number(clientId));
        } catch (e2) {
            return [];
        }
    }
}

export async function listProviderBookings(providerId) {
    try {
        const resp = await client.get(`/bookings/provider/${providerId}`);
        const list = resp.data || [];
        const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
        return results;
    } catch (error) {
        // Silently fallback to active bookings filtered by provider id
        if (error.response && error.response.status === 404) {
            try {
                const active = await listActiveBookings();
                return (active || []).filter((b) => Number(b.serviceProviderId) === Number(providerId));
            } catch (e2) {
                return [];
            }
        }
        throw error;
    }
}

export async function getBooking(bookingId) {
    try {
        const resp = await client.get(`/bookings/${bookingId}`);
        return normalizeBookingAsync(resp.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function listActiveBookings() {
    try {
        const resp = await client.get(`/bookings/active`);
        const list = resp.data || [];
        const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
        return results;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return [];
        }
        throw error;
    }
}

export async function updateBookingStatus(bookingId, newStatus) {
    try {
        const resp = await client.patch(`/bookings/${bookingId}/status`, {
            status: newStatus,
        });
        return normalizeBooking(resp.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function cancelBooking(bookingId) {
    try {
        const resp = await client.patch(`/bookings/${bookingId}/cancel`);
        return normalizeBooking(resp.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function rescheduleBooking(bookingId, data) {
    try {
        const resp = await client.patch(`/bookings/${bookingId}/reschedule`, data);
        return normalizeBooking(resp.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return null;
        }
        throw error;
    }
}

export async function listProviders() {
    return [];
}

export async function getProviderAvailability(providerId) {
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