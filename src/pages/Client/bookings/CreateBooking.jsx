// src/pages/Client/CreateBooking.jsx

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Calendar as CalendarIcon,
  Clock3,
  MapPin,
  FileText,
  ShieldCheck,
  User,
  Star,
  Briefcase,
  ChevronLeft,
  AlertCircle,
  CheckCircle,
  X,
  Loader2,
  DollarSign,
  Wrench,
  ChevronRight,
  Sparkles,
  Check,
  X as CloseIcon,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";
import bookingService from "../../../api/bookingService";
import providerServiceApi from "../../../api/providerServiceApi";
import aiService from "../../../api/aiService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import { getProvider } from "../../../services/discoveryApi";

// ── Skeleton Components ──

function ProviderCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="mt-2 h-4 w-24 bg-gray-200 rounded" />
          <div className="mt-1 h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-7 w-40 bg-gray-200 rounded mb-6" />
      <div className="space-y-4">
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 rounded-xl" />
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-64 w-full bg-gray-200 rounded-xl" />
        </div>
        <div>
          <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
          <div className="h-12 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
      <div className="space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-3">
          <div className="h-5 w-20 bg-gray-200 rounded" />
          <div className="h-5 w-24 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="mt-4 h-12 w-full bg-gray-200 rounded-xl" />
      <div className="mt-2 h-12 w-full bg-gray-200 rounded-xl" />
    </div>
  );
}

// ── Time Slot Component ──

function TimeSlot({ time, label, isSelected, isAvailable, onSelect }) {
  return (
    <button
      onClick={() => isAvailable && onSelect(time)}
      disabled={!isAvailable}
      className={`relative rounded-xl px-4 py-3 text-sm font-medium transition-all ${
        isSelected
          ? "bg-[#056db3] text-white shadow-md shadow-[#056db3]/25 scale-105"
          : isAvailable
          ? "bg-gray-50 text-gray-700 hover:bg-blue-50 border-2 border-transparent hover:border-[#056db3]"
          : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
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
}

// ── Duration Preset Button ──

function DurationButton({ value, label, isSelected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all border-2 ${
        isSelected
          ? "bg-[#056db3] text-white border-[#056db3] shadow-md shadow-[#056db3]/20"
          : "bg-gray-50 text-gray-700 border-transparent hover:border-[#056db3] hover:bg-blue-50"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main Component ──

function CreateBooking() {
  const navigate = useNavigate();
  const { providerId: routeProviderId } = useParams();
  const [searchParams] = useSearchParams();
  const serviceIdParam = searchParams.get("serviceId");

  const [serviceType, setServiceType] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [providerServices, setProviderServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [serviceLocation, setServiceLocation] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [suggestedDescription, setSuggestedDescription] = useState("");
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);
  const [descriptionAiError, setDescriptionAiError] = useState("");
  const [aiUsage, setAiUsage] = useState(null);
  const [urgency, setUrgency] = useState("normal");
  const [providerId, setProviderId] = useState(null);
  const [providerName, setProviderName] = useState("");
  const [providerTrade, setProviderTrade] = useState("");
  const [providerRate, setProviderRate] = useState(0);
  const [providerRating, setProviderRating] = useState(0);
  const [providerJobsCompleted, setProviderJobsCompleted] = useState(0);
  const [durationHours, setDurationHours] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nextAvailableError, setNextAvailableError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [providerAvailability, setProviderAvailability] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const DURATION_PRESETS = [
    { value: 1, label: "1 hr" },
    { value: 2, label: "2 hrs" },
    { value: 3, label: "3 hrs" },
    { value: 4, label: "4 hrs" },
    { value: 6, label: "6 hrs" },
    { value: 8, label: "Full day" },
  ];

  const isFixedPrice = Boolean(selectedService);

  useEffect(() => {
    aiService.getClientAiUsage()
      .then(setAiUsage)
      .catch(() => {});
  }, []);

  const improveJobDescription = async () => {
    if (!jobDescription.trim()) return;
    if (aiUsage && !aiUsage.is_premium && aiUsage.remaining_uses <= 0) {
      setDescriptionAiError("You have used your 3 free AI improvements. Upgrade to Premium for unlimited access.");
      return;
    }

    setIsImprovingDescription(true);
    setDescriptionAiError("");
    setSuggestedDescription("");

    try {
      const result = await aiService.improveJobDescription(jobDescription.trim());
      setSuggestedDescription(result.improved_description || "");
      setAiUsage((current) => ({
        ...current,
        ...result,
      }));
      if (!result.improved_description) {
        setDescriptionAiError("AI did not return a suggestion. Please try again.");
      }
    } catch (aiError) {
      if (aiError.status === 403 || aiError.status === 429) {
        setAiUsage((current) => ({ ...current, remaining_uses: 0, is_premium: false }));
      }
      setDescriptionAiError(
        aiError.message || aiError.detail || "Unable to improve the description right now. Please try again."
      );
    } finally {
      setIsImprovingDescription(false);
    }
  };

  // Fetch provider data on mount
  useEffect(() => {
    if (!routeProviderId) {
      setError("No provider selected. Please go back and choose a provider.");
      setLoading(false);
      return;
    }

    const selectedProviderId = Number(routeProviderId);
    setProviderId(selectedProviderId);

    const fetchProviderData = async () => {
      try {
        setLoading(true);

        const [provider, services] = await Promise.all([
          getProvider(selectedProviderId),
          providerServiceApi.listProviderServices(selectedProviderId).catch(() => []),
        ]);

        if (provider) {
          setProviderName(
            `${provider.first_name || ""} ${provider.last_name || ""}`.trim() || "Provider"
          );
          setProviderTrade(provider.service_category || "");
          setProviderRate(Number(provider.hourly_rate) || 0);
          setProviderRating(provider.average_rating || 0);
          setProviderJobsCompleted(provider.total_jobs_completed || 0);
          const activeServices = services.filter(
            (service) => service && service.is_active !== false,
          );
          setProviderServices(activeServices);

          // Preselect a service when arriving from the provider's services tab.
          if (serviceIdParam) {
            const sid = Number(serviceIdParam);
            const match = activeServices.find((service) => Number(service.id) === sid);

            if (match) {
              setSelectedService(match);
              setServiceType(match.service_name || "Service");
              if (match.duration_minutes) {
                setDurationHours(Math.max(1, Math.round(match.duration_minutes / 60)));
              }
            } else {
              setSelectedService(null);
              setServiceType("");
            }
          } else {
            setSelectedService(null);
            setServiceType("");
          }
        }

        try {
          const availability = await bookingService.getProviderAvailability(selectedProviderId);
          setProviderAvailability(availability || []);

          if (availability && availability.length > 0) {
            generateAvailableDates(availability);
          }
        } catch (err) {
          console.warn("Could not fetch availability:", err);
          setProviderAvailability([]);
        }
      } catch (err) {
        console.error("Error fetching provider:", err);
        setError("Unable to load provider details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProviderData();
  }, [routeProviderId, serviceIdParam]);

  const handleServiceChange = (event) => {
    const value = event.target.value;

    if (value === "custom") {
      setSelectedService(null);
      setServiceType(providerTrade || "Custom service");
      setDurationHours(1);
      return;
    }

    const service = providerServices.find((item) => String(item.id) === value);
    setSelectedService(service || null);
    setServiceType(service?.service_name || "");
    if (service?.duration_minutes) {
      setDurationHours(Math.max(1, Math.round(service.duration_minutes / 60)));
    }
  };

  // Generate available dates based on provider's availability
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

  // Update time slots when date changes
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
      setSelectedTime(null);
    } else {
      setAvailableTimeSlots([]);
      setSelectedTime(null);
    }
  }, [selectedDate, providerAvailability]);

  // Check if a date is available
  const isDateAvailable = (date) => {
    return availableDates.some((d) => isSameDay(d, date));
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    if (date && isDateAvailable(date)) {
      setSelectedDate(date);
      setSelectedTime(null);
      setNextAvailableError("");
    }
  };

  // Handle "Next Available" button
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
      setNextAvailableError("No available dates found in the next 60 days.");
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!serviceType) {
      setError("Please select a service type.");
      return;
    }
    if (!selectedDate) {
      setError("Please select a date.");
      return;
    }
    if (!selectedTime) {
      setError("Please select a time.");
      return;
    }
    if (!serviceLocation) {
      setError("Please enter your location.");
      return;
    }

    setError("");
    setShowConfirmModal(true);
  };

  const doCreateBooking = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setError("");

    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      const clientId = Number(
        localStorage.getItem("userId") || storedUser.id || storedUser.user_id
      );

      if (!clientId || !providerId) {
        throw new Error("A client and service provider are required.");
      }

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      let endTime = null;
      if (selectedTime) {
        const [h, m] = selectedTime.split(":").map((s) => Number(s));
        const base = new Date();
        base.setHours(h, m || 0, 0, 0);
        const ms = base.getTime() + (Number(durationHours) || 0) * 60 * 60 * 1000;
        const end = new Date(ms);
        const pad = (n) => n.toString().padStart(2, "0");
        endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}:00`;
      }

      const payload = {
        client_id: clientId,
        service_provider_id: providerId,
        service_name: serviceType || "Service",
        description: jobDescription || "",
        scheduled_date: formattedDate,
        scheduled_start_time: selectedTime ? `${selectedTime}:00` : null,
        scheduled_end_time: endTime,
        location: serviceLocation || "",
        amount: isFixedPrice
          ? Math.round(Number(selectedService.price))
          : providerRate
          ? Math.round(providerRate * Number(durationHours || 1))
          : 0,
      };

      await bookingService.createBooking(payload);
      navigate("/client/my-bookings");
    } catch (bookingError) {
      setError(bookingError.message || "Unable to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/client/find-services");
  };

  // ── Cost calculations ──
  // Fixed-price: total is the service price. No hourly math, no urgency multiplier.
  // Hourly: rate × duration × urgency multiplier.
  const baseCost = isFixedPrice
    ? Number(selectedService.price) || 0
    : providerRate
    ? providerRate * Number(durationHours || 1)
    : 0;

  const urgencyMultiplier =
    urgency === "emergency" ? 1.3 : urgency === "urgent" ? 1.15 : 1;

  const urgencySurcharge =
    !isFixedPrice && urgency !== "normal"
      ? Math.round(baseCost * (urgencyMultiplier - 1))
      : 0;

  const totalCost = isFixedPrice
    ? Math.round(baseCost)
    : providerRate
    ? Math.round(baseCost * urgencyMultiplier)
    : 0;

  // Determine if confirm button should be disabled
  const canSubmit = serviceType && selectedDate && selectedTime && serviceLocation && !submitting;
  const missingFields = [];
  if (!serviceType) missingFields.push("a service type");
  if (!selectedDate) missingFields.push("a date");
  if (!selectedTime) missingFields.push("a time");
  if (!serviceLocation) missingFields.push("your location");

  // Custom calendar modifiers
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

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-4 sm:px-6 pb-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="mt-2 h-4 w-64 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <ProviderCardSkeleton />
                  <FormSkeleton />
                </div>
                <div className="lg:col-span-1">
                  <SidebarSkeleton />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error && !providerName) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="flex-1 ml-0 lg:ml-72">
          <Navbar />
          <main className="pt-24 px-4 sm:px-6 pb-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="h-8 w-8" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-gray-800">Unable to load provider</h2>
                <p className="mt-2 text-gray-600">{error}</p>
                <button
                  onClick={() => navigate("/client/find-services")}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#056db3] px-6 py-3 font-semibold text-white transition hover:bg-[#045a94]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Find Services
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-4 sm:px-6 pb-6">
          <div className="max-w-7xl mx-auto">

            {/* ── Header ── */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/client/find-services")}
                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#056db3] transition-colors group mb-2"
              >
                <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Find Services
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Create Booking</h1>
              <p className="text-gray-600 mt-1">Book {providerName} for your service needs</p>
            </div>

            {/* ── Global Error Banner ── */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ── Left Column ── */}
              <div className="lg:col-span-2 space-y-6">

                {/* ── Provider Card ── */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <User className="h-5 w-5 text-[#056db3]" />
                      Service Provider
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#056db3] to-[#034d80] text-2xl font-bold text-white shadow-md">
                        {providerName
                          ? providerName.split(" ").map((s) => s[0]).slice(0, 2).join("")
                          : "--"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-semibold text-gray-800">
                            {providerName || "Provider"}
                          </p>
                          {providerRating > 0 && (
                            <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              {providerRating.toFixed(1)}
                            </span>
                          )}
                          {providerJobsCompleted > 0 && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                              <Briefcase className="h-3 w-3" />
                              {providerJobsCompleted} jobs
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Wrench className="h-3.5 w-3.5" />
                          {providerTrade || "Professional"}
                        </p>
                        <p className="text-sm font-semibold text-[#056db3] mt-1">
                          {providerRate
                            ? `KES ${providerRate.toLocaleString()} / hour`
                            : "Rate not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ── Booking Form ── */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#056db3]" />
                      Booking Details
                    </h2>
                  </div>
                  <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Service Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Service Type
                        </label>
                        <select
                          value={selectedService ? String(selectedService.id) : serviceType ? "custom" : ""}
                          onChange={handleServiceChange}
                          required
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 transition-colors"
                        >
                          <option value="" disabled>
                            {providerServices.length ? "Select a service" : "Select a service type"}
                          </option>
                          {providerServices.map((service) => (
                            <option key={service.id} value={String(service.id)}>
                              {service.service_name} — KES {Number(service.price || 0).toLocaleString()}
                            </option>
                          ))}
                          <option value="custom">Custom job (hourly rate)</option>
                        </select>
                        <p className="text-xs text-gray-400 mt-1">
                          {isFixedPrice
                            ? "This service uses the provider’s listed fixed price."
                            : "Choose a listed service or request a custom job at the hourly rate."}
                        </p>
                      </div>

                      {/* Date Selection */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                            <CalendarIcon className="h-4 w-4 text-[#056db3]" />
                            Select Date
                          </label>
                          <div className="flex flex-col items-end gap-1">
                            <button
                              type="button"
                              onClick={handleNextAvailable}
                              className="text-xs font-medium text-[#056db3] hover:text-[#045a94] transition-colors flex items-center gap-1"
                            >
                              Next Available
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
                            footer={
                              <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-full bg-green-200" />
                                    Available
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <span className="inline-block h-3 w-3 rounded-full bg-gray-200" />
                                    Unavailable
                                  </span>
                                </div>
                                {selectedDate && (
                                  <span className="text-[#056db3] font-medium">
                                    {format(selectedDate, "EEE, MMM d")}
                                  </span>
                                )}
                              </div>
                            }
                            className="m-0!"
                          />
                        </div>
                      </div>

                      {/* Time Selection */}
                      <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                          <Clock3 className="h-4 w-4 text-[#056db3]" />
                          Select Time
                        </label>

                        {!selectedDate ? (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <Clock3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">Select a date first</p>
                          </div>
                        ) : availableTimeSlots.length === 0 ? (
                          <div className="text-center py-6 bg-amber-50 rounded-xl border border-amber-200">
                            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm text-amber-600">No slots available for this date</p>
                            <p className="text-xs text-amber-500 mt-1">Try a different date</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {availableTimeSlots.some(
                              (slot) => parseInt(slot.time.split(":")[0]) < 12
                            ) && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                  Morning
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {availableTimeSlots
                                    .filter((slot) => parseInt(slot.time.split(":")[0]) < 12)
                                    .map((slot) => (
                                      <TimeSlot
                                        key={slot.value}
                                        time={slot.value}
                                        label={slot.label}
                                        isSelected={selectedTime === slot.value}
                                        isAvailable={true}
                                        onSelect={setSelectedTime}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}

                            {availableTimeSlots.some(
                              (slot) => parseInt(slot.time.split(":")[0]) >= 12
                            ) && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                                  Afternoon
                                </p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                  {availableTimeSlots
                                    .filter((slot) => parseInt(slot.time.split(":")[0]) >= 12)
                                    .map((slot) => (
                                      <TimeSlot
                                        key={slot.value}
                                        time={slot.value}
                                        label={slot.label}
                                        isSelected={selectedTime === slot.value}
                                        isAvailable={true}
                                        onSelect={setSelectedTime}
                                      />
                                    ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Duration — hidden for fixed-price services */}
                      {!isFixedPrice && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estimated Duration
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {DURATION_PRESETS.map((preset) => (
                              <DurationButton
                                key={preset.value}
                                value={preset.value}
                                label={preset.label}
                                isSelected={durationHours === preset.value}
                                onSelect={setDurationHours}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div>
                        <label
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
                          htmlFor="serviceLocation"
                        >
                          <MapPin className="h-4 w-4 text-[#056db3]" />
                          Service Location *
                        </label>
                        <input
                          id="serviceLocation"
                          type="text"
                          placeholder="Enter your address"
                          value={serviceLocation}
                          onChange={(e) => setServiceLocation(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 transition-colors"
                          required
                        />
                      </div>

                      {/* Job Description */}
                      <div>
                        <label
                          className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5"
                          htmlFor="jobDescription"
                        >
                          <FileText className="h-4 w-4 text-[#056db3]" />
                          Job Description
                        </label>
                        <textarea
                          id="jobDescription"
                          rows={Math.min(12, Math.max(3, Math.ceil(jobDescription.length / 85)))}
                          placeholder="Describe what needs to be done"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-800 focus:outline-none focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 transition-colors"
                        />
                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs text-gray-500">
                            Turn rough notes into a clearer request for your provider.
                          </p>
                          <button
                            type="button"
                            onClick={improveJobDescription}
                            disabled={!jobDescription.trim() || isImprovingDescription || Boolean(aiUsage && !aiUsage.is_premium && aiUsage.remaining_uses <= 0)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#056db3]/20 bg-blue-50 px-3 py-2 text-sm font-medium text-[#056db3] transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Sparkles className={`h-4 w-4 ${isImprovingDescription ? "animate-pulse" : ""}`} />
                            {isImprovingDescription ? "Improving..." : "Improve with AI"}
                          </button>
                        </div>
                        {aiUsage && !aiUsage.is_premium && aiUsage.remaining_uses > 0 && (
                          <p className="mt-2 text-xs text-gray-500">{aiUsage.remaining_uses} of {aiUsage.free_limit || 3} free AI improvements remaining.</p>
                        )}
                        {aiUsage && !aiUsage.is_premium && aiUsage.remaining_uses <= 0 && (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                            <span>Your free AI improvements are used.</span>
                            <button type="button" onClick={() => navigate("/client/subscription")} className="font-semibold text-[#056db3] underline">Upgrade for KES 300/month</button>
                          </div>
                        )}

                        {descriptionAiError && (
                          <p role="alert" className="mt-2 text-sm text-red-600">
                            {descriptionAiError}
                          </p>
                        )}

                        {suggestedDescription && (
                          <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/60 p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                                <Sparkles className="h-4 w-4 text-[#056db3]" />
                                Suggested description
                              </p>
                              <button
                                type="button"
                                onClick={() => setSuggestedDescription("")}
                                className="rounded p-1 text-gray-400 hover:bg-white hover:text-gray-700"
                                aria-label="Dismiss suggested description"
                              >
                                <CloseIcon className="h-4 w-4" />
                              </button>
                            </div>
                            <textarea
                              value={suggestedDescription}
                              onChange={(event) => setSuggestedDescription(event.target.value)}
                              rows={Math.min(12, Math.max(4, Math.ceil(suggestedDescription.length / 85)))}
                              aria-label="Edit suggested description"
                              className="w-full resize-y rounded-lg border border-blue-100 bg-white px-3 py-2 text-sm text-gray-700 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setJobDescription(suggestedDescription);
                                setSuggestedDescription("");
                              }}
                              disabled={!suggestedDescription.trim()}
                              className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#056db3] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#045a94] disabled:opacity-50"
                            >
                              <Check className="h-4 w-4" />
                              Accept & edit description
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Urgency — hidden for fixed-price services */}
                      {!isFixedPrice && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Urgency Level
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <label
                              className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                                urgency === "normal"
                                  ? "border-[#056db3] bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="urgency"
                                value="normal"
                                checked={urgency === "normal"}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="mr-2 accent-[#056db3]"
                              />
                              <span className="font-semibold text-gray-800">Normal</span>
                              <p className="text-xs text-gray-500 mt-0.5">Within 2–3 days</p>
                            </label>
                            <label
                              className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                                urgency === "urgent"
                                  ? "border-[#f59e0b] bg-amber-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="urgency"
                                value="urgent"
                                checked={urgency === "urgent"}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="mr-2 accent-[#f59e0b]"
                              />
                              <span className="font-semibold text-gray-800">Urgent</span>
                              <p className="text-xs text-gray-500 mt-0.5">Within 24 hours (+15%)</p>
                            </label>
                            <label
                              className={`rounded-xl border-2 p-3 text-left transition-all cursor-pointer ${
                                urgency === "emergency"
                                  ? "border-red-500 bg-red-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name="urgency"
                                value="emergency"
                                checked={urgency === "emergency"}
                                onChange={(e) => setUrgency(e.target.value)}
                                className="mr-2 accent-red-500"
                              />
                              <span className="font-semibold text-gray-800">Emergency</span>
                              <p className="text-xs text-gray-500 mt-0.5">ASAP (+30%)</p>
                            </label>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>
                </section>
              </div>

              {/* ── Right Column (Sticky Sidebar) ── */}
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-6">

                  {/* Price Summary */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-[#056db3]" />
                        Price Summary
                      </h2>
                    </div>
                    <div className="p-6">
                      <div className="space-y-2.5">

                        {/* Base cost */}
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {isFixedPrice
                              ? selectedService.service_name
                              : providerRate
                              ? `KES ${providerRate.toLocaleString()} × ${durationHours} hr${durationHours > 1 ? "s" : ""}`
                              : "Service fee"}
                          </span>
                          <span className="text-gray-800 font-medium">
                            KES {baseCost.toLocaleString()}
                          </span>
                        </div>

                        {/* Urgency surcharge — only in hourly mode */}
                        {!isFixedPrice && urgency !== "normal" && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {urgency === "urgent" ? "Urgent surcharge (15%)" : "Emergency surcharge (30%)"}
                            </span>
                            <span className="text-amber-600 font-medium">
                              + KES {urgencySurcharge.toLocaleString()}
                            </span>
                          </div>
                        )}

                        <div className="border-t border-gray-200 pt-3 mt-2">
                          <div className="flex justify-between">
                            <span className="font-bold text-gray-800">Total</span>
                            <span className="text-xl font-bold text-[#056db3]">
                              KES {totalCost.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            {isFixedPrice
                              ? "Fixed price for this service. Payment is collected after job completion."
                              : "Payment is collected after job completion. A service fee is deducted from the provider's payout."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2.5">
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className="w-full rounded-xl bg-[#056db3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#045a94] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating Booking...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Confirm Booking
                            </>
                          )}
                        </button>

                        {!canSubmit && !submitting && missingFields.length > 0 && (
                          <p className="text-xs text-center text-gray-400">
                            Please select{" "}
                            {missingFields.length === 1
                              ? missingFields[0]
                              : missingFields.slice(0, -1).join(", ") +
                                " and " +
                                missingFields[missingFields.length - 1]}{" "}
                            to continue
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={submitting}
                          className="w-full rounded-xl border-2 border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Booking Terms */}
                  <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[#056db3]" />
                        Booking Terms
                      </h2>
                    </div>
                    <div className="p-6">
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex gap-2">
                          <span className="text-[#056db3] font-bold">•</span>
                          <span>Payment is collected after job completion</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#056db3] font-bold">•</span>
                          <span>Free cancellation up to 24 hours before</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#056db3] font-bold">•</span>
                          <span>Provider confirms within 2 hours</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#056db3] font-bold">•</span>
                          <span>100% satisfaction guarantee</span>
                        </li>
                      </ul>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Confirmation Modal ── */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Confirm Booking</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Service</span>
                <span className="font-medium text-gray-800">{serviceType || "Not specified"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Provider</span>
                <span className="font-medium text-gray-800">{providerName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Date & Time</span>
                <span className="font-medium text-gray-800">
                  {selectedDate && format(selectedDate, "EEE, MMM d")} at {selectedTime}
                </span>
              </div>
              {!isFixedPrice && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-800">
                    {durationHours} hour{durationHours > 1 ? "s" : ""}
                  </span>
                </div>
              )}
              {!isFixedPrice && urgency !== "normal" && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-600">
                    {urgency === "urgent" ? "Urgent surcharge" : "Emergency surcharge"}
                  </span>
                  <span className="font-medium text-amber-600">
                    + KES {urgencySurcharge.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total</span>
                <span className="text-lg font-bold text-[#056db3]">
                  KES {totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-xl border-2 border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Go back
              </button>
              <button
                onClick={doCreateBooking}
                disabled={submitting}
                className="flex-1 rounded-xl bg-[#056db3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045a94] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateBooking;