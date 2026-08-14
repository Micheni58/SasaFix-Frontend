import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Brand from "./Brand";
import ServiceSearch from "./ServiceSearch";

export default function HomeNavbar({ fixed = true, showSearch = true, authVariant = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const linkClass = (active) =>
    `rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
      active
        ? "bg-white/50 text-[#034d80] shadow-sm"
        : "text-[#034d80]/80 hover:bg-white/40 hover:text-[#034d80]"
    }`;

  const ctaClass =
    "rounded-lg bg-[#034d80] px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-[#034d80]/20 transition hover:-translate-y-0.5 hover:bg-[#023c65]";

  return (
    <header
      className={`${fixed ? "fixed inset-x-0 top-0 z-40" : "relative z-40"} border-b border-white/40 bg-white/40 shadow-[0_8px_32px_-12px_rgba(3,77,128,0.15)] backdrop-blur-xl backdrop-saturate-150`}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        {authVariant ? (
          <>
            {/* CHANGE: inline style used instead of ml-6 class — guarantees the margin applies regardless of any CSS override/specificity issue */}
            <div style={{ marginLeft: "32px" }}>
              <Brand light={false} />
            </div>
            {/* CHANGE: inline style used instead of mr-6 class, same reasoning */}
            <Link to="/" className={linkClass(pathname === "/")} style={{ marginRight: "32px" }}>← Back to home</Link>
          </>
        ) : (
          <>
            <Brand light={false} />
            {showSearch && (
              <div className="hidden flex-1 justify-center md:flex">
                <ServiceSearch compact />
              </div>
            )}
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/" className={linkClass(pathname === "/")}>Home</Link>
              <Link to="/about" className={linkClass(pathname === "/about")}>About</Link>
              <Link to="/login" className={linkClass(pathname === "/login")}>Sign In</Link>
              <Link to="/signup" className={ctaClass}>Get Started</Link>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-[#034d80] transition hover:bg-white/40 sm:hidden"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </>
        )}
      </nav>

      {!authVariant && menuOpen && (
        <div className="border-t border-white/40 bg-white/50 p-4 backdrop-blur-xl backdrop-saturate-150 sm:hidden">
          {showSearch && <ServiceSearch compact />}
          <div className={`${showSearch ? "mt-3" : ""} grid grid-cols-2 gap-3`}>
            <Link to="/" className={`${linkClass(pathname === "/")} border border-white/50 text-center backdrop-blur-sm`}>Home</Link>
            <Link to="/about" className={`${linkClass(pathname === "/about")} border border-white/50 text-center backdrop-blur-sm`}>About</Link>
            <Link to="/login" className={`${linkClass(pathname === "/login")} border border-white/50 text-center backdrop-blur-sm`}>Sign In</Link>
            <Link to="/signup" className={`${ctaClass} text-center`}>Get Started</Link>
          </div>
        </div>
      )}
    </header>
  );
}