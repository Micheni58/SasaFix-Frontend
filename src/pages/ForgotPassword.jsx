import { useState } from "react";
import { Link } from "react-router-dom";
import AuthSplitLayout from "../components/AuthSplitLayout";
import authService from "../services/api";
export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <style>{`
        .fp-title { font-size: 28px; font-weight: 800; color: #101828; letter-spacing: -0.8px; margin-bottom: 10px; }
        .fp-sub { font-size: 14px; line-height: 1.7; color: #667085; margin-bottom: 28px; }
        .fp-label { display: block; font-size: 13px; font-weight: 600; color: #101828; margin-bottom: 8px; }
        .fp-input {
          width: 100%; padding: 14px 16px; font-size: 14px; font-family: 'Sora', sans-serif;
          border: 1.5px solid #E5E7EB; border-radius: 10px; color: #101828; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .fp-input:focus { border-color: #056db3; box-shadow: 0 0 0 3px rgba(5,109,179,0.12); }
        .fp-btn {
          width: 100%; margin-top: 20px; padding: 14px; font-size: 14px; font-weight: 700;
          font-family: 'Sora', sans-serif; color: #fff; background: #056db3;
          border: none; border-radius: 10px; cursor: pointer; transition: background 0.2s, opacity 0.2s;
        }
        .fp-btn:hover:not(:disabled) { background: #045a94; }
        .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .fp-error {
          background: #FEF3F2; border: 1px solid #FECDCA; color: #B42318;
          font-size: 13px; padding: 12px 14px; border-radius: 10px; margin-bottom: 16px;
        }
        .fp-back { display: block; text-align: center; margin-top: 24px; font-size: 13px; font-weight: 600; color: #056db3; text-decoration: none; }
        .fp-back:hover { text-decoration: underline; }
        .fp-success-icon {
          width: 56px; height: 56px; border-radius: 50%; background: #EEF0FD;
          display: flex; align-items: center; justify-content: center; margin-bottom: 20px;
        }
        .fp-link-btn {
          background: none; border: none; padding: 0; font: inherit; font-weight: 600;
          color: #056db3; cursor: pointer; text-decoration: underline;
        }
      `}</style>

      {sent ? (
        <div>
          <div className="fp-success-icon">
            <svg
              width="26"
              height="26"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#056db3"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <polyline points="3,7 12,13 21,7" />
            </svg>
          </div>
          <h2 className="fp-title">Check your email</h2>
          <p className="fp-sub">
            If an account exists for <strong>{email}</strong>, we've sent a link
            to reset your password. It expires in 30 minutes.
            <br />
            <br />
            Didn't get it? Check your spam folder, or{" "}
            <button
              type="button"
              className="fp-link-btn"
              onClick={() => setSent(false)}
            >
              try again
            </button>
            .
          </p>
          <Link to="/login" className="fp-back">
            ← Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2 className="fp-title">Forgot your password?</h2>
          <p className="fp-sub">
            Enter the email you signed up with and we'll send you a link to
            reset your password.
          </p>

          {error && <div className="fp-error">{error}</div>}

          <label className="fp-label" htmlFor="fp-email">
            Email address
          </label>
          <input
            id="fp-email"
            className="fp-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />

          <button className="fp-btn" type="submit" disabled={loading || !email}>
            {loading ? "Sending..." : "Send reset link"}
          </button>

          <Link to="/login" className="fp-back">
            ← Back to login
          </Link>
        </form>
      )}
    </AuthSplitLayout>
  );
}
