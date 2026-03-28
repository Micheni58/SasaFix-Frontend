// - Client Home Dashboard (Active Jobs count, 
// Completed Jobs count, 
// Wallet Balance, Loyalty Progress, 
// Active Booking in Progress section)
// import { useNavigate } from "react-router-dom";
import { MapPin, Briefcase, CheckCircle, Wallet, Star, Clock, MessageCircle, Eye } from "lucide-react";

function ClientDashboard() {
        let dummyBookings = [{
        service: "House Cleaning",
        worker: "Sarah Wanjiru",
        date: "Jan 8th, 2026",
        status: "Completed",
        amount: "KES 2,500" 
        },
        {
        service: "Plumbing Repair",
        worker: "Michael Ochieng",
        date: "Jan 8th, 2026",
        status: "In Progress",
        amount: "KES 4,250" 
      },{
        service: "Electrical Repair",
        worker: "James Mwangi",
        date: "Jan 10th, 2026",
        status: "Scheduled",
        amount: "KES 3,000"   
      }
      ]
  return (
    <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
      <section className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, John!</h1>
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
                <p className="text-2xl font-bold text-gray-800 mt-1">3</p>
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
                <p className="text-2xl font-bold text-gray-800 mt-1">24</p>
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
                <p className="text-2xl font-bold text-gray-800 mt-1">KES 4,250</p>
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
                <p className="text-2xl font-bold text-gray-800 mt-1">75%</p>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Briefcase className="w-10 h-10 text-[#056db3] mr-4" />
            <div>
              <p className="font-bold text-lg text-gray-800">Plumbing Repair</p>
              <p className="text-gray-600">Worker: Michael Ochieng</p>
              <div className="flex items-center mt-1">
                <Clock className="w-4 h-4 text-gray-500 mr-1" />
                <p className="text-sm text-gray-500">Jan 8th, 2026 at 10:00 AM</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="bg-white text-[#056db3] px-4 py-2 rounded-lg border border-[#056db3] hover:bg-[#056db3] hover:text-white transition-colors">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Message Worker
            </button>
            <button className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors">
              <Eye className="w-4 h-4 inline mr-1" />
              View Details
            </button>
          </div>
        </div>
        <div className="w-3/4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>50%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#056db3] h-2 rounded-full" style={{width: '50%'}}></div>
          </div>
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-sm">
        <div className="p-6 pb-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl text-gray-800">Recent Bookings</h2>
            <button className="text-[#056db3] hover:underline font-medium">View All</button>
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
                {dummyBookings.map((booking, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">{booking.service}</td>
                    <td className="py-4 px-6">{booking.worker}</td>
                    <td className="py-4 px-6">{booking.date}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-md text-xs font-medium ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'In Progress' ? 'bg-blue-50 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-medium">{booking.amount}</td>
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

export default ClientDashboard; 