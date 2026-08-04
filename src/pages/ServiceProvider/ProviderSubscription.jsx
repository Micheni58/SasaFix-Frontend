import { useState } from "react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useSubscription } from "../../hooks/useSubscription";

const ProviderSubscription = () => {
  const {
    subscription,
    commissionRate,
    loading,
    upgrading,
    upgrade,
  } = useSubscription();

  const [earnings, setEarnings] = useState("");

  const monthlyEarnings = Number(earnings) || 0;

  const freeCommission =
    monthlyEarnings * 0.10;

  const premiumCommission =
    monthlyEarnings * 0.05;

  const savings =
    freeCommission - premiumCommission;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading subscription...
      </div>
    );
  }

  const isPremium =
    subscription?.plan === "PREMIUM";

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">

      <Sidebar role="provider" />

      <div className="flex-1 ml-72">

        <Navbar />

        <main className="pt-24 px-8 pb-8">

          {/* Header */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold text-gray-900">
              {isPremium
                ? "Subscription"
                : "Upgrade to Premium"}
            </h1>

            <p className="text-gray-500 mt-2">
              {isPremium
                ? "Manage your Premium subscription."
                : "Upgrade your account and reduce your commission from 10% to 5%."}
            </p>

          </div>

          {/* Plan Cards */}

          <div className="grid grid-cols-2 gap-6">

            {/* FREE PLAN */}

            <div className={`rounded-2xl border p-8 bg-white ${
              !isPremium
                ? "border-[#056db3]"
                : "border-gray-200"
            }`}>

              <span className="inline-flex px-3 py-1 rounded-full bg-blue-50 text-[#056db3] text-xs font-semibold">
                FREE
              </span>

              <h2 className="mt-4 text-2xl font-bold">
                Free Plan
              </h2>

              <p className="text-gray-500 mt-2">
                Perfect for getting started.
              </p>

              <div className="mt-8">

                <p className="text-5xl font-bold">
                  10%
                </p>

                <p className="text-gray-500">
                  Commission
                </p>

              </div>

              <ul className="mt-8 space-y-3 text-gray-600">

                <li>✔ Basic profile</li>

                <li>✔ Unlimited bookings</li>

                <li>✔ Customer messaging</li>

                <li>✔ Standard listing</li>

              </ul>

            </div>
                        {/* PREMIUM PLAN */}

            <div
              className={`rounded-2xl border p-8 bg-gradient-to-br from-[#056db3] to-[#034d80] text-white relative overflow-hidden ${
                isPremium
                  ? "ring-4 ring-blue-200"
                  : ""
              }`}
            >

              <span className="inline-flex px-3 py-1 rounded-full bg-yellow-400 text-gray-900 text-xs font-bold">
                RECOMMENDED
              </span>

              <h2 className="mt-4 text-2xl font-bold">
                Premium Plan
              </h2>

              <p className="mt-2 text-blue-100">
                Grow faster and keep more of your earnings.
              </p>

              <div className="mt-8">

                <p className="text-5xl font-bold">
                  5%
                </p>

                <p className="text-blue-100">
                  Commission
                </p>

              </div>

              <ul className="mt-8 space-y-3">

                <li>✔ Priority listing</li>

                <li>✔ Premium badge</li>

                <li>✔ Featured in search</li>

                <li>✔ 50% lower commission</li>

                <li>✔ Higher visibility</li>

              </ul>

              <button
                disabled={
                  isPremium || upgrading
                }
                onClick={upgrade}
                className={`mt-10 w-full rounded-xl py-3 font-semibold transition ${
                  isPremium
                    ? "bg-green-500 cursor-default"
                    : "bg-white text-[#056db3] hover:bg-gray-100"
                }`}
              >
                {isPremium
                  ? "Premium Active"
                  : upgrading
                  ? "Upgrading..."
                  : "Upgrade Now"}
              </button>

            </div>

          </div>

          {/* Savings Calculator */}

          <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-8">

            <h2 className="text-xl font-bold mb-6">
              Savings Calculator
            </h2>

            <label className="block text-sm text-gray-600 mb-2">
              Monthly Earnings (KES)
            </label>

            <input
              type="number"
              value={earnings}
              onChange={(e) =>
                setEarnings(e.target.value)
              }
              placeholder="150000"
              className="w-full md:w-96 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#056db3] outline-none"
            />

            <div className="grid grid-cols-3 gap-6 mt-8">

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Free Plan
                </p>

                <h3 className="text-2xl font-bold mt-2">
                  KES {freeCommission.toLocaleString()}
                </h3>

              </div>

              <div className="rounded-xl bg-gray-50 p-5">

                <p className="text-sm text-gray-500">
                  Premium Plan
                </p>

                <h3 className="text-2xl font-bold mt-2 text-[#056db3]">
                  KES {premiumCommission.toLocaleString()}
                </h3>

              </div>

              <div className="rounded-xl bg-green-50 p-5">

                <p className="text-sm text-green-700">
                  You Save
                </p>

                <h3 className="text-2xl font-bold mt-2 text-green-700">
                  KES {savings.toLocaleString()}
                </h3>

              </div>

            </div>

          </div>

          {/* Current Subscription */}

          <div className="mt-10 bg-white rounded-2xl border border-gray-200 p-8">

            <h2 className="text-xl font-bold mb-6">
              Current Subscription
            </h2>

            <div className="grid md:grid-cols-4 gap-6">

              <div>

                <p className="text-gray-500 text-sm">
                  Plan
                </p>

                <h3 className="font-semibold text-lg mt-1">
                  {subscription?.plan}
                </h3>

              </div>

              <div>

                <p className="text-gray-500 text-sm">
                  Status
                </p>

                <h3 className="font-semibold text-lg mt-1">
                  {subscription?.status}
                </h3>

              </div>

              <div>

                <p className="text-gray-500 text-sm">
                  Commission
                </p>

                <h3 className="font-semibold text-lg mt-1">
                  {commissionRate}%
                </h3>

              </div>

              <div>

                <p className="text-gray-500 text-sm">
                  Monthly Price
                </p>

                <h3 className="font-semibold text-lg mt-1">
                  KES {subscription?.monthly_price}
                </h3>

              </div>

            </div>

          </div>

        </main>

      </div>

    </div>
  );
};

export default ProviderSubscription;