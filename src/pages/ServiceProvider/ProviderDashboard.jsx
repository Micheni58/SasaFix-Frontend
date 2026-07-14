// src/pages/ServiceProvider/ProviderDashboard.jsx - Updated

import { useEffect, useState } from "react";
import { MapPin, Briefcase, CheckCircle, Wallet, Star, Clock, MessageCircle, Eye, DollarSign, TrendingUp, Search, Calendar, ChevronRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

const TIER_COLORS = { gold: "#CA8A04", blue: "#056db3", gray: "#9CA3AF" };

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getProviderTier(rating, completionRate) {
  if (rating && rating >= 4.7 && completionRate >= 90) return { tier: "gold", label: "Top rated pro" };
  if (rating && rating >= 4.0) return { tier: "blue", label: "Verified pro" };
  return { tier: "gray", label: "Building reputation" };
}

function getInitials(name) {
  if (!name) return "--";
  return name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();
}

function StatCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-16 animate-pulse rounded bg-gray-200" />
        </div>
        <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

function ProviderDashboard() {
  const [providerBookings, setProviderBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [todaysJobsCount, setTodaysJobsCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [providerRating, setProviderRating] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletLoading, setWalletLoading] = useState(true);

  // derive logged-in provider display name from stored auth user
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const displayName = storedUser
    ? (storedUser.full_name || storedUser.name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() || storedUser.email || "Provider")
    : "Provider";

  // ── Status Color Mapping ──
  const getStatusStyles = (status) => {
    const statusMap = {
      "Upcoming": "bg-blue-100 text-blue-800",
      "Scheduled": "bg-blue-100 text-blue-800",
      "Pending": "bg-blue-100 text-blue-800",
      "New Requests": "bg-blue-100 text-blue-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      "Accepted": "bg-yellow-100 text-yellow-800",
      "Completed": "bg-green-100 text-green-800",
      "Cancelled": "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const providerId = Number(storedUser?.provider_id ?? storedUser?.id ?? localStorage.getItem("userId") ?? 1);

    const setBookingsFromList = (list) => {
      if (!mounted) return;
      setProviderBookings(list || []);
      try {
        const now = new Date();
        let monthSum = 0;
        let todayCount = 0;
        let completed = 0;
        let total = 0;
        (list || []).forEach((b) => {
          total += 1;
          if (b.status === 'Completed' || b.status === 'completed') completed += 1;
          const amount = Number(b.amountRaw || 0);
          let parsed = null;
          if (b.date) parsed = new Date(b.date);
          if (parsed && !isNaN(parsed.getTime())) {
            if (parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear()) monthSum += amount;
            if (parsed.getFullYear() === now.getFullYear() && parsed.getMonth() === now.getMonth() && parsed.getDate() === now.getDate()) todayCount += 1;
          } else {
            monthSum += amount;
          }
        });
        setMonthlyEarnings(monthSum);
        setTodaysJobsCount(todayCount);
        setCompletionRate(total > 0 ? Math.round((completed / total) * 100) : 0);
      } catch (e) {
        console.warn('Stats compute failed', e);
      }
    };

    bookingService
      .listProviderBookings(providerId)
      .then((list) => {
        if (!mounted) return;
        if (list && list.length > 0) {
          setBookingsFromList(list);
        } else {
          bookingService.listActiveBookings().then((active) => {
            if (!mounted) return;
            const providerName = displayName;
            const providerEmail = storedUser?.email;
            const filtered = (active || []).filter((b) => {
              const nameMatch = (b.provider_full_name || b.providerName || b.worker || '').toString().toLowerCase().includes((providerName || '').toLowerCase());
              const emailMatch = (b.service_provider && (b.service_provider.contact_email || b.service_provider.email) || '').toString().toLowerCase() === (providerEmail || '').toLowerCase();
              return nameMatch || emailMatch;
            });
            setBookingsFromList(filtered);
          }).catch(() => {
            setBookingsFromList([]);
          });
        }
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        bookingService.listActiveBookings().then((active) => {
          if (!mounted) return;
          const providerName = displayName;
          const providerEmail = storedUser?.email;
          const filtered = (active || []).filter((b) => {
            const nameMatch = (b.provider_full_name || b.providerName || b.worker || '').toString().toLowerCase().includes((providerName || '').toLowerCase());
            const emailMatch = (b.service_provider && (b.service_provider.contact_email || b.service_provider.email) || '').toString().toLowerCase() === (providerEmail || '').toLowerCase();
            return nameMatch || emailMatch;
          });
          setBookingsFromList(filtered);
        }).catch(() => {
          if (!mounted) return;
          setError(err.message || "Failed to load bookings");
        });
      })
      .finally(() => mounted && setLoading(false));

    try {
      const userId = storedUser?.id || localStorage.getItem("userId");
      if (userId) {
        fetch(`/api/wallets/user/${userId}/balance`)
          .then(res => res.json())
          .then(data => {
            if (mounted) {
              setWalletBalance(data.balance || 0);
            }
          })
          .catch(() => {})
          .finally(() => { if (mounted) setWalletLoading(false); });
      } else {
        setWalletLoading(false);
      }
    } catch (e) {
      setWalletLoading(false);
    }

    bookingService.getProviderAvailability(providerId).then((av) => {
      if (mounted) setAvailability(av || null);
    }).catch(() => {
      if (mounted) setAvailability(null);
    });

    bookingService.listProviders().then((provList) => {
      if (!mounted) return;
      const prov = (provList || []).find((p) => p.id === providerId || p.provider_id === providerId);
      if (prov && prov.rating) setProviderRating(prov.rating);
    }).catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const providerTier = getProviderTier(providerRating, completionRate);
  const todaysBookings = providerBookings.filter((b) => {
    if (!b.date) return false;
    const d = new Date(b.date);
    const now = new Date();
    return !isNaN(d.getTime()) && d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  });
  const jobsToShow = todaysBookings.length > 0 ? todaysBookings : providerBookings;

  const statCards = [
    {
      label: "Today's jobs",
      value: todaysJobsCount,
      sub: todaysJobsCount === 0 ? 'No change' : `+${todaysJobsCount} today`,
      icon: <Briefcase className="w-6 h-6 text-[#056db3]" />,
      iconClass: "bg-blue-100",
    },
    {
      label: "Completion rate",
      value: `${completionRate}%`,
      sub: completionRate ? 'Updated' : '—',
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      iconClass: "bg-purple-100",
    },
    {
      label: "Wallet balance",
      value: `KES ${walletBalance.toLocaleString()}`,
      sub: walletBalance > 0 ? 'Available for withdrawal' : 'No funds available',
      icon: <Wallet className="w-6 h-6 text-green-600" />,
      iconClass: "bg-green-100",
      loading: walletLoading,
    },
    {
      label: "Average rating",
      value: providerRating ?? '—',
      sub: providerRating ? 'Based on provider data' : 'No rating yet',
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      iconClass: "bg-yellow-100",
    },
  ];

  const quickActions = [
    { label: "New requests", to: "/provider/my-jobs", icon: Briefcase },
    { label: "Wallet", to: "/provider/wallet", icon: Wallet },
    { label: "Messages", to: "/provider/messages", icon: MessageCircle },
    { label: "Availability", to: "/provider/availability", icon: Calendar },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-8">
            <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center mb-5">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-gray-800">{getGreeting()}, {displayName.split(" ")[0]}</h1>
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
                <div className="flex items-center mt-2">
                  <MapPin className="w-4 h-4 text-[#056db3] mr-1" />
                  <h2 className="text-lg text-gray-600">Plumbing Specialist • Westlands, Nairobi</h2>
                </div>
              </div>
              <Link to="/provider/my-jobs">
                <button className="flex items-center gap-2 text-white bg-[#056db3] hover:bg-[#045ca0] font-semibold rounded-xl py-3 px-5 transition-colors">
                  <Briefcase className="w-4 h-4" />
                  View new requests
                </button>
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

          <section className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statCards.map((card) => (
                  <div key={card.label} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <h2 className="text-sm font-medium text-gray-600">{card.label}</h2>
                        {card.loading ? (
                          <div className="mt-2 h-6 w-20 animate-pulse rounded bg-gray-200" />
                        ) : (
                          <p className="text-2xl font-bold text-gray-800 mt-1 font-mono">{card.value}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-0.5">{card.sub}</p>
                      </div>
                      <div className={`p-2 rounded-full shrink-0 ${card.iconClass}`}>{card.icon}</div>
                    </div>
                  </div>
                ))}
          </section>

          <section className="bg-white rounded-xl shadow-sm">
            <div className="p-6 pb-0">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl text-gray-800">Today's jobs</h2>
                <Link to="/provider/my-jobs" className="flex items-center gap-1 text-[#056db3] hover:underline font-medium">
                  View all
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="border-t border-gray-200">
              {loading ? (
                <div className="space-y-3 p-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                        <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="py-10 text-center text-red-500 text-sm">{error}</div>
              ) : jobsToShow.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <Calendar className="h-10 w-10 text-gray-300" />
                  <p className="font-semibold text-gray-800">No bookings found</p>
                  <p className="text-sm text-gray-500">New job requests will show up here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Client</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Service</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Time</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Location</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Payment</th>
                        <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobsToShow.map((b, index) => {
                        const status = b.status || "Pending";
                        const statusClass = getStatusStyles(status);
                        const clientName = b.clientName || (b.client && (b.client.full_name || b.client.name)) || (b.clientId ? `Client #${b.clientId}` : 'Client');

                        return (
                          <tr key={b.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-xs font-bold text-white shrink-0">
                                  {getInitials(clientName)}
                                </div>
                                <span className="font-medium">{clientName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">{b.service || b.service_name}</td>
                            <td className="py-4 px-6">{b.time || (b.date ? b.date : '')}</td>
                            <td className="py-4 px-6">
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                <span>{b.location || ''}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-md text-xs font-medium ${statusClass}`}>
                                {status}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold font-mono">{b.amount || b.amountRaw ? (b.amount || `KES ${b.amountRaw}`) : ''}</td>
                            <td className="py-4 px-6">
                              {(() => {
                                const statusLower = (b.status || '').toString().toLowerCase();
                                if (statusLower.includes('in progress')) return (<Link to={`/provider/my-jobs/in-progress/${b.id}`} className="text-[#056db3] hover:underline font-medium">View</Link>);
                                if (statusLower.includes('completed')) return (<Link to={`/provider/my-jobs/completed/${b.id}`} className="text-[#056db3] hover:underline font-medium">View</Link>);
                                return (<Link to={`/provider/my-jobs/new/${b.id}`} className="text-[#056db3] hover:underline font-medium">View</Link>);
                              })()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-xl shadow-sm mt-6 p-6">
            <div className="mb-4">
              <h2 className="font-bold text-xl text-gray-800">Availability schedule</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="font-bold text-lg text-gray-800">Today</h1>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium font-mono">{availability && availability.today ? `${availability.today.length} Booked` : `${todaysJobsCount} Jobs`}</span>
                </div>
                <div className="space-y-2">
                  {(availability && availability.today && Array.isArray(availability.today) ? availability.today : []).slice(0,3).map((slot, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 border rounded-md ${slot.booked ? 'border-blue-100 bg-blue-50' : 'border-green-100 bg-green-50'}`}>
                      <span className="text-sm font-medium">{slot.time || slot.start || slot.label || `Slot ${i+1}`}</span>
                      <span className={`text-xs ${slot.booked ? 'text-gray-600' : 'text-green-600'}`}>{slot.booked ? 'Booked' : 'Available'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="font-bold text-lg text-gray-800">Tomorrow</h1>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium font-mono">{availability && availability.tomorrow ? `${availability.tomorrow.length} Booked` : '—'}</span>
                </div>
                <div className="space-y-2">
                  {(availability && availability.tomorrow && Array.isArray(availability.tomorrow) ? availability.tomorrow : []).slice(0,3).map((slot, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 border rounded-md ${slot.booked ? 'border-blue-100 bg-blue-50' : 'border-green-100 bg-green-50'}`}>
                      <span className="text-sm font-medium">{slot.time || slot.start || slot.label || `Slot ${i+1}`}</span>
                      <span className={`text-xs ${slot.booked ? 'text-gray-600' : 'text-green-600'}`}>{slot.booked ? 'Booked' : 'Available'}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="font-bold text-lg text-gray-800">{availability && availability.nextDateLabel ? availability.nextDateLabel : 'Upcoming'}</h1>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium font-mono">{availability && availability.next ? `${(Array.isArray(availability.next) ? availability.next.length : 1)} Booked` : '—'}</span>
                </div>
                <div className="space-y-2">
                  {(availability && availability.next && Array.isArray(availability.next) ? availability.next : []).slice(0,3).map((slot,i) => (
                    <div key={i} className={`flex items-center justify-between p-2 border rounded-md ${slot.booked ? 'border-blue-100 bg-blue-50' : 'border-green-100 bg-green-50'}`}>
                      <span className="text-sm font-medium">{slot.time || slot.start || slot.label || `Slot ${i+1}`}</span>
                      <span className={`text-xs ${slot.booked ? 'text-gray-600' : 'text-green-600'}`}>{slot.booked ? 'Booked' : 'Available'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ProviderDashboard;