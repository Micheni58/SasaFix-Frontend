import { useNavigate, useLocation } from "react-router-dom";

const BRAND = "#056db3";

const EmailVerificationSent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the email passed from registration
  const email = location.state?.email || "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        {/* Email icon */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center bg-blue-50">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke={BRAND}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Check your email
        </h1>

        <p className="text-gray-500 mb-3">We've sent a verification link to:</p>

        {email && <p className="font-semibold text-gray-800 mb-5">{email}</p>}

        <p className="text-sm text-gray-500 mb-6">
          Please check your inbox and click the <strong>Verify Email</strong>{" "}
          button to activate your account.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm text-gray-600">
            <strong>Didn't receive the email?</strong>
          </p>

          <p className="text-xs text-gray-500 mt-1">
            Check your spam or junk folder. The verification link is valid for
            24 hours.
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="w-full py-3 rounded-xl text-white font-semibold"
          style={{ backgroundColor: BRAND }}
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationSent;
