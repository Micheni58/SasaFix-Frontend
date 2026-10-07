import { useState, useEffect, useRef, memo, useCallback } from "react";
import Sidebar from "../layout/Sidebar";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole, getStoredProviderId } from "../utils/sidebarRole";
import authService from "../services/api";
import { useToast } from "../components/ui/ToastProvider";

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

const PasswordField = ({
  label,
  value,
  onChange,
  show,
  toggleShow,
  placeholder,
}) => (
  <div className="mb-4">
    <Label>{label}</Label>

    <div className="relative">
      <input
        className={`${inputCls} pr-10`}
        type={show ? "text" : "password"}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
      />

      <button
        type="button"
        onClick={toggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOpen /> : <EyeClosed />}
      </button>
    </div>
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

// ─────────────────────────────────────────────────────────────
// Personal Info
// ─────────────────────────────────────────────────────────────

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
        throw new Error(e.detail || "Failed to save changes");
      }

      const updated = await res.json();

      const mergedUser = {
        ...user,
        ...updated,
        provider_id: updated.provider_id ?? user?.provider_id,
        service_provider_id:
          updated.service_provider_id ?? user?.service_provider_id,
      };

      localStorage.setItem("user", JSON.stringify(mergedUser));

      onSaved?.(mergedUser);

      toast.success(
        "Changes saved",
        "Your personal information has been updated.",
      );
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
            style={{
              borderColor: BRAND,
              color: BRAND,
            }}
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
              const file = e.target.files?.[0];

              if (file) {
                setAvatar(URL.createObjectURL(file));
              }
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
              setForm((p) => ({
                ...p,
                first_name: e.target.value,
              }))
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
              setForm((p) => ({
                ...p,
                last_name: e.target.value,
              }))
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
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              email: e.target.value,
            }))
          }
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
            setForm((p) => ({
              ...p,
              phone_number: e.target.value,
            }))
          }
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-colors"
          style={{ backgroundColor: BRAND }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BRAND_DARK;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND;
          }}
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

// ─────────────────────────────────────────────────────────────
// Professional Info
// ─────────────────────────────────────────────────────────────

const ProfessionalInfo = () => {
  const providerId = getStoredProviderId();
  const toast = useToast();

  const [form, setForm] = useState({
    service_category: "",
    years_of_experience: "",
    hourly_rate: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!providerId) return;

    fetch(`http://localhost:8000/api/providers/${providerId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to load provider profile");
        }
        return response.json();
      })
      .then((data) => {
        setForm({
          service_category: data.service_category || "",
          years_of_experience: data.years_of_experience || "",
          hourly_rate: data.hourly_rate || "",
          bio: data.bio || "",
        });
      })
      .catch(() => {});
  }, [providerId]);

  const handleSave = async () => {
    if (!providerId) {
      toast.error(
        "Provider profile not found",
        "Unable to save professional information.",
      );
      return;
    }

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
            years_of_experience: parseInt(form.years_of_experience, 10) || 0,
            hourly_rate: parseFloat(form.hourly_rate) || 0,
          }),
        },
      );

      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail || "Failed to update professional info");
      }

      toast.success(
        "Professional info updated",
        "Your professional details have been saved.",
      );
    } catch (e) {
      toast.error("Save failed", e.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
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
            setForm((p) => ({
              ...p,
              service_category: e.target.value,
            }))
          }
        >
          <option value="">Select a category</option>

          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
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
              setForm((p) => ({
                ...p,
                years_of_experience: e.target.value,
              }))
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
              setForm((p) => ({
                ...p,
                hourly_rate: e.target.value,
              }))
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
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              bio: e.target.value,
            }))
          }
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

// ─────────────────────────────────────────────────────────────
// Availability
// ─────────────────────────────────────────────────────────────

const Availability = () => {
  const providerId = getStoredProviderId();
  const toast = useToast();

  const [slots, setSlots] = useState(
    DAYS.map((day) => ({
      day_of_week: day,
      enabled: !["Saturday", "Sunday"].includes(day),
      start: "08:00",
      end: "17:00",
    })),
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch availability separately from the provider profile.
  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }

    const loadAvailability = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/providers/${providerId}/availability`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Failed to load availability");
        }

        const data = await response.json();

        setSlots(
          DAYS.map((day) => {
            const existing = data.find((slot) => slot.day_of_week === day);

            if (existing) {
              return {
                day_of_week: existing.day_of_week,
                enabled: existing.is_available,
                start: existing.start_time,
                end: existing.end_time,
              };
            }

            return {
              day_of_week: day,
              enabled: false,
              start: "08:00",
              end: "17:00",
            };
          }),
        );
      } catch (error) {
        toast.error(
          "Failed to load availability",
          error.message || "Showing default availability.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadAvailability();
    // Toast changes should not trigger another availability fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId]);

  const toggle = (index) => {
    setSlots((previous) =>
      previous.map((slot, i) =>
        i === index
          ? {
              ...slot,
              enabled: !slot.enabled,
            }
          : slot,
      ),
    );
  };

  const setTime = (index, field, value) => {
    setSlots((previous) =>
      previous.map((slot, i) =>
        i === index
          ? {
              ...slot,
              [field]: value,
            }
          : slot,
      ),
    );
  };

  const handleSave = async () => {
    if (!providerId) {
      toast.error("Provider profile not found", "Unable to save availability.");
      return;
    }

    setSaving(true);

    try {
      const payload = slots.map((slot) => ({
        day_of_week: slot.day_of_week,
        start_time: slot.start,
        end_time: slot.end,
        is_available: slot.enabled,
      }));

      const response = await fetch(
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

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.detail || "Failed to update availability");
      }

      toast.success(
        "Availability updated",
        "Your working hours have been saved.",
      );
    } catch (error) {
      toast.error("Save failed", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Availability</h2>

        <p className="text-sm text-gray-400 mb-6">
          Set the days and hours you're available for bookings
        </p>

        <div className="bg-gray-50 rounded-xl p-10 text-center">
          <p className="text-sm text-gray-500">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Availability</h2>

      <p className="text-sm text-gray-400 mb-6">
        Set the days and hours you're available for bookings
      </p>

      <div className="flex flex-col gap-3 mb-5">
        {slots.map((slot, index) => (
          <div
            key={slot.day_of_week}
            className="flex items-center gap-3 p-3 rounded-xl border transition-colors"
            style={{
              borderColor: slot.enabled ? BRAND : "#e5e7eb",
              backgroundColor: slot.enabled ? BRAND_LIGHT : "#f9fafb",
            }}
          >
            <input
              type="checkbox"
              checked={slot.enabled}
              onChange={() => toggle(index)}
              style={{
                width: 18,
                height: 18,
                accentColor: BRAND,
                cursor: "pointer",
                flexShrink: 0,
              }}
            />

            <span className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">
              {slot.day_of_week}
            </span>

            {slot.enabled ? (
              <div className="flex items-center gap-2 ml-auto">
                <input
                  type="time"
                  value={slot.start}
                  onChange={(e) => setTime(index, "start", e.target.value)}
                  className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white outline-none"
                  style={{ width: 110 }}
                />

                <span className="text-sm text-gray-400">to</span>

                <input
                  type="time"
                  value={slot.end}
                  onChange={(e) => setTime(index, "end", e.target.value)}
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

// ─────────────────────────────────────────────────────────────
// Location
// ─────────────────────────────────────────────────────────────

const Location = ({ user }) => {
  const providerId = getStoredProviderId();
  const toast = useToast();

  const [form, setForm] = useState({
    city: "",
    country: "",
    address: "",
  });

  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (user) {
      setForm({
        city: user.city || "",
        country: user.country || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const userResponse = await fetch("http://localhost:8000/api/users/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(form),
      });

      if (!userResponse.ok) {
        const data = await userResponse.json();
        throw new Error(data.detail || "Failed to update user location");
      }

      if (providerId) {
        const providerResponse = await fetch(
          `http://localhost:8000/api/providers/${providerId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify(form),
          },
        );

        if (!providerResponse.ok) {
          const data = await providerResponse.json();
          throw new Error(data.detail || "Failed to update provider location");
        }
      }

      toast.success("Location updated", "Your service area has been saved.");
    } catch (error) {
      toast.error("Save failed", error.message || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
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
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                city: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label>Country</Label>

          <input
            className={inputCls}
            value={form.country}
            placeholder="Kenya"
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                country: e.target.value,
              }))
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
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              address: e.target.value,
            }))
          }
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

// ─────────────────────────────────────────────────────────────
// Security - FIXED (no focus loss)
// ─────────────────────────────────────────────────────────────

const Security = memo(() => {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (newPassword !== confirmPassword) {
        toast.warning(
          "Passwords do not match",
          "Enter the same new password in both fields.",
        );
        return;
      }

      if (newPassword.length < 2) {
        toast.warning("Password is too short", "Use at least 2 characters.");
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
            current_password: currentPassword,
            new_password: newPassword,
          }),
        });

        if (!res.ok) {
          const e = await res.json();
          throw new Error(e.detail || "Failed to change password");
        }

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

        toast.success(
          "Password changed",
          "Your password has been updated successfully.",
        );
      } catch (e) {
        toast.error("Password change failed", e.message || "Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [currentPassword, newPassword, confirmPassword, toast],
  );

  const handleCurrentChange = useCallback((e) => {
    setCurrentPassword(e.target.value);
  }, []);

  const handleNewChange = useCallback((e) => {
    setNewPassword(e.target.value);
  }, []);

  const handleConfirmChange = useCallback((e) => {
    setConfirmPassword(e.target.value);
  }, []);

  const toggleCurrent = useCallback(() => {
    setShowCurrent((prev) => !prev);
  }, []);

  const toggleNew = useCallback(() => {
    setShowNew((prev) => !prev);
  }, []);

  const toggleConfirm = useCallback(() => {
    setShowConfirm((prev) => !prev);
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Security</h2>

      <p className="text-sm text-gray-400 mb-6">
        Keep your account safe with a strong password
      </p>

      <form onSubmit={handleSubmit} className="max-w-md">
        <PasswordField
          label="Current Password"
          value={currentPassword}
          onChange={handleCurrentChange}
          show={showCurrent}
          toggleShow={toggleCurrent}
          placeholder="Enter current password"
        />

        <PasswordField
          label="New Password"
          value={newPassword}
          onChange={handleNewChange}
          show={showNew}
          toggleShow={toggleNew}
          placeholder="Create new password"
        />

        <PasswordField
          label="Confirm Password"
          value={confirmPassword}
          onChange={handleConfirmChange}
          show={showConfirm}
          toggleShow={toggleConfirm}
          placeholder="Repeat new password"
        />

        <button
          type="submit"
          disabled={saving || !currentPassword || !newPassword}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 mt-2 transition-colors"
          style={{ backgroundColor: BRAND }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = BRAND_DARK;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = BRAND;
          }}
        >
          {saving ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// Help & Support
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Main Profile Page
// ─────────────────────────────────────────────────────────────

function Profile() {
  const location = useLocation();
  const sidebarRole = getSidebarRole(location.pathname);

  const [active, setActive] = useState("personal");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = authService.getStoredUser();

    if (stored) {
      setUser(stored);
    }

    const token = localStorage.getItem("access_token");

    if (!token) return;

    authService
      .getCurrentUser()
      .then((currentUser) => {
        setUser((previousUser) => ({
          ...previousUser,
          ...currentUser,
          provider_id: currentUser.provider_id ?? previousUser?.provider_id,
          service_provider_id:
            currentUser.service_provider_id ??
            previousUser?.service_provider_id,
        }));
      })
      .catch(() => {});
  }, []);

  const sections = {
    personal: <PersonalInfo user={user} onSaved={setUser} />,

    professional: <ProfessionalInfo />,

    availability: <Availability />,

    location: <Location user={user} />,

    security: <Security />,

    help: <HelpSupport />,
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />

      <div className="flex-1 ml-0 lg:ml-72">
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
            {/* Settings navigation */}
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
                  <span
                    style={{
                      color: active === id ? BRAND : "#9ca3af",
                    }}
                  >
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
