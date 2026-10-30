// src/pages/ServiceProvider/quotes/ProviderQuotes.jsx

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, DollarSign, Clock, AlertCircle, MessageSquare,
  RotateCcw, RefreshCw, Tag,
} from "lucide-react";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import bookingRequestService from "../../../api/bookingRequestService";
import quoteService from "../../../api/quoteService";
import { useToast } from "../../../components/ui/ToastProvider";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

const STATUS_STYLES = {
  pending:   { bg: "bg-blue-50",  text: "text-blue-700",  label: "Pending" },
  accepted:  { bg: "bg-green-50", text: "text-green-700", label: "Accepted" },
  rejected:  { bg: "bg-red-50",   text: "text-red-700",   label: "Rejected" },
  withdrawn: { bg: "bg-gray-50",  text: "text-gray-700",  label: "Withdrawn" },
  expired:   { bg: "bg-gray-50",  text: "text-gray-700",  label: "Expired" },
};

const RequestSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
    <div className="h-5 w-2/3 bg-gray-200 rounded mb-3" />
    <div className="h-3 w-24 bg-gray-200 rounded mb-4" />
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-5/6 bg-gray-100 rounded" />
    </div>
    <div className="flex gap-4">
      <div className="h-3 w-28 bg-gray-200 rounded" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  </div>
);

const QuoteSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="space-y-2">
        <div className="h-4 w-32 bg-gray-200 rounded" />
        <div className="h-3 w-24 bg-gray-200 rounded" />
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded-full" />
    </div>
    <div className="h-12 bg-gray-100 rounded-lg mb-3" />
    <div className="flex justify-between pt-3 border-t border-gray-100">
      <div className="h-5 w-24 bg-gray-200 rounded" />
      <div className="h-4 w-16 bg-gray-200 rounded" />
    </div>
  </div>
);

const ProviderQuotes = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("open");

  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [errorRequests, setErrorRequests] = useState("");

  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [errorQuotes, setErrorQuotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingWithdrawQuoteId, setPendingWithdrawQuoteId] = useState(null);

  const refreshRequests = useCallback(async (silent = false) => {
    if (!silent) setLoadingRequests(true);
    setErrorRequests("");
    try {
      const data = await bookingRequestService.getOpenRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Open requests error:", err);
      if (!silent) {
        setErrorRequests(err.response?.data?.detail || err.message || "Could not load open requests.");
        setRequests([]);
      }
    } finally {
      if (!silent) setLoadingRequests(false);
    }
  }, []);

  const refreshQuotes = useCallback(async () => {
    setLoadingQuotes(true);
    setErrorQuotes("");
    try {
      const data = await quoteService.getMyQuotes();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("My quotes error:", err);
      setErrorQuotes(err.response?.data?.detail || err.message || "Could not load your quotes.");
      setQuotes([]);
    } finally {
      setLoadingQuotes(false);
    }
  }, []);

  useEffect(() => {
    refreshRequests();
    refreshQuotes();
  }, [refreshRequests, refreshQuotes]);

  // Optional: Poll for new requests every 30s while on Open Requests tab
  useEffect(() => {
    if (activeTab !== "open") return;
    
    const interval = setInterval(() => {
      refreshRequests(true); // true = silent refresh (no loading skeleton)
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab, refreshRequests]);

  const handleWithdraw = async () => {
    if (!pendingWithdrawQuoteId) return;
    setActionLoading(true);
    try {
      await quoteService.withdrawQuote(pendingWithdrawQuoteId);
      toast.success("Quote withdrawn", "You can no longer receive this job.");
      setPendingWithdrawQuoteId(null);
      await refreshQuotes();
    } catch (err) {
      toast.error("Failed to withdraw", err.response?.data?.detail || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="provider" />
      <div className="flex-1 ml-0 lg:ml-72 min-w-0">
        <Navbar />
        <main className="pt-24 px-4 sm:px-6 pb-10">
          <div className="max-w-4xl mx-auto">

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
              <p className="text-sm text-gray-500 mt-1">
                Find work from clients or track the quotes you've sent.
              </p>

              <div className="flex gap-6 mt-6 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("open")}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                    activeTab === "open"
                      ? "border-[#056db3] text-[#056db3]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Open Requests
                  {!loadingRequests && requests.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-[#056db3]">
                      {requests.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("sent")}
                  className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
                    activeTab === "sent"
                      ? "border-[#056db3] text-[#056db3]"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Quotes
                  {!loadingQuotes && quotes.length > 0 && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-[#056db3]">
                      {quotes.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Tab: Open Requests */}
            {activeTab === "open" && (
              <div>
                {loadingRequests ? (
                  <div className="space-y-4">
                    <RequestSkeleton />
                    <RequestSkeleton />
                    <RequestSkeleton />
                  </div>
                ) : errorRequests ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Could not load requests</p>
                      <p className="text-sm mt-1">{errorRequests}</p>
                      <button
                        onClick={() => refreshRequests()}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                      </button>
                    </div>
                  </div>
                ) : requests.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Top strip — makes it feel like part of the page */}
                    <div className="dark-provider-requests-strip flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#056db3] opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#056db3]"></span>
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        Watching for new requests in your area
                      </span>
                    </div>

                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                        <Search className="h-7 w-7 text-[#056db3]" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
                        No matching requests right now
                      </h2>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-1">
                        We only show jobs that match your service category, plus any
                        requests clients send directly to you.
                      </p>
                      <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                        New requests appear here as clients post them. Check back later, or
                        make sure your profile category matches the type of work you do.
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <button
                          onClick={() => refreshRequests()}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <RefreshCw className="h-4 w-4" /> Refresh now
                        </button>
                        <button
                          onClick={() => navigate("/provider/profile")}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#056db3] px-4 py-2 text-sm font-semibold text-white hover:bg-[#045a94]"
                        >
                          <Tag className="h-4 w-4" /> Check my category
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        onClick={() => navigate(`/provider/quotes/${req.id}`)}
                        className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-[#056db3] hover:shadow-md transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-3 gap-3">
                          <div className="min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#056db3] transition-colors">
                              {req.title}
                            </h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="inline-block text-xs font-medium bg-blue-50 text-[#056db3] px-2 py-0.5 rounded">
                                {req.service_category}
                              </span>
                              {req.target_provider_id && (
                                <span className="inline-block text-xs font-medium bg-purple-50 text-purple-700 px-2 py-0.5 rounded">
                                  Sent to you
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-gray-500 flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" />
                            {new Date(req.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {req.description}
                        </p>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gray-400" /> {req.location}
                          </span>
                          {req.budget_min && (
                            <span className="flex items-center gap-1.5">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              KES {req.budget_min.toLocaleString()} – {req.budget_max.toLocaleString()}
                            </span>
                          )}
                          {req.photos?.length > 0 && (
                            <span className="flex items-center gap-1.5 text-[#056db3] font-medium">
                              {req.photos.length} photo{req.photos.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: My Quotes */}
            {activeTab === "sent" && (
              <div>
                {loadingQuotes ? (
                  <div className="space-y-3">
                    <QuoteSkeleton />
                    <QuoteSkeleton />
                  </div>
                ) : errorQuotes ? (
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">Could not load your quotes</p>
                      <p className="text-sm mt-1">{errorQuotes}</p>
                      <button
                        onClick={() => refreshQuotes()}
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Try again
                      </button>
                    </div>
                  </div>
                ) : quotes.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/60 px-5 py-3">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#056db3] opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#056db3]"></span>
                      </span>
                      <span className="text-xs font-medium text-gray-600">
                        Ready when you are
                      </span>
                    </div>

                    <div className="px-6 py-10 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
                        <MessageSquare className="h-7 w-7 text-[#056db3]" />
                      </div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1.5">
                        You haven't sent any quotes yet
                      </h2>
                      <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                        Browse open requests, find a job that fits your skills, and send your
                        first quote. It only takes a minute.
                      </p>
                      <button
                        onClick={() => setActiveTab("open")}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#056db3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#045a94]"
                      >
                        Browse Open Requests
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map((quote) => {
                      const style = STATUS_STYLES[quote.status] || STATUS_STYLES.pending;
                      const isPending = quote.status === "pending";

                      return (
                        <div
                          key={quote.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-gray-900">
                                Request #{quote.request_id}
                              </h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Sent {new Date(quote.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.bg} ${style.text}`}
                            >
                              {style.label}
                            </span>
                          </div>

                          {quote.message && (
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-3 line-clamp-2">
                              {quote.message}
                            </p>
                          )}

                          <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-bold text-[#056db3] text-lg">
                                KES {quote.amount.toLocaleString()}
                              </span>
                              {quote.estimated_duration_hours && (
                                <span className="flex items-center gap-1 text-gray-500 text-xs">
                                  <Clock className="h-3.5 w-3.5" /> ~
                                  {quote.estimated_duration_hours} hrs
                                </span>
                              )}
                            </div>

                            {isPending && (
                              <button
                                onClick={() => setPendingWithdrawQuoteId(quote.id)}
                                disabled={actionLoading}
                                className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                              >
                                <RotateCcw className="h-3.5 w-3.5" /> Withdraw
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
      <ConfirmationModal
        isOpen={pendingWithdrawQuoteId !== null}
        onClose={() => setPendingWithdrawQuoteId(null)}
        onConfirm={handleWithdraw}
        title="Withdraw this quote?"
        message="Withdrawing means you will no longer be considered for this job. This action can't be undone."
        confirmLabel="Withdraw quote"
        isDestructive
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ProviderQuotes;