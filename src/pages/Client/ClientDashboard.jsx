// - Client Home Dashboard (Active Jobs count, 
// Completed Jobs count, 
// Wallet Balance, Loyalty Progress, 
// Active Booking in Progress section)
import { useNavigate } from "react-router-dom";

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
    <div className="bg-[#f8fafc]">
      <section className="">
        <div>
          <h1 className="text-3xl font-bold">Welcome back,John!</h1>
          <div>
            <span>
              <p>Location icon</p>
            </span>
            <h2>Nairobi, Kenya</h2>
          </div>
        </div>
        
        
        <div className="grid grid-cols-4 ">
          <div className="bg-white border border-[#e3e6f1] p-2 rounded-lg">
            <h2>Active Jobs</h2>
            <span>Briefcase Icon</span>
            <p className="font-bold">3</p>
          </div>
          <div className="bg-white border border-[#e3e6f1] p-2 rounded-lg">
            <h2>Completed Jobs</h2>
            <span>Checkbox Icon</span>
            <p className="font-bold">24</p>
          </div>
          <div className="bg-white border border-[#e3e6f1] p-2 rounded-lg">
            <h2>Wallet Balance</h2>
            <span>Wallet Icon</span>
            <p className="font-bold">KES 4,250</p>
          </div>
          <div className="bg-white border border-[#e3e6f1] p-2 rounded-lg">
            <h2>Loyalty Progress</h2>
            <span>Star Icon</span>
            <p className="font-bold">75%</p>
          </div>
         </div>
      </section>

      <section className="bg-white p-4 rounded-lg mt-6">
        <div>
          <h2 className="font-bold text-lg">Active Booking In Progress</h2>
        </div>
        <div className="grid grid-cols-3">
          <div>
            <span>Blue Briefcase icon</span>
          </div>
          <div>
            <p className="font-bold">Plumbing Repair</p>
            <p>Worker:Michael Ochieng</p>
            <span>Clock Icon</span>
            <p>Jan 8th, 2026 at 10:00 AM</p>
          </div>
        <div>
          <div>
            <button className="bg-white text-[#056db3] p-2 rounded-lg border border-[#056db3]">
              Message Worker
            </button>
            <button className="bg-[#056db3] text-white p-2 rounded-lg">
              View Details
            </button>
           </div>

          </div>
           <progress value="50" max="100" className="w-full">
            50%
          </progress>
        </div>
        
      </section>
      <section className="bg-white mt-6 p-4 rounded-lg">
        <div className="flex space-x-4 justify-between items-center mb-4">
          <h2>Recent Bookings</h2>
          <button className="text-[#056db3] underline ">View All</button>
        </div>
        <table>
          <th>Service</th>
          <th>Worker</th>
          <th>Date</th>
          <th>Status</th>
          <th>Amount</th>
          <th>Actions</th>
          <tr>
            <td>{dummyBookings[0].service}</td>
            <td>{dummyBookings[0].worker}</td>
            <td>{dummyBookings[0].date}</td>
            <td>{dummyBookings[0].status}</td>
            <td>{dummyBookings[0].amount}</td>
            <td>
              <button onClick={() => navigate(`/booking/${dummyBookings[0].id}`)}>View</button>
            </td>
          </tr>
        </table>
        
      </section>
    </div>
   

  
  )
}

export default ClientDashboard; 