import { useEffect, useState } from "react";
import { Check, Crown, Sparkles, X } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import subscriptionService from "../../services/subscriptionService";
import { useToast } from "../../components/ui/ToastProvider";
import SubscriptionSkeleton from "../../components/provider/SubscriptionSkeleton";

const ClientSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [aiUsage, setAiUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [mpesaPhone, setMpesaPhone] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const toast = useToast();

  const loadSubscription = async () => {
    try {
      setError("");
      const [currentSubscription, currentAiUsage] = await Promise.all([
        subscriptionService.getClientCurrent(),
        subscriptionService.getClientAiUsage(),
      ]);
      setSubscription(currentSubscription);
      setAiUsage(currentAiUsage);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your subscription.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const beginUpgrade = async () => {
    const phone = mpesaPhone.trim().replace(/[+\s-]/g, "");
    const normalizedPhone = phone.startsWith("0") ? `254${phone.slice(1)}` : phone;
    if (!/^254[17]\d{8}$/.test(normalizedPhone)) {
      setError("Enter a valid Kenyan M-Pesa number.");
      return;
    }

    setUpgrading(true);
    setError("");
    try {
      const payment = await subscriptionService.upgradeClient(normalizedPhone);
      setPaymentMessage(payment.message || "Approve the M-Pesa prompt on your phone.");
      setShowPayment(false);
      setMpesaPhone("");
      toast.info("Payment request sent", "Approve the M-Pesa prompt to activate Premium.");

      if (!payment.payment_id) {
        setUpgrading(false);
        return;
      }

      let attempts = 0;
      const poll = async () => {
        attempts += 1;
        try {
          const result = await subscriptionService.getClientPaymentStatus(payment.payment_id);
          if (result.status === "completed") {
            setSubscription(result.subscription);
            setPaymentMessage("Premium is active. Enjoy unlimited AI improvements.");
            toast.success("Premium activated", "Your client subscription is active.");
            setUpgrading(false);
            return;
          }
          if (result.status === "failed" || attempts >= 30) {
            setPaymentMessage(result.status === "failed" ? "Payment was not completed." : "Payment is still processing. Refresh after M-Pesa confirms.");
            setUpgrading(false);
            return;
          }
          window.setTimeout(poll, 2000);
        } catch {
          if (attempts < 30) window.setTimeout(poll, 2000);
          else setUpgrading(false);
        }
      };
      window.setTimeout(poll, 2000);
    } catch (upgradeError) {
      setError(upgradeError.message || "Unable to start the M-Pesa payment.");
      setUpgrading(false);
    }
  };

  const isPremium = subscription?.plan === "premium" && subscription?.is_active;

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="ml-0 flex-1 lg:ml-72">
          <Navbar />
          <main className="px-8 pb-10 pt-24">
            <SubscriptionSkeleton />
          </main>
        </div>
      </div>
    );
  }

  if (error && !subscription) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="client" />
        <div className="ml-0 flex-1 lg:ml-72">
          <Navbar />
          <main className="px-8 pb-10 pt-24">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
              {error}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
      <div className="ml-0 flex-1 lg:ml-72">
        <Navbar />
        <main className="px-8 pb-12 pt-24">
          {isPremium ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="subscription-page-heading text-[36px] font-bold tracking-tight text-[#111827]">
                  Your Subscription
                </h1>
                <p className="mt-2 text-[17px] text-slate-500">
                  Manage your current SasaFix plan
                </p>
              </div>

              {paymentMessage && (
                <div role="status" className="mx-auto mb-5 max-w-3xl rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {paymentMessage}
                </div>
              )}
              {error && (
                <div role="alert" className="mx-auto mb-5 max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="mx-auto max-w-3xl">
                <div className="overflow-hidden rounded-2xl border border-orange-300 bg-white shadow-sm">
                  <div className="bg-linear-to-r from-orange-400 to-amber-500 px-8 py-8 text-center text-white">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
                      <Crown className="h-7 w-7" />
                    </div>
                    <p className="text-sm font-medium uppercase tracking-wider">Current Plan</p>
                    <h2 className="mt-2 text-3xl font-bold">Premium Plan</h2>
                    <p className="mt-2 text-white/90">You are already enjoying Premium benefits</p>
                  </div>
                  <div className="p-8">
                    <div className="mb-8 text-center">
                      <p className="text-sm text-slate-500">Subscription Fee</p>
                      <div className="mt-2">
                        <span className="text-5xl font-bold text-slate-900">KES 300</span>
                        <span className="text-slate-500">/month</span>
                      </div>
                      <p className="mt-2 font-medium text-green-600">Unlimited AI job-description improvements</p>
                    </div>
                    <div className="space-y-5">
                      <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" /><span className="text-slate-700">Unlimited AI improvements</span></div>
                      <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-orange-500" /><span className="text-slate-700">Clearer job descriptions for providers</span></div>
                      <div className="flex items-center gap-3"><Crown className="h-5 w-5 text-orange-500" /><span className="text-slate-700">Premium client membership</span></div>
                      <div className="flex items-center gap-3"><Check className="h-5 w-5 text-green-600" /><span className="text-slate-700">Secure M-Pesa billing</span></div>
                    </div>
                    <div className="mt-8 rounded-lg bg-green-50 p-4 text-center">
                      <p className="text-sm text-green-700">Premium subscription active</p>
                      {subscription.end_date && <p className="mt-1 text-xs text-green-600">Renews on {new Date(subscription.end_date).toLocaleDateString("en-KE")}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="mb-8 text-center">
                <h1 className="subscription-page-heading text-[36px] font-bold tracking-tight text-[#111827]">
                  Upgrade to Premium
                </h1>
                <p className="mt-2 text-[17px] text-slate-500">
                  Get unlimited AI help for your service requests
                </p>
              </div>

              {error && <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
              {paymentMessage && <div role="status" className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">{paymentMessage}</div>}

              <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Current Plan</p>
                    <p className="mt-1 text-base font-semibold text-slate-800">Free Plan • 3 AI improvements</p>
                  </div>
                  <p className="text-sm text-slate-500">{aiUsage ? `${aiUsage.remaining_uses} free uses remaining` : "Upgrade for unlimited AI access"}</p>
                </div>
              </div>

              <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-7">
                <div className="mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Your AI Usage</h2>
                </div>
                <div className="grid grid-cols-1 divide-y divide-green-200 md:grid-cols-3 md:divide-x md:divide-y-0">
                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">Free Uses Included</p>
                    <p className="mt-2 text-2xl font-bold text-slate-800">3</p>
                    <p className="text-xs text-slate-500">per account</p>
                  </div>
                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">Used So Far</p>
                    <p className="mt-2 text-2xl font-bold text-orange-600">{aiUsage?.used_uses ?? 0}</p>
                    <p className="text-xs text-slate-500">successful improvements</p>
                  </div>
                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">Premium Access</p>
                    <p className="mt-2 text-2xl font-bold text-green-600">KES 300</p>
                    <p className="text-xs font-medium text-green-600">unlimited / month</p>
                  </div>
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-800">Free Plan</h2>
                    <div className="mt-4"><span className="text-5xl font-bold text-slate-900">KES 0</span><span className="text-slate-500">/month</span></div>
                    <p className="mt-3 text-sm text-slate-500">Try AI job-description improvements</p>
                  </div>
                  <div className="mt-8 space-y-5">
                    <div className="flex items-center gap-3 text-slate-700"><Check className="h-5 w-5 text-green-600" />3 AI improvements per account</div>
                    <div className="flex items-center gap-3 text-slate-700"><Check className="h-5 w-5 text-green-600" />Create and manage bookings</div>
                    <div className="flex items-center gap-3 text-slate-400"><X className="h-5 w-5 text-red-400" />Unlimited AI improvements</div>
                    <div className="flex items-center gap-3 text-slate-400"><X className="h-5 w-5 text-red-400" />Premium AI access</div>
                  </div>
                  <button disabled className="mt-8 h-11 w-full rounded-lg border-2 border-blue-300 text-sm font-medium text-blue-400">Current Plan</button>
                </div>

                <div className="relative rounded-xl bg-linear-to-br from-orange-400 to-amber-500 p-8 text-white shadow-sm">
                  <div className="subscription-recommended-badge absolute right-4 top-4 rounded-full bg-white px-4 py-1 text-xs font-medium text-orange-600">♕ RECOMMENDED</div>
                  <div className="text-center">
                    <h2 className="text-2xl font-semibold">Premium Plan</h2>
                    <div className="mt-4"><span className="text-5xl font-bold">KES 300</span><span>/month</span></div>
                    <p className="mt-3 text-sm text-white/90">Unlimited AI help for your service requests</p>
                  </div>
                  <div className="mt-8 space-y-5">
                    <div className="flex items-center gap-3"><Check className="h-5 w-5" /><span><strong>Unlimited AI improvements</strong> for job descriptions</span></div>
                    <div className="flex items-center gap-3"><Sparkles className="h-5 w-5" />Turn rough notes into clear requests</div>
                    <div className="flex items-center gap-3"><Crown className="h-5 w-5" />Premium client membership</div>
                    <div className="flex items-center gap-3"><Check className="h-5 w-5" />Secure M-Pesa payment</div>
                  </div>
                  <button
                    onClick={() => { setError(""); setPaymentMessage(""); setShowPayment(true); }}
                    disabled={upgrading}
                    className="subscription-upgrade-button mt-8 h-11 w-full rounded-lg bg-white text-sm font-medium text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {upgrading ? "Waiting for M-Pesa..." : "Upgrade to Premium"}
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <div className="p-6"><h2 className="text-xl font-semibold text-slate-800">Detailed Feature Comparison</h2></div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead><tr className="border-t border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">Feature</th>
                      <th className="px-6 py-4 text-center text-sm font-medium text-slate-700">Free</th>
                      <th className="subscription-premium-table-head bg-orange-50 px-6 py-4 text-center text-sm font-medium text-slate-700">Premium</th>
                    </tr></thead>
                    <tbody>
                      <tr className="border-t border-slate-200"><td className="px-6 py-4 text-sm text-slate-800">AI job-description improvements</td><td className="px-6 py-4 text-center text-sm text-slate-600">3 total</td><td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">Unlimited</td></tr>
                      <tr className="border-t border-slate-200"><td className="px-6 py-4 text-sm text-slate-800">Monthly subscription fee</td><td className="px-6 py-4 text-center text-sm text-slate-600">KES 0</td><td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">KES 300</td></tr>
                      <tr className="border-t border-slate-200"><td className="px-6 py-4 text-sm text-slate-800">Booking and provider search</td><td className="px-6 py-4 text-center text-green-600">✓</td><td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">✓</td></tr>
                      <tr className="border-t border-slate-200"><td className="px-6 py-4 text-sm text-slate-800">M-Pesa subscription payment</td><td className="px-6 py-4 text-center text-red-400">✕</td><td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">✓</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#253247]">Upgrade to Premium</h2>
                <p className="mt-1 text-sm text-gray-500">Enter your M-Pesa number to pay KES 300.</p>
              </div>
              <button type="button" onClick={() => { setShowPayment(false); setError(""); }} className="text-2xl leading-none text-gray-400 transition hover:text-gray-700" aria-label="Close payment dialog">×</button>
            </div>
            {error && <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}
            <div className="mb-4">
              <label htmlFor="client-mpesa-phone" className="mb-2 block text-sm font-medium text-[#253247]">M-Pesa Phone Number</label>
              <input id="client-mpesa-phone" type="tel" value={mpesaPhone} onChange={(event) => setMpesaPhone(event.target.value)} placeholder="e.g. 2547XXXXXXXX" disabled={upgrading} className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100" />
              <p className="mt-1.5 text-xs text-gray-400">Approve the payment prompt on your phone.</p>
            </div>
            <button type="button" onClick={beginUpgrade} disabled={upgrading} className="h-11 w-full rounded-lg bg-[#056db3] text-sm font-semibold text-white transition hover:bg-[#045b96] disabled:cursor-not-allowed disabled:opacity-60">{upgrading ? "Waiting for M-Pesa..." : "Continue to Payment"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSubscription;