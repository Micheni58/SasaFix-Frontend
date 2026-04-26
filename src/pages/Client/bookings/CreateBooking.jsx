import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock3, MapPin, FileText, ShieldCheck } from "lucide-react";

function CreateBooking() {
    const navigate = useNavigate();
    const [serviceType, setServiceType] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [preferredTime, setPreferredTime] = useState("");
    const [serviceLocation, setServiceLocation] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [urgency, setUrgency] = useState("normal");

    const handleSubmit = (event) => {
        event.preventDefault();
        const bookingData = { serviceType, preferredDate, preferredTime, serviceLocation, jobDescription, urgency };
        console.log(bookingData);
        // Navigate to MyBookings page
        navigate("/client/mybookings");
    };

    const handleCancel = () => {
        setServiceType("");
        setPreferredDate("");
        setPreferredTime("");
        setServiceLocation("");
        setJobDescription("");
        setUrgency("normal");
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen ml-64 p-6">
            <section className="mb-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Create Booking</h1>
                        <p className="text-gray-600 mt-2">Fill in the details to book a service.</p>
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Service Provider Card */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Service Provider</h2>
                        <div className="border-b border-gray-200 pb-6">
                            {/* The service provider profile with circle initials of names,speciality,and rate per hr */}
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                                    JD
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">Jane Doe</p>
                                    <p className="text-sm text-gray-600">Certified Plumber</p>
                                    <p className="text-sm text-gray-600 mt-1">KES 1,500 / hr</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Booking Form Card */}
                    <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="serviceType">
                                    Service Type *
                                </label>
                                <select
                                    id="serviceType"
                                    value={serviceType}
                                    onChange={(e) => setServiceType(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800  focus:outline-none focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3]"
                                >
                                    <option value="">Select a service</option>
                                    <option value="plumbing">Plumbing</option>
                                    <option value="electrical">Electrical</option>
                                    <option value="cleaning">Cleaning</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    {/* Date icon on the same line as the label */}
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2" htmlFor="preferredDate">
                                        <Calendar className="w-4 h-4 text-[#056db3]" />
                                        Preferred Date *
                                    </label>
                                    <input
                                        id="preferredDate"
                                        type="date"
                                        value={preferredDate}
                                        onChange={(e) => setPreferredDate(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300  px-4 py-3 text-gray-800 bg-gray-100 focus:outline-none focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3]"
                                    />
                                </div>

                                <div>
                                    {/* clock icon on the same line as the label */}
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2" htmlFor="preferredTime">
                                        <Clock3 className="w-4 h-4 text-[#056db3]" />
                                        Preferred Time *
                                    </label>
                                    <select
                                        id="preferredTime"
                                        value={preferredTime}
                                        onChange={(e) => setPreferredTime(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800  focus:outline-none focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3]"
                                    >
                                        <option value="">Select a time slot</option>
                                        <option value="9:00">09:00 AM</option>
                                        <option value="10:00">10:00 AM</option>
                                        <option value="12:00">12:00 PM</option>
                                        <option value="14:00">02:00 PM</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                {/* location icon on the same line as the label */}
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2" htmlFor="serviceLocation">
                                    <MapPin className="w-4 h-4 text-[#056db3]" />
                                    Service Location *
                                </label>
                                <input
                                    id="serviceLocation"
                                    type="text"
                                    placeholder="Enter your location"
                                    value={serviceLocation}
                                    onChange={(e) => setServiceLocation(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-black  focus:outline-none focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3]"
                                />
                            </div>

                            <div>
                                {/* paper icon on the same line as the label */}
                                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2" htmlFor="jobDescription">
                                    <FileText className="w-4 h-4 text-[#056db3]" />
                                    Job Description
                                </label>
                                <textarea
                                    id="jobDescription"
                                    rows="4"
                                    placeholder="Describe what needs to be done"
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-3 text-gray-800  focus:outline-none focus:border-[#056db3] focus:ring-1 focus:ring-[#056db3]"
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-800">Urgency Level</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <label className="rounded-xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-[#056db3] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value="normal"
                                            checked={urgency === "normal"}
                                            onChange={(e) => setUrgency(e.target.value)}
                                            className="mr-3 text-[#056db3] bg-[#056db3]"
                                        />
                                        <span className="font-semibold text-gray-800">Normal</span>
                                        <p className="text-sm text-gray-600 mt-1">Within 2-3 days</p>
                                    </label>
                                    <label className="rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-[#056db3] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value="urgent"
                                            checked={urgency === "urgent"}
                                            onChange={(e) => setUrgency(e.target.value)}
                                            className="mr-3 text-[#056db3]"
                                        />
                                        <span className="font-semibold text-gray-800">Urgent</span>
                                        <p className="text-sm text-gray-600 mt-1">Within 24hrs</p>
                                    </label>
                                    <label className="rounded-2xl border-2 border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-[#056db3] cursor-pointer">
                                        <input
                                            type="radio"
                                            name="urgency"
                                            value="emergency"
                                            checked={urgency === "emergency"}
                                            onChange={(e) => setUrgency(e.target.value)}
                                            className="mr-3 text-[#056db3]"
                                        />
                                        <span className="font-semibold text-gray-800">Emergency</span>
                                        <p className="text-sm text-gray-600 mt-1">ASAP (+30% fee)</p>
                                    </label>
                                </div>
                            </div>
                        </form>
                    </section>

                </div>

                {/* Sidebar */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-6 space-y-6">
                        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            {/* Price Breakdown Section */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">Price Breakdown</h2>
                                        <p className="text-xs text-gray-600 mt-1">See the estimated cost before confirming.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-2 border-gray-100">
                                        <span className="font-light text-sm text-gray-700">Estimated Service Cost</span>
                                        <span className="text-gray-800 font-semibold text-sm">KES 2,000</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-300">
                                        <span className="font-light text-sm text-gray-700">Platform Fee</span>
                                        <span className="text-gray-800 font-semibold text-sm">KES 200</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2">
                                        <span className="font-semibold text-sm text-gray-700">Total Amount</span>
                                        <span className="text-green-600 font-semibold text-lg">KES 2,200</span>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="space-y-3 mb-6">
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full rounded-xl bg-[#056db3] px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-900"
                                >
                                    Confirm Booking
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#056db3] bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-blue-50"
                                >
                                    Cancel
                                </button>
                            </div>

                          
                            {/* Separator */}
                            <div className="border-t border-gray-300 my-6"></div>

                            {/* Booking Terms Section */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="w-5 h-5 text-[#056db3]" />
                                    <h2 className="text-lg font-bold text-gray-800">Booking Terms</h2>
                                </div>
                                <ul className="space-y-2 text-xs text-gray-700">
                                    <li className="flex gap-2">
                                        <span className="mt-0.5 text-[#056db3] font-bold">•</span>
                                        <span>Payment is processed after job completion.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-0.5 text-[#056db3] font-bold">•</span>
                                        <span>Free cancellation is available up to 24 hours before.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-0.5 text-[#056db3] font-bold">•</span>
                                        <span>Worker will confirm your booking within 2 hours.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <span className="mt-0.5 text-[#056db3] font-bold">•</span>
                                        <span>100% satisfaction guarantee applies.</span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default CreateBooking;