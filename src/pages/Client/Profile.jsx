import { useState, useEffect, useRef, useCallback, memo } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole } from "../../utils/sidebarRole";
import authService from "../../services/api";
import apiClient from "../../api/apiClient";
import { useToast } from "../../components/ui/ToastProvider";
import ThemeSettings from "../../components/profile/ThemeSettings";

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
const PinIcon = () => (
  <Ico
    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    circle={[12, 10, 3]}
  />
);
const BellIcon = () => (
  <Ico d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
);
const LockIcon = () => (
  <Ico
    d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z"
    d2="M7 11V7a5 5 0 0 1 10 0v4"
  />
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
  { id: "personal", label: "Personal Info", icon: <UserIcon /> },
  { id: "locations", label: "Saved Locations", icon: <PinIcon /> },
  { id: "notifications", label: "Notifications", icon: <BellIcon /> },
  { id: "security", label: "Security", icon: <LockIcon /> },
  { id: "theme", label: "Theme", icon: <Ico circle={[12, 12, 4]} d="M12 2v2m0 16v2m10-10h-2M4 12H2m17.07 7.07-1.42-1.42M6.35 6.35 4.93 4.93m14.14 0-1.42 1.42M6.35 17.65l-1.42 1.42" /> },
  { id: "help", label: "Help & Support", icon: <HelpIcon /> },
];

// Memoized PwField component to prevent re-renders
const PwField = memo(
  ({
    label,
    vk,
    fk,
    placeholder,
    value,
    type,
    onChange,
    onToggle,
    isVisible,
  }) => (
    <div className="mb-4">
      <Label>{label}</Label>
      <div className="relative">
        <input
          className={inputCls + " pr-10"}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete={
            fk === "current_password" ? "current-password" : "new-password"
          }
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          tabIndex="-1"
        >
          {isVisible ? <EyeOpen /> : <EyeClosed />}
        </button>
      </div>
    </div>
  ),
);

const PersonalInfo = ({ user, onSaved }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [saving, setSaving] = useState(false);
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
      const res = await apiClient.patch("/users/me", form, {
        validateStatus: () => true,
      });
      if (res.status < 200 || res.status >= 300) {
        const e = res.data;
        throw new Error(e.detail);
      }
      const updated = res.data;
      localStorage.setItem("user", JSON.stringify({ ...user, ...updated }));
      onSaved?.({ ...user, ...updated });
      toast.success("Changes saved", "Your personal information has been updated.");
    } catch (e) {
      toast.error("Save failed", e.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Personal Information
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Update your photo and personal details
      </p>
      <div className="flex items-center gap-5 mb-7">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden"
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
          <button
            onClick={() => fileRef.current.click()}
            className="px-4 py-1.5 text-sm font-semibold rounded-lg border-2 transition-colors hover:bg-blue-50"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            Change Photo
          </button>
          <p className="text-xs text-gray-400 mt-1.5">
            JPG, PNG or GIF. Max size 5MB
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files[0];
              if (f) setAvatar(URL.createObjectURL(f));
            }}
          />
        </div>
      </div>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>First Name</Label>
          <input
            className={inputCls}
            value={form.first_name}
            placeholder="John"
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
            placeholder="Doe"
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
          placeholder="john@example.com"
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
        />
      </div>
      <div className="mb-6">
        <Label>Phone Number</Label>
        <input
          className={inputCls}
          type="tel"
          value={form.phone_number}
          placeholder="+254 712 345 678"
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

const SavedLocations = ({ user }) => {
  const toast = useToast();
  const [form, setForm] = useState({ city: "", country: "", address: "" });
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user)
      setForm({
        city: user.city || "",
        country: user.country || "",
        address: user.address || "",
      });
  }, [user]);
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiClient.patch("/users/me", form, {
        validateStatus: () => true,
      });
      if (res.status < 200 || res.status >= 300) {
        const e = res.data;
        throw new Error(e.detail);
      }
      toast.success("Location saved");
    } catch (e) {
      toast.error("Save failed", e.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Saved Locations</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your default address for service bookings
      </p>
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>City</Label>
          <input
            className={inputCls}
            value={form.city}
            placeholder="Nairobi"
            onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
          />
        </div>
        <div>
          <Label>Country</Label>
          <input
            className={inputCls}
            value={form.country}
            placeholder="Kenya"
            onChange={(e) =>
              setForm((p) => ({ ...p, country: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mb-6">
        <Label>Street Address / Area</Label>
        <input
          className={inputCls}
          value={form.address}
          placeholder="e.g. Westlands, Nairobi"
          onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
        style={{ backgroundColor: BRAND }}
      >
        {saving ? "Saving..." : "Save Location"}
      </button>
    </div>
  );
};

const NotificationSettings = () => {
  const [prefs, setPrefs] = useState({
    email_bookings: true,
    email_promotions: false,
    sms_bookings: true,
    sms_reminders: true,
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
        className="relative w-11 h-6 rounded-full transition-colors shrink-0 ml-4"
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
        Choose what you want to be notified about
      </p>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">
        Email
      </p>
      <Toggle
        k="email_bookings"
        label="Booking updates"
        desc="Confirmations, cancellations and status changes"
      />
      <Toggle
        k="email_promotions"
        label="Promotions"
        desc="Deals and offers from ServiceHub"
      />
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-5 mb-1">
        SMS
      </p>
      <Toggle
        k="sms_bookings"
        label="Booking alerts"
        desc="Real-time updates on your bookings via SMS"
      />
      <Toggle
        k="sms_reminders"
        label="Appointment reminders"
        desc="Reminders 1 hour before a scheduled service"
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
      toast.error("Password change failed", "New passwords don't match.");
      return;
    }
    // Allow passwords of any length (1 character minimum)
    if (form.new_password.length === 0) {
      toast.error("Password change failed", "Password cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const res = await apiClient.patch(
        "/users/me/password",
        {
          current_password: form.current_password,
          new_password: form.new_password,
        },
        { validateStatus: () => true },
      );
      if (res.status < 200 || res.status >= 300) {
        const e = res.data;
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

  // Memoized change handlers
  const handleChange = useCallback(
    (field) => (e) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    },
    [],
  );

  const handleToggle = useCallback(
    (vk) => () => {
      setVis((prev) => ({ ...prev, [vk]: !prev[vk] }));
    },
    [],
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>
      <p className="text-sm text-gray-400 mb-6">
        Keep your account safe with a strong password
      </p>
      <form onSubmit={handleSubmit} className="max-w-md">
        <PwField
          label="Current Password"
          vk="cur"
          fk="current_password"
          placeholder="Enter current password"
          value={form.current_password}
          type={vis.cur ? "text" : "password"}
          onChange={handleChange("current_password")}
          onToggle={handleToggle("cur")}
          isVisible={vis.cur}
        />
        <PwField
          label="New Password"
          vk="nw"
          fk="new_password"
          placeholder="Create new password"
          value={form.new_password}
          type={vis.nw ? "text" : "password"}
          onChange={handleChange("new_password")}
          onToggle={handleToggle("nw")}
          isVisible={vis.nw}
        />
        <PwField
          label="Confirm Password"
          vk="cf"
          fk="confirm_password"
          placeholder="Repeat new password"
          value={form.confirm_password}
          type={vis.cf ? "text" : "password"}
          onChange={handleChange("confirm_password")}
          onToggle={handleToggle("cf")}
          isVisible={vis.cf}
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
    </div>
  );
};

const HelpSupport = () => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-1">Help & Support</h2>
    <p className="text-sm text-gray-400 mb-6">
      Get help with your ServiceHub account
    </p>
    {[
      {
        q: "How do I book a service?",
        a: "Go to Find Services, select a provider, choose a date and time, and confirm your booking.",
      },
      {
        q: "How do I cancel a booking?",
        a: "Visit My Bookings, open the booking, and click Cancel. Cancellations must be made 2 hours before the scheduled time.",
      },
      {
        q: "How do I pay for services?",
        a: "ServiceHub supports M-Pesa and card payments. Manage payment methods in your Wallet.",
      },
      {
        q: "How do I report a provider?",
        a: "After a completed booking, you can leave a review and report issues on the booking details page.",
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
        Still need help?
      </p>
      <p className="text-sm text-gray-400 mb-2">
        Our team is available Mon–Fri, 8am–6pm EAT.
      </p>
      <a
        href="mailto:info@sasafix.co.ke"
        className="text-sm font-semibold hover:underline"
        style={{ color: BRAND }}
      >
        info@sasafix.co.ke
      </a>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────
function ClientProfile() {
  const location = useLocation();
  const sidebarRole = getSidebarRole(location.pathname);
  const [active, setActive] = useState("personal");
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
    personal: <PersonalInfo user={user} onSaved={setUser} />,
    locations: <SavedLocations user={user} />,
    notifications: <NotificationSettings />,
    security: <Security />,
    theme: <ThemeSettings />,
    help: <HelpSupport />,
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />
      <div className="min-w-0 flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-4 pb-6 sm:px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile & Settings
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your account preferences
            </p>
          </div>

          <div className="flex min-w-0 flex-col items-start gap-4 md:flex-row md:gap-5">
            {/* Settings nav */}
            <div className="flex w-full min-w-0 shrink-0 gap-1 overflow-x-auto rounded-2xl border border-gray-100 bg-white p-2 shadow-sm md:w-52 md:flex-col md:overflow-visible">
              {NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className="flex w-auto shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-colors md:w-full md:gap-3"
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

            {/* Active section */}
            <div className="min-w-0 w-full flex-1 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 md:w-auto md:p-7 min-h-96">
              {sections[active]}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ClientProfile;
