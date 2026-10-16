// src/components/filters/FilterSidebar.jsx
// Matches Figma exactly:
// - "Filters" heading + "Clear All" link
// - Service Category with dark filled radio bullets
// - Location dropdown (All Locations) + autocomplete input
// - Price Range (KES/hr) with two number inputs + dash between
// - Minimum Rating with star icon rows (4.5+, 4+, 3.5+, 3+)
// - Verified Workers Only checkbox
import { useState, useRef, useEffect } from "react";
import { geocodeAddress, getLocationSuggestions } from "../../services/discoveryApi";
import { useGeolocation } from "../../hooks/useGeolocation";

const STATIC_CATS = ["All Services","Plumbing","Electrical","Cleaning","Carpentry","Painting","Gardening"];
const LOCATIONS   = ["All Locations","Westlands, Nairobi","Kilimani, Nairobi","Lavington, Nairobi","Parklands, Nairobi","Karen, Nairobi","Eastleigh, Nairobi","Runda, Nairobi","South B, Nairobi"];
const RATINGS     = [
  { label: "4.5+", value: 4.5 },
  { label: "4+",   value: 4.0 },
  { label: "3.5+", value: 3.5 },
  { label: "3+",   value: 3.0 },
];

const FilterSidebar = ({ filters, categories, onSet, onSetLocation, onClearLocation, onReset }) => {
  const [locInput,    setLocInput]    = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDrop,    setShowDrop]    = useState(false);
  const debounce = useRef(null);
  const { location: gps, loading: gpsLoad, get: getGPS } = useGeolocation();

  useEffect(() => {
    if (gps) { onSetLocation(gps.latitude, gps.longitude); setLocInput("My current location"); }
  }, [gps]);

  const handleLocType = (val) => {
    setLocInput(val);
    clearTimeout(debounce.current);
    if (val.length < 2) { setSuggestions([]); return; }
    debounce.current = setTimeout(async () => {
      const list = await getLocationSuggestions(val);
      setSuggestions(list);
      setShowDrop(list.length > 0);
    }, 350);
  };

  const pickSuggestion = async (s) => {
    setLocInput(s.description);
    setShowDrop(false);
    setSuggestions([]);
    const geo = await geocodeAddress(s.description);
    if (geo) onSetLocation(geo.latitude, geo.longitude);
  };

  const cats = categories.length > 0 ? ["All Services", ...categories] : STATIC_CATS;

  return (
    <div className="filter-sidebar shrink-0 rounded-xl border border-gray-200 bg-white p-5 shadow-sm" style={{ width: 220 }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-base font-bold text-gray-900">Filters</span>
        <button onClick={onReset} className="text-sm font-medium text-[#056db3] hover:text-[#045b96]">
          Clear All
        </button>
      </div>

      {/* ── Service Category ─────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2.5">Service Category</p>
        <div className="flex flex-col gap-1.5">
          {cats.map((cat) => {
            const val    = cat === "All Services" ? "" : cat;
            const active = filters.category === val;
            return (
              <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                {/* Dark filled circle matching Figma */}
                <span
                  onClick={() => onSet("category", val)}
                  className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-colors
                    ${active ? "bg-[#056db3] border-[#056db3]" : "bg-white border-gray-400"}`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span
                  onClick={() => onSet("category", val)}
                  className={`text-sm cursor-pointer ${active ? "text-gray-900 font-semibold" : "text-gray-700"}`}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Location ─────────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2">Location</p>

        {/* Dropdown matching Figma */}
        <div className="relative mb-2">
          <select
            className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
            onChange={(e) => {
              const v = e.target.value;
              if (v === "All Locations") { onClearLocation(); setLocInput(""); }
              else { pickSuggestion({ description: v }); }
            }}
          >
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        {/* Text search */}
        <div className="relative">
          <input
            type="text" placeholder="Search location..."
            value={locInput}
            onChange={(e) => handleLocType(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 180)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
          />
          {showDrop && suggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-40 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s.place_id} onMouseDown={() => pickSuggestion(s)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0">
                  📍 {s.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button onClick={getGPS} disabled={gpsLoad}
          className="mt-1.5 text-xs font-medium text-[#056db3] hover:text-[#045b96] disabled:opacity-50">
          {gpsLoad ? "Detecting..." : "📍 Use my current location"}
        </button>

        {filters.latitude && (
          <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
            <span>Radius: <b>{filters.radius_km}km</b></span>
            <button onClick={onClearLocation} className="text-blue-600 hover:text-blue-800">Clear</button>
          </div>
        )}
      </div>

      {/* ── Price Range ───────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2">Price Range (KES/hr)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={filters.min_price}
            onChange={(e) => onSet("min_price", Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
          />
          <span className="text-gray-400 shrink-0">-</span>
          <input
            type="number"
            value={filters.max_price}
            onChange={(e) => onSet("max_price", Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
          />
        </div>
      </div>

      {/* ── Minimum Rating ────────────────────────────── */}
      <div className="mb-5">
        <p className="text-sm font-semibold text-gray-800 mb-2.5">Minimum Rating</p>
        <div className="flex flex-col gap-2">
          {RATINGS.map((r) => {
            const active = filters.min_rating === r.value;
            return (
              <label key={r.label} className="flex items-center gap-2 cursor-pointer"
                onClick={() => onSet("min_rating", active ? null : r.value)}>
                {/* Radio bullet matching Figma */}
                <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors
                  ${active ? "bg-[#056db3] border-[#056db3]" : "bg-white border-gray-400"}`}>
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                <span className={`text-sm ${active ? "text-gray-900 font-semibold" : "text-gray-700"}`}>
                  {r.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Verified Workers Only ─────────────────────── */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => onSet("verified_only", !filters.verified_only)}>
          {/* Square checkbox matching Figma */}
          <span className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
            ${filters.verified_only ? "bg-[#056db3] border-[#056db3]" : "border-gray-400 bg-white"}`}>
            {filters.verified_only && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
              </svg>
            )}
          </span>
          <span className="text-sm text-gray-700 font-medium">Verified Workers Only</span>
        </label>
      </div>
    </div>
  );
};

export default FilterSidebar;