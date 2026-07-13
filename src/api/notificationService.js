// src/api/notificationService.js - Updated with proper user ID handling

import axios from "axios";

const API_URL = "/api";

const client = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

client.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

function getStoredUserId() {
    // Try multiple sources for user ID
    const userId = localStorage.getItem("userId");
    if (userId) return userId;

    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        return user.id || user.user_id || user.client_id || user.provider_id || null;
    } catch {
        return null;
    }
}

function requireUserId(userId) {
    const resolvedUserId = userId || getStoredUserId();
    if (!resolvedUserId) {
        throw new Error("A user ID is required to fetch notifications.");
    }
    return resolvedUserId;
}

function formatTimeAgo(dateValue) {
    if (!dateValue) return "";

    const createdAt = new Date(dateValue);
    if (Number.isNaN(createdAt.getTime())) return "";

    const diffMs = Date.now() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;

    return createdAt.toLocaleDateString();
}

function normalizeNotification(notification) {
    return {
        id: notification.id,
        userId: notification.user_id,
        type: notification.type || "general",
        title: notification.title || "",
        body: notification.body || "",
        text: notification.body || notification.title || "",
        read: Boolean(notification.is_read),
        isRead: Boolean(notification.is_read),
        relatedBookingId: notification.related_booking_id || null,
        createdAt: notification.created_at || null,
        timeAgo: formatTimeAgo(notification.created_at),
        raw: notification,
    };
}

function normalizeNotifications(notifications) {
    return (notifications || []).map(normalizeNotification);
}

// ─────────────────────────────────────────────
// FETCH ENDPOINTS
// ─────────────────────────────────────────────

export async function fetchNotifications(userId, limit = 50, offset = 0) {
    const resolvedUserId = requireUserId(userId);
    const response = await client.get(
        `/notifications/user/${resolvedUserId}?limit=${limit}&offset=${offset}`
    );
    return normalizeNotifications(response.data);
}

export async function fetchUnreadNotifications(userId) {
    const resolvedUserId = requireUserId(userId);
    const response = await client.get(`/notifications/user/${resolvedUserId}/unread`);
    return normalizeNotifications(response.data);
}

export async function fetchUnreadNotificationCount(userId) {
    const resolvedUserId = requireUserId(userId);
    const response = await client.get(`/notifications/user/${resolvedUserId}/unread/count`);
    return response.data?.unread_count ?? 0;
}

export async function fetchNotificationsByType(userId, notificationType) {
    const resolvedUserId = requireUserId(userId);
    const response = await client.get(
        `/notifications/user/${resolvedUserId}/type/${notificationType}`
    );
    return normalizeNotifications(response.data);
}

export async function getNotification(notificationId) {
    const response = await client.get(`/notifications/${notificationId}`);
    return normalizeNotification(response.data);
}

// ─────────────────────────────────────────────
// MUTATIONS
// ─────────────────────────────────────────────

export async function createNotification(notificationData) {
    const response = await client.post("/notifications/", notificationData);
    return normalizeNotification(response.data);
}

export async function markNotificationAsRead(notificationId) {
    const response = await client.patch(`/notifications/${notificationId}/read`);
    return normalizeNotification(response.data);
}

export async function markAllNotificationsAsRead(userId) {
    const resolvedUserId = requireUserId(userId);
    const response = await client.patch(`/notifications/user/${resolvedUserId}/read-all`);
    return response.data;
}

export async function deleteNotification(notificationId) {
    await client.delete(`/notifications/${notificationId}`);
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

export default {
    fetchNotifications,
    fetchUnreadNotifications,
    fetchUnreadNotificationCount,
    fetchNotificationsByType,
    getNotification,
    createNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
};