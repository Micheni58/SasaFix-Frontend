import { useState } from "react";
import { Mail, Phone, CheckCircle2, Clock3, AlertCircle, MessageSquare, Star, Download, Flag } from "lucide-react";
import { Link } from "react-router-dom";

function CompletedJobDetails() {
    // Sample job data
    const job = {
        id: "00004",
        service: "Furniture Assembly",
        description: "Assemble IKEA bedroom furniture set (bed, wardrobe, nightstands)",
        date: "Jan 10, 2026",
        time: "11:00 AM",
        location: "Lavington, Nairobi - Apartment 12, Maple Court",
        duration: "2.5 hours",
        status: "Completed",
        client: {
            name: "David Kariuki",
            initials: "DK",
            type: "Regular Customer",
            bookings: 12,
            phone: "+254 745 678 901",
            email: "david@email.com"
        },
        serviceFee: "KES 1,800",
        commission: "KES 180",
        earnings: "KES 1,620",
        rating: 5,
        review: "Excellent work! The furniture is assembled perfectly. Very professional and courteous. Would definitely recommend!",
        completedDate: "Jan 10, 2026 at 1:30 PM",
        timeline: [
            { task: "Job Accepted", completed: true },
            { task: "Started Work", completed: true },
            { task: "Completed", completed: true },
            { task: "Client Approved", completed: true },
            { task: "Payment Released", completed: true }
        ]
    };

    const [modalType, setModalType] = useState(null);

    const closeModal = () => setModalType(null);

    const confirmModal = () => {
        // Add action logic here
        setModalType(null);
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Service Type</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.service}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Estimated Duration</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.duration}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Date</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.date}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Time</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.time}</p>
                            </div>
                            <div className="md:col-span-3">
                                <p className="text-sm text-gray-600 font-medium">Location</p>
                                <p className="text-lg font-semibold text-gray-800 mt-1">{job.location}</p>
                            </div>
                            <div className="md:col-span-3">
                                <p className="text-sm text-gray-600 font-medium">Description</p>
                                <p className="text-gray-800 mt-1">{job.description}</p>
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

                    {/* Client Review */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Client Review</h2>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={`w-5 h-5 ${i < job.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-gray-800">{job.rating}.0 Rating</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{job.review}</p>
                    </section>

                    {/* Payment Breakdown */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Breakdown</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="font-light text-gray-700">Service Fee</span>
                                <span className="text-gray-800 font-semibold">{job.serviceFee}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                <span className="font-light text-red-600">Platform Commission (10%)</span>
                                <span className="text-gray-800 font-semibold">{job.commission}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-semibold text-gray-700">Your Earnings</span>
                                <span className="font-semibold text-green-600 text-2xl">{job.earnings}</span>
                            </div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                            <p className="text-sm text-green-700 font-medium">✓ Payment released successfully on {job.completedDate}</p>
                        </div>
                    </section>
                </div>

                {/* Sidebar - Actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                        
                        <button className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white font-semibold py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors">
                            <Download className="w-5 h-5" />
                            Download Invoice
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Message Client
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <Star className="w-5 h-5" />
                            View More Jobs
                        </button>

                        {/* Completion Details */}
                        <div className="mt-6 pt-6 border-t border-gray-200 bg-green-50 rounded-2xl p-4">
                            <p className="text-sm font-semibold text-gray-800 mb-3">Completion Details</p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Job completed successfully</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Client approved the work</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>Payment processed</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-green-600 font-bold">✓</span>
                                    <span>5-star rating received</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CompletedJobDetails;
