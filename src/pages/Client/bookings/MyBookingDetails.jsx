import { Mail, Phone, CheckCircle2, Clock3, AlertCircle, MessageSquare, RotateCcw, Flag, Calendar, MapPin } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import bookingService from "../../../api/bookingService";

function MyBookingDetails() {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        bookingService.getBooking(Number(bookingId))
            .then((b) => {
                if (!mounted) return;
                setBooking(b);
            })
            .catch((err) => console.error(err))
            .finally(() => mounted && setLoading(false));

        return () => { mounted = false; };
    }, [bookingId]);

    if (loading) {
        return <div className="min-h-screen ml-64 p-6">Loading booking...</div>;
    }

    if (!booking) {
        return <div className="min-h-screen ml-64 p-6">Booking not found.</div>;
    }

    // map normalized booking fields to the UI shape used previously
    const ui = {
        id: booking.id,
        service: booking.service || booking.service_name,
        description: booking.details || booking.description,
        date: booking.date || booking.scheduled_date,
        time: booking.time || (booking.scheduled_start_time && `${booking.scheduled_start_time} - ${booking.scheduled_end_time}`),
        location: booking.location,
        duration: booking.duration || null,
        status: booking.status,
        worker: {
            name: booking.providerName || booking.provider_full_name || booking.worker || (booking.service_provider && (booking.service_provider.name || booking.service_provider.full_name)) || (booking.serviceProviderId ? `Provider #${booking.serviceProviderId}` : `Provider #${booking.service_provider_id}`),
            initials: booking.initials || ((booking.providerName || booking.provider_full_name || booking.worker || "").split(" ").map(s=>s[0]).slice(0,2).join("")) || "--",
            trade: booking.service_provider?.service_type || null,
            rating: booking.service_provider?.rating || null,
            phone: booking.service_provider?.contact_phone || booking.service_provider?.phone || null,
            email: booking.service_provider?.contact_email || booking.service_provider?.email || null,
        },
        serviceFee: booking.amount || booking.amountRaw ? `KES ${booking.amountRaw?.toLocaleString?.() || booking.amount}` : "",
        commission: booking.commission || "",
        totalPaid: booking.amount || booking.amountRaw ? `KES ${booking.amountRaw?.toLocaleString?.() || booking.amount}` : "",
        timeline: booking.timeline || [],
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
            <section className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Booking Details</h1>
                        <p className="text-gray-600 mt-2">Booking ID #{ui.id}</p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        ui.status === "Upcoming" ? "bg-sky-100 text-sky-800" :
                        ui.status === "In Progress" ? "bg-blue-100 text-blue-800" :
                        ui.status === "Completed" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-700"
                    }`}>
                        {ui.status}
                    </span>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h2>
                        <div className="space-y-6">                            
                                <div>
                                    <p className="text-sm text-gray-600 font-medium">Service</p>
                                    <p className="text-lg  text-gray-800 mt-1">{ui.service}</p>
                                </div>
                            {/* Date and Time - Horizontal on same line */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Date</p>
                                        <p className="text-lg  text-gray-800 mt-1">{ui.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock3 className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Time</p>
                                        <p className="text-lg text-gray-800 mt-1">{ui.time}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Location - Full width with icon */}
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 font-medium">Location</p>
                                    <p className="text-gray-800  mt-1">{ui.location}</p>
                                </div>
                            </div>

                            {/* Description - Full width */}
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Description</p>
                                <p className="text-gray-800 mt-1">{ui.description}</p>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Provider Information</h2>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                                {ui.worker.initials}
                            </div>
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-gray-800">{ui.worker.name}</p>
                                <p className="text-sm text-gray-600">{ui.worker.trade}</p>
                                <p className="text-sm text-gray-600">{ui.worker.rating ? `${ui.worker.rating} ★ rating` : ''}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 mb-6 sm:flex-row">
                            <a href={ui.worker.phone ? `tel:${ui.worker.phone}` : '#'} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">Call Provider</span>
                            </a>
                            <a href={ui.worker.email ? `mailto:${ui.worker.email}` : '#'} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium">Email Provider</span>
                            </a>
                        </div>
                        <Link to="#">
                            <button className="w-full px-4 py-2 border-2 border-[#056db3] text-[#056db3] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                                View Provider Profile
                            </button>
                        </Link>
                    </section>

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Timeline</h2>
                        <div className="space-y-4">
                            {(ui.timeline || []).map((item, index) => (
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

                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2">
                                <span className="font-light text-gray-700">Service Cost</span>
                                <span className="text-gray-800 font-semibold">{ui.serviceFee}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                <span className="font-light text-gray-700">Platform Fee</span>
                                <span className="text-gray-800 font-semibold">{ui.commission}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="font-semibold text-gray-700">Total Amount</span>
                                <span className="font-semibold text-green-600 text-2xl">{ui.totalPaid}</span>
                            </div>
                        </div>
                        <p className="text-sm text-[#056db3] bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                            Payment will be charged when the service is completed and approved.
                        </p>
                    </section>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <h2 className="text-xl font-bold text-gray-800">Actions</h2>
                        <button className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white  py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Message Worker
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3]  py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <RotateCcw className="w-5 h-5" />
                            Reschedule Booking
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-500  py-2 px-2 rounded-lg hover:bg-red-100 transition-colors">
                            Cancel Booking
                        </button>
                        <button className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <Flag className="w-5 h-5" />
                            Report Issue
                        </button>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm font-semibold text-gray-800 mb-3">Important Notes</p>
                            <ul className="space-y-2 text-sm text-gray-700">
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Keep the provider informed of any changes.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Approve the job only after it is completed.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Use the chat for quick updates.</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#056db3] font-bold">•</span>
                                    <span>Leave feedback after the service.</span>
                                </li>
                            </ul>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyBookingDetails;