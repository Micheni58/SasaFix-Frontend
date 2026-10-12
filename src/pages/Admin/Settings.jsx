import { useState, useEffect, useRef } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import authService from "../../services/api";
import { useToast } from "../../components/ui/ToastProvider";

const BRAND = "#056db3";
const BRAND_DARK = "#04599a";
const BRAND_LIGHT = "#e8f3fb";

const Ico = ({ d, d2, circle, size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d && <path d={d} />}
    {d2 && <path d={d2} />}
    {circle && <circle cx={circle[0]} cy={circle[1]} r={circle[2]} />}
  </svg>
);

const UserIcon = () => (
  <Ico d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" circle={[12, 7, 4]} />
);
const LockIcon = () => (
  <Ico
    d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"
    d2="M7 11V7a5 5 0 0 1 10 0v4"
  />
);
const BellIcon = () => (
  <Ico d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
);
const ShieldIcon = () => (
  <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
);
const HelpIcon = () => (
  <Ico
    circle={[12, 12, 10]}
    d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
  />
);
const EyeOpen = () => (
  <Ico d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" circle={[12, 12, 3]} />
);
const EyeClosed = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-800 bg-white outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100";
const Label = ({ children }) => (
  <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
    {children}
  </label>
);
const NAV = [
  { id: "profile", label: "My Profile", icon: <UserIcon /> },
  { id: "security", label: "Security", icon: <LockIcon /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  { id: "platform", label: "Platform Settings", icon: <ShieldIcon /> },
  { id: "help", label: "Help & Support", icon: <HelpIcon /> },
];

// ── My Profile ─────────────────────────────────────────────────────
const MyProfile = ({ user, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
      setAvatar(user.profile_photo_url || null);
    }
  }, [user]);

  const initials =
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() ||
    "?";
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail);
      }
      const updated = await res.json();
      localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
      onSaved?.({ ...user, ...updated });
      toast.success("Profile updated successfully");
    } catch (e) {
      toast.error("Save failed", e.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", "Maximum size is 5MB.");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);
    setAvatar(preview); // instant preview
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);

      const res = await fetch("http://localhost:8000/api/users/me/photo", {
        method: "POST",
        headers: {
          // No Content-Type here: the browser sets the multipart boundary
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          Array.isArray(err.detail)
            ? err.detail.map((d) => d.msg).join(", ")
            : err.detail || "Upload failed",
        );
      }

      const { profile_photo_url } = await res.json();
      const mergedUser = { ...user, profile_photo_url };

      localStorage.setItem("user", JSON.stringify(mergedUser));
      window.dispatchEvent(new Event("user-updated"));
      setAvatar(profile_photo_url);
      onSaved?.(mergedUser);

      toast.success("Photo updated", "Your profile photo has been saved.");
    } catch (err) {
      setAvatar(user?.profile_photo_url || null); // roll back the preview
      toast.error("Upload failed", err.message || "Please try again.");
    } finally {
      URL.revokeObjectURL(preview);
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">My Profile</h2>
      <p className="text-sm text-gray-400 mb-6">
        Update your admin account details
      </p>

      {/* Avatar */}
      <div className="flex items-center gap-5 mb-7">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden"
          style={{ backgroundColor: BRAND }}
        >
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg border-2 transition-colors hover:bg-blue-50 disabled:opacity-60"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              {uploading ? "Uploading..." : "Change Photo"}
            </button>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              Admin
            </span>
          </div>
          <p className="text-xs text-gray-400">JPG, PNG or GIF. Max size 5MB</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>First Name</Label>
          <input
            className={inputCls}
            value={form.first_name}
            placeholder="First name"
            onChange={(e) =>
              setForm((p) => ({ ...p, first_name: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Last Name</Label>
          <input
            className={inputCls}
            value={form.last_name}
            placeholder="Last name"
            onChange={(e) =>
              setForm((p) => ({ ...p, last_name: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mb-4">
        <Label>Email Address</Label>
        <input
          className={inputCls}
          type="email"
          value={form.email}
          placeholder="admin@servicehub.co.ke"
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div className="mb-6">
        <Label>Phone Number</Label>
        <input
          className={inputCls}
          type="tel"
          value={form.phone_number}
          placeholder="+254 700 000 000"
          onChange={(e) =>
            setForm((p) => ({ ...p, phone_number: e.target.value }))
          }
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ backgroundColor: BRAND }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = BRAND_DARK)}
          onMouseLeave={(e) => (e.target.style.backgroundColor = BRAND)}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={() =>
            setForm({
              first_name: user?.first_name || "",
              last_name: user?.last_name || "",
              email: user?.email || "",
              phone_number: user?.phone_number || "",
            })
          }
          className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// ── Security ───────────────────────────────────────────────────────
const Security = () => {
  const toast = useToast();
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [vis, setVis] = useState({ cur: false, nw: false, cf: false });
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      toast.error("Password change failed", "Passwords don't match.");
      return;
    }
    if (form.new_password.length < 6) {
      toast.error(
        "Password change failed",
        "Password must be at least 6 characters.",
      );
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("http://localhost:8000/api/users/me/password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({
          current_password: form.current_password,
          new_password: form.new_password,
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail);
      }
      setForm({ current_password: "", new_password: "", confirm_password: "" });
      toast.success("Password changed successfully");
    } catch (e) {
      toast.error("Password change failed", e.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const PwField = ({ label, vk, fk, placeholder }) => (
    <div className="mb-4">
      <Label>{label}</Label>
      <div className="relative">
        <input
          className={inputCls + " pr-10"}
          type={vis[vk] ? "text" : "password"}
          value={form[fk]}
          placeholder={placeholder}
          onChange={(e) => setForm((p) => ({ ...p, [fk]: e.target.value }))}
        />
        <button
          type="button"
          onClick={() => setVis((p) => ({ ...p, [vk]: !p[vk] }))}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
        >
          {vis[vk] ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>
      <p className="text-sm text-gray-400 mb-6">
        Keep your admin account secure
      </p>
      <form onSubmit={handleSubmit} className="max-w-md">
        <PwField
          label="Current Password"
          vk="cur"
          fk="current_password"
          placeholder="Enter current password"
        />
        <PwField
          label="New Password"
          vk="nw"
          fk="new_password"
          placeholder="Create new password"
        />
        <PwField
          label="Confirm Password"
          vk="cf"
          fk="confirm_password"
          placeholder="Repeat new password"
        />
        <button
          type="submit"
          disabled={saving || !form.current_password || !form.new_password}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 mt-2"
          style={{ backgroundColor: BRAND }}
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>

      {/* Active sessions info */}
      <div className="mt-8 max-w-md">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Active Session</h3>
        <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Current browser session
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Logged in as admin</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};

// ── Notifications ──────────────────────────────────────────────────
const Notifications = () => {
  const [prefs, setPrefs] = useState({
    new_user: true,
    new_provider: true,
    dispute: true,
    payment: true,
    email_digest: false,
    sms_alerts: false,
  });
  const toggle = (k) => setPrefs((p) => ({ ...p, [k]: !p[k] }));

  const Toggle = ({ label, desc, k }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => toggle(k)}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-6"
        style={{ backgroundColor: prefs[k] ? BRAND : "#d1d5db" }}
      >
        <span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: prefs[k] ? "calc(100% - 20px)" : "4px" }}
        />
      </button>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Notifications</h2>
      <p className="text-sm text-gray-400 mb-6">
        Choose which admin alerts you receive
      </p>

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
        Platform Alerts
      </p>
      <Toggle
        k="new_user"
        label="New user registrations"
        desc="Get notified when a new client signs up"
      />
      <Toggle
        k="new_provider"
        label="New provider signups"
        desc="Get notified when a provider registers"
      />
      <Toggle
        k="dispute"
        label="Disputes & reports"
        desc="Alerts for flagged bookings or user reports"
      />
      <Toggle
        k="payment"
        label="Payment issues"
        desc="Alerts for failed or suspicious transactions"
      />

      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-5 mb-1">
        Delivery
      </p>
      <Toggle
        k="email_digest"
        label="Daily email digest"
        desc="Receive a daily summary of platform activity"
      />
      <Toggle
        k="sms_alerts"
        label="SMS for critical alerts"
        desc="Get SMS for urgent platform issues"
      />

      <button
        className="mt-6 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
        style={{ backgroundColor: BRAND }}
      >
        Save Preferences
      </button>
    </div>
  );
};

// ── Platform Settings ──────────────────────────────────────────────
const PlatformSettings = () => {
  const toast = useToast();
  const [settings, setSettings] = useState({
    allow_registrations: true,
    require_id_verification: false,
    maintenance_mode: false,
    commission_rate: "10",
    support_email: "support@servicehub.co.ke",
  });
  const [saving, setSaving] = useState(false);
  const Toggle = ({ label, desc, k }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => setSettings((p) => ({ ...p, [k]: !p[k] }))}
        className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-6"
        style={{ backgroundColor: settings[k] ? BRAND : "#d1d5db" }}
      >
        <span
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all"
          style={{ left: settings[k] ? "calc(100% - 20px)" : "4px" }}
        />
      </button>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Platform Settings
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Global configuration for ServiceHub
      </p>

      <Toggle
        k="allow_registrations"
        label="Allow new registrations"
        desc="When off, new users cannot sign up"
      />
      <Toggle
        k="require_id_verification"
        label="Require ID verification"
        desc="Providers must verify ID before going live"
      />
      <Toggle
        k="maintenance_mode"
        label="Maintenance mode"
        desc="Takes the platform offline for all users"
      />

      <div className="mt-5 mb-4">
        <Label>Platform Commission Rate (%)</Label>
        <input
          className={inputCls + " max-w-xs"}
          type="number"
          min="0"
          max="100"
          value={settings.commission_rate}
          onChange={(e) =>
            setSettings((p) => ({ ...p, commission_rate: e.target.value }))
          }
        />
        <p className="text-xs text-gray-400 mt-1">
          Percentage taken from each completed booking
        </p>
      </div>

      <div className="mb-6">
        <Label>Support Email</Label>
        <input
          className={inputCls + " max-w-sm"}
          type="email"
          value={settings.support_email}
          onChange={(e) =>
            setSettings((p) => ({ ...p, support_email: e.target.value }))
          }
        />
      </div>

      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 mb-5 max-w-md">
        <p className="text-sm font-semibold text-amber-800">
          ⚠ Changes apply immediately
        </p>
        <p className="text-xs text-amber-600 mt-1">
          Enabling maintenance mode will log out all active users.
        </p>
      </div>

      <button
        onClick={() => {
          setSaving(true);
          setTimeout(() => {
            setSaving(false);
            toast.success("Platform settings saved");
          }, 800);
        }}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: BRAND }}
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
};

// ── Help ───────────────────────────────────────────────────────────
const HelpSupport = () => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-1">Help & Support</h2>
    <p className="text-sm text-gray-400 mb-6">
      Admin documentation and support resources
    </p>
    {[
      {
        q: "How do I suspend a user?",
        a: "Go to Users Management, find the user, and click the ban icon. You'll be asked to confirm before the action takes effect.",
      },
      {
        q: "How do I verify a service provider?",
        a: "Go to the Providers section, open the provider's profile, review their submitted documents, and click Verify or Reject.",
      },
      {
        q: "How do I view booking disputes?",
        a: "Disputes appear in the Bookings section under 'Disputed' status. You can review both parties' accounts and resolve from there.",
      },
      {
        q: "How do I enable maintenance mode?",
        a: "Go to Platform Settings in this page and toggle Maintenance Mode on. All users will see a maintenance message until you turn it off.",
      },
    ].map(({ q, a }) => (
      <details
        key={q}
        className="mb-3 border border-gray-100 rounded-xl overflow-hidden"
      >
        <summary className="px-4 py-3 text-sm font-semibold text-gray-800 cursor-pointer hover:bg-gray-50">
          {q}
        </summary>
        <p className="px-4 pb-4 pt-2 text-sm text-gray-500">{a}</p>
      </details>
    ))}
    <div className="mt-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
      <p className="text-sm font-semibold text-gray-700 mb-1">
        Technical support
      </p>
      <p className="text-sm text-gray-400 mb-2">
        For backend or infrastructure issues contact the dev team.
      </p>
      <a
        href="mailto:dev@servicehub.co.ke"
        className="text-sm font-semibold hover:underline"
        style={{ color: BRAND }}
      >
        dev@servicehub.co.ke
      </a>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────
function Settings() {
  const [active, setActive] = useState("profile");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = authService.getStoredUser();
    if (stored) setUser(stored);
    const token = localStorage.getItem("access_token");
    if (!token) return;
    authService
      .getCurrentUser()
      .then(setUser)
      .catch(() => {});
  }, []);

  const sections = {
    profile: <MyProfile user={user} onSaved={setUser} />,
    security: <Security />,
    notifications: <Notifications />,
    platform: <PlatformSettings />,
    help: <HelpSupport />,
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your account and platform configuration
            </p>
          </div>

          <div className="flex gap-5 items-start">
            {/* Nav */}
            <div className="w-52 flex-shrink-0 bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
              {NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left"
                  style={{
                    backgroundColor:
                      active === id ? BRAND_LIGHT : "transparent",
                    color: active === id ? BRAND : "#6b7280",
                  }}
                >
                  <span style={{ color: active === id ? BRAND : "#9ca3af" }}>
                    {icon}
                  </span>
                  {label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-7 min-h-96">
              {sections[active]}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Settings;
