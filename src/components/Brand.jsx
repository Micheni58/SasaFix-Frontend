import { Link } from "react-router-dom";

export default function Brand({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="Sasafix home">
      {/* CHANGE: wrapped img in a circular frame — h-12 w-12 (up from h-10 w-10) for larger size, rounded-full + overflow-hidden to clip it into a circle */}
      <span className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
        <img
          src="/SasaFix_logo.svg"
          alt="Sasafix logo"
          className="h-full w-full object-cover"
        />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-[#034d80]"}`}>Sasafix</span>
    </Link>
  );
}