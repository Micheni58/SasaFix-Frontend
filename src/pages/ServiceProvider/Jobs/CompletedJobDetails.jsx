import { useState, useEffect } from "react";
import {
    Mail,
    Phone,
    CheckCircle2,
    Calendar,
    Clock3,
    MapPin,
    AlertCircle,
    MessageSquare,
    Star,
    Download,
    Flag
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

function CompletedJobDetails() {
    const { id: bookingId } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        bookingService.getBooking(bookingId)
            .then((b) => {
                if (!mounted) return;
                const mapped = {
                    id: b.id || bookingId,
                    service: b.service || b.service_name || '',
                    description: b.details || b.description || '',
                    date: b.date || b.scheduled_date || '',
                    time: b.time || b.scheduled_start_time || '',
                    location: b.location || '',
                    duration: b.duration || b.estimated_duration || '',
                    status: b.status || 'Completed',
                    client: {
                        name: b.clientName || (b.client && (b.client.full_name || b.client.name)) || `Client #${b.clientId || (b.client && b.client.id)}`,
                        initials: (b.clientName || (b.client && (b.client.full_name || b.client.name)) || '').split(' ').map(s=>s[0]).slice(0,2).join('') || '--',
                        type: b.client?.type || 'Customer',
                        bookings: b.client?.booking_count || b.client?.bookings || 0,
                        phone: b.client?.phone || b.client_phone || '',
                        email: b.client?.email || b.client_email || ''
                    },
                    serviceFee: b.amount || (b.amountRaw ? `KES ${b.amountRaw}` : ''),
                    commission: b.commission || '',
                    earnings: b.earnings || '',
                    rating: b.rating || null,
                    review: b.review || b.client_review || '',
                    completedDate: b.completed_at || b.completedDate || '',
                    timeline: b.timeline || [] ,
                    raw: b
                };
                setJob(mapped);
            })
            .catch((e) => {
                console.error(e);
                if (!mounted) return;
                setError(e.message || 'Failed to load booking');
            })
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, [bookingId]);

    const [modalType, setModalType] = useState(null);

    const closeModal = () => setModalType(null);

    const confirmModal = () => {
        setModalType(null);
    };

    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Loading...</p>
                    </main>
                </div>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-red-500">Error: {error}</p>
                    </main>
                </div>
            </div>
        );
    }
    if (!job) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="provider" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">No booking found.</p>
                    </main>
                </div>
            </div>
        );
    }

        return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="provider" />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Job Summary */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Job Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3">
                                <p className="text-sm text-gray-600">Service Type</p>
                                <p className="text-lg  text-gray-800 mt-1">{job.service}</p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date</span>
                                </div>
                                <p className="text-lg  text-gray-800 mt-1">{job.date}</p>
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock3 className="h-4 w-4" />
                                    <span>Time</span>
                                </div>
                                <p className="text-lg  text-gray-800 mt-1">{job.time}</p>
                            </div>
                            <div className="md:col-span-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span>Location</span>
                                </div>
                                <p className=" text-gray-800 mt-1">{job.location}</p>
                            </div>
                            <div className="md:col-span-3">
                                <p className="text-sm text-gray-600">Description</p>
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
                            <div className="flex justify-between items-center py-2">
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
                        <div className="bg-blue-50 border border-[#056db3] rounded-lg p-3 mt-4">
                            <p className="text-sm text-[#056db3] font-medium">Payment will be released to your wallet after job completion and client approval</p>
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
                </main>
            </div>
        </div>
    );
}

export default CompletedJobDetails;
