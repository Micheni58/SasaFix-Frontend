import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/api";

const BRAND = "#056db3";

// ── tiny inline icons ──────────────────────────────────────────────
const UserIcon = () => (
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
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
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
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const PhoneIcon = () => (
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
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.61 19a19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 3.09 4.18 2 2 0 0 1 5.07 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L9.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LockIcon = () => (
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
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
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

const MapPinIcon = () => (
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
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ── reusable input with left icon ──────────────────────────────────
const InputField = ({
  icon,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  rightSlot,
}) => (
  <div className="mb-4">
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <div
      className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-white transition-all"
      style={{ height: "50px" }}
      onFocus={(e) => (e.currentTarget.style.borderColor = BRAND)}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
    >
      <span className="shrink-0">{icon}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
      />
      {rightSlot}
    </div>
  </div>
);

// ── step indicator ─────────────────────────────────────────────────
const StepIndicator = ({ current }) => (
  <div className="flex flex-col items-center mb-8">
    <div className="flex items-center gap-0 mb-2">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: current >= 1 ? BRAND : "#d1d5db" }}
        >
          1
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: current >= 1 ? BRAND : "#9ca3af" }}
        >
          Personal Info
        </span>
      </div>

      {/* Connector */}
      <div
        className="w-24 h-0.5 mx-3"
        style={{ backgroundColor: current >= 2 ? BRAND : "#d1d5db" }}
      />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: current >= 2 ? BRAND : "transparent",
            color: current >= 2 ? "#fff" : "#9ca3af",
            border: current >= 2 ? "none" : "2px solid #d1d5db",
          }}
        >
          2
        </div>
        <span
          className="text-sm font-semibold"
          style={{ color: current >= 2 ? BRAND : "#9ca3af" }}
        >
          Location
        </span>
      </div>
    </div>
    <p className="text-sm text-gray-400">Step {current} of 2</p>
  </div>
);

// ── main component ─────────────────────────────────────────────────
const SignUpForm = () => {
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { state } = useLocation();
  const role = state?.role || "client";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    city: "",
    country: "",
    role,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { confirm_password, ...payload } = formData;

      await authService.register(payload);

      navigate("/email-verification-sent", {
        state: {
          email: formData.email,
        },
      });
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-10">
      {/* Logo */}
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
        <span className="text-xl font-semibold text-gray-800">SasaFix </span>
      </div>

      <StepIndicator current={step} />

      {/* Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {step === 1 ? "Create your account" : "Where are you located?"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNext}>
            {/* Side-by-side name */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  First Name
                </label>
                <div
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-white"
                  style={{ height: "50px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BRAND)}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                >
                  <UserIcon />
                  <input
                    name="first_name"
                    type="text"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    required
                    className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Last Name
                </label>
                <div
                  className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 bg-white"
                  style={{ height: "50px" }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = BRAND)}
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = "#e5e7eb")
                  }
                >
                  <input
                    name="last_name"
                    type="text"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                    required
                    className="flex-1 border-none outline-none text-sm text-gray-800 bg-transparent placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            <InputField
              icon={<MailIcon />}
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
            <InputField
              icon={<PhoneIcon />}
              label="Phone Number"
              name="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="+254 712 345 678"
            />

            <InputField
              icon={<LockIcon />}
              label="Password"
              name="password"
              type={showPass ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="shrink-0 p-0 bg-transparent border-none cursor-pointer"
                >
                  <EyeIcon show={showPass} />
                </button>
              }
            />

            <InputField
              icon={<LockIcon />}
              label="Confirm Password"
              name="confirm_password"
              type={showConfirm ? "text" : "password"}
              value={formData.confirm_password}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="shrink-0 p-0 bg-transparent border-none cursor-pointer"
                >
                  <EyeIcon show={showConfirm} />
                </button>
              }
            />

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold text-base mt-2 transition-colors"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#04599a")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = BRAND)}
            >
              Next
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <InputField
              icon={<MapPinIcon />}
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Nairobi"
              required
            />
            <InputField
              icon={<MapPinIcon />}
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Kenya"
              required
            />

            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-semibold text-base border border-gray-200 text-gray-700 bg-white transition-colors hover:bg-gray-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl text-white font-semibold text-base transition-colors disabled:opacity-60"
                style={{ backgroundColor: BRAND }}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.backgroundColor = "#04599a")
                }
                onMouseLeave={(e) => (e.target.style.backgroundColor = BRAND)}
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
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

export default SignUpForm;
