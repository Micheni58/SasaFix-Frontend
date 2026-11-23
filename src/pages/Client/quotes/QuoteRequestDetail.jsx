// src/pages/Client/quotes/QuoteRequestDetail.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Clock, MapPin, X, Image as ImageIcon, MessageSquare, UserCheck } from "lucide-react";
import Sidebar from "../../../layout/Sidebar";
import Navbar from "../../../components/Navbar";
import bookingRequestService from "../../../api/bookingRequestService";
import quoteService from "../../../api/quoteService";
import { useToast } from "../../../components/ui/ToastProvider";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";

// Skeleton that mirrors the actual page layout
const DetailSkeleton = () => (
  <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="lg:col-span-2 space-y-6">
      <div className="h-4 w-32 bg-gray-200 rounded" />
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-64">
        <div className="h-6 w-2/3 bg-gray-200 rounded mb-4" />
        <div className="h-4 w-1/4 bg-gray-200 rounded mb-6" />
        <div className="space-y-2 mb-6">
          <div className="h-3 w-full bg-gray-100 rounded" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
          <div className="h-3 w-4/6 bg-gray-100 rounded" />
        </div>
        <div className="h-20 w-full bg-gray-100 rounded-lg" />
      </div>
      <div className="h-6 w-48 bg-gray-200 rounded mt-8 mb-4" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-32" />
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-32" />
    </div>
    <div className="hidden lg:block">
      <div className="bg-white rounded-xl border border-gray-200 p-6 h-64" />
    </div>
  </div>
);

const QuoteRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [request, setRequest] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  
  // Image Lightbox State
  const [lightboxImage, setLightboxImage] = useState(null);

  const loadData = async () => {
    try {
      const [reqData, quotesData] = await Promise.all([
        bookingRequestService.getRequestDetails(id),
        quoteService.getQuotesForRequest(id),
      ]);
      setRequest(reqData);
      setQuotes(quotesData);
    } catch {
      toast.error("Error", "Could not load request details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [id]);

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    setActionLoading(true);
    try {
      if (pendingAction.type === "accept") {
        const res = await quoteService.acceptQuote(pendingAction.quoteId);
        toast.success("Quote accepted", "A booking has been created.");
        navigate(`/client/my-bookings/upcoming/${res.booking_id}`);
      } else {
        await quoteService.rejectQuote(pendingAction.quoteId);
        toast.success("Quote rejected", "You can still accept other quotes.");
        setPendingAction(null);
        await loadData();
      }
    } catch (err) {
      const message = pendingAction.type === "accept"
        ? "Could not accept quote."
        : "Could not reject quote.";
      toast.error("Action failed", err.response?.data?.detail || message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-16 lg:ml-(--sidebar-w,18rem) transition-[margin] duration-300 min-w-0 pt-24 px-4 sm:px-6">
        <DetailSkeleton />
      </div>
    </div>
  );
  
  if (!request) return <div className="text-center py-20 text-gray-500">Request not found.</div>;

  const isTargeted = Boolean(request.target_provider_id);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="flex-1 ml-16 lg:ml-(--sidebar-w,18rem) transition-[margin] duration-300 min-w-0">
        <Navbar />
        <main className="pt-20 px-4 sm:px-6 pb-10">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Request Info & Quotes */}
            <div className="lg:col-span-2 space-y-6">
              <button onClick={() => navigate("/client/quotes")} className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#056db3] transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to Requests
              </button>

              {/* Request Details Card */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-gray-500">{request.service_category}</p>
                      {isTargeted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-100">
                          <UserCheck className="h-3 w-3" /> Direct Request
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    request.status === 'open' ? 'bg-blue-100 text-blue-700' : 
                    request.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                  }`}>
                    {request.status}
                  </span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap mb-5">{request.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-5 bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-400" /> {request.location}</div>
                  {request.budget_min && <div className="flex items-center gap-2"><span className="font-semibold text-gray-800">KES</span> {request.budget_min} - {request.budget_max}</div>}
                </div>

                {request.photos?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Attached Photos</p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {request.photos.map(p => (
                        <button 
                          key={p.id} 
                          onClick={() => setLightboxImage(p.url)}
                          className="relative group shrink-0 rounded-lg overflow-hidden border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#056db3]"
                        >
                          <img src={p.url} alt="Job" className="h-24 w-24 object-cover transition-opacity group-hover:opacity-80" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                            <ImageIcon className="h-6 w-6 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quotes List */}
              <h2 className="text-lg font-bold text-gray-900 mt-8 mb-4">
                {isTargeted ? "Provider Response" : `Quotes Received (${quotes.length})`}
              </h2>
              
              {quotes.length === 0 ? (
                <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-10 text-center flex flex-col items-center">
                  <MessageSquare className="h-8 w-8 text-gray-300 mb-3" />
                  {isTargeted ? (
                    <>
                      <p className="text-gray-600 font-medium">Waiting for the provider's quote</p>
                      <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                        You sent this request directly to a specific provider. We'll notify you as soon as they respond.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-600 font-medium">Waiting for providers</p>
                      <p className="text-sm text-gray-500 mt-1">We'll notify you when someone sends a quote.</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <table className="dark-client-quotes-table w-full min-w-180 border-collapse text-left">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <tr>
                        <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-5">Provider</th>
                        <th scope="col" className="px-4 py-3.5 sm:px-5">Quote details</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3.5 sm:px-5">Duration</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3.5 text-right sm:px-5">Price</th>
                        <th scope="col" className="whitespace-nowrap px-4 py-3.5 text-right sm:px-5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="transition-colors hover:bg-blue-50/40">
                          <td className="whitespace-nowrap px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-100 font-bold text-[#056db3]">
                                {quote.provider_photo_url ? <img src={quote.provider_photo_url} alt={quote.provider_name || "Provider"} className="h-full w-full object-cover" /> : quote.provider_name?.[0] || "P"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{quote.provider_name}</p>
                                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                  <Star className="h-3 w-3 fill-current" /> {quote.provider_rating.toFixed(1)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="max-w-md whitespace-normal px-4 py-4 text-sm leading-6 text-gray-600 sm:px-5">
                            {quote.message}
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 sm:px-5">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {quote.estimated_duration_hours ? `${quote.estimated_duration_hours} hrs` : "Duration not specified"}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right sm:px-5">
                            <span className="text-base font-bold text-[#056db3]">KES {quote.amount.toLocaleString()}</span>
                          </td>
                          <td className="whitespace-nowrap px-4 py-4 text-right sm:px-5">
                            {quote.status === 'pending' && request.status === 'open' ? (
                              <div className="inline-flex items-center gap-2">
                                <button onClick={() => setPendingAction({ type: "reject", quoteId: quote.id })} disabled={actionLoading} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">Reject</button>
                                <button onClick={() => setPendingAction({ type: "accept", quoteId: quote.id })} disabled={actionLoading} className="rounded-lg bg-[#056db3] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#045a94] disabled:opacity-50">Accept</button>
                              </div>
                            ) : (
                              <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold capitalize text-gray-600">{quote.status}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm sticky top-24">
                <h3 className="font-bold text-gray-900 mb-5">How it works</h3>
                <ol className="relative border-l border-gray-200 ml-3 space-y-6 text-sm text-gray-600">
                  {isTargeted ? (
                    <>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[#056db3]"></span>
                        <strong className="text-gray-900 block mb-1">1. Direct Request</strong>
                        You sent this job specifically to one provider.
                      </li>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-gray-300"></span>
                        <strong className="text-gray-900 block mb-1">2. Wait for Quote</strong>
                        The provider will review your photos and details.
                      </li>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-gray-300"></span>
                        <strong className="text-gray-900 block mb-1">3. Accept & Book</strong>
                        If you like the price, accept it to create a booking.
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-[#056db3]"></span>
                        <strong className="text-gray-900 block mb-1">1. Review Quotes</strong>
                        Compare prices, ratings, and messages.
                      </li>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-gray-300"></span>
                        <strong className="text-gray-900 block mb-1">2. Accept One</strong>
                        The others are automatically rejected.
                      </li>
                      <li className="pl-4">
                        <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-gray-300"></span>
                        <strong className="text-gray-900 block mb-1">3. Get it Done</strong>
                        A booking is created. Pay safely via the app.
                      </li>
                    </>
                  )}
                </ol>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightboxImage(null)}
        >
          <button 
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            onClick={() => setLightboxImage(null)}
          >
            <X className="h-6 w-6" />
          </button>
          <img 
            src={lightboxImage} 
            alt="Enlarged view" 
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}

      <ConfirmationModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
        title={pendingAction?.type === "accept" ? "Accept this quote?" : "Reject this quote?"}
        message={pendingAction?.type === "accept"
          ? "Accepting this quote will create a booking. Other quotes for this request will no longer be available."
          : "Are you sure you want to reject this quote? You can still accept other quotes."}
        confirmLabel={pendingAction?.type === "accept" ? "Accept quote" : "Reject quote"}
        isDestructive={pendingAction?.type === "reject"}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default QuoteRequestDetail;