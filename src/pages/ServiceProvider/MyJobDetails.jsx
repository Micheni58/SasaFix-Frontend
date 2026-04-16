import { Mail, Phone, CheckCircle2, Clock3, AlertCircle, MessageSquare, RotateCcw, Flag } from "lucide-react";
import { Link } from "react-router-dom";

function MyJobDetails() {
    // Sample job data
    const job = {
        id: "00001",
        service: "Plumbing Repair",
        description: "Fix leaking kitchen sink and check water pressure",
        date: "Jan 8, 2026",
        time: "10:00 AM",
        location: "Westlands, Nairobi - House 23, Green Avenue",
        duration: "2 hours",
        status: "New Request",
        client: {
            name: "Sarah Wanjiku",
            initials: "SW",
            type: "Regular Customer",
            bookings: 5,
            phone: "+254 712 345 678",
            email: "sarah@email.com"
        },
        serviceFee: "KES 2,000",
        commission: "KES 200",
        earnings: "KES 1,800",
        timeline: [
            { task: "Job Accepted", completed: false },
            { task: "Started Work", completed: false },
            { task: "Completed", completed: false },
            { task: "Client Approved", completed: false },
            { task: "Payment Released", completed: false }
        ]
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
            {/* Header */}
            <section className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Job Details</h1>
                        <p className="text-gray-600 mt-2">Request ID #{job.id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        job.status === "New Request" ? "bg-amber-100 text-amber-800" :
                        job.status === "Accepted" ? "bg-sky-100 text-sky-800" :
                        job.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                    }`}>
                        {job.status}
                    </span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Summary */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Job Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Service Type</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.service}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Estimated Duration</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.duration}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-sm text-gray-600 font-medium">Description</p>
                                <p className="text-gray-800 mt-1">{job.description}</p>
                            </div>
                        </div>
                    </section>

                    {/* Date, Time, Location */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule & Location</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <Clock3 className="w-5 h-5 text-[#056db3] mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Date</p>
                                    <p className="text-gray-800 font-semibold">{job.date}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Clock3 className="w-5 h-5 text-[#056db3] mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Time</p>
                                    <p className="text-gray-800 font-semibold">{job.time}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 md:col-span-3">
                                <AlertCircle className="w-5 h-5 text-[#056db3] mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Location</p>
                                    <p className="text-gray-800 font-semibold">{job.location}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Client Information */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Client Information</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                                {job.client.initials}
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-800">{job.client.name}</p>
                                <p className="text-sm text-gray-600">{job.client.type}</p>
                                <p className="text-sm text-gray-600">{job.client.bookings} previous bookings</p>
                            </div>
                        </div>
                        <div className="flex gap-3 mb-6">
                            <a href={`tel:${job.client.phone}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">Call</span>
                            </a>
                            <a href={`mailto:${job.client.email}`} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium">Email</span>
                            </a>
                        </div>
                        <Link to="#">
                            <button className="w-full px-4 py-2 border-2 border-[#056db3] text-[#056db3] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                View Client Profile
                            </button>
                        </Link>
                    </section>

                    {/* Job Status Timeline */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Job Status Timeline</h2>
                        <div className="space-y-4">
                            {job.timeline.map((item, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="shrink-0 mt-1">
                                        {item.completed ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-medium ${item.completed ? "text-green-600" : "text-gray-800"}`}>
                                            {item.task}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Payment Breakdown */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Breakdown</h2>
                        <div className="overflow-x-auto mb-4">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Service Fee</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Platform Commission (10%)</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Your Earnings</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-3 text-gray-800 font-semibold">{job.serviceFee}</td>
                                        <td className="px-4 py-3 text-gray-800 font-semibold">{job.commission}</td>
                                        <td className="px-4 py-3 font-semibold text-green-600">{job.earnings}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                            Payment will be released to your wallet after job completion and client approval
                        </p>
                    </section>
                </div>

                {/* Sidebar - Actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                        
                        <button className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-900 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                            Accept Job
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-semibold py-3 px-4 rounded-lg hover:bg-red-50 transition-colors">
                            Decline Job
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Message Client
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                            Request Reschedule
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                            <Flag className="w-5 h-5" />
                            Report Issue
                        </button>

                        {/* Important Notes */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-800 mb-3">Important Notes</p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Arrive on time or notify client</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Complete job as described</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Request payment only after completion</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Maintain professionalism</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyJobDetails;