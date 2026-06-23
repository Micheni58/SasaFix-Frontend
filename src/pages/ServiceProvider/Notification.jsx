import { useEffect, useMemo, useState } from "react";
import { Briefcase, DollarSign, MessageCircle, Bell, Trash2 } from "lucide-react";
import {
  deleteNotification,
  fetchNotifications,
  markNotificationAsRead,
} from "../../api/notificationService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const tabs = ["All", "Unread", "Jobs", "Payments", "Messages"];

function IconFor({ type }) {
  switch (type) {
    case "job":
    case "booking":
      return <Briefcase className="h-5 w-5 text-[#056db3]" />;
    case "payment":
      return <DollarSign className="h-5 w-5 text-[#056db3]" />;
    case "message":
      return <MessageCircle className="h-5 w-5 text-[#056db3]" />;
    default:
      return <Bell className="h-5 w-5 text-[#056db3]" />;
  }
}

export default function ProviderNotification() {
  const [activeTab, setActiveTab] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetchNotifications()
      .then((data) => {
        if (!mounted) return;
        setNotifications(data || []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "Unread") return notifications.filter((n) => !n.read);
    if (activeTab === "Jobs") return notifications.filter((n) => n.type === "job" || n.type === "booking");
    if (activeTab === "Payments") return notifications.filter((n) => n.type === "payment");
    if (activeTab === "Messages") return notifications.filter((n) => n.type === "message");
    return notifications;
  }, [activeTab, notifications]);

  const counts = useMemo(() => ({
    All: notifications.length,
    Unread: notifications.filter((n) => !n.read).length,
    Jobs: notifications.filter((n) => n.type === "job" || n.type === "booking").length,
    Payments: notifications.filter((n) => n.type === "payment").length,
    Messages: notifications.filter((n) => n.type === "message").length,
  }), [notifications]);

  const markRead = async (id) => {
    const notification = notifications.find((n) => n.id === id);
    if (!notification || notification.read) return;

    setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: true } : n)));

    try {
      const updated = await markNotificationAsRead(id);
      setNotifications((s) => s.map((n) => (n.id === id ? updated : n)));
    } catch (err) {
      console.error(err);
      setNotifications((s) => s.map((n) => (n.id === id ? { ...n, read: false } : n)));
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

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-2 text-gray-600 max-w-2xl">Job requests, payments, and client messages</p>
          </section>

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
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="space-y-3">
          {(loading || error || filtered.length === 0) && (
            <div className="py-8 text-center text-sm text-gray-500">
              {loading ? "Loading notifications..." : error ? "Unable to load notifications" : "No notifications"}
            </div>
          )}

          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-center gap-4 rounded-lg px-4 py-3 ${n.read ? "bg-white" : "bg-blue-50"}`}
            >
              <div className="shrink-0">
                <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-100">
                  <IconFor type={n.type} />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{n.title}</p>
                <p className="mt-1 text-sm text-gray-600 truncate">{n.text}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">{n.timeAgo}</div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(n.id);
                  }}
                  className="text-gray-400 hover:text-red-600"
                  aria-label="Delete notification"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
        </main>
      </div>
    </div>
  );
}
