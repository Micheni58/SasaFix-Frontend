import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  CheckCircle2,
  Clock3,
  EllipsisVertical,
  MapPin,
  Phone,
} from "lucide-react";

const jobs = [
  {
    id: 1,
    service: "Plumbing Repair",
    details: "Fix leaking kitchen sink and replace worn tap washer",
    client: "Sarah Wanjiku",
    initials: "SW",
    date: "2026-04-14",
    time: "10:00 AM",
    location: "Westlands, Nairobi",
    status: "New Requests",
    amount: "KES 3,000",
  },
  {
    id: 2,
    service: "Electrical Repair",
    details: "Restore power to living room sockets and inspect breaker",
    client: "James Otieno",
    initials: "JO",
    date: "2026-04-15",
    time: "2:00 PM",
    location: "Kilimani, Nairobi",
    status: "Accepted",
    amount: "KES 1,500",
  },
  {
    id: 3,
    service: "Deep Cleaning",
    details: "Clean a two-bedroom apartment before tenant move-in",
    client: "Linet Achieng",
    initials: "LA",
    date: "2026-04-13",
    time: "9:00 AM",
    location: "Lavington, Nairobi",
    status: "In Progress",
    amount: "KES 4,200",
  },
  {
    id: 4,
    service: "Painting",
    details: "Repaint bedroom walls and touch up the ceiling corners",
    client: "Brian Mwangi",
    initials: "BM",
    date: "2026-04-11",
    time: "1:00 PM",
    location: "Karen, Nairobi",
    status: "Completed",
    amount: "KES 5,000",
  },
  {
    id: 5,
    service: "Appliance Repair",
    details: "Repair washing machine drum and test full spin cycle",
    client: "Mercy Njeri",
    initials: "MN",
    date: "2026-04-16",
    time: "8:30 AM",
    location: "Riverside, Nairobi",
    status: "New Requests",
    amount: "KES 2,300",
  },
  {
    id: 6,
    service: "Gardening",
    details: "Trim overgrown hedges and clear front compound weeds",
    client: "Daniel Kiptoo",
    initials: "DK",
    date: "2026-04-12",
    time: "11:30 AM",
    location: "South B, Nairobi",
    status: "Completed",
    amount: "KES 2,100",
  },
];

const rescheduleRequests = [
  {
    id: 1,
    client: "Sarah Wanjiku",
    initials: "SW",
    service: "Plumbing Repair",
    originalDate: "2026-04-14",
    originalTime: "10:00 AM",
    proposedDate: "2026-04-16",
    proposedTime: "2:00 PM",
    reason: "Family emergency",
  },
  {
    id: 2,
    client: "James Otieno",
    initials: "JO",
    service: "Electrical Repair",
    originalDate: "2026-04-15",
    originalTime: "2:00 PM",
    proposedDate: "2026-04-17",
    proposedTime: "11:00 AM",
    reason: "Work conflict",
  },
  {
    id: 3,
    client: "Linet Achieng",
    initials: "LA",
    service: "Deep Cleaning",
    originalDate: "2026-04-13",
    originalTime: "9:00 AM",
    proposedDate: "2026-04-18",
    proposedTime: "10:00 AM",
    reason: "Tenant delay",
  },
];

const tabs = ["New Requests", "Accepted", "In Progress", "Completed", "Request Reschedule"];

const statusStyles = {
  "New Requests": "bg-amber-100 text-amber-800",
  Accepted: "bg-sky-100 text-sky-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

function formatJobDate(date) {
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function MyJobs() {
  const [activeTab, setActiveTab] = useState("New Requests");
  const [modalType, setModalType] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isRescheduleRequest, setIsRescheduleRequest] = useState(false);

  const filteredJobs = jobs.filter((job) => job.status === activeTab);
  const filteredRescheduleRequests = activeTab === "Request Reschedule" ? rescheduleRequests : [];

  const tabCounts = {
    "New Requests": jobs.filter((job) => job.status === "New Requests").length,
    Accepted: jobs.filter((job) => job.status === "Accepted").length,
    "In Progress": jobs.filter((job) => job.status === "In Progress").length,
    Completed: jobs.filter((job) => job.status === "Completed").length,
    "Request Reschedule": rescheduleRequests.length,
  };

  const handleAccept = (job, isReschedule = false) => {
    setSelectedJob(job);
    setModalType("accept");
    setIsRescheduleRequest(isReschedule);
  };

  const handleDecline = (job, isReschedule = false) => {
    setSelectedJob(job);
    setModalType("decline");
    setIsRescheduleRequest(isReschedule);
  };

  const confirmAction = () => {
    console.log(`${modalType === "accept" ? "Accepted" : "Declined"} ${isRescheduleRequest ? "reschedule request" : "job"}: `, selectedJob);
    setModalType(null);
    setSelectedJob(null);
    setIsRescheduleRequest(false);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedJob(null);
    setIsRescheduleRequest(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] ml-64 p-5">
      <section className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">My Jobs</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your service requests and bookings
        </p>
      </section>

      <section className="mb-6 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 border-b-[3px] px-6 py-3.5 text-base  transition-colors ${
                activeTab === tab
                  ? "border-[#056db3] bg-blue-50 text-[#056db3]"
                  : "border-transparent text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{tab}</span>
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  activeTab === tab
                    ? "bg-[#056db3] text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="border-b border-gray-200 bg-gray-50">
              {activeTab === "Request Reschedule" ? (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Original Date &amp; Time
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Proposed Date &amp; Time
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Reason
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Actions
                  </th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Client
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Service
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Date &amp; Time
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Location
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Status
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Earnings
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                    Actions
                  </th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeTab === "Request Reschedule" ? (
                filteredRescheduleRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 align-middle">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                          {request.initials}
                        </div>
                        <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800">
                          {request.client}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <p className="text-base font-semibold text-gray-800">{request.service}</p>
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{formatJobDate(request.originalDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{request.originalTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{formatJobDate(request.proposedDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{request.proposedTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm text-gray-600">{request.reason}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleAccept(request, true)}
                          className="rounded-xl bg-green-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDecline(request, true)}
                          className="rounded-xl px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          Decline
                        </button>
                        <Link
                          to={`/provider/my-jobs/${request.id}`}
                          className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                        >
                          View Booking
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 align-middle">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-linear-to-b from-[#3b82f6] to-[#1d4ed8] text-sm font-bold text-white">
                          {job.initials}
                        </div>
                        <div className="max-w-30 text-sm font-semibold leading-6 text-gray-800">
                          {job.client}
                        </div>
                        <button className="text-sm text-[#056db3] hover:underline">View Profile</button>
                      </div>
                    </td>
                    <td className="px-6 py-2">
                      <div className="max-w-42.5">
                        <p className="text-base font-semibold text-gray-800">{job.service}</p>
                        <p className="mt-1 text-sm leading-5 text-gray-500 truncate">{job.details}</p>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{formatJobDate(job.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 className="h-3.5 w-3.5 text-gray-500" />
                          <span className="text-sm">{job.time}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-3.5 w-3.5 text-gray-500" />
                        <span className="max-w-33.75 text-sm leading-6">{job.location}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                          statusStyles[job.status]
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-sm font-bold text-gray-800">{job.amount}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        {job.status === "New Requests" && (
                          <>
                            <button
                              onClick={() => handleAccept(job)}
                              className="rounded-xl bg-[#056db3] px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(job)}
                              className="rounded-xl border-2 border-[#056db3] px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-red-50"
                            >
                              Decline
                            </button>
                            <Link
                              to={`/provider/my-jobs/${job.id}`}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                            >
                              View
                            </Link>
                          </>
                        )}
                        {job.status === "Accepted" && (
                          <Link
                            to={`/provider/my-jobs/${job.id}`}
                            className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                          >
                            View
                          </Link>
                        )}
                        {job.status === "In Progress" && (
                          <>
                            <button className="text-sm font-semibold text-green-700 hover:bg-green-50 rounded-md px-2 py-1">
                              Complete
                            </button>
                            <Link
                              to={`/provider/my-jobs/${job.id}`}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                            >
                              View
                            </Link>
                          </>
                        )}
                        {job.status === "Completed" && (
                          <>
                            <button className="text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-md px-2 py-1">
                              Receipt
                            </button>
                            <Link
                              to={`/provider/my-jobs/${job.id}`}
                              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-[#056db3] transition-colors hover:bg-blue-50"
                            >
                              View
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(activeTab === "Request Reschedule" ? filteredRescheduleRequests : filteredJobs).length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-gray-500">
            No {activeTab.toLowerCase()} found.
          </div>
        )}
      </section>

      {/* Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white shadow-lg">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-800">
                {modalType === "accept" ? "Confirm Accept" : "Confirm Decline"} {isRescheduleRequest ? "Reschedule Request" : "Job"}
              </h2>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                {modalType === "accept"
                  ? isRescheduleRequest
                    ? `Are you sure you want to accept the reschedule request from ${selectedJob?.client}? The new date and time will be confirmed.`
                    : `Are you sure you want to accept this job from ${selectedJob?.client}? You will be notified of any further details.`
                  : isRescheduleRequest
                  ? `Are you sure you want to decline the reschedule request from ${selectedJob?.client}? The client will be notified.`
                  : `Are you sure you want to decline this job from ${selectedJob?.client}? The client will be notified and the request will be rejected.`}
              </p>
              {selectedJob && (
                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800">{selectedJob.service}</p>
                  {isRescheduleRequest ? (
                    <>
                      <p className="mt-2 text-xs text-gray-600">
                        <span className="font-semibold">Original:</span> {formatJobDate(selectedJob.originalDate)} at {selectedJob.originalTime}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Proposed:</span> {formatJobDate(selectedJob.proposedDate)} at {selectedJob.proposedTime}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Reason:</span> {selectedJob.reason}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-gray-600">
                        <span className="font-semibold">Date & Time:</span> {formatJobDate(selectedJob.date)} at {selectedJob.time}
                      </p>
                      <p className="text-xs text-gray-600">
                        <span className="font-semibold">Location:</span> {selectedJob.location}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex gap-3">
                <button
                  onClick={closeModal}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction}
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors ${
                    modalType === "accept"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {modalType === "accept" ? "Yes, Accept" : "Yes, Decline"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyJobs;
