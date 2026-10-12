import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const BRAND = "#056db3";
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");

      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/users/verify-email?token=${encodeURIComponent(token)}`,
        );

        const data = response.data;

        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response
            ? error.response.data?.detail || "Email verification failed."
            : error.message,
        );
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 p-8 text-center">
        {status === "verifying" && (
          <>
            <div className="text-4xl mb-4">✉️</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying your email
            </h1>

            <p className="text-gray-500">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-4xl mb-4">✓</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email verified!
            </h1>

            <p className="text-gray-500 mb-6">
              Your email address has been successfully verified. You can now log
              in to your account.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: BRAND }}
            >
              Go to Login
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-4xl mb-4">!</div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verification failed
            </h1>

            <p className="text-gray-500 mb-6">{message}</p>

            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: BRAND }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
