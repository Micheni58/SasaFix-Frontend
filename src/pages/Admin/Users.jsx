import { useState, useEffect } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useToast } from "../../components/ui/ToastProvider";

const API = "http://localhost:8000/api";
const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const BRAND = "#056db3";

// Avatar with initials
const Avatar = ({ name }) => {
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
    "#7c3aed",
    "#4f46e5",
  ];
  const color = colors[name?.charCodeAt(0) % colors.length] || BRAND;
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

// Pin icon
const PinIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const BanIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const FilterIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// Confirm modal
const ConfirmModal = ({ msg, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
    <div className="bg-white rounded-2xl p-6 shadow-xl w-80">
      <p className="text-sm text-gray-700 font-medium mb-5">{msg}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// User detail modal
const UserModal = ({ user, onClose }) => {
  if (!user) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-xl w-96"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4 mb-5">
          <Avatar name={`${user.first_name} ${user.last_name}`} />
          <div>
            <p className="font-bold text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-xs text-gray-400">{user.role}</p>
          </div>
        </div>
        {[
          ["Email", user.email],
          ["Phone", user.phone_number || "—"],
          ["Location", user.location || "—"],
          [
            "Joined",
            user.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "—",
          ],
          [
            "Status",
            user.is_active
              ? user.is_suspended
                ? "Suspended"
                : "Active"
              : "Inactive",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between py-2 border-b border-gray-50 text-sm"
          >
            <span className="text-gray-500">{label}</span>
            <span className="font-medium text-gray-800">{value}</span>
          </div>
        ))}
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
        >
          Close
        </button>
      </div>
    </div>
  );
};

function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState(new Set());
  const [viewUser, setViewUser] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const showToast = (msg, ok = true) => {
    if (ok) toast.success(msg);
    else toast.error("Action failed", msg);
  };

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API}/users/`, {
          headers: authHeaders(),
        });
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }
        const data = await response.json();
        setUsers(data);
        setFiltered(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        showToast("Failed to load users.", false);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // authHeaders uses localStorage which is stable

  // Filter
  useEffect(() => {
    let result = [...users];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phone_number?.includes(q),
      );
    }
    if (statusFilter === "active")
      result = result.filter((u) => u.is_active && !u.is_suspended);
    if (statusFilter === "suspended")
      result = result.filter((u) => u.is_suspended);
    if (statusFilter === "inactive")
      result = result.filter((u) => !u.is_active);
    setFiltered(result);
  }, [search, statusFilter, users]);

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    setSelected(
      selected.size === filtered.length
        ? new Set()
        : new Set(filtered.map((u) => u.id)),
    );
  };

  // Suspend user
  const suspendUser = async (userId) => {
    try {
      const res = await fetch(`${API}/users/${userId}/suspend`, {
        method: "PATCH",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_suspended: !u.is_suspended } : u,
        ),
      );
      showToast("User status updated.");
    } catch (error) {
      console.error("Error suspending user:", error);
      showToast("Action failed.", false);
    }
    setConfirm(null);
  };

  // Delete user
  const deleteUser = async (userId) => {
    try {
      const res = await fetch(`${API}/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showToast("User deleted.");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Delete failed.", false);
    }
    setConfirm(null);
  };

  const statusBadge = (user) => {
    if (user.is_suspended)
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          Suspended
        </span>
      );
    if (user.is_active)
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
          Active
        </span>
      );
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
        Inactive
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          {viewUser && (
            <UserModal user={viewUser} onClose={() => setViewUser(null)} />
          )}
          {confirm && (
            <ConfirmModal
              msg={confirm.msg}
              onConfirm={confirm.action}
              onCancel={() => setConfirm(null)}
            />
          )}

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Users Management
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage all client accounts on the platform
            </p>
          </div>

          {/* Search + filter */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex items-center gap-3 mb-5">
            <SearchIcon />
            <input
              className="flex-1 text-sm outline-none text-gray-700 placeholder-gray-400"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FilterIcon />
            <select
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                Loading users...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                No users found.
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selected.size === filtered.length &&
                          filtered.length > 0
                        }
                        onChange={toggleAll}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: BRAND }}
                      />
                    </th>
                    {[
                      "NAME",
                      "CONTACT",
                      "LOCATION",
                      "JOIN DATE",
                      "BOOKINGS",
                      "STATUS",
                      "ACTIONS",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-400 tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(user.id)}
                          onChange={() => toggleSelect(user.id)}
                          className="w-4 h-4 rounded"
                          style={{ accentColor: BRAND }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={`${user.first_name} ${user.last_name}`}
                          />
                          <span className="text-sm font-semibold text-gray-800">
                            {user.first_name} {user.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          {user.phone_number || "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <PinIcon /> {user.location || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {user.created_at
                          ? new Date(user.created_at).toLocaleDateString(
                              "en-CA",
                            )
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {user.total_bookings ?? "—"}
                      </td>
                      <td className="px-4 py-3">{statusBadge(user)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {/* View */}
                          <button
                            onClick={() => setViewUser(user)}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="View"
                          >
                            <EyeIcon />
                          </button>
                          {/* Suspend / Unsuspend */}
                          <button
                            onClick={() =>
                              setConfirm({
                                msg: user.is_suspended
                                  ? `Unsuspend ${user.first_name}?`
                                  : `Suspend ${user.first_name}? They won't be able to log in.`,
                                action: () => suspendUser(user.id),
                              })
                            }
                            className="text-orange-400 hover:text-orange-600 transition-colors"
                            title={user.is_suspended ? "Unsuspend" : "Suspend"}
                          >
                            <BanIcon />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() =>
                              setConfirm({
                                msg: `Permanently delete ${user.first_name} ${user.last_name}? This cannot be undone.`,
                                action: () => deleteUser(user.id),
                              })
                            }
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer count */}
          {!loading && (
            <p className="text-xs text-gray-400 mt-3">
              Showing {filtered.length} of {users.length} users
              {selected.size > 0 && ` · ${selected.size} selected`}
            </p>
          )}
        </main>
      </div>
    </div>
  );
}

export default Users;
