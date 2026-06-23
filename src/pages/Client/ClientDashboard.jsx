// Client Home Dashboard — fetches real bookings and computes summary stats
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Briefcase, CheckCircle, Wallet, Star, Clock, MessageCircle, Eye } from "lucide-react";
import bookingService from "../../api/bookingService";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const clientId = Number(localStorage.getItem("userId") || 1);
    setLoading(true);
    bookingService
      .listClientBookings(clientId)
      .then((data) => {
        if (!mounted) return;
        setBookings(data || []);
      })
      .catch((err) => {
        console.error(err);
        if (!mounted) return;
        setError(err);
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const activeCount = bookings.filter((b) => b.status === "In Progress" || b.status === "Upcoming").length;
  const completedCount = bookings.filter((b) => b.status === "Completed").length;
  const walletBalance = "KES " + (bookings.reduce((sum, b) => sum + (b.amountRaw || 0), 0)).toLocaleString();
  const loyalty = Math.min(100, Math.round((completedCount / Math.max(1, completedCount + activeCount)) * 100));

  const activeBooking = bookings.find((b) => b.status === "In Progress" || b.status === "Upcoming") || null;

  // derive logged-in user display name from stored auth user
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  })();

  const displayName = storedUser
    ? (storedUser.full_name || storedUser.name || `${storedUser.first_name || ""} ${storedUser.last_name || ""}`.trim() || storedUser.email || "User")
    : "User";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <section className="mb-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {displayName}!</h1>
          <div className="flex items-center mt-2">
            <MapPin className="w-5 h-5 text-[#056db3] mr-2" />
            <h2 className="text-lg text-gray-600">Nairobi, Kenya</h2>
          </div>
        </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Active Jobs</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{activeCount}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Briefcase className="w-8 h-8 text-[#056db3]" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Completed Jobs</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{completedCount}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Wallet Balance</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{walletBalance}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="w-8 h-8 text-[#056db3]" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Loyalty Progress</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">{loyalty}%</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
         </div>
      </section>

      <section className="bg-white p-6 rounded-xl shadow-sm mb-8">
        <div className="mb-4">
          <h2 className="font-bold text-xl text-gray-800">Active Booking In Progress</h2>
        </div>
        {activeBooking ? (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Briefcase className="w-10 h-10 text-[#056db3] mr-4" />
              <div>
                <p className="font-bold text-lg text-gray-800">{activeBooking.service}</p>
                <p className="text-gray-600">Worker: {activeBooking.providerName || activeBooking.worker}</p>
                <div className="flex items-center mt-1">
                  <Clock className="w-4 h-4 text-gray-500 mr-1" />
                  <p className="text-sm text-gray-500">{activeBooking.date} {activeBooking.time}</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <button className="bg-white text-[#056db3] px-4 py-2 rounded-lg border border-[#056db3] hover:bg-[#056db3] hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Message Worker
              </button>
              <Link to={`/client/my-bookings/${activeBooking.id}`} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
                <Eye className="w-4 h-4 inline mr-1" />
                View Details
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6 text-gray-600">No active bookings</div>
        )}
        <div className="w-3/4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{activeBooking ? '50%' : '0%'}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#056db3] h-2 rounded-full" style={{width: activeBooking ? '50%' : '0%'}}></div>
          </div>
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-gray-800">Recent Bookings</h2>
            <Link to="/client/my-bookings" className="text-[#056db3] hover:underline font-medium">View All</Link>
          </div>
        </div>
        <div className="border-t border-gray-200 ">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Worker</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{booking.service || booking.service_name}</td>
                    <td className="py-4 px-6">{booking.providerName || booking.worker || (booking.service_provider && (booking.service_provider.name || booking.service_provider.full_name)) || (booking.service_provider_id ? `Provider #${booking.service_provider_id}` : '')}</td>
                    <td className="py-4 px-6">{booking.date || booking.scheduled_date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'In Progress' ? 'bg-blue-50 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">{booking.amount || booking.amountRaw ? (booking.amount || `KES ${booking.amountRaw}`) : ''}</td>
                    <td className="py-4 px-6">
                      <Link to={`/client/my-bookings/${booking.id}`} className="text-[#056db3] hover:underline font-medium">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
        </main>
      </div>
    </div>

  )
}

export default ClientDashboard;