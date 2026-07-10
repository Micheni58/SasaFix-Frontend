import { Mail, Phone, CheckCircle2, Clock3, AlertCircle, MessageSquare, RotateCcw, Flag, Calendar, MapPin } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import bookingService from "../../../api/bookingService";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";

function MyBookingDetails() {
    const { bookingId } = useParams();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reportOpen, setReportOpen] = useState(false);
    const [reportText, setReportText] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const navigate = useNavigate();

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
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Loading booking...</p>
                    </main>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role="client" />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-6 flex items-center justify-center">
                        <p className="text-gray-500">Booking not found.</p>
                    </main>
                </div>
            </div>
        );
    }

    // map normalized booking fields to the UI shape used previously and compute fees/timeline
    const providerId = booking?.serviceProviderId || booking?.raw?.service_provider_id || booking?.raw?.service_provider?.id || null;

    function computeTimeline(status) {
        const stages = [
            { task: "Requested", key: "requested" },
            { task: "Scheduled", key: "scheduled" },
            { task: "In Progress", key: "in_progress" },
            { task: "Completed", key: "completed" },
        ];

        if (status === "Cancelled") {
            return [{ task: "Cancelled", completed: true }];
        }

        // determine completed index
        const order = {
            Requested: 0,
            Upcoming: 1,
            "In Progress": 2,
            Completed: 3,
        };

        const idx = order[status] ?? 0;
        return stages.map((s, i) => ({ task: s.task, completed: i <= idx }));
    }

    const amountRaw = booking?.amountRaw || booking?.raw?.amount || 0;
    const providerIsPremium = !!(
        booking?.raw?.service_provider?.premium || booking?.raw?.service_provider?.is_premium || booking?.raw?.provider?.premium
    );
    const commissionRate = providerIsPremium ? 0.05 : 0.1;
    const commissionAmt = amountRaw ? Math.round(amountRaw * commissionRate) : 0;
    // clients pay the full service amount; show commission separately
    const totalAmt = amountRaw ? Math.round(amountRaw) : 0;

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
            id: providerId,
            name: booking.providerName || booking.provider_full_name || booking.worker || (booking.service_provider && (booking.service_provider.name || booking.service_provider.full_name)) || (booking.serviceProviderId ? `Provider #${booking.serviceProviderId}` : `Provider #${booking.service_provider_id}`),
            initials: booking.initials || ((booking.providerName || booking.provider_full_name || booking.worker || "").split(" ").map(s=>s[0]).slice(0,2).join("")) || "--",
            trade: booking.service_provider?.service_type || null,
            rating: booking.service_provider?.rating || null,
            phone: booking.service_provider?.contact_phone || booking.service_provider?.phone || null,
            email: booking.service_provider?.contact_email || booking.service_provider?.email || null,
        },
        serviceFee: amountRaw ? `KES ${amountRaw.toLocaleString()}` : "KES 0",
        commission: `KES ${commissionAmt.toLocaleString()}`,
        totalPaid: `KES ${totalAmt.toLocaleString()}`,
        timeline: booking.timeline && booking.timeline.length ? booking.timeline : computeTimeline(booking.status),
        providerIsPremium,
    };

    // Actions
    const handleMessage = () => {
        const q = ui.worker.id ? `?provider=${ui.worker.id}` : "";
        navigate(`/client/messages${q}`);
    };

    const handleReschedule = async () => {
        if (ui.status !== "Upcoming") {
            window.alert("Rescheduling is only allowed for Upcoming bookings.");
            return;
        }
        const newDate = window.prompt("Enter new date (YYYY-MM-DD)", ui.date || "");
        if (!newDate) return;
        const newTime = window.prompt("Enter new start time (HH:MM)", ui.time ? ui.time.split(' - ')[0] : "09:00");
        if (!newTime) return;
        try {
            setActionLoading(true);
            const updated = await bookingService.rescheduleBooking(ui.id, { scheduled_date: newDate, scheduled_start_time: newTime });
            if (updated) setBooking(updated);
            window.alert("Reschedule request submitted. Provider will need to accept.");
        } catch (err) {
            console.error(err);
            window.alert("Failed to submit reschedule request.");
        } finally { setActionLoading(false); }
    };

    const handleCancel = async () => {
        if (ui.status === "Completed") {
            window.alert("Completed bookings cannot be cancelled.");
            return;
        }
        if (ui.status === "In Progress") {
            window.alert("Bookings that are in progress cannot be cancelled at the moment.");
            return;
        }
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            setActionLoading(true);
            const updated = await bookingService.cancelBooking(ui.id);
            if (updated) setBooking(updated);
            window.alert("Booking cancelled.");
        } catch (err) {
            console.error(err);
            window.alert("Failed to cancel booking.");
        } finally { setActionLoading(false); }
    };

    const submitReport = async () => {
        if (!reportText) {
            window.alert("Please add a reason for the report.");
            return;
        }
        // For now, log and close. Backend endpoint not defined here.
        console.info("Report submitted", { bookingId: ui.id, text: reportText });
        setReportText("");
        setReportOpen(false);
        window.alert("Report submitted. Our team will review it.");
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role="client" />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-6">
                    <section className="mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Booking Details</h1>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        ui.status === "Upcoming" ? "bg-sky-100 text-sky-800" :
                        ui.status === "In Progress" ? "bg-amber-100 text-amber-800" :
                        ui.status === "Completed" ? "bg-green-100 text-green-800" :
                        ui.status === "Cancelled" ? "bg-red-100 text-red-800" :
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
                        <Link to={ui.worker.id ? `/service-provider/${ui.worker.id}` : "/service-provider"}>
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
                        <button onClick={handleMessage} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 bg-[#056db3] text-white  py-2 px-2 rounded-lg hover:bg-blue-900 transition-colors">
                            <MessageSquare className="w-5 h-5" />
                            Message Worker
                        </button>
                        {ui.status === "Upcoming" ? (
                            <button onClick={handleReschedule} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3]  py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
                                <RotateCcw className="w-5 h-5" />
                                Reschedule Booking
                            </button>
                        ) : (
                            <button onClick={() => window.alert('Rescheduling is only allowed for Upcoming bookings.')} className="w-full flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-500  py-2 px-2 rounded-lg">
                                <RotateCcw className="w-5 h-5" />
                                Reschedule Booking
                            </button>
                        )}
                        <button onClick={handleCancel} disabled={actionLoading} className="w-full flex items-center justify-center gap-2 border-2 border-red-300 text-red-500  py-2 px-2 rounded-lg hover:bg-red-100 transition-colors">
                            Cancel Booking
                        </button>
                        <button onClick={() => setReportOpen(true)} className="w-full flex items-center justify-center gap-2 border-2 border-[#056db3] text-[#056db3] py-2 px-2 rounded-lg hover:bg-blue-100 transition-colors">
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
                {/* Report Modal */}
                {reportOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                                <div className="w-full max-w-lg rounded-xl bg-white shadow-lg p-6 border-2 border-blue-100 ring-2 ring-blue-50">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Report Issue for Booking</h3>
                                    <textarea value={reportText} onChange={(e)=>setReportText(e.target.value)} rows={6} className="w-full rounded-xl border border-blue-200 p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-200" placeholder="Describe the issue..." />
                                    <div className="flex gap-3 justify-end">
                                        <button onClick={()=>setReportOpen(false)} className="px-4 py-2 rounded-lg border border-gray-300">Cancel</button>
                                        <button onClick={submitReport} className="px-4 py-2 rounded-lg bg-[#056db3] text-white">Submit Report</button>
                                    </div>
                                </div>
                    </div>
                )}

                </main>
            </div>
        </div>
    );
}

export default MyBookingDetails;