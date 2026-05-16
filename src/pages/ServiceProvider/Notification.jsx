import { useMemo, useState } from "react";
import { CheckCircle, Briefcase, DollarSign, MessageCircle, Bell, Trash2 } from "lucide-react";

const tabs = ["All", "Unread", "Jobs", "Payments", "Messages"];

const initialNotifications = [
  { id: 1, type: "job", title: "New job request", text: "Client requested your service for plumbing repair.", timeAgo: "5 min ago", read: false },
  { id: 2, type: "payment", title: "Payment received", text: "KES 4,000 received for completed job #456.", timeAgo: "20 min ago", read: false },
  { id: 3, type: "message", title: "New message", text: "Client sent a message about the booking.", timeAgo: "1 hour ago", read: true },
  { id: 4, type: "job", title: "Job completed", text: "Client marked your job as completed.", timeAgo: "Yesterday", read: true },
  { id: 5, type: "general", title: "Profile reminder", text: "Update your availability for next week.", timeAgo: "2 days ago", read: false },
];

function IconFor({ type }) {
  switch (type) {
    case "job":
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
  const [notifications, setNotifications] = useState(initialNotifications);

  const filtered = useMemo(() => {
    if (activeTab === "Unread") return notifications.filter((n) => !n.read);
    if (activeTab === "Jobs") return notifications.filter((n) => n.type === "job");
    if (activeTab === "Payments") return notifications.filter((n) => n.type === "payment");
    if (activeTab === "Messages") return notifications.filter((n) => n.type === "message");
    return notifications;
  }, [activeTab, notifications]);

  const counts = useMemo(() => ({
    All: notifications.length,
    Unread: notifications.filter((n) => !n.read).length,
    Jobs: notifications.filter((n) => n.type === "job").length,
    Payments: notifications.filter((n) => n.type === "payment").length,
    Messages: notifications.filter((n) => n.type === "message").length,
  }), [notifications]);

  const remove = (id) => setNotifications((s) => s.filter((n) => n.id !== id));

  return (
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-6">
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
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500">No notifications</div>
          )}

          {filtered.map((n) => (
            <div key={n.id} className={`flex items-center gap-4 rounded-lg px-4 py-3 ${n.read ? "bg-white" : "bg-blue-50"}`}>
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
                  onClick={() => remove(n.id)}
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
    </div>
  );
}