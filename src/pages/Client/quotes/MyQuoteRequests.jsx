// src/pages/Client/quotes/MyQuoteRequests.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import bookingRequestService from "../../../api/bookingRequestService";

const STATUS_COLORS = {
  open: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
  expired: "bg-red-100 text-red-700",
};

const TableSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <div className="bg-gray-50 border-b border-gray-200 h-10 w-full" />
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-gray-100 last:border-0">
        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/6 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse ml-auto" />
      </div>
    ))}
  </div>
);

const MyQuoteRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await bookingRequestService.getMyRequests();
        setRequests(data);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-4 sm:px-6 pb-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Quote Requests</h1>
                <p className="text-sm text-gray-500 mt-1">Jobs you've posted for custom quotes</p>
              </div>
              <button
                onClick={() => navigate("/client/quotes/new")}
                className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94] transition-colors"
              >
                Post a Job
              </button>
            </div>

            {loading ? (
              <TableSkeleton />
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <h2 className="text-lg font-semibold text-gray-800 mb-1">No requests yet</h2>
                <p className="text-gray-500 mb-4">When you post a custom job, it will appear here.</p>
                <button
                  onClick={() => navigate("/client/quotes/new")}
                  className="rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94]"
                >
                  Create your first request
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Quotes</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => navigate(`/client/quotes/${req.id}`)}>
                        <td className="px-4 py-3 font-medium text-gray-800">{req.title}</td>
                        <td className="px-4 py-3 text-gray-600">{req.service_category}</td>
                        <td className="px-4 py-3 text-gray-600">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-semibold">
                            {req.quotes_count || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[req.status] || "bg-gray-100"}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <ChevronRight className="h-4 w-4 text-gray-400 inline" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyQuoteRequests;