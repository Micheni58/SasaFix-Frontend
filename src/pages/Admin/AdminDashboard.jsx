import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Eye, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import bookingService from "../../api/bookingService";

function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(null);
  const [providersCount, setProvidersCount] = useState(null);
  const [activeBookingsCount, setActiveBookingsCount] = useState(null);
  const [platformCommission, setPlatformCommission] = useState(null);
  const [bookingData, setBookingData] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    async function fetchAll() {
      try {
        // fetch providers
        const provList = await bookingService.listProviders();
        if (!mounted) return;
        setProvidersCount(Array.isArray(provList) ? provList.length : null);

        // fetch active bookings
        const active = await bookingService.listActiveBookings();
        if (!mounted) return;
        setActiveBookingsCount(Array.isArray(active) ? active.length : 0);

        // attempt to fetch users list via API - may not exist
        let users = null;
        try {
          const resp = await fetch('/api/users');
          if (resp.ok) {
            const data = await resp.json();
            users = Array.isArray(data) ? data : (data.users || null);
          }
        } catch (e) {
          users = null;
        }
        if (!mounted) return;
        setUsersCount(users ? users.length : null);

        // fetch all bookings to compute monthly stats and platform commission
        let allBookings = [];
        try {
          const resp = await fetch('/api/bookings');
          if (resp.ok) {
            const data = await resp.json();
            allBookings = Array.isArray(data) ? data : (data.bookings || []);
          }
        } catch (e) {
          allBookings = [];
        }
        if (!mounted) return;

        // compute monthly booking counts
        const months = Array.from({ length: 12 }, (_, i) => ({ month: new Date(0, i).toLocaleString('default', { month: 'short' }), bookings: 0 }));
        const now = new Date();
        let commissionSum = 0;
        (allBookings || []).forEach((b) => {
          const dateStr = b.scheduled_date || b.date || b.created_at || b.createdAt || null;
          let d = dateStr ? new Date(dateStr) : null;
          if (d && !isNaN(d.getTime())) {
            const m = d.getMonth();
            months[m].bookings += 1;
          }
          const amount = Number(b.amount || b.amountRaw || 0);
          commissionSum += amount; // treat as revenue; compute commission later
        });
        // platform commission — backend may provide exact field; fallback to 10% of revenue
        const commission = Math.round((commissionSum * 0.1) || 0);
        setPlatformCommission(commission);
        setBookingData(months);

        // build recent activities from active bookings + recent bookings
        const recent = ((active || []).slice(0, 10)).map((b) => ({
          type: 'Booking',
          worker: b.worker || b.providerName || b.service_provider?.name || 'Provider',
          client: b.clientName || (b.client && (b.client.full_name || b.client.name)) || `Client #${b.clientId || b.client?.id || ''}`,
          service: b.service || b.service_name || '',
          amount: b.amount || (b.amountRaw ? `KES ${b.amountRaw}` : '-'),
          status: b.status,
          time: b.date || b.scheduled_date || ''
        }));
        setActivities(recent);

      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError(e.message || 'Failed to load admin data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    return () => { mounted = false; };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <div className="flex-1 ml-72">
        {/* Navbar */}
        <div className="fixed top-0 left-72 right-0 z-30 bg-white">
          <Navbar />
        </div>

        {/* Dashboard Content */}
        <main className="p-28 pt-6">
          <section className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">
                Admin Dashboard
              </h1>

              <p className="text-gray-600 mt-2">
                Monitor and manage Sasafix Service Hub
              </p>
            </div>
              <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{usersCount !== null ? usersCount : '—'}</p>
              <h2 className="text-sm font-medium text-gray-600">Total Users</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-4 right-4">
              <span className="text-sm text-green-600 font-medium">+8.2%</span>
            </div>
              <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-purple-100 rounded-full mb-3">
                <Briefcase className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{providersCount !== null ? providersCount : '—'}</p>
              <h2 className="text-sm font-medium text-gray-600">Total Providers</h2>
            </div>
          </div>

              <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-green-600 font-medium">
                    +18.7%
                  </span>
                </div>

                <div className="flex flex-col items-start mt-4">
                  <div className="p-3 bg-green-100 rounded-full mb-3">
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>

                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    KES 12.5M
                  </p>

                  <h2 className="text-sm font-medium text-gray-600">
                    Platform Commission
                  </h2>
                </div>
              </div>
            </div>
              <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-orange-100 rounded-full mb-3">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{activeBookingsCount !== null ? activeBookingsCount : '—'}</p>
              <h2 className="text-sm font-medium text-gray-600">Active Bookings</h2>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bookingData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                  />

                  <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="bookings"
                    stroke="#056db3"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
              <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{platformCommission !== null ? `KES ${platformCommission.toLocaleString()}` : '—'}</p>
              <h2 className="text-sm font-medium text-gray-600">Platform Commission</h2>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-xl text-gray-800">Bookings Over Time</h2>
            <p className="text-gray-600">Monthly booking trends</p>
          </div>
          <div>
            <Link to="/reports">
              <button className="flex items-center bg-[#056db3] hover:bg-[#045ca0] text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Report
              </button>
            </Link>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bookingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#056db3"
                strokeWidth={3}
                dot={{ fill: '#056db3', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#056db3', strokeWidth: 2, fill: '#ffffff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm">
              <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-bold text-xl text-gray-800">Recent Activity</h2>
              <p className="text-gray-600">Latest bookings and flagged accounts</p>
            </div>
            <button className="text-[#056db3] hover:underline font-medium">View All</button>
          </div>
        </div>
        <div className="border-t border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Details</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Time</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">Loading...</td>
                  </tr>
                ) : (activities.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No recent activity</td>
                  </tr>
                ) : (
                  activities.map((activity, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          {activity.type === "Booking" && <Calendar className="w-4 h-4 text-blue-500 mr-2" />}
                          {activity.type === "Flagged Account" && <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />}
                          {activity.type === "New Provider" && <Users className="w-4 h-4 text-green-500 mr-2" />}
                          <span className="font-medium">{activity.type}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-800">{activity.worker} → {activity.client}</div>
                          <div className="text-sm text-gray-600">{activity.service}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium">{activity.amount}</td>
                      <td className="py-4 px-6 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-medium ${
                            activity.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : activity.status === "Under Review"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{activity.time}</td>
                      <td className="py-4 px-6">
                        <button className="text-[#056db3] hover:underline font-medium">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;