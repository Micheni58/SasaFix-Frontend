import {
  ArrowLeft,
  ArrowUpRight,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Flag,
  Eye,
  MapPin,
  Phone,
  Mail,
  Star,
  User,
  Wallet,
} from "lucide-react";

const booking = {
  id: "001",
  service: "Plumbing Repair",
  description: "Fix leaking kitchen sink and check water pressure",
  location: "Westlands, Nairobi",
  scheduledDate: "Thursday, 06 March 2026",
  startTime: "09:00 AM",
  endTime: "11:00 AM",
  createdOn: "01 March 2026",
  lastUpdated: "05 March 2026",
  status: "Completed",
  amount: "KES 5,000",
  commission: "KES 750",
  providerPayout: "KES 4,250",
  date: "06/03/2026",
  duration: "2 hours",
  mpesaRef: "QHJ7K9LMN2",
  client: {
    initials: "JK",
    name: "Jane Kamau",
    email: "jane.kamau@email.com",
    phone: "+254 712 345 678",
  },
  provider: {
    initials: "JM",
    name: "John Mwangi",
    email: "john.mwangi@email.com",
    phone: "+254 723 456 789",
    category: "Plumbing Specialist",
    rating: 4.9,
    reviews: 127,
    verified: true,
  },
};

const statusStyles = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Scheduled: "bg-amber-100 text-amber-700",
};

function SummaryCard({ icon: Icon, iconBg, iconColor, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div
        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-2xl ${iconBg}`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

function DetailRow({ label, value, isLast = false }) {
  return (
    <div
      className={`flex items-start justify-between py-3 ${
        !isLast ? "border-b border-gray-100" : ""
      }`}
    >
      <span className="text-sm text-gray-500">{label}</span>
      <span className="ml-4 text-right text-sm font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

function Avatar({ initials }) {
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b from-[#b517ff] to-[#6f10f4] text-lg font-bold text-white">
      {initials}
    </div>
  );
}

function AdminBookingDetail({ onBack }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-6">

      {/* ── Header ── */}
      <section className="mb-8">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-[#056db3] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bookings
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">
              Booking Details
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Full information about this booking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
              Booking #{booking.id}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-semibold ${
                statusStyles[booking.status]
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>
      </section>

      {/* ── Summary Cards ── */}
      <section className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-4">
        <SummaryCard
          icon={ArrowUpRight}
          iconBg="bg-[#dfe6ff]"
          iconColor="text-[#5b38f2]"
          label="Booking Amount"
          value={booking.amount}
        />
        <SummaryCard
          icon={Wallet}
          iconBg="bg-[#dcfce7]"
          iconColor="text-[#16a34a]"
          label="Commission Earned"
          value={booking.commission}
        />
        <SummaryCard
          icon={CalendarDays}
          iconBg="bg-[#dfe6ff]"
          iconColor="text-[#056db3]"
          label="Booking Date"
          value={booking.date}
        />
        <SummaryCard
          icon={Clock3}
          iconBg="bg-[#fef3c7]"
          iconColor="text-[#f97316]"
          label="Service Duration"
          value={booking.duration}
        />
      </section>

      {/* ── Main Content — Two Columns ── */}
      <section className="mb-8 flex gap-6">

        {/* Left Column — Booking Information */}
        <div className="flex-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#056db3]" />
            <h2 className="text-lg font-bold text-gray-900">
              Booking Information
            </h2>
          </div>

          <DetailRow label="Service" value={booking.service} />
          <DetailRow label="Description" value={booking.description} />
          <DetailRow label="Location" value={booking.location} />
          <DetailRow label="Scheduled Date" value={booking.scheduledDate} />
          <DetailRow label="Start Time" value={booking.startTime} />
          <DetailRow label="End Time" value={booking.endTime} />
          <DetailRow label="Created On" value={booking.createdOn} />
          <DetailRow label="Last Updated" value={booking.lastUpdated} isLast />

          {/* Map Placeholder */}
          <div className="mt-6 flex h-40 items-center justify-center rounded-xl bg-gray-100">
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <MapPin className="h-8 w-8" />
              <span className="text-sm font-medium">{booking.location}</span>
            </div>
          </div>
        </div>

        {/* Right Column — Client and Provider */}
        <div className="flex flex-4 flex-col gap-6">

          {/* Client Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-[#056db3]" />
              <h2 className="text-lg font-bold text-gray-900">
                Client Information
              </h2>
            </div>

            <div className="flex flex-col items-center text-center">
              <Avatar initials={booking.client.initials} />
              <p className="mt-3 text-base font-bold text-gray-900">
                {booking.client.name}
              </p>
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                {booking.client.email}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                {booking.client.phone}
              </div>
              <button className="mt-4 w-full rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white">
                View Client Profile
              </button>
            </div>
          </div>

          {/* Provider Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#056db3]" />
              <h2 className="text-lg font-bold text-gray-900">
                Service Provider Information
              </h2>
            </div>

            <div className="flex flex-col items-center text-center">
              <Avatar initials={booking.provider.initials} />
              <p className="mt-3 text-base font-bold text-gray-900">
                {booking.provider.name}
              </p>
              <p className="text-sm font-medium text-[#056db3]">
                {booking.provider.category}
              </p>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(booking.provider.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-gray-700">
                  {booking.provider.rating}
                </span>
                <span className="text-sm text-gray-400">
                  ({booking.provider.reviews} reviews)
                </span>
              </div>

              {/* Verified Badge */}
              {booking.provider.verified && (
                <div className="mt-2 flex items-center gap-1 rounded-full bg-green-100 px-3 py-1">
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Verified Professional
                  </span>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <Mail className="h-4 w-4" />
                {booking.provider.email}
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-4 w-4" />
                {booking.provider.phone}
              </div>
              <button className="mt-4 w-full rounded-lg border-2 border-[#056db3] px-4 py-2 text-sm font-medium text-[#056db3] transition-colors hover:bg-[#056db3] hover:text-white">
                View Provider Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payment Breakdown ── */}
      <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-[#056db3]" />
          <h2 className="text-lg font-bold text-gray-900">
            Payment Breakdown
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full table-auto">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Description
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Amount
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                  Service Amount
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-800">
                  {booking.amount}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  Total charged to client
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="px-5 py-4 text-sm font-medium text-gray-800">
                  Platform Commission (15%)
                </td>
                <td className="px-5 py-4 text-sm font-semibold text-red-500">
                  {booking.commission}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  Deducted by SasaFix
                </td>
              </tr>
              <tr className="bg-green-50">
                <td className="px-5 py-4 text-sm font-bold text-gray-800">
                  Provider Payout
                </td>
                <td className="px-5 py-4 text-sm font-bold text-green-600">
                  {booking.providerPayout}
                </td>
                <td className="px-5 py-4 text-sm text-gray-500">
                  Amount released to provider
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* M-Pesa Reference */}
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-gray-50 px-5 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <span className="text-xs font-bold text-green-700">M</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Paid via M-Pesa</p>
            <p className="text-xs text-gray-400">
              Transaction Ref: {booking.mpesaRef}
            </p>
          </div>
        </div>
      </section>

      {/* ── Admin Actions ── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Eye className="h-5 w-5 text-[#056db3]" />
          <h2 className="text-lg font-bold text-gray-900">Admin Actions</h2>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-[#056db3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96]">
            <Eye className="h-4 w-4" />
            Mark as Reviewed
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-red-400 px-5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500 hover:text-white">
            <Flag className="h-4 w-4" />
            Flag Booking
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100">
            <Download className="h-4 w-4" />
            Export PDF
          </button>
        </div>

        {/* Admin Notes */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Admin Notes
          </label>
          <textarea
            rows={4}
            placeholder="Add internal notes about this booking..."
            className="w-full rounded-xl border border-gray-200 p-4 text-sm text-gray-700 outline-none transition-colors placeholder:text-gray-400 focus:border-2 focus:border-[#056db3]"
          />
          <div className="mt-3 flex justify-end">
            <button className="rounded-xl bg-[#056db3] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#045a96]">
              Save Notes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminBookingDetail;