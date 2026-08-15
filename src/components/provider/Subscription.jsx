import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  Crown,
  Star,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

import subscriptionService from "../../services/subscriptionService";
import SubscriptionSkeleton from "../../components/provider/SubscriptionSkeleton";


const formatCurrency = (
  amount
) => {
  return `KES ${Number(
    amount || 0
  ).toLocaleString("en-KE", {
    maximumFractionDigits: 0,
  })}`;
};


const PremiumCurrentPlan = ({
  subscription,
}) => {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-orange-300 bg-white shadow-sm">

        <div className="bg-gradient-to-r from-orange-400 to-amber-500 px-8 py-8 text-center text-white">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white/20">
            <Crown className="h-7 w-7" />
          </div>

          <p className="text-sm font-medium uppercase tracking-wider">
            Current Plan
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Premium Plan
          </h2>

          <p className="mt-2 text-white/90">
            You are already enjoying Premium benefits
          </p>
        </div>


        <div className="p-8">

          <div className="mb-8 text-center">
            <p className="text-sm text-slate-500">
              Subscription Fee
            </p>

            <div className="mt-2">
              <span className="text-5xl font-bold text-slate-900">
                KES 500
              </span>

              <span className="text-slate-500">
                /month
              </span>
            </div>

            <p className="mt-2 font-medium text-green-600">
              5% commission on jobs
            </p>
          </div>


          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-slate-700">
                5% commission
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-orange-500" />
              <span className="text-slate-700">
                Top search placement
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Crown className="h-5 w-5 text-orange-500" />
              <span className="text-slate-700">
                Premium badge on profile
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-500" />
              <span className="text-slate-700">
                10+ monthly job leads
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-slate-700">
                Priority 24/7 support
              </span>
            </div>

            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-slate-700">
                Advanced analytics
              </span>
            </div>

          </div>


          <div className="mt-8 rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm text-green-700">
              Premium subscription active
            </p>

            {subscription.end_date && (
              <p className="mt-1 text-xs text-green-600">
                Renews on{" "}
                {new Date(
                  subscription.end_date
                ).toLocaleDateString(
                  "en-KE"
                )}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};


const Subscription = () => {
  const [
    subscription,
    setSubscription,
  ] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [upgrading, setUpgrading] =
  useState(false);

const [error, setError] =
  useState("");

const [
  paymentMessage,
  setPaymentMessage,
] = useState("");

const [showMpesaModal, setShowMpesaModal] =
  useState(false);

const [mpesaPhone, setMpesaPhone] =
  useState("");


  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await subscriptionService.getCurrent();

      setSubscription(data);
    } catch (err) {
      console.error(
        "Failed to load subscription:",
        err
      );

      setError(
        err.message ||
          "Failed to load subscription."
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadSubscription();
  }, []);


  const handleUpgrade = () => {
    setError("");
    setPaymentMessage("");
    setShowMpesaModal(true);
    };

  const handleMpesaUpgrade = async () => {
    const phone = mpesaPhone.trim();

    if (!phone) {
        setError("Please enter your M-Pesa phone number.");
        return;
    }

    const normalizedPhone = phone
        .replace("+", "")
        .replace(/\s/g, "");

    if (
        !/^2547\d{8}$/.test(normalizedPhone) &&
        !/^2541\d{8}$/.test(normalizedPhone) &&
        !/^07\d{8}$/.test(normalizedPhone) &&
        !/^01\d{8}$/.test(normalizedPhone)
    ) {
        setError(
        "Please enter a valid Kenyan M-Pesa number."
        );
        return;
    }

    try {
        setUpgrading(true);
        setError("");
        setPaymentMessage("");

        const result =
        await subscriptionService.upgrade(
            normalizedPhone
        );

        setShowMpesaModal(false);

        setPaymentMessage(
        result.message ||
            "M-Pesa payment request sent. Check your phone."
        );

        setMpesaPhone("");

        const paymentId =
        result.payment_id;

        if (!paymentId) {
        setUpgrading(false);
        return;
        }

        let attempts = 0;

        const pollPayment = async () => {
        attempts += 1;

        try {
            const status =
            await subscriptionService.getPaymentStatus(
                paymentId
            );

            if (status.status === "completed") {
            setSubscription(
                status.subscription
            );

            setPaymentMessage(
                "Payment successful. Your Premium subscription is now active."
            );

            setUpgrading(false);

            return;
            }

            if (status.status === "failed") {
            setError(
                "The M-Pesa payment was not completed."
            );

            setUpgrading(false);

            return;
            }

            if (attempts < 30) {
            setTimeout(
                pollPayment,
                2000
            );
            } else {
            setPaymentMessage(
                "Payment is still being processed. Refresh the page once M-Pesa confirms the payment."
            );

            setUpgrading(false);
            }
        } catch (pollError) {
            console.error(
            "Payment status error:",
            pollError
            );

            if (attempts < 30) {
            setTimeout(
                pollPayment,
                2000
            );
            } else {
            setUpgrading(false);
            }
        }
        };

        setTimeout(
        pollPayment,
        2000
        );
    } catch (err) {
        console.error(
        "Upgrade failed:",
        err
        );

        setError(
        err?.response?.data?.detail ||
            err.message ||
            "Unable to start the Premium payment."
        );

        setUpgrading(false);
    }
    };



  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc]">
        <Sidebar role="provider" />

        <div className="ml-72 flex-1">
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
        <Sidebar role="provider" />

        <div className="ml-72 flex-1">
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


  const isPremium =
    subscription?.plan ===
      "premium" &&
    subscription?.is_active;


  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      <Sidebar role="provider" />

      <div className="ml-72 flex-1">

        <Navbar />

        <main className="px-8 pb-12 pt-24">

          {isPremium ? (
            <>
              <div className="mb-8 text-center">
                <h1 className="text-[36px] font-bold tracking-tight text-[#111827]">
                  Your Subscription
                </h1>

                <p className="mt-2 text-[17px] text-slate-500">
                  Manage your current SasaFix plan
                </p>
              </div>

              {error && (
                <div className="mx-auto mb-5 max-w-3xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <PremiumCurrentPlan
                subscription={
                  subscription
                }
              />
            </>
          ) : (
            <>
              {/* HEADING */}
              <div className="mb-8 text-center">
                <h1 className="text-[36px] font-bold tracking-tight text-[#111827]">
                  Upgrade to Premium
                </h1>

                <p className="mt-2 text-[17px] text-slate-500">
                  Get more bookings and earn more with reduced commission
                </p>
              </div>


              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}


              {paymentMessage && (
                <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {paymentMessage}
                </div>
              )}


              {/* CURRENT PLAN */}
              <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <p className="text-sm text-slate-500">
                      Current Plan
                    </p>

                    <p className="mt-1 text-base font-semibold text-slate-800">
                      Free Plan • 10% Commission
                    </p>
                  </div>

                  <p className="text-sm text-slate-500">
                    Upgrade and save on commissions
                  </p>

                </div>
              </div>


              {/* SAVINGS */}
              <div className="mb-8 rounded-xl border border-green-200 bg-green-50 p-7">

                <div className="mb-6 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />

                  <h2 className="text-lg font-semibold text-slate-800">
                    Your Potential Savings
                  </h2>
                </div>


                <div className="grid grid-cols-1 divide-y divide-green-200 md:grid-cols-3 md:divide-x md:divide-y-0">

                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">
                      Current Monthly Earnings
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-800">
                      {formatCurrency(
                        subscription.current_monthly_earnings
                      )}
                    </p>

                    <p className="text-xs text-slate-500">
                      after 10% commission
                    </p>
                  </div>


                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">
                      Premium Subscription
                    </p>

                    <p className="mt-2 text-2xl font-bold text-orange-600">
                      - KES 500
                    </p>

                    <p className="text-xs text-slate-500">
                      /month
                    </p>
                  </div>


                  <div className="px-5 py-2 text-center">
                    <p className="text-sm text-slate-500">
                      With Premium (5% commission)
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-600">
                      {formatCurrency(
                        subscription.premium_monthly_earnings
                      )}
                    </p>

                    <p className="text-xs font-medium text-green-600">
                      +
                      {formatCurrency(
                        subscription.monthly_savings
                      )}
                      /month savings!
                    </p>
                  </div>

                </div>
              </div>


              {/* PLAN CARDS */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* FREE */}
                <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

                  <div className="text-center">
                    <h2 className="text-2xl font-semibold text-slate-800">
                      Free Plan
                    </h2>

                    <div className="mt-4">
                      <span className="text-5xl font-bold text-slate-900">
                        KES 0
                      </span>

                      <span className="text-slate-500">
                        /month
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-500">
                      10% commission on all jobs
                    </p>
                  </div>


                  <div className="mt-8 space-y-5">

                    <div className="flex items-center gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-green-600" />
                      Standard search placement
                    </div>

                    <div className="flex items-center gap-3 text-slate-700">
                      <Check className="h-5 w-5 text-green-600" />
                      Basic profile features
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      <X className="h-5 w-5 text-red-400" />
                      Featured placement
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      <X className="h-5 w-5 text-red-400" />
                      Reduced commission
                    </div>

                  </div>


                  <button
                    disabled
                    className="mt-8 h-11 w-full rounded-lg border-2 border-blue-300 text-sm font-medium text-blue-400"
                  >
                    Current Plan
                  </button>

                </div>


                {/* PREMIUM */}
                <div className="relative rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 p-8 text-white shadow-sm">

                  <div className="absolute right-4 top-4 rounded-full bg-white px-4 py-1 text-xs font-medium text-orange-600">
                    ♕ RECOMMENDED
                  </div>


                  <div className="text-center">
                    <h2 className="text-2xl font-semibold">
                      Premium Plan
                    </h2>

                    <div className="mt-4">
                      <span className="text-5xl font-bold">
                        KES 500
                      </span>

                      <span>
                        /month
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-white/90">
                      Only 5% commission + featured placement
                    </p>
                  </div>


                  <div className="mt-8 space-y-5">

                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5" />
                      <span>
                        <strong>
                          5% commission
                        </strong>{" "}
                        (save 50% on fees!)
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Star className="h-5 w-5" />
                      Top search placement
                    </div>

                    <div className="flex items-center gap-3">
                      <Crown className="h-5 w-5" />
                      Premium badge on profile
                    </div>

                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5" />
                      10+ monthly job leads
                    </div>

                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5" />
                      Priority 24/7 support
                    </div>

                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5" />
                      Advanced analytics
                    </div>

                  </div>


                  <button
                    onClick={
                      handleUpgrade
                    }
                    disabled={upgrading}
                    className="mt-8 h-11 w-full rounded-lg bg-white text-sm font-medium text-orange-600 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {upgrading
                      ? "Waiting for M-Pesa..."
                      : "Upgrade to Premium"}
                  </button>

                </div>

              </div>


              {/* FEATURE COMPARISON */}
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">

                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Detailed Feature Comparison
                  </h2>
                </div>


                <table className="w-full">

                  <thead>
                    <tr className="border-t border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-medium text-slate-700">
                        Feature
                      </th>

                      <th className="px-6 py-4 text-center text-sm font-medium text-slate-700">
                        Free
                      </th>

                      <th className="bg-orange-50 px-6 py-4 text-center text-sm font-medium text-slate-700">
                        Premium
                      </th>
                    </tr>
                  </thead>


                  <tbody>

                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Commission Rate
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        10%
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">
                        5%
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Search Placement
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        Standard
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">
                        Top Results
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Profile Badge
                      </td>

                      <td className="px-6 py-4 text-center text-red-400">
                        ✕
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">
                        ✓
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Featured Listing
                      </td>

                      <td className="px-6 py-4 text-center text-red-400">
                        ✕
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">
                        ✓
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Priority Support
                      </td>

                      <td className="px-6 py-4 text-center text-red-400">
                        ✕
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">
                        ✓
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Analytics Dashboard
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        Basic
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">
                        Advanced
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Direct Booking Links
                      </td>

                      <td className="px-6 py-4 text-center text-red-400">
                        ✕
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-green-600">
                        ✓
                      </td>
                    </tr>


                    <tr className="border-t border-slate-200">
                      <td className="px-6 py-4 text-sm text-slate-800">
                        Monthly Job Leads
                      </td>

                      <td className="px-6 py-4 text-center text-sm text-slate-600">
                        0
                      </td>

                      <td className="bg-orange-50/30 px-6 py-4 text-center text-sm font-semibold text-orange-600">
                        10+
                      </td>
                    </tr>

                  </tbody>

                </table>
              </div>

            </>
                    )}

        </main>

        {/* M-PESA PAYMENT MODAL */}
        {showMpesaModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              {/* HEADER */}
              <div className="mb-5 flex items-start justify-between">

                <div>
                  <h2 className="text-2xl font-semibold text-[#253247]">
                    Upgrade to Premium
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter your M-Pesa number to pay for Premium.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMpesaModal(false);
                    setError("");
                  }}
                  className="text-2xl leading-none text-gray-400 transition hover:text-gray-700"
                >
                  ×
                </button>

              </div>


              {/* ERROR */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}


              {/* PHONE NUMBER */}
              <div className="mb-4">

                <label className="mb-2 block text-sm font-medium text-[#253247]">
                  M-Pesa Phone Number
                </label>

                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) =>
                    setMpesaPhone(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2547XXXXXXXX"
                  disabled={upgrading}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-[#056db3] focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Format: 2547XXXXXXXX (without +)
                </p>

              </div>


              {/* AMOUNT */}
              <div className="mb-6">

                <label className="mb-2 block text-sm font-medium text-[#253247]">
                  Amount (KES)
                </label>

                <input
                  type="text"
                  value="500"
                  disabled
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600"
                />

                <p className="mt-1.5 text-xs text-gray-400">
                  Premium subscription fee
                </p>

              </div>


              {/* BUTTONS */}
              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => {
                    setShowMpesaModal(false);
                    setError("");
                  }}
                  disabled={upgrading}
                  className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>


                <button
                  type="button"
                  onClick={handleMpesaUpgrade}
                  disabled={upgrading}
                  className="flex-1 rounded-xl bg-[#056db3] py-3 text-sm font-semibold text-white transition hover:bg-[#045d99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {upgrading
                    ? "Sending..."
                    : "Upgrade"}
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default Subscription;