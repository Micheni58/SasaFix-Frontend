import { useState } from "react";
import { Check, Moon, Sun } from "lucide-react";
import { applyTheme, getThemePreference } from "../../utils/theme";

const themeOptions = [
  {
    id: "light",
    title: "Light mode",
    description: "A crisp, bright look for daytime use.",
    icon: Sun,
    preview: "bg-gradient-to-br from-white via-slate-50 to-blue-100",
  },
  {
    id: "dark",
    title: "Dark mode",
    description: "A softer, low-light look that’s easy on the eyes.",
    icon: Moon,
    preview: "bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950",
  },
];

export default function ThemeSettings() {
  const [theme, setTheme] = useState(getThemePreference);

  const selectTheme = (nextTheme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <section aria-labelledby="theme-settings-title">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#056db3]">
          {theme === "dark" ? <Moon size={20} /> : <Sun size={20} />}
        </div>
        <div>
          <h2 id="theme-settings-title" className="text-xl font-bold text-gray-900">
            Theme
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Choose how Sasafix looks on your signed-in pages. This preference is saved for your account on this device.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2" role="group" aria-label="Color theme">
        {themeOptions.map(({ id, title, description, icon: _Icon, preview }) => {
          const selected = theme === id;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              onClick={() => selectTheme(id)}
              className={`group overflow-hidden rounded-2xl border text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                selected
                  ? "border-[#056db3] bg-blue-50/50 shadow-md ring-1 ring-[#056db3]/20"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
            >
              <div className={`relative h-28 p-4 ${preview}`}>
                <div className="absolute inset-x-4 top-4 h-5 rounded-md bg-white/80 shadow-sm" />
                <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                  <div className="h-10 w-1/3 rounded-lg bg-white/85 shadow-sm" />
                  <div className="h-10 flex-1 rounded-lg bg-white/55 shadow-sm" />
                </div>
                <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#056db3] shadow-sm">
                  {selected ? <Check size={16} strokeWidth={2.5} /> : <_Icon size={15} />}
                </span>
              </div>

              <div className="flex items-start gap-3 p-4">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  selected ? "bg-[#056db3] text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  <_Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    {title}
                    {selected && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#056db3]">
                        Active
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-5 flex items-center gap-2 text-xs text-gray-500" role="status" aria-live="polite">
        <Check size={14} className="text-emerald-500" />
        Theme preference saved automatically.
      </p>
    </section>
  );
}