import { useEffect, useState } from "react";
import { MapPin, Briefcase, CheckCircle, Wallet, Star, Clock, MessageCircle, Eye, DollarSign, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import bookingService from "../../api/bookingService";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

function ProviderDashboard() {
  const [providerBookings, setProviderBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [todaysJobsCount, setTodaysJobsCount] = useState(0);
  const [completionRate, setCompletionRate] = useState(0);
  const [providerRating, setProviderRating] = useState(null);
  const [availability, setAvailability] = useState(null);

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

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const providerId = Number(storedUser?.provider_id ?? storedUser?.id ?? localStorage.getItem("userId") ?? 1);
    const setBookingsFromList = (list) => {
      if (!mounted) return;
      setProviderBookings(list || []);
      try {
        // compute stats
        const now = new Date();
        let monthSum = 0;
        let todayCount = 0;
        let completed = 0;
        let total = 0;
        (list || []).forEach((b) => {
          total += 1;
          if (b.status === 'Completed') completed += 1;
          const amount = Number(b.amountRaw || 0);
          let parsed = null;
          if (b.date) parsed = new Date(b.date);
          if (parsed && !isNaN(parsed.getTime())) {
            if (parsed.getMonth() === now.getMonth() && parsed.getFullYear() === now.getFullYear()) monthSum += amount;
            if (parsed.getFullYear() === now.getFullYear() && parsed.getMonth() === now.getMonth() && parsed.getDate() === now.getDate()) todayCount += 1;
          } else {
            monthSum += amount; // fallback
          }
        });
        setMonthlyEarnings(monthSum);
        setTodaysJobsCount(todayCount);
        setCompletionRate(total > 0 ? Math.round((completed / total) * 100) : 0);
      } catch (e) {
        console.warn('Stats compute failed', e);
      }
    };

    // Primary: try provider-specific endpoint
    bookingService
      .listProviderBookings(providerId)
      .then((list) => {
        if (!mounted) return;
        if (list && list.length > 0) {
          setBookingsFromList(list);
        } else {
          // Fallback: fetch active bookings and filter by provider name/email match
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
        // try fallback to active bookings
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

    // also fetch availability and provider info
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

  return (
    <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Welcome back, {displayName}!</h1>
            <div className="flex items-center mt-2">
              <h2 className="text-lg text-gray-600">Plumbing Specialist • Westlands, Nairobi</h2>
            </div>
          </div>
          <div>
            <Link to="/provider/my-jobs">
              <button className="text-white bg-[#056db3] hover:bg-[#045ca0] font-medium border rounded-md py-2 px-4">View New Requests</button>
            </Link>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 pt-28">
          <section className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Today's Jobs</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{todaysJobsCount}</p>
                <p className="text-sm text-gray-600 font-medium">{todaysJobsCount >= 0 ? (todaysJobsCount === 0 ? 'No change' : `+${todaysJobsCount} today`) : ''}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Briefcase className="w-8 h-8 text-[#056db3]" />
              </div>
            </div>
          </section>
        
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Monthly Earnings</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">KES {monthlyEarnings.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">{monthlyEarnings ? '+ updated' : '—'}</p>
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-600">Completion Rate</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{completionRate}%</p>
                <p className="text-sm text-gray-600">{completionRate ? '+ updated' : '—'}</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-600">Today's Jobs</h2>
                </div>
              </div>
            </div>
        
            <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-medium text-gray-600">Average Rating</h2>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{providerRating ?? '—'}</p>
                  <p className="text-sm text-gray-600">{providerRating ? 'based on provider data' : 'No rating yet'}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-full">
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
}

export default ProviderDashboard;
