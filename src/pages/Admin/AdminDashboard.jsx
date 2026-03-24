import { Link } from "react-router-dom";
import { Users, Briefcase, Calendar, DollarSign, TrendingUp, Eye, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function AdminDashboard() {
  const bookingData = [
    { month: 'Jan', bookings: 120 },
    { month: 'Feb', bookings: 135 },
    { month: 'Mar', bookings: 148 },
    { month: 'Apr', bookings: 162 },
    { month: 'May', bookings: 178 },
    { month: 'Jun', bookings: 195 },
    { month: 'Jul', bookings: 210 },
    { month: 'Aug', bookings: 225 },
    { month: 'Sep', bookings: 240 },
    { month: 'Oct', bookings: 258 },
    { month: 'Nov', bookings: 275 },
    { month: 'Dec', bookings: 290 }
  ];

  let dummyActivities = [
    {
      type: "Booking",
      worker: "Caleb Nesh",
      client: "John Doe",
      service: "Plumbing",
      amount: "KES 2,500",
      status: "Completed",
      time: "2 hours ago"
    },
    {
      type: "Flagged Account",
      worker: "Jane Smith",
      client: "Multiple complaints",
      service: "Account Issue",
      amount: "-",
      status: "Under Review",
      time: "1 hour ago"
    },
    {
      type: "New Provider",
      worker: "Mike Johnson",
      client: "Platform",
      service: "Electrician",
      amount: "-",
      status: "Approved",
      time: "3 hours ago"
    }
  ]

  return (
    <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
      <section className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage Sasafix Service Hub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-4 right-4">
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
            </div>
            <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-blue-100 rounded-full mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">2,322</p>
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
              <p className="text-2xl font-bold text-gray-800 mb-1">487</p>
              <h2 className="text-sm font-medium text-gray-600">Total Providers</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-4 right-4">
              <span className="text-sm text-green-600 font-medium">+15.3%</span>
            </div>
            <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-orange-100 rounded-full mb-3">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">156</p>
              <h2 className="text-sm font-medium text-gray-600">Active Bookings</h2>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow relative">
            <div className="absolute top-4 right-4">
              <span className="text-sm text-green-600 font-medium">+18.7%</span>
            </div>
            <div className="flex flex-col items-start mt-4">
              <div className="p-3 bg-green-100 rounded-full mb-3">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">KES 12.5M</p>
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
                {dummyActivities.map((activity, index) => (
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
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">{activity.time}</td>
                    <td className="py-4 px-6">
                      <button className="text-[#056db3] hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboard;