import { useMemo, useState } from "react";
import { Clock3, Copy, Edit3, Plus, Trash2, X } from "lucide-react";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const INITIAL_SLOTS = {
  Monday: [
    { id: 1, start: "09:00", end: "12:00", booked: false },
    { id: 2, start: "14:00", end: "17:00", booked: false },
  ],
  Tuesday: [
    { id: 3, start: "09:00", end: "12:00", booked: true },
    { id: 4, start: "14:00", end: "18:00", booked: false },
  ],
  Wednesday: [
    { id: 5, start: "09:00", end: "12:00", booked: false },
    { id: 6, start: "14:00", end: "17:00", booked: false },
  ],
  Thursday: [{ id: 7, start: "10:00", end: "18:00", booked: false }],
  Friday: [{ id: 8, start: "09:00", end: "15:00", booked: false }],
  Saturday: [{ id: 9, start: "10:00", end: "14:00", booked: false }],
  Sunday: [],
};

function formatHours(slots) {
  return slots.reduce((sum, slot) => {
    const [sh, sm] = slot.start.split(":").map(Number);
    const [eh, em] = slot.end.split(":").map(Number);
    return sum + Math.max(0, eh + em / 60 - (sh + sm / 60));
  }, 0);
}

function formatTime(value) {
  const [hourString, minute] = value.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minute} ${suffix}`;
}

export default function Availability() {
  const [selectedDay, setSelectedDay] = useState("Tuesday");
  const [days, setDays] = useState(INITIAL_SLOTS);
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [slotDraft, setSlotDraft] = useState({ start: "09:00", end: "12:00" });

  const slotsForSelected = days[selectedDay] || [];

  const weeklyTotals = useMemo(() => {
    const totals = WEEK_DAYS.map((day) => {
      const slots = days[day] || [];
      return { day, hours: formatHours(slots), slots: slots.length };
    });

    return {
      totals,
      weekHours: totals.reduce((sum, item) => sum + item.hours, 0),
    };
  }, [days]);

  function beginAddSlot() {
    setEditingSlotId("new");
    setSlotDraft({ start: "09:00", end: "12:00" });
  }

  function beginEditSlot(slot) {
    setEditingSlotId(slot.id);
    setSlotDraft({ start: slot.start, end: slot.end });
  }

  function saveSlot() {
    if (editingSlotId === "new") {
      setDays((current) => ({
        ...current,
        [selectedDay]: [
          ...current[selectedDay],
          { id: Date.now(), start: slotDraft.start, end: slotDraft.end, booked: false },
        ],
      }));
    } else {
      setDays((current) => ({
        ...current,
        [selectedDay]: current[selectedDay].map((slot) =>
          slot.id === editingSlotId ? { ...slot, start: slotDraft.start, end: slotDraft.end } : slot
        ),
      }));
    }

    setEditingSlotId(null);
  }

  function deleteSlot(slotId) {
    setDays((current) => ({
      ...current,
      [selectedDay]: current[selectedDay].filter((slot) => slot.id !== slotId),
    }));
  }

  function copyToAllDays() {
    setDays((current) => {
      const source = current[selectedDay].map((slot) => ({
        ...slot,
        id: Date.now() + Math.random(),
      }));
      const next = {};
      WEEK_DAYS.forEach((day) => {
        next[day] = source.map((slot) => ({ ...slot, id: Date.now() + Math.random() }));
      });
      return next;
    });
  }

  function clearAllSlots() {
    setDays((current) => ({
      ...current,
      [selectedDay]: [],
    }));
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-6">
      <section className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
          <p className="mt-2 text-sm text-gray-600">Set your working hours and manage your schedule</p>
        </div>

        <button
          onClick={beginAddSlot}
          className="inline-flex items-center gap-2 rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#045ca0]"
        >
          <Plus className="h-5 w-5" />
          Add Time Slot
        </button>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[236px_minmax(0,1fr)]">
        <aside className="sticky top-6 h-fit rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
          {WEEK_DAYS.map((day) => {
            const daySlots = days[day] || [];
            const bookedCount = daySlots.filter((slot) => slot.booked).length;
            const isActive = day === selectedDay;

            return (
              <button
                key={day}
                onClick={() => {
                  setSelectedDay(day);
                  setEditingSlotId(null);
                }}
                className={`mb-2 w-full rounded-lg border px-3 py-2 text-left transition-colors last:mb-0 ${
                  isActive
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent bg-white hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`text-sm ${isActive ? "font-semibold text-[#056db3]" : "text-gray-700"}`}>
                    {day}
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">{daySlots.length} slots</span>
                    {bookedCount > 0 && (
                      <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-[#056db3]">
                        {bookedCount} booked
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{selectedDay}</h2>
            <span className="text-sm text-gray-500">{slotsForSelected.length} time slots</span>
          </div>

          <div className="space-y-4">
            {slotsForSelected.map((slot) => (
              <div
                key={slot.id}
                className={`flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between ${
                  slot.booked ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full">
                    <Clock3 className={`h-5 w-5 ${slot.booked ? "text-[#056db3]" : "text-gray-400"}`} />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-gray-700">
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                      {formatTime(slot.start)}
                    </div>
                    <span className="text-sm text-gray-400">to</span>
                    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
                      {formatTime(slot.end)}
                    </div>
                    {slot.booked && (
                      <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-[#056db3]">
                        Booked
                      </span>
                    )}
                  </div>
                </div>

                {!slot.booked && (
                  <div className="flex items-center gap-3 self-end lg:self-auto">
                    <button
                      onClick={() => beginEditSlot(slot)}
                      className="text-gray-400 transition-colors hover:text-[#056db3]"
                    >
                      <Edit3 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      className="text-red-500 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {editingSlotId && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slotDraft.start}
                      onChange={(event) =>
                        setSlotDraft((current) => ({ ...current, start: event.target.value }))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#056db3]"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <input
                      type="time"
                      value={slotDraft.end}
                      onChange={(event) =>
                        setSlotDraft((current) => ({ ...current, end: event.target.value }))
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-[#056db3]"
                    />
                  </div>
                  <div className="flex items-center gap-2 xl:ml-auto">
                    <button
                      onClick={() => setEditingSlotId(null)}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveSlot}
                      className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#045ca0]"
                    >
                      Save Slot
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!editingSlotId && (
              <button
                onClick={beginAddSlot}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#056db3] px-3 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-blue-50"
              >
                <Plus className="h-5 w-5" />
                Add Another Time Slot
              </button>
            )}
          </div>
        </section>

        <section className="sticky top-96 h-fit rounded-lg border border-gray-200  p-4 shadow-sm bg-blue-50">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <div className="mt-3 space-y-2">
            <button
              onClick={copyToAllDays}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2  border-[#056db3]  px-3 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-blue-100"
            >
              <Copy className="h-4 w-4" />
              Copy to All Days
            </button>
            <button
              onClick={clearAllSlots}
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#056db3] hover:blue-50  px-3 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
              Clear All Slots
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">Weekly Overview</h2>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {weeklyTotals.totals.map((item) => (
              <div
                key={item.day}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 text-center"
              >
                <p className="text-xs font-medium text-gray-600">{item.day.slice(0, 3)}</p>
                <p className="mt-2 text-sm font-bold text-gray-900">
                  {item.hours.toFixed(0)}h
                </p>
                <p className="mt-1 text-xs text-gray-500">{item.slots} s</p>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Total Weekly Hours</span>
              <span className="font-semibold text-gray-900">{weeklyTotals.weekHours.toFixed(0)} hours</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
