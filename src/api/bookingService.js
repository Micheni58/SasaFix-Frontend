// src/api/bookingService.js - Updated with APPROVED & REJECTED Statuses

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

// ─────────────────────────────────────────────
// NORMALIZERS
// ─────────────────────────────────────────────

function normalizeBooking(apiBooking) {
    const statusMap = {
        pending: "New Requests",
        accepted: "Accepted",
        in_progress: "In Progress",
        completed: "Completed",
        approved: "Approved",
        rejected: "Rejected",
        cancelled: "Cancelled",
    };

    const providerName = apiBooking.provider_full_name || apiBooking.provider_name || "Provider";
    const clientName = apiBooking.client_full_name || apiBooking.client_name || "Client";

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
        rejectionReason: apiBooking.rejection_reason || null,
        raw: apiBooking,
    };
}

// ─────────────────────────────────────────────
// USER CACHE
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// BOOKING ENDPOINTS
// ─────────────────────────────────────────────

export async function listClientBookings(clientId) {
    try {
        const resp = await client.get(`/bookings/client/${clientId}`);
        const list = resp.data || [];
        const results = await Promise.all(list.map((b) => normalizeBookingAsync(b)));
        return results;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.info("No bookings found for this client");
            return [];
        }
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

/**
 * Update booking status with optional rejection reason
 * @param {number} bookingId - The booking ID
 * @param {string} newStatus - New status (pending, accepted, in_progress, completed, approved, rejected, cancelled)
 * @param {string} rejectionReason - Optional reason for rejection (only used when status is 'rejected')
 */
export async function updateBookingStatus(bookingId, newStatus, rejectionReason = null) {
    try {
        const payload = { status: newStatus };
        if (rejectionReason && newStatus === "rejected") {
            payload.rejection_reason = rejectionReason;
        }
        const resp = await client.patch(`/bookings/${bookingId}/status`, payload);
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

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

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