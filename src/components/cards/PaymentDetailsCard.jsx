// src/pages/Client/bookings/components/cards/PaymentDetailsCard.jsx

export function PaymentDetailsCard({
  booking,
  isPaid,
  isPaymentPending,
  isPaymentProcessing,
  isRejected,
  isCancelled,
  isCompleted,
  isApproved,
}) {
  return (
    <section className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Details</h2>
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 py-2">
          <span className="font-light text-gray-700">Service Cost</span>
          <span className="text-gray-800 font-semibold">
            {booking.serviceFee}
          </span>
        </div>
        <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b border-gray-300 py-2">
          <span className="font-light text-gray-700">
            Platform Fee ({Math.round(booking.commissionRate * 100)}%)
          </span>
          <span className="text-gray-800 font-semibold">
            {booking.commission}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2">
          <span className="font-semibold text-gray-700">Total Amount</span>
          <span className="text-xl font-semibold text-green-600 sm:text-2xl">
            {booking.totalPaid}
          </span>
        </div>
      </div>
      {isPaid && isApproved ? (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
          ✅ Payment completed successfully
        </div>
      ) : isPaymentPending ? (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
          ⏳ Payment pending - Please complete payment
        </div>
      ) : isPaymentProcessing ? (
        <div className="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          ⏳ Processing your payment... Please wait for confirmation.
        </div>
      ) : isRejected ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          ❌ Payment cancelled - Work was rejected
        </div>
      ) : isCancelled ? (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
          ❌ Payment cancelled - Booking cancelled
        </div>
      ) : isCompleted ? (
        <p className="text-sm text-[#056db3] bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
          Work is complete! Please review and approve or reject.
        </p>
      ) : (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 mt-4">
          Payment will be processed after the work is completed and approved.
        </p>
      )}
    </section>
  );
}
