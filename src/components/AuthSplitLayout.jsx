import { useState, useEffect } from "react";
import HomeNavbar from "./HomeNavbar";

const features = [
  "Verified professionals",
  "Secure M-Pesa payments",
  "Transparent pricing",
];

const CheckIcon = () => (
  <svg
    viewBox="0 0 16 16"
    width="16"
    height="16"
    fill="none"
    stroke="white"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2,8 6,12 14,4" />
  </svg>
);

export default function AuthSplitLayout({ children }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const fadeUp = (delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(22px)",
    transition: `opacity 0.55s ${delay}s ease, transform 0.55s ${delay}s ease`,
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; }

        .sh-root { font-family: 'Sora', sans-serif; min-height: 100vh; display: flex; padding-top: 72px; }

        .sh-left {
          width: 50%;
          min-height: calc(100vh - 72px);
          background: linear-gradient(160deg, #034d80 0%, #2e96d4 100%, #0383d3 70%, #2e96d4 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 56px 52px;
          position: relative;
          overflow: hidden;
        }

        .sh-noise {
          position: absolute; inset: 0; pointer-events: none; z-index: 0; opacity: 0.35;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }

        .sh-container { position: relative; z-index: 1; display: flex; flex-direction: column; }

        .sh-logo { display: flex; align-items: center; gap: 14px; margin-bottom: 52px; }

        .sh-logo-icon {
          width: 52px; height: 52px;
          border-radius: 50%;
          overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .sh-logo-icon img { width: 100%; height: 100%; object-fit: cover; }

        .sh-logo-name { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }

        .sh-headline {
          font-size: clamp(32px, 3.5vw, 48px);
          font-weight: 800; line-height: 1.1; letter-spacing: -1.5px; margin-bottom: 22px;
        }

        .sh-body {
          font-size: 15px; line-height: 1.75;
          color: rgba(255,255,255,0.78); font-weight: 400; margin-bottom: 44px;
        }

        .sh-features { display: flex; flex-direction: column; gap: 14px; }
        .sh-feature  { display: flex; align-items: center; gap: 16px; }

        .sh-check {
          width: 36px; height: 36px; flex-shrink: 0;
          background: rgba(255,255,255,0.15);
          border-radius: 10px; border: 1px solid rgba(255,255,255,0.22);
          display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(6px);
        }

        .sh-feature-text { font-size: 15px; font-weight: 500; color: rgba(255,255,255,0.92); }

        .sh-right {
          width: 50%; min-height: calc(100vh - 72px); background: #fff;
          display: flex; align-items: center; justify-content: center;
          padding: 56px 48px;
        }

        .sh-right-inner { width: 100%; max-width: 440px; }

        @media (max-width: 768px) {
          .sh-left  { display: none; }
          .sh-right { width: 100%; padding: 40px 24px 80px; }
        }
      `}</style>

      <HomeNavbar authVariant />

      <div className="sh-root">
        <div className="sh-left">
          <div className="sh-noise" />
          <div className="sh-container">
            <div className="sh-logo" style={fadeUp(0)}>
              <div className="sh-logo-icon">
                <img src="/SasaFix_logo.svg" alt="Sasafix logo" />
              </div>
              <span className="sh-logo-name">Sasafix</span>
            </div>

            <h1 className="sh-headline" style={fadeUp(0.1)}>
              Find trusted local professionals
            </h1>

            <p className="sh-body" style={fadeUp(0.2)}>
              Connect with verified service providers in your area. From
              plumbing to cleaning, find the help you need, when you need it.
            </p>

            <div className="sh-features" style={fadeUp(0.3)}>
              {features.map((f) => (
                <div className="sh-feature" key={f}>
                  <div className="sh-check">
                    <CheckIcon />
                  </div>
                  <span className="sh-feature-text">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sh-right">
          <div className="sh-right-inner">{children}</div>
        </div>
      </div>
    </>
  );
}
