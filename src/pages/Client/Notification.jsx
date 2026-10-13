// src/pages/Client/Notification.jsx - With Skeleton Loaders

import { useEffect, useMemo, useState } from "react";
import { Calendar, DollarSign, MessageCircle, Bell, Trash2, Loader2, RefreshCw } from "lucide-react";
import {
    deleteNotification,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    fetchUnreadNotificationCount,
} from "../../api/notificationService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const tabs = ["All", "Unread", "Bookings", "Payments", "Messages"];

// ── Updated time logic ──
function getTimeAgo(dateValue) {
    if (!dateValue) return "Just now";

    const createdAt = new Date(dateValue);
    if (Number.isNaN(createdAt.getTime())) return "Just now";

    const diffMs = Date.now() - createdAt.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSeconds < 60) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffWeeks === 1) return "1 week ago";
    if (diffWeeks < 4) return `${diffWeeks} weeks ago`;

    return createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

// ── Check if notification should be shown (read notifications older than 3 days) ──
function shouldShowNotification(notification) {
    if (!notification.read) return true;
    if (!notification.createdAt) return true;

    const createdAt = new Date(notification.createdAt);
    if (Number.isNaN(createdAt.getTime())) return true;

    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    return createdAt > threeDaysAgo;
}

function IconFor({ type }) {
    switch (type) {
        case "booking":
            return <Calendar className="h-5 w-5 text-[#056db3]" />;
        case "payment":
            return <DollarSign className="h-5 w-5 text-[#056db3]" />;
        case "message":
            return <MessageCircle className="h-5 w-5 text-[#056db3]" />;
        default:
            return <Bell className="h-5 w-5 text-[#056db3]" />;
    }
}

function EmptyState({ icon: Icon, title, description }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="rounded-full bg-gray-100 p-4 mb-4">
                <Icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm">{description}</p>
        </div>
    );
}

// ─────────────────────────────────────────────
// SKELETON LOADER COMPONENTS
// ─────────────────────────────────────────────

function SkeletonNotificationItem() {
    return (
        <div className="flex items-center gap-4 rounded-lg px-4 py-3 bg-white">
            <div className="shrink-0">
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-64 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0 sm:gap-4">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-2 w-2 rounded-full bg-gray-200 animate-pulse" />
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
            </div>
        </div>
    );
}

function SkeletonTab() {
    return (
        <div className="h-10 w-24 animate-pulse rounded bg-gray-200" />
    );
}

function SkeletonNotificationList() {
    return (
        <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
                <SkeletonNotificationItem key={i} />
            ))}
        </div>
    );
}

function SkeletonHeader() {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
                <div className="h-9 w-56 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-5 w-72 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
                <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-10 w-24 animate-pulse rounded-lg bg-gray-200" />
            </div>
        </div>
    );
}

function SkeletonTabs() {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex min-w-max gap-2 px-4 py-3">
                {[...Array(5)].map((_, i) => (
                    <SkeletonTab key={i} />
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function ClientNotification() {
    const [activeTab, setActiveTab] = useState("All");
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchData = async (showRefresh = false) => {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [data, count] = await Promise.all([
                fetchNotifications(),
                fetchUnreadNotificationCount(),
            ]);

            const filteredData = (data || []).filter(shouldShowNotification);

            setNotifications(filteredData);
            const unread = filteredData.filter((n) => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to load notifications");
            setNotifications([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filtered = useMemo(() => {
        let result = notifications;

        if (activeTab === "Unread") {
            result = notifications.filter((n) => !n.read);
        } else if (activeTab === "Bookings") {
            result = notifications.filter((n) => n.type === "booking");
        } else if (activeTab === "Payments") {
            result = notifications.filter((n) => {
                if (n.type !== "payment") return false;
                const title = (n.title || "").toLowerCase();
                const body = (n.text || n.body || "").toLowerCase();
                const paymentKeywords = [
                    "payment", "paid", "pay", "refund",
                    "charged", "charge", "mpesa", "stk",
                    "transaction", "receipt", "invoice",
                    "complete", "success", "confirmed"
                ];
                return paymentKeywords.some(keyword =>
                    title.includes(keyword) || body.includes(keyword)
                );
            });
        } else if (activeTab === "Messages") {
            result = notifications.filter((n) => n.type === "message");
        }

        return result;
    }, [activeTab, notifications]);

    const counts = useMemo(() => ({
        All: notifications.length,
        Unread: notifications.filter((n) => !n.read).length,
        Bookings: notifications.filter((n) => n.type === "booking").length,
        Payments: notifications.filter((n) => {
            if (n.type !== "payment") return false;
            const title = (n.title || "").toLowerCase();
            const body = (n.text || n.body || "").toLowerCase();
            const paymentKeywords = [
                "payment", "paid", "pay", "refund",
                "charged", "charge", "mpesa", "stk",
                "transaction", "receipt", "invoice",
                "complete", "success", "confirmed"
            ];
            return paymentKeywords.some(keyword =>
                title.includes(keyword) || body.includes(keyword)
            );
        }).length,
        Messages: notifications.filter((n) => n.type === "message").length,
    }), [notifications]);

    const markRead = async (id) => {
        const notification = notifications.find((n) => n.id === id);
        if (!notification || notification.read) return;

        setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await markNotificationAsRead(id);
        } catch (err) {
            console.error(err);
            setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: false } : n)));
            setUnreadCount((prev) => prev + 1);
        }
    };

    const markAllRead = async () => {
        if (unreadCount === 0) return;

        const previousNotifications = notifications;
        setNotifications((s) => s.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);

        try {
            await markAllNotificationsAsRead();
        } catch (err) {
            console.error(err);
            setNotifications(previousNotifications);
            const count = await fetchUnreadNotificationCount();
            setUnreadCount(count);
        }
    };

    const remove = async (id) => {
        const previousNotifications = notifications;
        setNotifications((s) => s.filter((n) => n.id !== id));

        try {
            await deleteNotification(id);
        } catch (err) {
            console.error(err);
            setNotifications(previousNotifications);
        }
    };

    // ── Loading state with skeleton ──
    if (loading) {
        return (
            <div className="flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="min-w-0 flex-1 ml-0 lg:ml-72">
                    <Navbar />
                    <main className="min-w-0 px-4 pb-6 pt-24 sm:px-6">
                        <div className="max-w-5xl mx-auto">
                            <section className="mb-6">
                                <SkeletonHeader />
                            </section>
                            <section className="mb-6">
                                <SkeletonTabs />
                            </section>
                            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                <SkeletonNotificationList />
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
            <Sidebar role="client" />
            <div className="min-w-0 flex-1 ml-0 lg:ml-72">
                <Navbar />
                <main className="min-w-0 px-4 pb-6 pt-24 sm:px-6">
                    <div className="max-w-5xl mx-auto">
                        {/* ── Page Header ── */}
                        <section className="mb-6 flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                                <p className="mt-2 text-gray-600 max-w-2xl">All your recent activity and messages</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => fetchData(true)}
                                    disabled={refreshing}
                                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                                    Refresh
                                </button>
                            </div>
                        </section>

                        {/* ── Tabs ── */}
                        <section className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex min-w-max">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`flex items-center gap-2 border-b-[3px] px-6 py-3.5 text-base font-semibold transition-colors ${
                                            activeTab === tab
                                                ? "border-[#056db3] bg-blue-50 text-[#056db3]"
                                                : "border-transparent text-gray-600 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span>{tab}</span>
                                        <span className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                                            activeTab === tab ? "bg-[#056db3] text-white" : "bg-gray-100 text-gray-600"
                                        }`}>
                                            {counts[tab] || 0}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Notifications List ── */}
                        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            {error ? (
                                <div className="py-8 text-center">
                                    <p className="text-red-500">Unable to load notifications</p>
                                    <button
                                        onClick={() => fetchData()}
                                        className="mt-2 text-[#056db3] hover:underline"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : filtered.length === 0 ? (
                                <EmptyState
                                    icon={Bell}
                                    title="No notifications"
                                    description={
                                        activeTab === "Unread"
                                            ? "You've read all your notifications! 🎉"
                                            : activeTab === "Bookings"
                                            ? "No booking notifications yet"
                                            : activeTab === "Payments"
                                            ? "No payment notifications yet"
                                            : activeTab === "Messages"
                                            ? "No message notifications yet"
                                            : "You don't have any notifications yet"
                                    }
                                />
                            ) : (
                                <div className="space-y-2">
                                    {filtered.map((n) => {
                                        const timeAgo = n.timeAgo || getTimeAgo(n.createdAt);

                                        return (
                                            <div
                                                key={n.id}
                                                onClick={() => markRead(n.id)}
                                                className={`flex flex-wrap items-center gap-3 rounded-lg px-3 py-3 cursor-pointer transition-colors sm:flex-nowrap sm:gap-4 sm:px-4 ${
                                                    n.read ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
                                                }`}
                                            >
                                                <div className="shrink-0">
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-100">
                                                        <IconFor type={n.type} />
                                                    </div>
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${n.read ? "font-medium" : "font-semibold"} text-gray-900`}>
                                                        {n.title}
                                                    </p>
                                                    <p className="mt-0.5 text-sm text-gray-600 truncate">{n.text || n.body}</p>
                                                    {n.relatedBookingId && (
                                                        <p className="mt-0.5 text-xs text-[#056db3]">
                                                            Booking #{n.relatedBookingId}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="ml-auto flex shrink-0 items-center gap-3 sm:ml-0 sm:gap-4">
                                                    <div className="text-xs text-gray-500">{timeAgo}</div>
                                                    {!n.read && (
                                                        <div className="h-2 w-2 rounded-full bg-[#056db3]" />
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            remove(n.id);
                                                        }}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        aria-label="Delete notification"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}