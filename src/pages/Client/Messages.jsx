import { useState, useEffect, useRef, useCallback } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole } from "../../utils/sidebarRole";

const API = "http://localhost:8000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const BRAND = "#056db3";

// ── Helpers ────────────────────────────────────────────────────────
const Avatar = ({ name, size = 10 }) => {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";
  const colors = [
    "#7c3aed",
    "#0891b2",
    "#059669",
    "#d97706",
    "#dc2626",
    "#db2777",
    "#4f46e5",
  ];
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length];
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}
      style={{
        backgroundColor: color,
        width: size * 4,
        height: size * 4,
        fontSize: size < 8 ? 12 : 14,
      }}
    >
      {initials}
    </div>
  );
};

const formatTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const SendIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MsgIcon = () => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d1d5db"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// ── Main Page ──────────────────────────────────────────────────────
function Messages() {
  const location = useLocation();
  const sidebarRole = getSidebarRole(location.pathname);

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [search, setSearch] = useState("");
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  // ── Fetch conversations ──────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(`${API}/conversations/`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setConversations(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoadingConvos(false));
  }, [fetchConversations]);

  // ── Fetch messages for active conversation ───────────────────────
  const fetchMessages = useCallback(async (convoId) => {
    if (!convoId) return;
    try {
      const res = await fetch(`${API}/conversations/${convoId}/messages`, {
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
    } catch {}
  }, []);

  // Open a conversation
  const openConvo = async (convo) => {
    setActiveConvo(convo);
    setLoadingMessages(true);
    await fetchMessages(convo.id);
    setLoadingMessages(false);
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) => (c.id === convo.id ? { ...c, unread_count: 0 } : c)),
    );
  };

  // Poll for new messages every 5s when a conversation is open
  useEffect(() => {
    if (!activeConvo) return;
    pollRef.current = setInterval(() => {
      fetchMessages(activeConvo.id);
      fetchConversations();
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [activeConvo, fetchMessages, fetchConversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = async () => {
    if (!draft.trim() || !activeConvo || sending) return;
    setSending(true);
    try {
      const res = await fetch(
        `${API}/conversations/${activeConvo.id}/messages`,
        {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({ content: draft.trim() }),
        },
      );
      if (!res.ok) return;
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      // Update preview
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvo.id
            ? {
                ...c,
                last_message: msg.content,
                last_message_at: msg.created_at,
              }
            : c,
        ),
      );
    } catch {
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filtered = conversations.filter(
    (c) =>
      c.other_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.last_message?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unread_count || 0),
    0,
  );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Messages
              {totalUnread > 0 && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: BRAND }}
                >
                  {totalUnread}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Your conversations with{" "}
              {sidebarRole === "client" ? "service providers" : "clients"}
            </p>
          </div>

          <div
            className="flex gap-0 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            style={{ height: "calc(100vh - 200px)" }}
          >
            {/* ── Conversation list ── */}
            <div className="w-80 flex-shrink-0 border-r border-gray-100 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-gray-100">
                <input
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400"
                  placeholder="Search conversations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {loadingConvos ? (
                  <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                    Loading...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2">
                    <MsgIcon />
                    <p className="text-sm text-gray-400">
                      No conversations yet
                    </p>
                    {sidebarRole === "client" && (
                      <p className="text-xs text-gray-300 text-center px-4">
                        Book a service to start chatting with a provider
                      </p>
                    )}
                  </div>
                ) : (
                  filtered.map((convo) => {
                    const isActive = activeConvo?.id === convo.id;
                    return (
                      <button
                        key={convo.id}
                        onClick={() => openConvo(convo)}
                        className="w-full flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 text-left transition-colors hover:bg-gray-50"
                        style={{
                          backgroundColor: isActive ? BRAND_LIGHT : undefined,
                        }}
                      >
                        <Avatar name={convo.other_name} size={10} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span
                              className={`text-sm truncate ${convo.unread_count > 0 ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}
                            >
                              {convo.other_name}
                            </span>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                              {formatTime(convo.last_message_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p
                              className={`text-xs truncate ${convo.unread_count > 0 ? "text-gray-700 font-medium" : "text-gray-400"}`}
                            >
                              {convo.last_message || "No messages yet"}
                            </p>
                            {convo.unread_count > 0 && (
                              <span
                                className="ml-2 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: BRAND }}
                              >
                                {convo.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* ── Message thread ── */}
            <div className="flex-1 flex flex-col">
              {!activeConvo ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300">
                  <MsgIcon />
                  <p className="text-sm">
                    Select a conversation to start messaging
                  </p>
                </div>
              ) : (
                <>
                  {/* Thread header */}
                  <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-3">
                    <Avatar name={activeConvo.other_name} size={9} />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {activeConvo.other_name}
                      </p>
                      {activeConvo.booking_id && (
                        <p className="text-xs text-gray-400">
                          Booking #{activeConvo.booking_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
                    {loadingMessages ? (
                      <div className="flex items-center justify-center h-full text-sm text-gray-400">
                        Loading messages...
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-sm text-gray-400">
                        No messages yet. Say hello!
                      </div>
                    ) : (
                      messages.map((msg, i) => {
                        const isMe = msg.sender_id === currentUser.id;
                        const showDate =
                          i === 0 ||
                          new Date(msg.created_at).toDateString() !==
                            new Date(messages[i - 1].created_at).toDateString();
                        return (
                          <div key={msg.id}>
                            {showDate && (
                              <div className="text-center my-2">
                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                  {new Date(msg.created_at).toLocaleDateString(
                                    [],
                                    {
                                      weekday: "long",
                                      month: "short",
                                      day: "numeric",
                                    },
                                  )}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-xs lg:max-w-md xl:max-w-lg`}
                              >
                                {!isMe && (
                                  <p className="text-xs text-gray-400 mb-1 ml-1">
                                    {msg.sender_name}
                                  </p>
                                )}
                                <div
                                  className={`px-4 py-2.5 rounded-2xl text-sm ${
                                    isMe
                                      ? "text-white rounded-br-sm"
                                      : "bg-gray-100 text-gray-800 rounded-bl-sm"
                                  }`}
                                  style={isMe ? { backgroundColor: BRAND } : {}}
                                >
                                  {msg.content}
                                </div>
                                <div
                                  className={`flex items-center gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                  <span className="text-xs text-gray-400">
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {isMe && (
                                    <span
                                      className="text-xs"
                                      style={{
                                        color: msg.is_read ? BRAND : "#9ca3af",
                                      }}
                                    >
                                      {msg.is_read ? "✓✓" : "✓"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div className="px-4 py-3 border-t border-gray-100 flex items-end gap-3">
                    <textarea
                      className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none resize-none focus:border-blue-400 transition-colors"
                      placeholder="Type a message..."
                      rows={1}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={handleKey}
                      style={{ maxHeight: 120 }}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!draft.trim() || sending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-colors disabled:opacity-40 flex-shrink-0"
                      style={{ backgroundColor: BRAND }}
                    >
                      <SendIcon />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// missing BRAND_LIGHT — define at module level
const BRAND_LIGHT = "#e8f3fb";

export default Messages;
