import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/api";

const BRAND = "#056db3";
const BRAND_DARK = "#04599a";
const BRAND_LIGHT = "#e8f3fb";

// ── Icons ──────────────────────────────────────────────────────────
const Icon = ({ d, d2, circle, rect }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {d && <path d={d} />}
    {d2 && <path d={d2} />}
    {circle && <circle cx={circle[0]} cy={circle[1]} r={circle[2]} />}
    {rect && (
      <rect
        x={rect[0]}
        y={rect[1]}
        width={rect[2]}
        height={rect[3]}
        rx={rect[4]}
      />
    )}
  </svg>
);

const UserIcon = () => (
  <Icon d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" circle={[12, 7, 4]} />
);
const MailIcon = () => <Icon rect={[2, 4, 20, 16, 2]} d="M2,4 L12,13 L22,4" />;
const PhoneIcon = () => (
  <Icon d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
);
const LockIcon = () => (
  <Icon rect={[3, 11, 18, 11, 2]} d="M7 11V7a5 5 0 0 1 10 0v4" />
);
const MapIcon = () => (
  <Icon
    d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
    circle={[12, 10, 3]}
  />
);
const BriefIcon = () => (
  <Icon rect={[2, 7, 20, 14, 2]} d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
);
const ClockIcon = () => <Icon circle={[12, 12, 10]} d="M12 6v6l4 2" />;
const DollarIcon = () => (
  <Icon d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
);
const DocIcon = () => (
  <Icon
    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
    d2="M14 2v6h6M16 13H8M16 17H8M10 9H8"
  />
);
const CalIcon = () => (
  <Icon rect={[3, 4, 18, 18, 2]} d="M16 2v4M8 2v4M3 10h18" />
);

const EyeIcon = ({ show }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {show ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

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

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// ── Reusable field wrapper ─────────────────────────────────────────
const Field = ({ label, hint, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
  </div>
);

const inputWrap = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "12px",
  padding: "0 14px",
  height: "50px",
  background: "#fff",
};

const InputBox = ({
  icon,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  rightSlot,
  as,
}) => {
  const handleFocus = (e) => (e.currentTarget.style.borderColor = BRAND);
  const handleBlur = (e) => (e.currentTarget.style.borderColor = "#e5e7eb");
  if (as === "textarea")
    return (
      <div
        style={{
          ...inputWrap,
          height: "auto",
          padding: "12px 14px",
          alignItems: "flex-start",
        }}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        <span style={{ marginTop: "2px" }}>{icon}</span>
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: "#111827",
            background: "transparent",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>
    );
  if (as === "select")
    return (
      <div style={inputWrap} onFocus={handleFocus} onBlur={handleBlur}>
        <span>{icon}</span>
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            fontSize: "14px",
            color: value ? "#111827" : "#9ca3af",
            background: "transparent",
            fontFamily: "inherit",
          }}
        >
          <option value="">{placeholder}</option>
          {SERVICE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    );
  return (
    <div style={inputWrap} onFocus={handleFocus} onBlur={handleBlur}>
      <span>{icon}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          fontSize: "14px",
          color: "#111827",
          background: "transparent",
          fontFamily: "inherit",
        }}
      />
      {rightSlot}
    </div>
  );
};

// ── Step Indicator ─────────────────────────────────────────────────
const steps = [
  "Personal Info",
  "Professional Info",
  "Location",
  "Availability",
];

const StepIndicator = ({ current }) => (
  <div className="flex flex-col items-center mb-8">
    <div className="flex items-center mb-2">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = current > n;
        const active = current === n;
        return (
          <React.Fragment key={n}>
            <div className="flex flex-col items-center">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: done
                    ? "#22c55e"
                    : active
                      ? BRAND
                      : "transparent",
                  border: done || active ? "none" : "2px solid #d1d5db",
                  color: done || active ? "#fff" : "#9ca3af",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {done ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="2,8 6,12 14,4" />
                  </svg>
                ) : (
                  n
                )}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  width: 48,
                  height: 2,
                  margin: "0 4px",
                  backgroundColor: current > n ? "#22c55e" : "#d1d5db",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
    <p className="text-sm text-gray-400">
      Step {current} of {steps.length} — {steps[current - 1]}
    </p>
  </div>
);

// ── Logo ───────────────────────────────────────────────────────────
const Logo = () => (
  <div className="flex items-center gap-2 mb-6">
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: BRAND }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    </div>
    <span className="text-xl font-semibold text-gray-800">ServiceHub</span>
  </div>
);

const Btn = ({ children, onClick, type = "button", disabled, outline }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className="flex-1 py-3 rounded-xl font-semibold text-base transition-colors"
    style={
      outline
        ? {
            border: "1.5px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
          }
        : {
            backgroundColor: disabled ? "#8fbedd" : BRAND,
            color: "#fff",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
          }
    }
    onMouseEnter={(e) =>
      !outline && !disabled && (e.target.style.backgroundColor = BRAND_DARK)
    }
    onMouseLeave={(e) =>
      !outline && !disabled && (e.target.style.backgroundColor = BRAND)
    }
  >
    {children}
  </button>
);

// ── Main Component ─────────────────────────────────────────────────
const ProviderSignUpForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Step 1 — Personal Info
  const [personal, setPersonal] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
  });

  // Step 2 — Professional Info
  const [professional, setProfessional] = useState({
    service_category: "",
    years_of_experience: "",
    hourly_rate: "",
    bio: "",
  });

  // Step 3 — Location
  const [location, setLocation] = useState({
    city: "",
    country: "",
    address: "",
  });

  // Step 4 — Availability
  const [availability, setAvailability] = useState(
    DAYS.map((day) => ({
      day,
      enabled: !["Saturday", "Sunday"].includes(day),
      start: "08:00",
      end: "17:00",
    })),
  );

  const handleChange = (setter) => (e) => {
    setter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const toggleDay = (i) => {
    setAvailability((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, enabled: !d.enabled } : d)),
    );
  };

  const setTime = (i, field, val) => {
    setAvailability((prev) =>
      prev.map((d, idx) => (idx === i ? { ...d, [field]: val } : d)),
    );
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (step === 1 && personal.password !== personal.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    if (step === 2 && professional.bio.length < 10) {
      setError("Bio must be at least 10 characters.");
      return;
    }
    setError("");
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { confirm_password, ...personalClean } = personal;
      const payload = {
        ...personalClean,
        role: "service_provider",
        ...professional,
        years_of_experience: parseInt(professional.years_of_experience) || 0,
        hourly_rate: parseFloat(professional.hourly_rate) || 0,
        location: location.city,
        city: location.city,
        country: location.country,
        address: location.address,
        availability: availability
          .filter((d) => d.enabled)
          .map((d) => ({ day: d.day, start_time: d.start, end_time: d.end })),
      };
      const response = await authService.register(payload);
      navigate("/provider");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      <Logo />
      <StepIndicator current={step} />

      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 p-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* ── STEP 1: Personal Info ── */}
        {step === 1 && (
          <form onSubmit={nextStep}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Create your account
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Let's start with your personal details
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                ["first_name", "John", "First Name"],
                ["last_name", "Doe", "Last Name"],
              ].map(([name, ph, label]) => (
                <Field key={name} label={label}>
                  <div style={inputWrap}>
                    <UserIcon />
                    <input
                      name={name}
                      value={personal[name]}
                      onChange={handleChange(setPersonal)}
                      placeholder={ph}
                      required
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        background: "transparent",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </Field>
              ))}
            </div>

            <Field label="Email">
              <InputBox
                icon={<MailIcon />}
                name="email"
                type="email"
                value={personal.email}
                onChange={handleChange(setPersonal)}
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field label="Phone Number">
              <InputBox
                icon={<PhoneIcon />}
                name="phone_number"
                type="tel"
                value={personal.phone_number}
                onChange={handleChange(setPersonal)}
                placeholder="+254 712 345 678"
              />
            </Field>
            <Field label="Password">
              <InputBox
                icon={<LockIcon />}
                name="password"
                type={showPass ? "text" : "password"}
                value={personal.password}
                onChange={handleChange(setPersonal)}
                placeholder="Create a password"
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPass((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <EyeIcon show={showPass} />
                  </button>
                }
              />
            </Field>
            <Field label="Confirm Password">
              <InputBox
                icon={<LockIcon />}
                name="confirm_password"
                type={showConfirm ? "text" : "password"}
                value={personal.confirm_password}
                onChange={handleChange(setPersonal)}
                placeholder="Confirm your password"
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                    }}
                  >
                    <EyeIcon show={showConfirm} />
                  </button>
                }
              />
            </Field>

            <div className="flex gap-3 mt-2">
              <Btn type="submit">Next →</Btn>
            </div>
          </form>
        )}

        {/* ── STEP 2: Professional Info ── */}
        {step === 2 && (
          <form onSubmit={nextStep}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Tell us about your services
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Help clients understand what you offer
            </p>

            <Field label="Service Category">
              <InputBox
                icon={<BriefIcon />}
                as="select"
                name="service_category"
                value={professional.service_category}
                onChange={handleChange(setProfessional)}
                placeholder="Select a service category"
                required
              />
            </Field>
            <Field label="Years of Experience">
              <InputBox
                icon={<ClockIcon />}
                name="years_of_experience"
                type="number"
                value={professional.years_of_experience}
                onChange={handleChange(setProfessional)}
                placeholder="e.g., 5"
                required
              />
            </Field>
            <Field
              label="Hourly Rate (KES)"
              hint="Set your competitive hourly rate"
            >
              <InputBox
                icon={<DollarIcon />}
                name="hourly_rate"
                type="number"
                value={professional.hourly_rate}
                onChange={handleChange(setProfessional)}
                placeholder="e.g., 1500"
                required
              />
            </Field>
            <Field
              label="Bio / About Your Services"
              hint={`${professional.bio.length}/10 minimum characters`}
            >
              <InputBox
                icon={<DocIcon />}
                as="textarea"
                name="bio"
                value={professional.bio}
                onChange={handleChange(setProfessional)}
                placeholder="Tell potential clients about your experience, skills, and what makes your service unique..."
                required
              />
            </Field>

            <div className="flex gap-3 mt-2">
              <Btn outline onClick={() => setStep(1)}>
                ← Back
              </Btn>
              <Btn type="submit">Next →</Btn>
            </div>
          </form>
        )}

        {/* ── STEP 3: Location ── */}
        {step === 3 && (
          <form onSubmit={nextStep}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Where are you based?
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Help clients find you in their area
            </p>

            <Field label="City">
              <InputBox
                icon={<MapIcon />}
                name="city"
                value={location.city}
                onChange={handleChange(setLocation)}
                placeholder="Nairobi"
                required
              />
            </Field>
            <Field label="Country">
              <InputBox
                icon={<MapIcon />}
                name="country"
                value={location.country}
                onChange={handleChange(setLocation)}
                placeholder="Kenya"
                required
              />
            </Field>
            <Field label="Physical Address / Area">
              <InputBox
                icon={<MapIcon />}
                name="address"
                value={location.address}
                onChange={handleChange(setLocation)}
                placeholder="e.g., Westlands, Nairobi"
                required
              />
            </Field>

            <div className="flex gap-3 mt-2">
              <Btn outline onClick={() => setStep(2)}>
                ← Back
              </Btn>
              <Btn type="submit">Next →</Btn>
            </div>
          </form>
        )}

        {/* ── STEP 4: Availability ── */}
        {step === 4 && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Set your working hours
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Let clients know when you're available for bookings
            </p>

            <div className="flex flex-col gap-3 mb-4">
              {availability.map((d, i) => (
                <div
                  key={d.day}
                  className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{
                    borderColor: d.enabled ? BRAND : "#e5e7eb",
                    backgroundColor: d.enabled ? BRAND_LIGHT : "#f9fafb",
                  }}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={d.enabled}
                    onChange={() => toggleDay(i)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: BRAND,
                      cursor: "pointer",
                      flexShrink: 0,
                    }}
                  />
                  {/* Day */}
                  <CalIcon />
                  <span className="text-sm font-semibold text-gray-700 w-24">
                    {d.day}
                  </span>
                  {/* Times */}
                  {d.enabled ? (
                    <div className="flex items-center gap-2 ml-auto">
                      <ClockIcon />
                      <input
                        type="time"
                        value={d.start}
                        onChange={(e) => setTime(i, "start", e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white"
                        style={{ width: 110 }}
                      />
                      <span className="text-sm text-gray-400">to</span>
                      <input
                        type="time"
                        value={d.end}
                        onChange={(e) => setTime(i, "end", e.target.value)}
                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white"
                        style={{ width: 110 }}
                      />
                    </div>
                  ) : (
                    <span className="ml-auto text-sm text-gray-400">
                      Unavailable
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div
              className="p-3 rounded-xl text-sm text-gray-500 mb-4"
              style={{
                backgroundColor: "#f0f7ff",
                border: `1px solid ${BRAND_LIGHT}`,
              }}
            >
              <strong>Note:</strong> You can update your availability anytime
              from your dashboard settings.
            </div>

            <div className="flex gap-3">
              <Btn outline onClick={() => setStep(3)}>
                ← Back
              </Btn>
              <Btn type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Complete Registration"}
              </Btn>
            </div>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold hover:underline"
            style={{ color: BRAND }}
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ProviderSignUpForm;
