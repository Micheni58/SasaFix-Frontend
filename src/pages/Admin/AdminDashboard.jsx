import { Link } from "react-router-dom";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

function AdminDashboard() {
  const bookingData = [
    { month: "Jan", bookings: 120 },
    { month: "Feb", bookings: 135 },
    { month: "Mar", bookings: 148 },
    { month: "Apr", bookings: 162 },
    { month: "May", bookings: 178 },
    { month: "Jun", bookings: 195 },
    { month: "Jul", bookings: 210 },
    { month: "Aug", bookings: 225 },
    { month: "Sep", bookings: 240 },
    { month: "Oct", bookings: 258 },
    { month: "Nov", bookings: 275 },
    { month: "Dec", bookings: 290 },
  ];

  let dummyActivities = [
    {
      type: "Booking",
      worker: "Caleb Nesh",
      client: "John Doe",
      service: "Plumbing",
      amount: "KES 2,500",
      status: "Completed",
      time: "2 hours ago",
    },
    {
      type: "Flagged Account",
      worker: "Jane Smith",
      client: "Multiple complaints",
      service: "Account Issue",
      amount: "-",
      status: "Under Review",
      time: "1 hour ago",
    },
    {
      type: "New Provider",
      worker: "Mike Johnson",
      client: "Platform",
      service: "Electrician",
      amount: "-",
      status: "Approved",
      time: "3 hours ago",
    },
  ];

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-green-600 font-medium">
                    +12.5%
                  </span>
                </div>

                <div className="flex flex-col items-start mt-4">
                  <div className="p-3 bg-blue-100 rounded-full mb-3">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>

                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    2,322
                  </p>

                  <h2 className="text-sm font-medium text-gray-600">
                    Total Users
                  </h2>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-green-600 font-medium">
                    +8.2%
                  </span>
                </div>

                <div className="flex flex-col items-start mt-4">
                  <div className="p-3 bg-purple-100 rounded-full mb-3">
                    <Briefcase className="w-8 h-8 text-purple-600" />
                  </div>

                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    487
                  </p>

                  <h2 className="text-sm font-medium text-gray-600">
                    Total Providers
                  </h2>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
                <div className="absolute top-4 right-4">
                  <span className="text-sm text-green-600 font-medium">
                    +15.3%
                  </span>
                </div>

                <div className="flex flex-col items-start mt-4">
                  <div className="p-3 bg-orange-100 rounded-full mb-3">
                    <Calendar className="w-8 h-8 text-orange-600" />
                  </div>

                  <p className="text-2xl font-bold text-gray-800 mb-1">
                    156
                  </p>

                  <h2 className="text-sm font-medium text-gray-600">
                    Active Bookings
                  </h2>
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
          </section>

          <section className="bg-white p-28 p-6 rounded-xl shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="font-bold text-xl text-gray-800">
                  Bookings Over Time
                </h2>

                <p className="text-gray-600">
                  Monthly booking trends
                </p>
              </div>

              <Link to="/reports">
                <button className="flex items-center bg-[#056db3] hover:bg-[#045ca0] text-white font-medium py-2 px-4 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Report
                </button>
              </Link>
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
          </section>

          <section className="bg-white rounded-xl shadow-sm">
            <div className="p-28 p-6 pb-0">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-bold text-xl text-gray-800">
                    Recent Activity
                  </h2>

                  <p className="text-gray-600">
                    Latest bookings and flagged accounts
                  </p>
                </div>

                <button className="text-[#056db3] hover:underline font-medium">
                  View All
                </button>
              </div>
            </div>

          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;