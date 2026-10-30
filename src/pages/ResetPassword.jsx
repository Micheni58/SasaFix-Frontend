import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthSplitLayout from "../components/AuthSplitLayout";
import authService from "../services/api";

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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // After a successful reset, send the user to login
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      console.error("resetPassword failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <style>{`
        .rp-title { font-size: 28px; font-weight: 800; color: #101828; letter-spacing: -0.8px; margin-bottom: 10px; }
        .rp-sub { font-size: 14px; line-height: 1.7; color: #667085; margin-bottom: 28px; }
        .rp-field { margin-bottom: 18px; }
        .rp-label { display: block; font-size: 13px; font-weight: 600; color: #101828; margin-bottom: 8px; }
        .rp-input-wrap {
          display: flex; align-items: center; gap: 10px;
          border: 1.5px solid #E5E7EB; border-radius: 10px; padding: 0 14px; height: 50px; background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .rp-input-wrap:focus-within { border-color: #056db3; box-shadow: 0 0 0 3px rgba(5,109,179,0.12); }
        .rp-input {
          flex: 1; border: none; outline: none; background: transparent;
          font-family: 'Sora', sans-serif; font-size: 14px; color: #101828;
        }
        .rp-eye { background: none; border: none; cursor: pointer; padding: 0; display: flex; align-items: center; }
        .rp-btn {
          width: 100%; margin-top: 8px; height: 52px; font-size: 15px; font-weight: 700;
          font-family: 'Sora', sans-serif; color: #fff; background: #056db3;
          border: none; border-radius: 10px; cursor: pointer; transition: background 0.2s, opacity 0.2s;
        }
        .rp-btn:hover:not(:disabled) { background: #045a94; }
        .rp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .rp-error {
          background: #FEF3F2; border: 1px solid #FECDCA; color: #B42318;
          font-size: 13px; padding: 12px 14px; border-radius: 10px; margin-bottom: 16px;
        }
        .rp-link { display: block; text-align: center; margin-top: 24px; font-size: 13px; font-weight: 600; color: #056db3; text-decoration: none; }
        .rp-link:hover { text-decoration: underline; }
        .rp-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #EEF0FD;
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
        }
      `}</style>

      {!token ? (
        <div>
          <h2 className="rp-title">Invalid reset link</h2>
          <p className="rp-sub">
            This link is missing its reset token. Please request a new password
            reset email.
          </p>
          <Link to="/forgot-password" className="rp-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            Request a new link
          </Link>
        </div>
      ) : done ? (
        <div>
          <div className="rp-icon">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#056db3" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="4,12 10,18 20,6" />
            </svg>
          </div>
          <h2 className="rp-title">Password updated</h2>
          <p className="rp-sub">
            Your password has been reset. Redirecting you to login...
          </p>
          <Link to="/login" className="rp-link">
            Go to login now
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="rp-title">Set a new password</h2>
          <p className="rp-sub">
            Choose a new password for your Sasafix account.
          </p>

          {error && (
            <div className="rp-error">
              {error}
              {error.toLowerCase().includes("expired") && (
                <>
                  {" "}
                  <Link to="/forgot-password" style={{ color: "#B42318", fontWeight: 700 }}>
                    Request a new link
                  </Link>
                </>
              )}
            </div>
          )}

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-password">New password</label>
            <div className="rp-input-wrap">
              <input
                id="rp-password"
                className="rp-input"
                type={showPass ? "text" : "password"}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
                autoFocus
              />
              <button
                type="button"
                className="rp-eye"
                onClick={() => setShowPass((p) => !p)}
                aria-label="Toggle password visibility"
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
          </div>

          <div className="rp-field">
            <label className="rp-label" htmlFor="rp-confirm">Confirm new password</label>
            <div className="rp-input-wrap">
              <input
                id="rp-confirm"
                className="rp-input"
                type={showPass ? "text" : "password"}
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setError("");
                }}
                required
              />
            </div>
          </div>

          <button className="rp-btn" type="submit" disabled={loading || !password || !confirm}>
            {loading ? "Updating..." : "Reset password"}
          </button>

          <Link to="/login" className="rp-link">
            ← Back to login
          </Link>
        </form>
      )}
    </AuthSplitLayout>
  );
}