import { useMemo, useState } from "react";
import { Edit3, Trash2, Plus, Copy, X } from "lucide-react";

const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function formatHours(slots) {
    // naive total hours per day
    return slots.reduce((sum, s) => {
        const [sh, sm] = s.start.split(":");
        const [eh, em] = s.end.split(":");
        const start = Number(sh) + Number(sm) / 60;
        const end = Number(eh) + Number(em) / 60;
        return sum + Math.max(0, end - start);
    }, 0);
}

export default function Availability() {
    const [selectedDay, setSelectedDay] = useState(WEEK_DAYS[0]);
    const [days, setDays] = useState(() => {
        const base = {};
        WEEK_DAYS.forEach((d) => {
            base[d] = [];
        });
        // sample slots for Monday
        base[WEEK_DAYS[0]] = [
            { id: 1, start: "09:00", end: "12:00" },
            { id: 2, start: "14:00", end: "17:00" },
        ];
        return base;
    });

    const [editing, setEditing] = useState(null);
    const [slotDraft, setSlotDraft] = useState({ start: "09:00", end: "17:00" });

    const slotsForSelected = days[selectedDay] || [];

    const weeklyTotals = useMemo(() => {
        const totals = WEEK_DAYS.map((d) => ({ day: d, hours: formatHours(days[d] || []) }));
        const week = totals.reduce((s, t) => s + t.hours, 0);
        return { totals, week };
    }, [days]);

    function addSlot(day, slot) {
        setDays((s) => ({ ...s, [day]: [...s[day], { ...slot, id: Date.now() }] }));
    }

    function updateSlot(day, id, payload) {
        setDays((s) => ({
            ...s,
            [day]: s[day].map((sl) => (sl.id === id ? { ...sl, ...payload } : sl)),
        }));
    }

    function deleteSlot(day, id) {
        setDays((s) => ({ ...s, [day]: s[day].filter((sl) => sl.id !== id) }));
    }

    function copyToAll(day) {
        setDays((s) => {
            const newDays = { ...s };
            WEEK_DAYS.forEach((d) => {
                newDays[d] = newDays[day].map((sl) => ({ ...sl, id: Date.now() + Math.random() }));
            });
            return newDays;
        });
    }

    function clearAll() {
        setDays((s) => {
            const cleared = {};
            WEEK_DAYS.forEach((d) => (cleared[d] = []));
            return cleared;
        });
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] ml-64 p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
                    <p className="mt-2 text-gray-600 max-w-2xl">Set your working hours and manage your schedule.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => addSlot(selectedDay, slotDraft)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#056db3] px-4 py-2 text-sm font-medium text-white hover:bg-[#045ca0]"
                    >
                        <Plus className="h-4 w-4" /> Add Time Slot
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <aside className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm sticky top-6 h-fit">
                    <h3 className="text-sm font-semibold text-gray-700">Days</h3>
                    <div className="mt-3 space-y-2">
                        {WEEK_DAYS.map((d) => (
                            <button
                                key={d}
                                onClick={() => setSelectedDay(d)}
                                className={`w-full text-left px-3 py-2 rounded-lg font-medium ${
                                    selectedDay === d ? "bg-[#e6f3fb] border border-[#cbe9fb] text-[#056db3]" : "text-gray-700 hover:bg-gray-50"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{d}</span>
                                    <span className="text-sm text-gray-500">{(days[d] || []).length} slots</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <button onClick={() => copyToAll(selectedDay)} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium">
                            <Copy className="h-4 w-4" /> Copy to All Days
                        </button>
                        <button onClick={clearAll} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium">
                            <X className="h-4 w-4" /> Clear All
                        </button>
                    </div>
                </aside>

                <main className="lg:col-span-2 space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{selectedDay}</h2>
                                <p className="text-sm text-gray-600">Manage slots for {selectedDay}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => copyToAll(selectedDay)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">Copy to all</button>
                                <button onClick={clearAll} className="rounded-lg border border-gray-200 px-3 py-2 text-sm">Clear all</button>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {slotsForSelected.length === 0 && <p className="text-sm text-gray-500">No slots for this day yet.</p>}

                            {slotsForSelected.map((slot) => (
                                <div key={slot.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                                    <div>
                                        <p className="font-medium">{slot.start} - {slot.end}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditing(slot.id);
                                                setSlotDraft({ start: slot.start, end: slot.end });
                                            }}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                        >
                                            <Edit3 className="h-4 w-4" /> Edit
                                        </button>
                                        <button onClick={() => deleteSlot(selectedDay, slot.id)} className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {editing && (
                                <div className="mt-2 rounded-lg border border-gray-100 p-3">
                                    <div className="flex gap-2 items-center">
                                        <input value={slotDraft.start} onChange={(e) => setSlotDraft(s => ({...s, start: e.target.value}))} type="time" className="rounded-lg border border-gray-200 p-2" />
                                        <span className="text-sm text-gray-500">to</span>
                                        <input value={slotDraft.end} onChange={(e) => setSlotDraft(s => ({...s, end: e.target.value}))} type="time" className="rounded-lg border border-gray-200 p-2" />
                                        <button onClick={() => { updateSlot(selectedDay, editing, slotDraft); setEditing(null); }} className="ml-2 rounded-lg bg-[#056db3] px-3 py-2 text-white">Save</button>
                                        <button onClick={() => setEditing(null)} className="ml-2 rounded-lg border border-gray-200 px-3 py-2">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">Weekly Overview</h3>
                        <div className="mt-3 flex items-end gap-3">
                            {weeklyTotals.totals.map((t) => (
                                <div key={t.day} className="flex flex-col items-center">
                                    <div className="h-24 w-8 bg-[#056db3] rounded-md" style={{ height: `${Math.max(6, t.hours * 10)}px` }} />
                                    <span className="text-sm mt-2 text-gray-700">{t.day.slice(0,3)}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 text-sm text-gray-700">Total this week: <span className="font-semibold">{weeklyTotals.week.toFixed(1)} hrs</span></div>
                    </div>
                </main>
            </div>
        </div>
    );
}