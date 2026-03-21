import { MapPin, Briefcase, CheckCircle, Wallet, Star, Clock, MessageCircle, Eye, DollarSign, TrendingUp } from "lucide-react";

function ProviderDashboard() {
  const providerBookings = [
    { client: "John Doe", service: "House Cleaning", time: "10:00 AM", location: "Westlands", status: "In Progress", payments: "KES 4,000" },
    { client: "Mary Ouma", service: "AC Repair", time: "2:00 PM", location: "Karen", status: "Completed", payments: "KES 6,200" },
    { client: "Kevin Kamau", service: "Carpentry", time: "9:00 AM", location: "Kilimani", status: "Scheduled", payments: "KES 8,500" },
  ];

  return (
    <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
      <section className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Sarah!</h1>
          <div className="flex items-center mt-2">
            <MapPin className="w-5 h-5 text-[#056db3] mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">Plumbing specialist</h2>
            <h2 className="text-lg text-gray-600">Nairobi, Kenya</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Today's Jobs</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">6</p>
                <p className="text-sm text-gray-600 font-medium">+2 from yesterday</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <Briefcase className="w-8 h-8 text-[#056db3]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Monthly Earnings</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">KES 78,500</p>
                <p className="text-gray-600  text-sm">+15% from last month</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <DollarSign className="w-8 h-8 text-[#056db3]" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Completion Rate</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">32</p>
                <p className="text-sm text-gray-600">+5% from last month</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          

          <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-gray-600">Average Rating</h2>
                <p className="text-2xl font-bold text-gray-800 mt-1">4.9</p>
                <p className="text-sm text-gray-600">127 Reviews</p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-full">
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-gray-800">Recent Jobs</h2>
            <button className="text-[#056db3] hover:underline font-medium">View All</button>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Client</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Service</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Time</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Location</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">Payments</th>
                </tr>
              </thead>
              <tbody>
                {providerBookings.map((booking, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{booking.client}</td>
                    <td className="py-4 px-6">{booking.service}</td>
                    <td className="py-4 px-6">{booking.time}</td>
                    <td className="py-4 px-6">{booking.location}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-medium ${
                          booking.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "In Progress"
                            ? "bg-blue-50 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">{booking.payments}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-sm mt-6 p-6">
        <div className="mb-4">
          <h2 className="font-bold text-xl text-gray-800">Availability Schedule</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-bold text-lg text-gray-800">Today</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">3 Booked</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-blue-100 rounded-md bg-blue-50">
                <span className="text-sm font-medium">10:00 AM</span>
                <span className="text-xs text-gray-600">Booked</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-green-50">
                <span className="text-sm font-medium">12:00 PM</span>
                <span className="text-xs text-green-600">Available</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-blue-100 rounded-md bg-blue-50">
                <span className="text-sm font-medium">2:00 PM</span>
                <span className="text-xs text-gray-600">Booked</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-bold text-lg text-gray-800">Tomorrow</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">2 Booked</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-green-50">
                <span className="text-sm font-medium">10:00 AM</span>
                <span className="text-xs text-green-600">Available</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-blue-100 rounded-md bg-blue-50">
                <span className="text-sm font-medium">12:00 PM</span>
                <span className="text-xs text-gray-600">Booked</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-green-50">
                <span className="text-sm font-medium">2:00 PM</span>
                <span className="text-xs text-green-600">Available</span>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h1 className="font-bold text-lg text-gray-800">Thursday, April 2</h1>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">1 Booked</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 border border-blue-100 rounded-md bg-blue-50">
                <span className="text-sm font-medium">10:00 AM</span>
                <span className="text-xs text-gray-600">Booked</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-green-50">
                <span className="text-sm font-medium">12:00 PM</span>
                <span className="text-xs text-green-600">Available</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-green-100 rounded-md bg-green-50">
                <span className="text-sm font-medium">2:00 PM</span>
                <span className="text-xs text-green-600">Available</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProviderDashboard;