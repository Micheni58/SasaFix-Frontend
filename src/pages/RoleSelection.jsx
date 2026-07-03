import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BRAND = "#056db3";

const roles = [
  {
    id: "client",
    title: "I need services",
    description:
      "Book trusted local professionals for any job. Find verified service providers for home repairs, cleaning, and more.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z" />
        <path d="M8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" />
        <path d="M22 21v-1a4 4 0 0 0-4-4h-4" />
        <path d="M2 21v-1a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v1" />
      </svg>
    ),
  },
  {
    id: "service_provider",
    title: "I offer services",
    description:
      "Grow your business and find more clients. Connect with customers looking for your professional services.",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
  },
];

const RoleSelection = () => {
  const [selected, setSelected] = useState("client");
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate("/signup/details", { state: { role: selected } });
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
            xmlns="http://www.w3.org/2000/svg"
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

      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Join ServiceHub</h1>
      <p className="text-gray-500 text-sm mb-8">
        How would you like to use ServiceHub?
      </p>

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-6">
        {roles.map((role) => {
          const isSelected = selected === role.id;
          return (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className="text-left p-5 bg-white rounded-2xl border-2 transition-all"
              style={{
                borderColor: isSelected ? BRAND : "#e5e7eb",
                backgroundColor: isSelected ? "#e8f3fb" : "#ffffff",
              }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-3"
                style={{
                  backgroundColor: isSelected ? "#d0e8f7" : "#f3f4f6",
                  color: isSelected ? BRAND : "#6b7280",
                }}
              >
                {role.icon}
              </div>
              <p className="font-semibold text-gray-900 text-base mb-1">
                {role.title}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                {role.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        className="w-full max-w-lg py-3 rounded-xl text-white font-medium text-base transition-colors"
        style={{ backgroundColor: BRAND }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = "#04599a")}
        onMouseLeave={(e) => (e.target.style.backgroundColor = BRAND)}
      >
        Continue
      </button>

      {/* Login Link */}
      <p className="mt-4 text-sm text-gray-500">
        Already have an account?{" "}
        <a
          href="/login"
          style={{ color: BRAND }}
          className="font-medium hover:underline"
        >
          Login
        </a>
      </p>
    </div>
  );
};

export default RoleSelection;
