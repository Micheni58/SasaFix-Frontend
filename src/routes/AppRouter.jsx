import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import About from "../pages/About";
import AdminEscrow from "../pages/Admin/AdminEscrow";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminNotification from "../pages/Admin/Notification";
import AdminSettings from "../pages/Admin/Settings";
import ClientDashboard from "../pages/Client/ClientDashboard";
import ClientNotification from "../pages/Client/Notification";
import ClientMessages from "../pages/Client/Messages";
import ClientWallet from "../pages/Client/Wallet";
import Profile from "../pages/Profile";
import FindServices from "../pages/ServiceDiscovery/FindServices";
import ProviderDashboard from "../pages/ServiceProvider/ProviderDashboard";
import ProviderNotification from "../pages/ServiceProvider/Notification";
import Availability from "../pages/ServiceProvider/Availability";
import MyBookings from "../pages/Client/bookings/MyBookings";
import MyJobs from "../pages/ServiceProvider/Jobs/MyJobs";
import NewJobRequestDetails from "../pages/ServiceProvider/Jobs/NewJobRequestDetails";
import AcceptedJobDetails from "../pages/ServiceProvider/Jobs/AcceptedJobDetails";
import InProgressJobDetails from "../pages/ServiceProvider/Jobs/InProgressJobDetails";
import CompletedJobDetails from "../pages/ServiceProvider/Jobs/CompletedJobDetails";
import ClientProfile from "../pages/Client/Profile";
import RoleSelection from "../pages/RoleSelection"; // new file we made
import SignUpForm from "../components/SignUpForm"; // existing file
import ReportAndAnalytics from "../pages/Admin/ReportsAndAnalytics";
import BookingsAndPayments from "../pages/Admin/BookingsAndPayments";
import BookingsAndPaymentsDetails from "../pages/Admin/BookingsAndPaymentDetails";
import PayoutDetails from "../pages/Admin/PayoutDetails";
import Users from "../pages/Admin/Users";
import ServiceProviders from "../pages/Admin/ServiceProviders";
import Reviews from "../pages/ServiceProvider/Reviews";
import CancelledJobDetails from "../pages/ServiceProvider/Jobs/CancelledJobDetails";
import UpcomingBookingDetails from "../pages/Client/bookings/UpComingBookingDetails";
import CancelledBookingDetails from "../pages/Client/bookings/CancelledBookingDetails";
import CompletedBookingDetails from "../pages/Client/bookings/CompletedBookingDetails";
import InProgressBookingDetails from "../pages/Client/bookings/InProgressBookingDetails";
import RescheduledJobDetails from "../pages/ServiceProvider/Jobs/RescheduledJobDetails";
import RescheduledBookingDetails from "../pages/Client/bookings/RescheduledBookingDetails";
import PaidBookingDetails from "../pages/Client/bookings/PaidBookingDetails";
import ProviderProfilePage from "../pages/ServiceDiscovery/ProviderProfile";
import ProviderSubscription from "../pages/ServiceProvider/ProviderSubscription";
import ProviderWallet from "../pages/ServiceProvider/Wallet";
import AIAssistant from "../pages/ServiceProvider/AIAssistant";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<RoleSelection />} />
        <Route path="/signup/details" element={<SignUp />} />
        <Route path="/about" element={<About />} />

        {/* Protected/Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotification />} />
        <Route path="/admin/reports" element={<ReportAndAnalytics />} />
        <Route path="/admin/bookings-payments" element={<BookingsAndPayments />} />
        <Route path="/admin/bookings-payments/:bookingId" element={<BookingsAndPaymentsDetails />}/>
        <Route path="/admin/payouts/:payoutId" element={<PayoutDetails />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/service-providers" element={<ServiceProviders />} />
        <Route path="/admin/escrow" element={<AdminEscrow />} />
        {/* Client Routes */}

        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/find-services" element={<FindServices />} />
        <Route path="/client/messages" element={<ClientMessages />} />
        <Route path="/client/wallet" element={<ClientWallet />} />
        <Route path="/client/notifications" element={<ClientNotification />} />
        <Route path="/client/profile" element={<ClientProfile />} />
        <Route path="/client/my-bookings" element={<MyBookings />} />
        <Route path="/client/my-bookings/in-progress/:bookingId" element={<InProgressBookingDetails />} />
        <Route path="/client/my-bookings/completed/:bookingId" element={<CompletedBookingDetails />} />
        <Route path="/client/my-bookings/cancelled/:bookingId" element={<CancelledBookingDetails />} />
        <Route path="/client/my-bookings/upcoming/:bookingId" element={<UpcomingBookingDetails />} />
        <Route path="/client/my-bookings/rescheduled/:bookingId" element={<RescheduledBookingDetails />} />
        <Route path="/client/my-bookings/paid/:bookingId" element={<PaidBookingDetails />} />

        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/messages" element={<ClientMessages />} />
        <Route path="/provider/wallet" element={<ProviderWallet />} />
        <Route path="/provider/profile" element={<Profile />} />
        <Route path="/provider/availability" element={<Availability />} />
        <Route path="/provider/notifications" element={<ProviderNotification />}/>
        <Route path="/provider/my-reviews" element={<Reviews />} />
        <Route path="/provider/my-jobs/rescheduled/:id" element={<RescheduledJobDetails />}/>
        <Route path="/provider/ai-assistant" element={<AIAssistant />} />
       
       
        <Route
          path="/provider/subscription"
          element={<ProviderSubscription />}
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/provider/my-jobs" element={<MyJobs />} />
        <Route path="/provider/my-jobs/new/:id" element={<NewJobRequestDetails />}/>
        <Route path="/provider/my-jobs/accepted/:id"element={<AcceptedJobDetails />}/>
        <Route path="/provider/my-jobs/in-progress/:id" element={<InProgressJobDetails />}/>
        <Route path="/provider/my-jobs/completed/:id" element={<CompletedJobDetails />}/>
        <Route path="/provider/my-jobs/cancelled/:id" element={<CancelledJobDetails />}/>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
