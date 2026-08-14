import { useEffect, useMemo, useState } from "react";
import { Clock3, Copy, X } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import authService from "../../services/api";

const BRAND = "#056db3";
const BRAND_DARK = "#045ca0";
const BRAND_LIGHT = "#e8f3fb";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_DAYS = WEEK_DAYS.reduce((acc, day) => {
  acc[day] = {
    enabled: !["Saturday", "Sunday"].includes(day),
    start: "09:00",
    end: "17:00",
  };
  return acc;
}, {});

function dayHours({ enabled, start, end }) {
  if (!enabled) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh + em / 60 - (sh + sm / 60));
}

function formatTime(value) {
  const [hourString, minute] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minute} ${suffix}`;
}

const Toast = ({ msg, ok }) => (
  <div
    className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white flex items-center gap-2 ${
      ok ? "bg-green-500" : "bg-red-500"
    }`}
  >
    {ok ? "✓" : "✕"} {msg}
  </div>
);

export default function Availability() {
  const providerId = authService.getStoredUser()?.provider_id;

  const [selectedDay, setSelectedDay] = useState("Monday");
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!providerId) {
      setLoading(false);
      return;
    }
    fetch(`http://localhost:8000/api/providers/${providerId}/availability`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDays((current) => {
            const next = { ...current };
            WEEK_DAYS.forEach((day) => {
              const existing = data.find((d) => d.day_of_week === day);
              next[day] = existing
                ? {
                    enabled: existing.is_available,
                    start: existing.start_time,
                    end: existing.end_time,
                  }
                : { enabled: false, start: "09:00", end: "17:00" };
            });
            return next;
          });
        }
      })
      .catch(() => {
        showToast("Couldn't load availability. Showing defaults.", false);
      })
      .finally(() => setLoading(false));
  }, [providerId]);

  const weeklyTotals = useMemo(() => {
    const totals = WEEK_DAYS.map((day) => ({
      day,
      hours: dayHours(days[day]),
    }));
    return {
      totals,
      weekHours: totals.reduce((sum, item) => sum + item.hours, 0),
    };
  }, [days]);

  const current = days[selectedDay];

  const updateSelected = (patch) =>
    setDays((prev) => ({
      ...prev,
      [selectedDay]: { ...prev[selectedDay], ...patch },
    }));

  const copyToAllDays = () => {
    setDays((prev) => {
      const source = prev[selectedDay];
      const next = {};
      WEEK_DAYS.forEach((day) => {
        next[day] = { ...source };
      });
      return next;
    });
    showToast(`Applied ${selectedDay}'s hours to every day.`);
  };

  const clearAllSlots = () => {
    setDays((prev) => {
      const next = {};
      WEEK_DAYS.forEach((day) => {
        next[day] = { ...prev[day], enabled: false };
      });
      return next;
    });
    showToast("All days marked unavailable.");
  };

  const handleSave = async () => {
    if (!providerId) {
      showToast("No provider account found.", false);
      return;
    }
    setSaving(true);
    try {
      const payload = WEEK_DAYS.map((day) => ({
        day,
        start_time: days[day].start,
        end_time: days[day].end,
        is_available: days[day].enabled,
      }));
      const res = await fetch(
        `http://localhost:8000/api/providers/${providerId}/availability`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const e = await res.json();
        throw new Error(e.detail);
      }
      showToast("Availability updated.");
    } catch (e) {
      showToast(e.message || "Save failed.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          {toast && <Toast msg={toast.msg} ok={toast.ok} />}

          <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Availability Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Set your working hours and manage your schedule
              </p>
            </div>

            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
              onMouseEnter={(e) =>
                !saving && (e.target.style.backgroundColor = BRAND_DARK)
              }
              onMouseLeave={(e) => (e.target.style.backgroundColor = BRAND)}
            >
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </section>

          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-sm text-gray-400 shadow-sm">
              Loading availability…
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
              <aside className="sticky top-6 h-fit rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                {WEEK_DAYS.map((day) => {
                  const isActive = day === selectedDay;
                  const d = days[day];
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`mb-2 w-full rounded-lg border px-3 py-2 text-left transition-colors last:mb-0 ${
                        isActive
                          ? "border-blue-200 bg-blue-50"
                          : "border-transparent bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span
                          className={`text-sm ${
                            isActive
                              ? "font-semibold text-[#056db3]"
                              : "text-gray-700"
                          }`}
                        >
                          {day}
                        </span>
                        <span className="text-xs text-gray-500">
                          {d.enabled ? formatTime(d.start) : "Off"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </aside>

              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedDay}
                  </h2>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={current.enabled}
                      onChange={(e) =>
                        updateSelected({ enabled: e.target.checked })
                      }
                      style={{
                        width: 18,
                        height: 18,
                        accentColor: BRAND,
                        cursor: "pointer",
                      }}
                    />
                    Available
                  </label>
                </div>

                {current.enabled ? (
                  <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 lg:flex-row lg:items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full">
                      <Clock3 className="h-5 w-5" style={{ color: BRAND }} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="time"
                        value={current.start}
                        onChange={(e) =>
                          updateSelected({ start: e.target.value })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#056db3]"
                      />
                      <span className="text-sm text-gray-400">to</span>
                      <input
                        type="time"
                        value={current.end}
                        onChange={(e) =>
                          updateSelected({ end: e.target.value })
                        }
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#056db3]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-400">
                    Marked unavailable on {selectedDay}
                  </div>
                )}
              </section>

              <section className="sticky top-96 h-fit rounded-lg border border-gray-200 bg-blue-50 p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-gray-900">
                  Quick Actions
                </h2>
                <div className="mt-3 space-y-2">
                  <button
                    onClick={copyToAllDays}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-100"
                    style={{ borderColor: BRAND, color: BRAND }}
                  >
                    <Copy className="h-4 w-4" />
                    Copy to All Days
                  </button>
                  <button
                    onClick={clearAllSlots}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-100"
                    style={{ borderColor: BRAND, color: BRAND }}
                  >
                    <X className="h-4 w-4" />
                    Clear All Days
                  </button>
                </div>
              </section>

              <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900">
                  Weekly Overview
                </h2>

                <div className="mt-4 grid grid-cols-7 gap-2">
                  {weeklyTotals.totals.map((item) => (
                    <div
                      key={item.day}
                      className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-center"
                    >
                      <p className="text-xs font-medium text-gray-600">
                        {item.day.slice(0, 3)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-gray-900">
                        {item.hours.toFixed(0)}h
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      Total Weekly Hours
                    </span>
                    <span className="font-semibold text-gray-900">
                      {weeklyTotals.weekHours.toFixed(0)} hours
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
