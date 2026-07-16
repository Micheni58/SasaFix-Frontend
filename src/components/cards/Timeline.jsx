// src/pages/Client/bookings/components/Timeline.jsx

import { CheckCircle2, XCircle } from "lucide-react";

export function Timeline({ items }) {
    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Booking Timeline</h2>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className="shrink-0 mt-1">
                            {item.completed ? (
                                item.task.includes("Rejected") ? (
                                    <XCircle className="w-5 h-5 text-red-500" />
                                ) : (
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                )
                            ) : (
                                <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                            )}
                        </div>
                        <div className="flex-1">
                            <p className={`font-medium ${
                                item.completed && !item.task.includes("Rejected") ? "text-green-600" : 
                                item.task.includes("Rejected") ? "text-red-600" : "text-gray-800"
                            }`}>
                                {item.task}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}