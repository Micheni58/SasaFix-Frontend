import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/api";

const MailIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="18"
    height="18"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="16" height="13" rx="2" />
    <polyline points="2,4 10,12 18,4" />
  </svg>
);

const LockIcon = () => (
  <svg
    viewBox="0 0 20 20"
    width="18"
    height="18"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="4" y="9" width="12" height="9" rx="2" />
    <path d="M7 9V6a3 3 0 0 1 6 0v3" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg
    viewBox="0 0 20 20"
    width="18"
    height="18"
    fill="none"
    stroke="#9ca3af"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
    <circle cx="10" cy="10" r="2.5" />
    {!open && <line x1="3" y1="3" x2="17" y2="17" />}
  </svg>
);

const LoginForm = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);
      const user = response.user;
      console.log("Login successful:", user);

      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "service_provider") {
        navigate("/provider");
      } else {
        navigate("/client");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .lf-wrap { font-family: 'Sora', sans-serif; width: 100%; }

        .lf-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f0f1a;
          letter-spacing: -0.8px;
          margin-bottom: 6px;
        }

        .lf-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 36px;
        }

        .lf-error {
          margin-bottom: 20px;
          padding: 12px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
        }

        .lf-field { margin-bottom: 20px; }

        .lf-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
          letter-spacing: 0.1px;
        }

        .lf-input-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          padding: 0 14px;
          height: 50px;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .lf-input-wrap:focus-within {
          border-color: #4f35f5;
          box-shadow: 0 0 0 3px rgba(79,53,245,0.1);
        }

        .lf-input {
          flex: 1;
          border: none;
          outline: none;
          font-family: 'Sora', sans-serif;
          font-size: 14px;
          color: #111827;
          background: transparent;
        }

        .lf-input::placeholder { color: #9ca3af; }

        .lf-eye {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .lf-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 4px 0 28px;
        }

        .lf-remember {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #374151;
          font-weight: 500;
          cursor: pointer;
          user-select: none;
        }

        .lf-remember input[type="checkbox"] {
          width: 16px;
          height: 16px;
          accent-color: #4f35f5;
          cursor: pointer;
        }

        .lf-forgot {
          font-size: 13px;
          font-weight: 600;
          color: #4f35f5;
          background: none;
          border: none;
          cursor: pointer;
          font-family: 'Sora', sans-serif;
          padding: 0;
        }

        .lf-forgot:hover { text-decoration: underline; }

        .lf-btn {
          width: 100%;
          height: 52px;
          background: #4f35f5;
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 700;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: background 0.2s, transform 0.1s;
          margin-bottom: 28px;
        }

        .lf-btn:hover:not(:disabled)  { background: #3d27d4; }
        .lf-btn:active:not(:disabled) { transform: scale(0.98); }
        .lf-btn:disabled              { background: #a5b4fc; cursor: not-allowed; }

        .lf-signup {
          text-align: center;
          font-size: 13px;
          color: #6b7280;
        }

        .lf-signup a {
          color: #4f35f5;
          font-weight: 700;
          text-decoration: none;
        }

        .lf-signup a:hover { text-decoration: underline; }
      `}</style>

      <div className="lf-wrap">
        <h2 className="lf-title">Welcome back</h2>
        <p className="lf-subtitle">Sign in to your account to continue</p>

        {error && <div className="lf-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="lf-field">
            <label className="lf-label">Email</label>
            <div className="lf-input-wrap">
              <MailIcon />
              <input
                className="lf-input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="lf-field">
            <label className="lf-label">Password</label>
            <div className="lf-input-wrap">
              <LockIcon />
              <input
                className="lf-input"
                type={showPass ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                className="lf-eye"
                onClick={() => setShowPass((p) => !p)}
                aria-label="Toggle password visibility"
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          <div className="lf-row">
            <label className="lf-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className="lf-forgot">
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="lf-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="lf-signup">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
      </div>
    </>
  );
};

export default LoginForm;
