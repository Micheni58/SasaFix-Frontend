// src/pages/ServiceProvider/ProviderDashboard.jsx - With consistent earnings logic

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  CheckCircle,
  Star,
  Clock,
  MessageCircle,
  Eye,
  Calendar,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Sparkles,
  Receipt,
} from "lucide-react";
import bookingService from "../../api/bookingService";
import { getProviderTransactions } from "../../api/transactionService";
import ratingService from "../../api/ratingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import aiService from "../../api/aiService";

// ── Status Colors ──
const STATUS_STYLES = {
  "New Requests": "bg-amber-100 text-amber-800",
  "Pending": "bg-amber-100 text-amber-800",
  "Accepted": "bg-sky-100 text-sky-800",
  "Upcoming": "bg-sky-100 text-sky-800",
  "In Progress": "bg-indigo-100 text-indigo-800",
  "Completed": "bg-green-100 text-green-800",
  "Approved": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
  "Cancelled": "bg-red-100 text-red-800",
  "Paid": "bg-emerald-100 text-emerald-800",
};

const TIER_COLORS = { gold: "#CA8A04", blue: "#056db3", gray: "#9CA3AF" };

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatAmount(amount) {
  return `KES ${Number(amount || 0).toLocaleString()}`;
}

function getInitials(name) {
  if (!name) return "--";
  if (name.length <= 2 && name === name.toUpperCase()) {
    return name;
  }
  const normalized = name.toString().trim().replace(/\s+/g, " ");
  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 0) return "--";
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function getProviderTier(rating, completionRate) {
  if (rating && rating >= 4.7 && completionRate >= 90) return { tier: "gold", label: "Top rated pro" };
  if (rating && rating >= 4.0) return { tier: "blue", label: "Verified pro" };
  return { tier: "gray", label: "Building reputation" };
}

function formatDateToWords(dateString) {
  if (!dateString) return "Date pending";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date pending";
    return new Intl.DateTimeFormat("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return "Date pending";
  }
}

function isToday(dateString) {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  } catch {
    return false;
  }
}

function getBookingRoute(booking) {
  const status = booking.status || "Pending";
  const routeMap = {
    "New Requests": `/provider/my-jobs/new/${booking.id}`,
    "Pending": `/provider/my-jobs/new/${booking.id}`,
    "Upcoming": `/provider/my-jobs/upcoming/${booking.id}`,
    "Accepted": `/provider/my-jobs/accepted/${booking.id}`,
    "In Progress": `/provider/my-jobs/in-progress/${booking.id}`,
    "Completed": `/provider/my-jobs/completed/${booking.id}`,
    "Approved": `/provider/my-jobs/approved/${booking.id}`,
    "Rejected": `/provider/my-jobs/rejected/${booking.id}`,
    "Cancelled": `/provider/my-jobs/cancelled/${booking.id}`,
    "Paid": `/provider/my-jobs/paid/${booking.id}`,
  };
  return routeMap[status] || `/provider/my-jobs/${booking.id}`;
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function ClientAvatar({ name, size = 44 }) {
  const initials = getInitials(name);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full p-0.5" style={{ background: `conic-gradient(#056db3 100%, #e5e7eb 100%)` }}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
          {initials}
        </div>
      </div>
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="min-h-28 rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, iconBg, isLoading, subText }) {
  return (
    <div className="min-h-28 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-full items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-medium text-gray-600">{label}</h2>
          {isLoading ? (
            <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-200" />
          ) : (
            <>
              <p className="mt-2 font-mono text-xl font-bold text-gray-800">{value}</p>
              {subText && <p className="text-xs text-gray-400">{subText}</p>}
            </>
          )}
        </div>
        <div className={`shrink-0 rounded-lg p-2 ${iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

// ── AI Insight Card ──
function AIInsightCard({ onGenerate, isLoading, insight }) {
  return (
    <div className="rounded-xl border border-blue-200 bg-linear-to-r from-blue-50/80 to-indigo-50/80 p-6 transition-all hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: '#056db3' }}>
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h4 className="font-semibold text-gray-800" style={{ color: '#056db3' }}>
              AI Provider Co-Pilot
            </h4>
            <button
              onClick={onGenerate}
              disabled={isLoading}
              className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#045a94] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#056db3' }}
            >
              {isLoading ? (
                <>
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Get Insights
                </>
              )}
            </button>
          </div>
          <div className="mt-3">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full" style={{ backgroundColor: '#056db3' }} />
                <span className="text-sm text-gray-500">AI is analyzing your profile...</span>
              </div>
            ) : insight ? (
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 text-green-500">✅</span>
                  <span>{insight}</span>
                </div>
                <Link
                  to="/provider/ai-assistant"
                  className="inline-flex items-center gap-1 text-xs font-medium transition-colors hover:underline"
                  style={{ color: '#056db3' }}
                >
                  Open AI Assistant
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Click <strong>"Get Insights"</strong> to get AI-powered suggestions for your profile and pricing.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Availability Card ──
function AvailabilityCard({ bookings, availability, loading }) {
  const generateTimeSlots = (startTime, endTime) => {
    if (!startTime || !endTime) return [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const start = startHour * 60 + startMinute;
    const end = endHour * 60 + endMinute;
    const slots = [];
    for (let slotStart = start; slotStart < end; slotStart += 120) {
      const slotEnd = Math.min(slotStart + 120, end);
      const format = (minutes) => {
        const hour = Math.floor(minutes / 60);
        return `${String(hour).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      };
      slots.push(`${format(slotStart)} - ${format(slotEnd)}`);
    }
    return slots;
  };

  const dates = [0, 1, 2].map((offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  });

  const getDaySchedule = (date) => {
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    return availability.find(
      (entry) => (entry.day_of_week || entry.day || "").toLowerCase() === dayName.toLowerCase(),
    );
  };

  const isBookingOnDate = (booking, date) => {
    const bookingDate = new Date(booking.date || booking.scheduled_date);
    return !Number.isNaN(bookingDate.getTime()) &&
      bookingDate.getFullYear() === date.getFullYear() &&
      bookingDate.getMonth() === date.getMonth() &&
      bookingDate.getDate() === date.getDate();
  };

  const scheduleForDate = (date) => {
    const schedule = getDaySchedule(date);
    const available = Boolean(schedule?.is_available);
    const slots = available
      ? generateTimeSlots(schedule.start_time, schedule.end_time)
      : [];
    const bookedSlots = bookings
      .filter((booking) => isBookingOnDate(booking, date))
      .map((booking) => booking.scheduled_start_time || booking.time?.split(" - ")[0]);

    return {
      available,
      slots: slots.map((time) => ({
        time,
        booked: bookedSlots.some((bookedTime) => bookedTime?.slice(0, 5) === time.slice(0, 5)),
      })),
    };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dates.map((date, index) => {
          const schedule = scheduleForDate(date);
          const title = index === 0
            ? "Today"
            : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

          return (
        <div key={date.toDateString()}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-gray-800">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${schedule.available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
              {schedule.available ? `${schedule.slots.filter((slot) => slot.booked).length} Booked` : "Unavailable"}
            </span>
          </div>
          <div className="space-y-2">
            {loading ? (
              <p className="py-3 text-sm text-gray-500">Loading availability…</p>
            ) : schedule.slots.length === 0 ? (
              <p className="py-3 text-sm text-gray-500">No working hours set.</p>
            ) : schedule.slots.map((slot) => (
              <div key={slot.time} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                <span className="text-sm font-medium text-gray-700">{slot.time}</span>
                <span className={`text-xs font-medium ${slot.booked ? "text-blue-600" : "text-green-600"}`}>
                  {slot.booked ? "Booked" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>
          );
        })}
      </div>
      <Link to="/provider/availability" className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50">
        <Calendar className="h-4 w-4" />
        Manage Availability
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ProviderDashboard() {
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [monthEarnings, setMonthEarnings] = useState(0);
  const [monthPaidJobs, setMonthPaidJobs] = useState(0);
  const [providerRating, setProviderRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);
  const [providerSpecialty, setProviderSpecialty] = useState("Service Provider");
  const [providerLocation, setProviderLocation] = useState("Nairobi, Kenya");
  const [aiInsight, setAiInsight] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const storedUser = getStoredUser();
  const displayName = storedUser
    ? storedUser.full_name ||
      storedUser.name ||
      `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() ||
      storedUser.email ||
      "Provider"
    : "Provider";

  // ✅ Get provider ID correctly
  const providerId = Number(
    storedUser?.provider_id || 
    storedUser?.service_provider_id || 
    localStorage.getItem("providerId") ||
    0
  );

  // ── Fetch bookings ──
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    if (!providerId) {
      setBookings([]);
      setError("Provider account not found. Please sign in again.");
      setLoading(false);
      return () => { mounted = false; };
    }

    const fetchData = async () => {
      try {
        const data = await bookingService.listProviderBookings(providerId);
        if (!mounted) return;
        setBookings(data || []);

        if (data && data.length > 0) {
          const firstBooking = data[0];
          const provider = firstBooking.raw?.service_provider;
          if (provider?.service_category) {
            setProviderSpecialty(provider.service_category);
          }
          if (provider?.location) {
            setProviderLocation(provider.location);
          }
        }

        try {
          const ratingData = await ratingService.getProviderAverageRating(providerId);
          if (mounted && ratingData) {
            setProviderRating(ratingData.averageScore || 0);
            setTotalRatings(ratingData.totalRatings || 0);
          }
        } catch (ratingErr) {
          console.warn("Could not fetch rating:", ratingErr);
        }

      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err.message || "Failed to load data");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => { mounted = false; };
  }, [providerId]);

  // ── Fetch the provider's saved working hours ──
  useEffect(() => {
    let mounted = true;
    setAvailabilityLoading(true);

    if (!providerId) {
      setAvailability([]);
      setAvailabilityLoading(false);
      return () => { mounted = false; };
    }

    bookingService
      .getProviderAvailability(providerId)
      .then((data) => {
        if (mounted) setAvailability(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.warn("Could not fetch availability:", err);
        if (mounted) setAvailability([]);
      })
      .finally(() => {
        if (mounted) setAvailabilityLoading(false);
      });

    return () => { mounted = false; };
  }, [providerId]);

  // ── Fetch month-to-date earnings from transaction history ──
  // ✅ Fixed: Use providerId instead of userId
  useEffect(() => {
    let mounted = true;
    if (!providerId) { 
      setEarningsLoading(false); 
      return; 
    }

    const fetchMonthEarnings = async () => {
      try {
        // ✅ Use providerId for transactions
        const txRes = await getProviderTransactions(providerId);
        const txList = Array.isArray(txRes)
          ? txRes
          : txRes?.transactions || txRes?.data?.transactions || [];
        
        if (!mounted) return;

        // Get current month date range
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Filter transactions to current month only
        const monthTransactions = txList.filter(tx => {
          const txDate = new Date(tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date);
          if (isNaN(txDate.getTime())) return false;
          return txDate >= monthStart && txDate <= monthEnd;
        });

        // Calculate total for this month (using net_amount for provider earnings)
        const total = monthTransactions
          .filter(tx => {
            const status = (tx.status || "").toUpperCase();
            // Only include successful/completed transactions
            return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
          })
          .reduce((sum, tx) => {
            const amount = tx.net_amount ?? tx.netAmount ?? tx.amount ?? 0;
            return sum + Number(amount);
          }, 0);

        const count = monthTransactions.filter(tx => {
          const status = (tx.status || "").toUpperCase();
          return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
        }).length;

        setMonthEarnings(total);
        setMonthPaidJobs(count);
      } catch (err) {
        console.warn("Could not fetch month earnings:", err);
      } finally {
        if (mounted) setEarningsLoading(false);
      }
    };

    fetchMonthEarnings();
    return () => { mounted = false; };
  }, [providerId]);  // ✅ Use providerId as dependency

  // ── AI Insight Generation ──
  const generateAIInsight = async () => {
    setAiLoading(true);
    try {
      const analysis = await aiService.getReviewAnalysis(providerId);
      if (analysis && analysis.analysis) {
        const lines = analysis.analysis.split('\n').filter(line => line.trim());
        const firstInsight = lines.find(line => line.match(/^\d\./)) || lines[0];
        setAiInsight(firstInsight || "Your profile is looking great! Keep up the good work.");
      }
    } catch (error) {
      console.error("AI insight generation failed:", error);
      setAiInsight("We couldn't generate insights right now. Check back later.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Derived stats ──
  const today = new Date();
  
  const todaysBookings = bookings.filter((b) => {
    if (b.status === "New Requests" || b.status === "Pending") {
      return true;
    }
    const bookingDate = b.date || b.scheduled_date || b.booking_date;
    if (!bookingDate) return false;
    try {
      const d = new Date(bookingDate);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear() === today.getFullYear() &&
             d.getMonth() === today.getMonth() &&
             d.getDate() === today.getDate();
    } catch {
      return false;
    }
  });
  
  const displayedJobs = todaysBookings.slice(0, 5);

  const activeStatuses = ["Accepted", "In Progress"];
  const activeJobs = bookings.filter((b) => activeStatuses.includes(b.status));
  const activeCount = activeJobs.length;

  const completedCount = bookings.filter(
    (b) => b.status === "Completed" || b.status === "Approved"
  ).length;
  const totalBookings = bookings.length;
  const completionRate = totalBookings > 0 ? Math.round((completedCount / totalBookings) * 100) : 0;

  const providerTier = getProviderTier(providerRating, completionRate);
  const activeJob = activeJobs.length > 0 ? activeJobs[0] : null;

  // ── Stat Cards ──
  const statCards = [
    {
      label: "Average Rating",
      value: providerRating ? `${providerRating.toFixed(1)} ★` : '—',
      icon: Star,
      iconBg: "bg-yellow-100 text-yellow-500",
      isLoading: false,
    },
    {
      label: "Completion Rate",
      value: `${completionRate}%`,
      icon: TrendingUp,
      iconBg: "bg-purple-100 text-purple-600",
      isLoading: false,
    },
    {
      label: "Active Jobs",
      value: activeCount,
      icon: Briefcase,
      iconBg: "bg-blue-100 text-[#056db3]",
      isLoading: false,
    },
    {
      label: "This Month's Earnings",
      value: formatAmount(monthEarnings),
      icon: Receipt,
      iconBg: "bg-green-100 text-green-600",
      isLoading: earningsLoading,
      subText: `${monthPaidJobs} jobs paid this month`,
    },
  ];

  const quickActions = [
    { label: "My Jobs", to: "/provider/my-jobs", icon: Briefcase },
    { label: "Earnings", to: "/provider/earnings", icon: Receipt },
    { label: "Messages", to: "/provider/messages", icon: MessageCircle },
    { label: "Availability", to: "/provider/availability", icon: Calendar },
    { label: "AI Assistant", to: "/provider/ai-assistant", icon: Sparkles },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="px-6 pb-6 pt-24">
          {/* ── Header ── */}
          <section className="mb-8">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-800">
                    {getGreeting()}, {displayName.split(" ")[0]}
                  </h1>
                  <span
                    className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                    style={{
                      backgroundColor: `${TIER_COLORS[providerTier.tier]}1A`,
                      color: TIER_COLORS[providerTier.tier],
                    }}
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {providerTier.label}
                  </span>
                </div>
                <div className="mt-2 flex items-center">
                  <MapPin className="mr-2 h-5 w-5 text-[#056db3]" />
                  <h2 className="text-lg text-gray-600">
                    {providerSpecialty} • {providerLocation}
                  </h2>
                </div>
              </div>
              <Link to="/provider/my-jobs" className="flex items-center justify-center gap-2 rounded-xl bg-[#056db3] px-5 py-3 font-semibold text-white transition-colors hover:bg-[#045a94]">
                <Briefcase className="h-4 w-4" />
                View Jobs
              </Link>
            </div>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-[#056db3] hover:text-[#056db3]"
                >
                  <action.icon className="h-4 w-4" />
                  {action.label}
                </Link>
              ))}
            </div>
          </section>

          {/* ── AI Insight Card ── */}
          <section className="mb-8">
            <AIInsightCard
              onGenerate={generateAIInsight}
              isLoading={aiLoading}
              insight={aiInsight}
            />
          </section>

          {/* ── Stat cards ── */}
          <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {loading || earningsLoading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statCards.map((card) => (
                  <StatCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    icon={card.icon}
                    iconBg={card.iconBg}
                    isLoading={card.isLoading}
                    subText={card.subText}
                  />
                ))}
          </section>

          {/* ── Monthly Earnings Section ── */}
          {!earningsLoading && monthEarnings > 0 && (
            <section className="mb-8 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">This month's earnings</p>
                  <p className="font-semibold text-gray-800">{formatAmount(monthEarnings)}</p>
                  <p className="text-xs text-gray-400">{monthPaidJobs} jobs paid this month</p>
                </div>
              </div>
              <Link to="/provider/earnings" className="flex items-center justify-center gap-1 rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50">
                <Receipt className="h-4 w-4" />
                View earnings
              </Link>
            </section>
          )}

          {/* ── Side by Side: Active Jobs & Today's Jobs ── */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active Jobs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-800">Active Jobs</h3>
                <span className="text-sm font-medium text-[#056db3]">{activeCount} active</span>
              </div>
              {activeJob ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <ClientAvatar name={activeJob.client || activeJob.clientName || `Client #${activeJob.clientId}`} size={48} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 truncate">{activeJob.service}</p>
                      <p className="text-sm text-gray-500 truncate">{activeJob.client || activeJob.clientName || "Client"}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{formatDateToWords(activeJob.date)}</span>
                      </div>
                    </div>
                    <Link to={getBookingRoute(activeJob)} className="flex items-center gap-1 rounded-lg bg-[#056db3] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#045a94] transition-colors">
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </div>
                  {activeJobs.length > 1 && (
                    <div className="border-t border-gray-100 pt-3 mt-2">
                      <p className="text-xs text-gray-500">+{activeJobs.length - 1} more active job{activeJobs.length - 1 > 1 ? 's' : ''}</p>
                    </div>
                  )}
                  <div className="mt-2">
                    <div className="mb-1 flex justify-between text-xs text-gray-600">
                      <span>Progress</span>
                      <span className="font-mono">{activeJob.status === "In Progress" ? "50%" : "25%"}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-200">
                      <div className="h-2 rounded-full bg-[#056db3] transition-all" style={{ width: activeJob.status === "In Progress" ? "50%" : "25%" }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Briefcase className="h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-600 font-medium">No active jobs</p>
                  <p className="text-sm text-gray-400">Accepted jobs will appear here</p>
                  <Link to="/provider/my-jobs" className="mt-3 rounded-lg bg-[#056db3] px-4 py-2 text-xs font-semibold text-white hover:bg-[#045a94] transition-colors">
                    View requests
                  </Link>
                </div>
              )}
            </div>

            {/* Today's Jobs Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-bold text-gray-800">Today's Jobs</h3>
                  <Link to="/provider/my-jobs" className="flex items-center gap-1 font-medium text-[#056db3] hover:underline">
                    View all
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-200">
                {loading ? (
                  <div className="space-y-3 p-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                          <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="p-10 text-center text-sm text-red-500">{error}</div>
                ) : displayedJobs.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 p-10 text-center">
                    <Calendar className="h-10 w-10 text-gray-300" />
                    <p className="font-semibold text-gray-800">No jobs today</p>
                    <p className="text-sm text-gray-500">New requests will appear here</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {displayedJobs.map((job) => (
                      <li key={job.id} className="flex flex-col gap-3 px-6 py-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <ClientAvatar name={job.client || job.clientName || `Client #${job.clientId}`} size={44} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">{job.service || "Service unavailable"}</p>
                            <p className="truncate text-sm text-gray-500">{job.client || job.clientName || "Client"}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[job.status] || "bg-gray-100 text-gray-700"}`}>
                            {job.status}
                          </span>
                          <span className="font-mono text-sm font-semibold text-gray-800">
                            {job.amount || formatAmount(job.amountRaw)}
                          </span>
                          <Link to={getBookingRoute(job)} className="text-sm font-medium text-[#056db3] hover:underline">
                            View
                          </Link>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* ── Availability Card ── */}
          <AvailabilityCard
            bookings={bookings}
            availability={availability}
            loading={availabilityLoading}
          />
        </main>
      </div>
    </div>
  );
}

export default ProviderDashboard;