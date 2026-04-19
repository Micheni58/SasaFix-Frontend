import { useState } from "react";
import { Mail, Phone, CheckCircle2, Clock3, AlertCircle, MessageSquare, RotateCcw, Flag, Play } from "lucide-react";
import { Link } from "react-router-dom";

function AcceptedJobDetails() {
    // Sample job data
    const job = {
        id: "00002",
        service: "Electrical Wiring",
        description: "Install new light fixtures in living room and bedroom",
        date: "Jan 12, 2026",
        time: "02:00 PM",
        location: "Karen, Nairobi - Apartment 5, Spring Gardens",
        duration: "3 hours",
        status: "Accepted",
        client: {
            name: "John Kipchoge",
            initials: "JK",
            type: "Regular Customer",
            bookings: 8,
            phone: "+254 723 456 789",
            email: "john@email.com"
        },
        serviceFee: "KES 3,500",
        commission: "KES 350",
        earnings: "KES 3,150",
        timeline: [
            { task: "Job Accepted", completed: true },
            { task: "Started Work", completed: false },
            { task: "Completed", completed: false },
            { task: "Client Approved", completed: false },
            { task: "Payment Released", completed: false }
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
                        <p className="text-sm text-[#6f10f4] bg-[#f0f4ff] border border-blue-200 rounded-lg p-3 mt-4">
                            Payment will be released to your wallet after job completion and client approval
                        </p>
                    </section>
                </div>

                {/* Sidebar - Actions */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                        
                        <button onClick={() => setModalType("start")} className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white font-semibold py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors">
                            <Play className="w-5 h-5" />
                            Start Work
                        </button>
                        
                        <button onClick={() => setModalType("complete")} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-2 rounded-lg hover:bg-green-700 transition-colors">
                            <CheckCircle2 className="w-5 h-5" />
                            Mark as Completed
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Message Client
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] font-semibold py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                            Request Reschedule
                        </button>
                        
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-600 font-semibold py-2 px-2 rounded-lg hover:bg-red-50 transition-colors">
                            <Flag className="w-5 h-5" />
                            Report Issue
                        </button>

                        {/* Important Notes */}
                        <div className="mt-6 pt-6 border-t border-gray-200 bg-[#fdffe9] rounded-2xl p-4">
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

            {modalType && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
                        <h3 className="text-xl font-bold text-gray-800 mb-3">
                            {modalType === "start" ? "Confirm Start Work" : "Confirm Mark as Completed"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-6">
                            {modalType === "start"
                                ? "Are you sure you want to start work on this job? The client will be notified of the status update."
                                : "Are you sure you want to mark this job as completed? Please make sure all work has been finished before confirming."}
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button onClick={closeModal} className="w-full sm:w-auto rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            <button onClick={confirmModal} className="w-full sm:w-auto rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-900 transition-colors">
                                {modalType === "start" ? "Yes, Start Work" : "Yes, Mark Completed"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AcceptedJobDetails;