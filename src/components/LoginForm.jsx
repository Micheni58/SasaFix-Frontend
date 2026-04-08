import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path
      d="M2.5 7l3 3L11.5 3.5"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="1"
      y="3"
      width="14"
      height="10"
      rx="2"
      stroke="#9ca3af"
      strokeWidth="1.5"
    />
    <path
      d="M1 5.5l7 4.5 7-4.5"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="3"
      y="7"
      width="10"
      height="8"
      rx="1.5"
      stroke="#9ca3af"
      strokeWidth="1.5"
    />
    <path
      d="M5 7V5a3 3 0 016 0v2"
      stroke="#9ca3af"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <circle cx="8" cy="11" r="1" fill="#9ca3af" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z"
      stroke="#9ca3af"
      strokeWidth="1.5"
    />
    <circle cx="8" cy="8" r="2" stroke="#9ca3af" strokeWidth="1.5" />
    {!open && (
      <line
        x1="2"
        y1="2"
        x2="14"
        y2="14"
        stroke="#9ca3af"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18">
    <path
      d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
      fill="#4285F4"
    />
    <path
      d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
      fill="#34A853"
    />
    <path
      d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      fill="#FBBC05"
    />
    <path
      d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      fill="#EA4335"
    />
  </svg>
);

const LogoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="10" fill="rgba(255,255,255,0.2)" />
    <path
      d="M10 13h16M10 18h12M10 23h14"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle
      cx="26"
      cy="23"
      r="4"
      fill="white"
      fillOpacity="0.25"
      stroke="white"
      strokeWidth="1.5"
    />
    <path
      d="M24.5 23l1 1 2-2"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sh-root {
    min-height: 100vh;
    display: flex;
    font-family: 'DM Sans', sans-serif;
  }

  .sh-left {
    width: 50%;
    background: linear-gradient(145deg, #3b1fcf 0%, #1a0fa8 45%, #0d0680 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 56px 60px;
    position: relative;
    overflow: hidden;
  }
  .sh-left::before {
    content: '';
    position: absolute;
    top: -140px; right: -140px;
    width: 420px; height: 420px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%);
    pointer-events: none;
  }
  .sh-left::after {
    content: '';
    position: absolute;
    bottom: -100px; left: -100px;
    width: 350px; height: 350px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 65%);
    pointer-events: none;
  }

  .sh-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 68px;
  }
  .sh-brand-name {
    font-family: 'Sora', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: white;
    letter-spacing: -0.3px;
  }

  .sh-headline {
    font-family: 'Sora', sans-serif;
    font-size: 40px;
    font-weight: 700;
    color: white;
    line-height: 1.15;
    letter-spacing: -1px;
    margin-bottom: 18px;
    max-width: 360px;
  }
  .sh-subtext {
    font-size: 15px;
    color: rgba(255,255,255,0.62);
    line-height: 1.65;
    max-width: 340px;
    margin-bottom: 48px;
  }

  .sh-features { display: flex; flex-direction: column; gap: 18px; }
  .sh-feature { display: flex; align-items: center; gap: 14px; }
  .sh-feature-dot {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: rgba(255,255,255,0.18);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .sh-feature-label {
    font-size: 14px;
    font-weight: 500;
    color: rgba(255,255,255,0.88);
  }

  .sh-right {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 60px;
    background: white;
  }

  .sh-form-container {
    width: 100%;
    max-width: 390px;
  }

  .sh-form-title {
    font-family: 'Sora', sans-serif;
    font-size: 28px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
  }
  .sh-form-sub {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 36px;
  }

  .sh-field-group { margin-bottom: 20px; }
  .sh-label {
    display: block;
    font-size: 13px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
  }
  .sh-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .sh-input-icon {
    position: absolute;
    left: 13px;
    display: flex;
    align-items: center;
    pointer-events: none;
  }
  .sh-input {
    width: 100%;
    padding: 11px 14px 11px 40px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
    background: white;
    transition: border-color 0.15s, box-shadow 0.15s;
    outline: none;
  }
  .sh-input::placeholder { color: #9ca3af; }
  .sh-input:focus {
    border-color: #3b1fcf;
    box-shadow: 0 0 0 3px rgba(59,31,207,0.09);
  }
  .sh-eye-btn {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    opacity: 0.55;
    transition: opacity 0.15s;
  }
  .sh-eye-btn:hover { opacity: 1; }
  .sh-error { font-size: 12px; color: #ef4444; margin-top: 5px; }

  .sh-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }
  .sh-remember {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
  }
  .sh-checkbox {
    width: 17px; height: 17px;
    border-radius: 4px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .sh-checkbox-off {
    border: 2px solid #d1d5db;
    background: white;
  }
  .sh-checkbox-on {
    border: 2px solid #3b1fcf;
    background: #3b1fcf;
  }
  .sh-remember-label { font-size: 13px; color: #374151; }

  .sh-forgot {
    font-size: 13px;
    color: #3b1fcf;
    font-weight: 500;
    text-decoration: none;
  }
  .sh-forgot:hover { text-decoration: underline; }

  .sh-btn-primary {
    width: 100%;
    padding: 13px;
    background: #3b1fcf;
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'Sora', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
    margin-bottom: 20px;
    letter-spacing: 0.1px;
  }
  .sh-btn-primary:hover:not(:disabled) { background: #2d17a8; }
  .sh-btn-primary:active:not(:disabled) { transform: scale(0.99); }
  .sh-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

  .sh-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .sh-divider-line { flex: 1; height: 1px; background: #e5e7eb; }
  .sh-divider-text { font-size: 12px; color: #9ca3af; white-space: nowrap; }

  .sh-btn-google {
    width: 100%;
    padding: 12px;
    background: white;
    color: #374151;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
    margin-bottom: 28px;
  }
  .sh-btn-google:hover {
    border-color: #d1d5db;
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  }

  .sh-signup-text { text-align: center; font-size: 13px; color: #6b7280; }
  .sh-signup-link { color: #3b1fcf; font-weight: 600; text-decoration: none; }
  .sh-signup-link:hover { text-decoration: underline; }

  .sh-status-err {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 8px;
    margin-bottom: 18px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .sh-left { display: none; }
    .sh-right { width: 100%; padding: 32px 24px; }
  }
`;

const ROLE_ROUTES = {
  admin: "/admin",
  provider: "/provider",
  client: "/client",
};

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    setStatus("");
    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, rememberMe }),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.access_token);
        navigate(ROLE_ROUTES[data.user.role] || "/client");
      } else {
        setStatus(data.detail || data.error || "Login failed");
      }
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="sh-root">
        {/* LEFT */}
        <div className="sh-left">
          <div className="sh-brand">
            <LogoIcon />
            <span className="sh-brand-name">ServiceHub</span>
          </div>
          <h1 className="sh-headline">Find trusted local professionals</h1>
          <p className="sh-subtext">
            Connect with verified service providers in your area. From plumbing
            to cleaning, find the help you need, when you need it.
          </p>
          <div className="sh-features">
            {[
              "Verified professionals",
              "Secure M-Pesa payments",
              "Transparent pricing",
            ].map((f) => (
              <div className="sh-feature" key={f}>
                <div className="sh-feature-dot">
                  <CheckIcon />
                </div>
                <span className="sh-feature-label">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="sh-right">
          <div className="sh-form-container">
            <h2 className="sh-form-title">Welcome back</h2>
            <p className="sh-form-sub">Sign in to your account to continue</p>

            <Formik
              initialValues={{ email: "", password: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, status }) => (
                <Form>
                  {status && <div className="sh-status-err">{status}</div>}

                  <div className="sh-field-group">
                    <label className="sh-label">Email</label>
                    <div className="sh-input-wrap">
                      <span className="sh-input-icon">
                        <EmailIcon />
                      </span>
                      <Field
                        type="email"
                        name="email"
                        className="sh-input"
                        placeholder="you@example.com"
                        disabled={isSubmitting}
                      />
                    </div>
                    <ErrorMessage
                      name="email"
                      component="div"
                      className="sh-error"
                    />
                  </div>

                  <div className="sh-field-group">
                    <label className="sh-label">Password</label>
                    <div className="sh-input-wrap">
                      <span className="sh-input-icon">
                        <LockIcon />
                      </span>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        className="sh-input"
                        placeholder="Enter your password"
                        disabled={isSubmitting}
                        style={{ paddingRight: "42px" }}
                      />
                      <button
                        type="button"
                        className="sh-eye-btn"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        <EyeIcon open={showPassword} />
                      </button>
                    </div>
                    <ErrorMessage
                      name="password"
                      component="div"
                      className="sh-error"
                    />
                  </div>

                  <div className="sh-row">
                    <label
                      className="sh-remember"
                      onClick={() => setRememberMe((r) => !r)}
                    >
                      <div
                        className={`sh-checkbox ${rememberMe ? "sh-checkbox-on" : "sh-checkbox-off"}`}
                      >
                        {rememberMe && <CheckIcon />}
                      </div>
                      <span className="sh-remember-label">Remember me</span>
                    </label>
                    <a href="/forgot-password" className="sh-forgot">
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="sh-btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Signing in…" : "Login"}
                  </button>

                  <div className="sh-divider">
                    <div className="sh-divider-line" />
                    <span className="sh-divider-text">or continue with</span>
                    <div className="sh-divider-line" />
                  </div>

                  <button
                    type="button"
                    className="sh-btn-google"
                    onClick={() => (window.location.href = "/auth/google")}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <p className="sh-signup-text">
                    Don't have an account?{" "}
                    <a href="/signup" className="sh-signup-link">
                      Sign up
                    </a>
                  </p>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
