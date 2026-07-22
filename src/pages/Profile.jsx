import { useState, useEffect, useRef } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole } from "../utils/sidebarRole";
import authService from "../services/api";

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
const BriefIcon = () => (
  <Ico
    d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"
    d2="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"
  />
);
const CalIcon = () => (
  <Ico
    d="M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"
    d2="M16 2v4M8 2v4M3 10h18"
  />
);
const PinIcon = () => (
  <Ico
    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    circle={[12, 10, 3]}
  />
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
const Toast = ({ msg, ok }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${ok ? "bg-green-500" : "bg-red-500"}`}
  >
    {ok ? "✓" : "✕"} {msg}
  </div>
);

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Cleaning",
  "Painting",
  "Gardening",
  "Moving & Delivery",
  "AC & Appliance Repair",
  "Security & CCTV",
  "Beauty & Wellness",
  "Tutoring",
  "Other",
];

const NAV = [
  { id: "personal", label: "Personal Info", icon: <UserIcon /> },
  { id: "professional", label: "Professional Info", icon: <BriefIcon /> },
  { id: "availability", label: "Availability", icon: <CalIcon /> },
  { id: "location", label: "Location", icon: <PinIcon /> },
  { id: "security", label: "Security", icon: <LockIcon /> },
  { id: "help", label: "Help & Support", icon: <HelpIcon /> },
];

// ── Personal Info ──────────────────────────────────────────────────
const PersonalInfo = ({ user, onSaved }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
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
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast("Changes saved successfully.");
    } catch (e) {
      showToast(e.message || "Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Personal Information
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Update your photo and personal details
      </p>
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
      <div className="grid grid-cols-2 gap-4 mb-4">
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

// ── Professional Info ──────────────────────────────────────────────
const ProfessionalInfo = ({ user }) => {
  const providerId = authService.getStoredUser()?.provider_id;
  const [form, setForm] = useState({
    service_category: "",
    years_of_experience: "",
    hourly_rate: "",
    bio: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!providerId) return;
    fetch(`http://localhost:8000/api/providers/${providerId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        setForm({
          service_category: d.service_category || "",
          years_of_experience: d.years_of_experience || "",
          hourly_rate: d.hourly_rate || "",
          bio: d.bio || "",
        });
      })
      .catch(() => {});
  }, [providerId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(
        `http://localhost:8000/api/providers/${providerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            ...form,
            years_of_experience: parseInt(form.years_of_experience) || 0,
            hourly_rate: parseFloat(form.hourly_rate) || 0,
          }),
        },
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail);
      }
      showToast("Professional info updated.");
    } catch (e) {
      showToast(e.message || "Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Professional Information
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Details clients see when browsing your profile
      </p>

      <div className="mb-4">
        <Label>Service Category</Label>
        <select
          className={inputCls}
          value={form.service_category}
          onChange={(e) =>
            setForm((p) => ({ ...p, service_category: e.target.value }))
          }
        >
          <option value="">Select a category</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <Label>Years of Experience</Label>
          <input
            className={inputCls}
            type="number"
            min="0"
            value={form.years_of_experience}
            placeholder="e.g. 5"
            onChange={(e) =>
              setForm((p) => ({ ...p, years_of_experience: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Hourly Rate (KES)</Label>
          <input
            className={inputCls}
            type="number"
            min="0"
            value={form.hourly_rate}
            placeholder="e.g. 1500"
            onChange={(e) =>
              setForm((p) => ({ ...p, hourly_rate: e.target.value }))
            }
          />
        </div>
      </div>
      <div className="mb-6">
        <Label>Bio / About Your Services</Label>
        <textarea
          className={inputCls}
          rows={4}
          value={form.bio}
          placeholder="Tell clients about your experience, skills, and what makes your service unique..."
          onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          style={{ resize: "vertical" }}
        />
        <p className="text-xs text-gray-400 mt-1">
          {form.bio.length} / 50 minimum characters
        </p>
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
        style={{ backgroundColor: BRAND }}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

// ── Availability ───────────────────────────────────────────────────
const Availability = () => {
  const providerId = authService.getStoredUser()?.provider_id;
  const [slots, setSlots] = useState(
    DAYS.map((day) => ({
      day,
      enabled: !["Saturday", "Sunday"].includes(day),
      start: "08:00",
      end: "17:00",
    })),
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!providerId) return;
    fetch(`http://localhost:8000/api/providers/${providerId}/availability`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlots(
            DAYS.map((day) => {
              const existing = data.find((d) => d.day_of_week === day);
              return existing
                ? {
                    day,
                    enabled: existing.is_available,
                    start: existing.start_time,
                    end: existing.end_time,
                  }
                : { day, enabled: false, start: "08:00", end: "17:00" };
            }),
          );
        }
      })
      .catch(() => {});
  }, [providerId]);

  const toggle = (i) =>
    setSlots((p) =>
      p.map((s, idx) => (idx === i ? { ...s, enabled: !s.enabled } : s)),
    );
  const setTime = (i, field, val) =>
    setSlots((p) =>
      p.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = slots.map((s) => ({
        day: s.day,
        start_time: s.start,
        end_time: s.end,
        is_available: s.enabled,
      }));
      const res = await fetch(
        `http://localhost:8000/api/providers/${providerId}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail);
      }
      showToast("Availability updated.");
    } catch (e) {
      showToast(e.message || "Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <h2 className="text-xl font-bold text-gray-900 mb-1">Availability</h2>
      <p className="text-sm text-gray-400 mb-6">
        Set the days and hours you're available for bookings
      </p>
      <div className="flex flex-col gap-3 mb-5">
        {slots.map((s, i) => (
          <div
            key={s.day}
            className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
            style={{
              borderColor: s.enabled ? BRAND : "#e5e7eb",
              backgroundColor: s.enabled ? BRAND_LIGHT : "#f9fafb",
            }}
          >
            <input
              type="checkbox"
              checked={s.enabled}
              onChange={() => toggle(i)}
              style={{
                width: 18,
                height: 18,
                accentColor: BRAND,
                cursor: "pointer",
                flexShrink: 0,
              }}
            />
            <span className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">
              {s.day}
            </span>
            {s.enabled ? (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  value={s.start}
                  onChange={(e) => setTime(i, "start", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white outline-none"
                  style={{ width: 110 }}
                />
                <span className="text-sm text-gray-400">to</span>
                <input
                  type="time"
                  value={s.end}
                  onChange={(e) => setTime(i, "end", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white outline-none"
                  style={{ width: 110 }}
                />
              </div>
            ) : (
              <span className="ml-auto text-sm text-gray-400">Unavailable</span>
            )}
          </div>
        ))}
      </div>
      <div
        className="p-3 rounded-xl text-sm text-gray-500 mb-5"
        style={{
          backgroundColor: "#f0f7ff",
          border: `1px solid ${BRAND_LIGHT}`,
        }}
      >
        <strong>Note:</strong> Changes take effect immediately for new booking
        requests.
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
        style={{ backgroundColor: BRAND }}
      >
        {saving ? "Saving..." : "Save Availability"}
      </button>
    </div>
  );
};

// ── Location ───────────────────────────────────────────────────────
const Location = ({ user }) => {
  const providerId = authService.getStoredUser()?.provider_id;
  const [form, setForm] = useState({ city: "", country: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

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
      // Update user location
      await fetch("http://localhost:8000/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(form),
      });
      // Also update provider location
      if (providerId) {
        await fetch(`http://localhost:8000/api/providers/${providerId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(form),
        });
      }
      showToast("Location updated.");
    } catch (e) {
      showToast("Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
      <h2 className="text-xl font-bold text-gray-900 mb-1">Location</h2>
      <p className="text-sm text-gray-400 mb-6">
        Your service area shown to clients
      </p>
      <div className="grid grid-cols-2 gap-4 mb-4">
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

// ── Security ───────────────────────────────────────────────────────
const Security = () => {
  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [vis, setVis] = useState({ cur: false, nw: false, cf: false });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      showToast("New passwords don't match.", false);
      return;
    }
    if (form.new_password.length < 6) {
      showToast("Password must be at least 6 characters.", false);
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
      showToast("Password changed successfully.");
    } catch (e) {
      showToast(e.message || "Failed.", false);
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
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
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
    </div>
  );
};

// ── Help ───────────────────────────────────────────────────────────
const HelpSupport = () => (
  <div>
    <h2 className="text-xl font-bold text-gray-900 mb-1">Help & Support</h2>
    <p className="text-sm text-gray-400 mb-6">
      Get help with your ServiceHub provider account
    </p>
    {[
      {
        q: "How do I get more bookings?",
        a: "Keep your profile complete, respond quickly to requests, and maintain a high rating. Verified providers appear higher in search results.",
      },
      {
        q: "How do I accept or reject a job?",
        a: "Go to My Jobs, open the new request, and tap Accept or Decline. You have 30 minutes to respond before it expires.",
      },
      {
        q: "How do I get paid?",
        a: "Payments are released to your wallet after a job is marked complete and the client confirms. You can withdraw via M-Pesa from the Wallet page.",
      },
      {
        q: "How do I update my availability?",
        a: "Go to the Availability tab on this page and toggle the days and hours you're free. Changes take effect immediately.",
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
        Provider support: Mon–Fri, 8am–6pm EAT.
      </p>
      <a
        href="mailto:providers@servicehub.co.ke"
        className="text-sm font-semibold hover:underline"
        style={{ color: BRAND }}
      >
        providers@servicehub.co.ke
      </a>
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────
function Profile() {
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
    professional: <ProfessionalInfo user={user} />,
    availability: <Availability />,
    location: <Location user={user} />,
    security: <Security />,
    help: <HelpSupport />,
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Profile & Settings
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage your account and service preferences
            </p>
          </div>

          <div className="flex gap-5 items-start">
            {/* Settings nav */}
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

            {/* Active section */}
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-7 min-h-96">
              {sections[active]}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
