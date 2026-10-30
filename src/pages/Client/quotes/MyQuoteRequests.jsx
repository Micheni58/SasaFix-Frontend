// src/pages/Client/quotes/MyQuoteRequests.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronRight, ClipboardList, MessageSquare, CalendarCheck, CheckCircle2 } from "lucide-react";
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
  <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
    <div className="h-12 w-full bg-gray-50" />
    <div className="divide-y divide-gray-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-5">
          <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-1/6 animate-pulse rounded bg-gray-200" />
          <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-gray-200" />
        </div>
      ))}
    </div>
  </div>
);

const HowItWorks = () => (
  <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:sticky lg:top-24">
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#056db3]">
        <ClipboardList className="h-5 w-5" />
      </span>
      <div>
        <h2 className="font-bold text-gray-900">How it works</h2>
        <p className="text-xs text-gray-500">Your next steps</p>
      </div>
    </div>

    <ol className="space-y-5">
      <li className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#056db3]">
          <span className="text-sm font-bold">1</span>
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Post your job</h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">Share what you need, your location, budget, and photos. Your request will appear in this list.</p>
        </div>
      </li>
      <li className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#056db3]">
          <MessageSquare className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Review provider quotes</h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">Open a request to compare prices, provider ratings, and the details of each offer.</p>
        </div>
      </li>
      <li className="flex gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#056db3]">
          <CalendarCheck className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Choose and book</h3>
          <p className="mt-1 text-sm leading-5 text-gray-500">Accept the quote that works for you. A booking is created, and you can follow its progress in My Bookings.</p>
        </div>
      </li>
    </ol>

    <div className="mt-5 flex gap-2 rounded-xl bg-gray-50 p-3 text-xs leading-5 text-gray-500">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      You decide which quote to accept. Nothing is booked until you accept an offer.
    </div>
  </aside>
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
        <main className="px-4 pb-10 pt-24 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-sm font-semibold text-[#056db3]">CUSTOM SERVICE</p>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">My Quote Requests</h1>
                <p className="mt-1.5 text-sm text-gray-500">Track your jobs and choose the right provider for the work.</p>
              </div>
              <button
                onClick={() => navigate("/client/quotes/new")}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#056db3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#045a94] focus:outline-none focus:ring-4 focus:ring-blue-200 sm:w-auto"
              >
                Post a Job
              </button>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
              <section className="min-w-0 space-y-4 xl:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Your requests</h2>
                    <p className="mt-0.5 text-sm text-gray-500">Select a request to see provider responses.</p>
                  </div>
                  {!loading && requests.length > 0 && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#056db3]">
                      {requests.length} {requests.length === 1 ? "request" : "requests"}
                    </span>
                  )}
                </div>

                {loading ? (
                  <TableSkeleton />
                ) : requests.length === 0 ? (
                  <div className="rounded-2xl border border-gray-200 bg-white px-6 py-12 text-center shadow-sm sm:px-10">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#056db3]">
                      <Search className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">No requests yet</h3>
                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">Post a job describing the service you need, and providers can send you quotes to review here.</p>
                    <button
                      onClick={() => navigate("/client/quotes/new")}
                      className="mt-5 rounded-xl bg-[#056db3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#045a94]"
                    >
                      Create your first request
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:block">
                      <table className="dark-quote-requests-table w-full table-fixed text-left text-sm">
                      <thead className="border-b border-gray-200 bg-gray-50 text-gray-500">
                        <tr>
                          <th scope="col" className="w-[34%] px-4 py-4 font-medium">Title</th>
                          <th scope="col" className="w-[24%] px-3 py-4 font-medium">Category</th>
                          <th scope="col" className="w-[14%] px-2 py-4 text-center font-medium">Quotes</th>
                          <th scope="col" className="w-[22%] px-2 py-4 font-medium">Status</th>
                          <th scope="col" className="w-[6%] px-2 py-4"><span className="sr-only">Open request</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {requests.map((req) => (
                          <tr
                            key={req.id}
                            tabIndex={0}
                            role="link"
                            aria-label={`View ${req.title}`}
                            className="cursor-pointer transition-colors hover:bg-gray-50 focus:bg-blue-50 focus:outline-none"
                            onClick={() => navigate(`/client/quotes/${req.id}`)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                navigate(`/client/quotes/${req.id}`);
                              }
                            }}
                          >
                            <td className="wrap-break-word px-4 py-4 font-semibold text-gray-900">{req.title}</td>
                            <td className="wrap-break-word px-3 py-4 text-gray-600">{req.service_category}</td>
                            <td className="px-2 py-4 text-center">
                              <span className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-full bg-gray-100 px-2 text-xs font-semibold text-gray-700">
                                {req.quotes_count || 0}
                              </span>
                            </td>
                            <td className="px-2 py-4">
                              <span className={`inline-flex max-w-full items-center truncate rounded-full px-2 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-700"}`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="px-2 py-4 text-right">
                              <ChevronRight className="inline h-4 w-4 text-gray-400" />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      </table>
                    </div>
                    <div className="space-y-3 xl:hidden">
                      {requests.map((req) => (
                        <button
                          key={req.id}
                          type="button"
                          onClick={() => navigate(`/client/quotes/${req.id}`)}
                          className="block w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-200 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-blue-100 sm:p-5"
                        >
                          <span className="flex min-w-0 items-start justify-between gap-3">
                            <span className="min-w-0">
                              <span className="block wrap-break-word font-semibold text-gray-900">{req.title}</span>
                              <span className="mt-1 block wrap-break-word text-sm text-gray-500">{req.service_category}</span>
                            </span>
                            <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
                          </span>
                          <span className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-3">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[req.status] || "bg-gray-100 text-gray-700"}`}>
                              {req.status}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                              {req.quotes_count || 0} {(req.quotes_count || 0) === 1 ? "quote" : "quotes"} received
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </section>

              <HowItWorks />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MyQuoteRequests;