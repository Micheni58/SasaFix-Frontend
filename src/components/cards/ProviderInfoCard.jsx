// src/pages/Client/bookings/components/ProviderInfoCard.jsx

import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export function ProviderInfoCard({ worker }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Provider Information</h2>
            <div className="flex items-center gap-4 mb-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-2xl font-bold text-white">
                    {worker.initials}
                </div>
                <div className="flex-1">
                    <p className="text-lg font-semibold text-gray-800">{worker.name}</p>
                    <p className="text-sm text-gray-600">{worker.trade}</p>
                    <p className="text-sm text-gray-600">{worker.rating ? `${worker.rating} ★ rating` : ''}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3 mb-6 sm:flex-row">
                <a href={worker.phone ? `tel:${worker.phone}` : '#'} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm font-medium">Call Provider</span>
                </a>
                <a href={worker.email ? `mailto:${worker.email}` : '#'} className="flex items-center gap-2 px-4 py-2 text-[#056db3] hover:bg-blue-50 rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">Email Provider</span>
                </a>
            </div>
            <Link to={worker.id ? `/service-provider/${worker.id}` : "/service-provider"}>
                <button className="w-full px-4 py-2 border-2 border-[#056db3] text-[#056db3] font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                    View Provider Profile
                </button>
            </Link>
        </section>
    );
}