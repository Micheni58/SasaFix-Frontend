// src/pages/ServiceProvider/quotes/SubmitQuote.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, MapPin, Image as ImageIcon, X, DollarSign, Clock,
  Send, Loader2, AlertCircle, Calendar as CalendarIcon, ChevronRight, Target,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import bookingRequestService from "../../../api/bookingRequestService";
import bookingService from "../../../api/bookingService";
import quoteService from "../../../api/quoteService";
import { useToast } from "../../../components/ui/ToastProvider";
import { getStoredProviderId } from "../../../utils/sidebarRole";

// ── Skeleton that mirrors the real page ──
const SubmitQuoteSkeleton = () => (
  <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 animate-pulse">
    <div className="lg:col-span-3 space-y-4">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="h-6 w-2/3 bg-gray-200 rounded mb-3" />
        <div className="h-4 w-24 bg-gray-200 rounded mb-5" />
        <div className="space-y-2 mb-5">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
          <div className="h-3 w-4/6 bg-gray-100 rounded" />
        </div>
        <div className="h-12 w-full bg-gray-100 rounded-lg" />
        <div className="mt-4 flex gap-2">
          <div className="h-20 w-20 bg-gray-100 rounded-lg" />
          <div className="h-20 w-20 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
    <div className="lg:col-span-2">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="h-6 w-40 bg-gray-200 rounded mb-5" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-11 w-full bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="mt-6 h-12 w-full bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Time Slot Component (mirrors CreateBooking) ──
const TimeSlot = ({ time, label, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(time)}
    className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all ${
      isSelected
        ? "bg-[#056db3] text-white shadow-md shadow-[#056db3]/25 scale-105"
        : "bg-gray-50 text-gray-700 hover:bg-blue-50 border-2 border-transparent hover:border-[#056db3]"
    }`}
  >
    {label}
    {isSelected && (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] text-white">
        ✓
      </span>
    )}
  </button>
);

const SubmitQuote = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const providerId = getStoredProviderId();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Availability state
  const [providerAvailability, setProviderAvailability] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [nextAvailableError, setNextAvailableError] = useState("");

  const [form, setForm] = useState({
    amount: "",
    estimated_duration_hours: "",
    message: "",
  });

  // Load request + provider's own availability
  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingRequestService.getRequestDetails(requestId);
        if (data.status !== "open") {
          setError("This request is no longer accepting quotes.");
        } else {
          setRequest(data);

          // Prefill date/time from the client's request if provided
          if (data.preferred_date) {
            try {
              const preferred = new Date(data.preferred_date + "T00:00:00");
              if (!isNaN(preferred.getTime())) {
                setSelectedDate(preferred);
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err) {
        setError(err.response?.data?.detail || "Could not load this request.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [requestId]);

  // Load provider's availability
  useEffect(() => {
    if (!providerId) return;

    const loadAvailability = async () => {
      try {
        const availability = await bookingService.getProviderAvailability(providerId);
        setProviderAvailability(availability || []);
        if (availability && availability.length > 0) {
          generateAvailableDates(availability);
        }
      } catch (err) {
        console.warn("Could not load availability:", err);
        setProviderAvailability([]);
      }
    };

    loadAvailability();
  }, [providerId]);

  const generateAvailableDates = (availability) => {
    const dates = [];
    const today = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const availableDays = availability
      .filter((a) => a.is_available)
      .map((a) => a.day_of_week);

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = days[date.getDay()];

      if (availableDays.includes(dayName)) {
        dates.push(date);
      }
    }

    setAvailableDates(dates);
  };

  // Update time slots when a date is picked
  useEffect(() => {
    if (!selectedDate || providerAvailability.length === 0) {
      setAvailableTimeSlots([]);
      setSelectedTime(null);
      return;
    }

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = days[selectedDate.getDay()];

    const dayAvailability = providerAvailability.find(
      (avail) => avail.day_of_week === dayName && avail.is_available
    );

    if (dayAvailability) {
      const startHour = parseInt(dayAvailability.start_time.split(":")[0]);
      const endHour = parseInt(dayAvailability.end_time.split(":")[0]);
      const slots = [];

      for (let hour = startHour; hour < endHour; hour++) {
        const hourStr = hour.toString().padStart(2, "0");
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const timeValue = `${hourStr}:00`;
        slots.push({
          value: timeValue,
          label: `${displayHour}:00 ${ampm}`,
          time: timeValue,
        });
      }
      setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDate, providerAvailability]);

  const isDateAvailable = (date) => availableDates.some((d) => isSameDay(d, date));

  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
      setNextAvailableError("");
    }
  };

  const handleNextAvailable = () => {
    const today = new Date();
    let nextDate = null;
    for (const date of availableDates) {
      if (date >= today) {
        nextDate = date;
        break;
      }
    }
    if (nextDate) {
      setSelectedDate(nextDate);
      setSelectedTime(null);
      setNextAvailableError("");
    } else {
      setNextAvailableError("No available dates in the next 60 days.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) {
      toast.warning("Invalid amount", "Please enter a valid quote amount.");
      return;
    }

    setSubmitting(true);
    try {
      await quoteService.submitQuote(requestId, {
        amount,
        estimated_duration_hours: form.estimated_duration_hours
          ? parseFloat(form.estimated_duration_hours)
          : null,
        message: form.message.trim() || null,
        // Optionally include the provider's availability hint
        preferred_date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : null,
        preferred_start_time: selectedTime ? `${selectedTime}:00` : null,
      });
      toast.success("Quote sent", "The client will review your quote shortly.");
      navigate("/provider/quotes");
    } catch (err) {
      toast.error("Failed to send quote", err.response?.data?.detail || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-4 sm:px-6 pb-10">
            <SubmitQuoteSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-4 sm:px-6 flex items-center justify-center">
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-8 max-w-md text-center">
              <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-500" />
              <p className="font-semibold text-lg mb-2">Cannot submit quote</p>
              <p>{error}</p>
              <button
                onClick={() => navigate("/provider/quotes")}
                className="mt-6 rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-semibold hover:bg-red-700"
              >
                Back to Open Requests
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const hasBudget = request.budget_min || request.budget_max;

  const modifiers = {
    available: (date) => isDateAvailable(date),
    unavailable: (date) => !isDateAvailable(date) && date >= new Date(),
    past: (date) => date < new Date(),
  };

  const modifiersStyles = {
    available: {
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
      borderRadius: "50%",
      fontWeight: "600",
    },
    unavailable: {
      color: "#bdbdbd",
      textDecoration: "line-through",
      cursor: "not-allowed",
    },
    past: {
      color: "#e0e0e0",
      cursor: "not-allowed",
    },
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-4 sm:px-6 pb-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Request Details */}
            <div className="lg:col-span-3 space-y-4">
              <button
                onClick={() => navigate("/provider/quotes")}
                className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#056db3]"
              >
                <ChevronLeft className="h-4 w-4" /> Back to Requests
              </button>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h1 className="text-xl font-bold text-gray-900 mb-1">{request.title}</h1>
                <span className="inline-block mb-4 text-xs font-medium bg-blue-50 text-[#056db3] px-2 py-0.5 rounded">
                  {request.service_category}
                </span>

                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mb-5">
                  {request.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3">
                  <MapPin className="h-4 w-4 text-gray-400" /> {request.location}
                </div>

                {hasBudget && (
                  <div className="flex items-start gap-2 text-sm bg-green-50 border border-green-100 p-3 rounded-lg">
                    <Target className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800 text-xs uppercase tracking-wider">
                        Client's Budget
                      </p>
                      <p className="text-green-700 font-medium mt-0.5">
                        {request.budget_min && request.budget_max
                          ? `KES ${request.budget_min.toLocaleString()} – ${request.budget_max.toLocaleString()}`
                          : request.budget_min
                          ? `From KES ${request.budget_min.toLocaleString()}`
                          : `Up to KES ${request.budget_max.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                )}

                {request.photos?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Attached Photos
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {request.photos.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setLightboxImage(p.url)}
                          className="relative group shrink-0 rounded-lg overflow-hidden border border-gray-200"
                        >
                          <img
                            src={p.url}
                            alt="Job"
                            className="h-20 w-20 object-cover group-hover:opacity-80"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20">
                            <ImageIcon className="h-5 w-5 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Availability calendar */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-[#056db3]" />
                    <h2 className="text-base font-semibold text-gray-900">
                      Your availability
                    </h2>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      onClick={handleNextAvailable}
                      className="text-xs font-medium text-[#056db3] hover:text-[#045a94] transition-colors flex items-center gap-1"
                    >
                      Next available
                      <ChevronRight className="h-3 w-3" />
                    </button>
                    {nextAvailableError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {nextAvailableError}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  Pick a date you can start the job. This helps the client
                  know when you're free. It's optional — you can also arrange
                  details with the client after they accept.
                </p>

                {availableDates.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
                    <p className="text-sm text-gray-500">
                      You haven't set your availability yet.
                    </p>
                    <button
                      onClick={() => navigate("/provider/profile")}
                      className="mt-3 text-sm font-medium text-[#056db3] hover:underline"
                    >
                      Set availability
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50/50">
                      <DayPicker
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateSelect}
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                        disabled={[
                          { before: new Date() },
                          (date) => !isDateAvailable(date),
                        ]}
                        className="m-0!"
                      />
                    </div>

                    {selectedDate && availableTimeSlots.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Start time on {format(selectedDate, "EEE, MMM d")}
                        </p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {availableTimeSlots.map((slot) => (
                            <TimeSlot
                              key={slot.value}
                              time={slot.value}
                              label={slot.label}
                              isSelected={selectedTime === slot.value}
                              onSelect={setSelectedTime}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDate && availableTimeSlots.length === 0 && (
                      <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-700">
                        You're not available on this day. Pick another date or update
                        your availability in your profile.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Right: Quote Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24"
              >
                <h2 className="text-lg font-bold text-gray-900 mb-5">Send a Quote</h2>

                <div className="space-y-4">
                  {hasBudget && (
                    <div className="flex items-center justify-between rounded-lg bg-gray-50 border border-gray-200 px-3 py-2">
                      <span className="text-xs font-medium text-gray-600">Client's budget</span>
                      <span className="text-xs font-semibold text-green-700">
                        {request.budget_min && request.budget_max
                          ? `KES ${request.budget_min.toLocaleString()} – ${request.budget_max.toLocaleString()}`
                          : request.budget_min
                          ? `From ${request.budget_min.toLocaleString()}`
                          : `Up to ${request.budget_max.toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <DollarSign className="h-4 w-4 text-[#056db3]" /> Your Quote Amount (KES) *
                    </label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder={request.budget_max ? `e.g. ${Math.round(request.budget_max * 0.9)}` : "e.g. 4500"}
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 outline-none"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                      <Clock className="h-4 w-4 text-[#056db3]" /> Estimated Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="e.g. 2"
                      value={form.estimated_duration_hours}
                      onChange={(e) =>
                        setForm({ ...form, estimated_duration_hours: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 outline-none"
                    />
                  </div>

                  {/* Selected schedule summary */}
                  {(selectedDate || selectedTime) && (
                    <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm">
                      <p className="text-xs font-medium text-[#056db3] mb-0.5">
                        Proposed start
                      </p>
                      <p className="text-gray-800 font-medium">
                        {selectedDate ? format(selectedDate, "EEE, MMM d") : "Date TBD"}
                        {selectedTime ? ` at ${selectedTime}` : ""}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      placeholder="What's included? When can you start?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full rounded-xl bg-[#056db3] px-6 py-3 text-sm font-semibold text-white hover:bg-[#045a94] disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send Quote
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>

      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button
            className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={lightboxImage}
            alt="Enlarged"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default SubmitQuote;