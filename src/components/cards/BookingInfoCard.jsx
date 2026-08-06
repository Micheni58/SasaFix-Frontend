// src/pages/Client/bookings/components/BookingInfoCard.jsx

import { Calendar, Clock3, MapPin } from "lucide-react";

export function BookingInfoCard({ booking }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Details</h2>
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-gray-600 font-medium">Service</p>
                    <p className="text-lg text-gray-800 mt-1">{booking.service}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Date</p>
                            <p className="text-lg text-gray-800 mt-1">{booking.date}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Clock3 className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm text-gray-600 font-medium">Time</p>
                            <p className="text-lg text-gray-800 mt-1">{booking.time}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#056db3] mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm text-gray-600 font-medium">Location</p>
                        <p className="text-gray-800 mt-1">{booking.location}</p>
                    </div>
                </div>
                <div>
                    <p className="text-sm text-gray-600 font-medium">Description</p>
                    <p className="text-gray-800 mt-1">{booking.description}</p>
                </div>
            </div>
        </section>
    );
}