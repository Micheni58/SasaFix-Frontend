import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";

const suggestions = ["Plumber near me", "Electrician", "House cleaning", "Appliance repair"];

// TODO: wire this up to your real auth source (AuthContext, redux, etc.)
// Stubbed to check a token in localStorage for now.
function isAuthenticated() {
  return Boolean(localStorage.getItem("token"));
}

export default function ServiceSearch({ compact = false }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  // Close the suggestions dropdown on any click outside the component.
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToResults = (term) => {
    navigate(`/client/find-services${term ? `?search=${encodeURIComponent(term)}` : ""}`);
    setOpen(false);
  };

  const search = (term = query) => {
    setOpen(false);
    if (!isAuthenticated()) {
      const intendedSearch = `/client/find-services${term ? `?search=${encodeURIComponent(term)}` : ""}`;
      // No account on file yet, so send new visitors to signup.
      // Signup pages typically link back to /login for returning users.
      navigate("/signup", { state: { redirectTo: intendedSearch } });
      return;
    }
    goToResults(term);
  };

  return (
    <div ref={containerRef} className={`relative ${compact ? "w-full max-w-md" : "w-full"}`}>
      <div className={`flex items-center rounded-xl border ${compact ? "border-slate-200 bg-slate-50" : "border-white/25 bg-white/15 backdrop-blur-xl"} p-1 shadow-lg`}>
        <Search className={`ml-3 h-5 w-5 shrink-0 ${compact ? "text-slate-400" : "text-white/80"}`} />
        <input
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => { setQuery(event.target.value); setOpen(true); }}
          onKeyDown={(event) => event.key === "Enter" && search()}
          placeholder="Search for a service..."
          className={`min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm outline-none ${compact ? "text-slate-800 placeholder:text-slate-400" : "text-white placeholder:text-white/70"}`}
          aria-label="Search for a service"
        />
        {!compact && <button type="button" className="hidden items-center gap-1 rounded-lg border-l border-white/20 px-3 text-sm text-white/90 sm:flex">Categories <ChevronDown className="h-4 w-4" /></button>}
        <button type="button" onClick={() => search()} className={`${compact ? "bg-[#034d80]" : "bg-[#F28C28]"} rounded-lg px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]`}>{compact ? <Search className="h-4 w-4" /> : "Find service"}</button>
      </div>

      {open && (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
          <p className="px-3 pb-1 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Suggested services</p>
          {suggestions
            .filter((item) => item.toLowerCase().includes(query.toLowerCase()))
            .map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => search(item)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-sky-50"
              >
                <Search className="h-4 w-4 text-[#2e96d4]" />{item}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}