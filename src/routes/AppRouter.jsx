import {
  BrowserRouter as Router,
  Navigate,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useLayoutEffect } from "react";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import About from "../pages/About";
import AdminTransactions from "../pages/Admin/AdminTransactions";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminNotification from "../pages/Admin/Notification";
import AdminSettings from "../pages/Admin/Settings";
import ClientDashboard from "../pages/Client/ClientDashboard";
import ClientNotification from "../pages/Client/Notification";
import ClientMessages from "../pages/Client/Messages";
import ClientTransactions from "../pages/Client/Transactions";
import Profile from "../pages/Profile";
import FindServices from "../pages/ServiceDiscovery/FindServices";
import ProviderDashboard from "../pages/ServiceProvider/ProviderDashboard";
import ProviderNotification from "../pages/ServiceProvider/Notification";
import Availability from "../pages/ServiceProvider/Availability";
import MyBookings from "../pages/Client/bookings/MyBookings";
import CreateBooking from "../pages/Client/bookings/CreateBooking";
import MyJobs from "../pages/ServiceProvider/Jobs/MyJobs";
import NewJobRequestDetails from "../pages/ServiceProvider/Jobs/NewJobRequestDetails";
import AcceptedJobDetails from "../pages/ServiceProvider/Jobs/AcceptedJobDetails";
import InProgressJobDetails from "../pages/ServiceProvider/Jobs/InProgressJobDetails";
import CompletedJobDetails from "../pages/ServiceProvider/Jobs/CompletedJobDetails";
import PaidJobDetails from "../pages/ServiceProvider/Jobs/PaidJobDetails";
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
import RescheduleProposedDetails from "../pages/Client/bookings/RescheduleProposedDetails";
import RescheduleRequestedDetails from "../pages/Client/bookings/RescheduleRequestedDetails";
import RescheduleProposedJobDetails from "../pages/ServiceProvider/Jobs/RescheduleProposedJobDetails";
import RescheduleRequestedJobDetails from "../pages/ServiceProvider/Jobs/RescheduleRequestedJobDetails";
import PaidBookingDetails from "../pages/Client/bookings/PaidBookingDetails";
import ProviderProfilePage from "../pages/ServiceDiscovery/ProviderProfile";
import ServiceProvidersManagement from "../pages/Admin/ServiceProvidersManagement";
import Subscription from "../components/provider/Subscription";
import VerifyEmail from "../pages/VerifyEmail";
import EmailVerificationSent from "../pages/EmailVerificationSent";
import ProviderEarnings from "../pages/ServiceProvider/Earnings";
import AIAssistant from "../pages/ServiceProvider/AIAssistant";
import AdminReportsDisputes from "../pages/Admin/AdminReportsDisputes";
import NotFound from "../pages/NotFound";
import NotAuthorized from "../pages/NotAuthorized";
import { getStoredUserRole } from "../utils/sidebarRole";
import { syncThemeWithRoute } from "../utils/theme";

function RouteThemeSync() {
  const location = useLocation();

  useLayoutEffect(() => {
    syncThemeWithRoute(location.pathname);
  }, [location.pathname]);

  return null;
}

function RoleGuard({ allowedRoles, children }) {
  const token = localStorage.getItem("access_token");
  const userRole = getStoredUserRole();

  if (!token || !userRole) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <NotAuthorized />;
  }

  return children;
}

const protectedRoute = (role, element) => (
  <RoleGuard allowedRoles={[role]}>{element}</RoleGuard>
);

export default function AppRouter() {
  return (
    <Router>
      <RouteThemeSync />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/signup" element={<RoleSelection />} />
        <Route path="/signup/details" element={<SignUp />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/email-verification-sent"
          element={<EmailVerificationSent />}
        />

        {/* Protected/Dashboard Routes */}
        <Route path="/admin" element={protectedRoute("admin", <AdminDashboard />)} />
        <Route path="/admin/settings" element={protectedRoute("admin", <AdminSettings />)} />
        <Route path="/admin/notifications" element={protectedRoute("admin", <AdminNotification />)} />
        <Route
          path="/admin/bookings-payments"
          element={protectedRoute("admin", <BookingsAndPayments />)}
        />
        <Route
          path="/admin/bookings-payments/:bookingId"
          element={protectedRoute("admin", <BookingsAndPaymentsDetails />)}
        />
        <Route path="/admin/payouts/:payoutId" element={protectedRoute("admin", <PayoutDetails />)} />
        <Route path="/admin/users" element={protectedRoute("admin", <Users />)} />
        <Route path="/admin/service-providers" element={protectedRoute("admin", <ServiceProviders />)} />
        <Route path="/admin/transactions" element={protectedRoute("admin", <AdminTransactions />)} />
        <Route path="/admin/reports-disputes" element={protectedRoute("admin", <AdminReportsDisputes />)} />
        <Route path="/admin/analytics" element={protectedRoute("admin", <ReportAndAnalytics />)} />
        {/* Client Routes */}

        <Route path="/client" element={protectedRoute("client", <ClientDashboard />)} />
        <Route path="/client/find-services" element={protectedRoute("client", <FindServices />)} />
        <Route
          path="/providers/:providerId"
          element={<ProviderProfilePage />}
        />
        <Route path="/client/messages" element={protectedRoute("client", <ClientMessages />)} />
        <Route path="/client/transactions" element={protectedRoute("client", <ClientTransactions />)} />
        <Route path="/client/notifications" element={protectedRoute("client", <ClientNotification />)} />
        <Route path="/client/profile" element={protectedRoute("client", <ClientProfile />)} />
        <Route path="/client/my-bookings" element={protectedRoute("client", <MyBookings />)} />
        <Route
          path="/client/bookings/create/:providerId"
          element={protectedRoute("client", <CreateBooking />)}
        />
        <Route
          path="/client/my-bookings/in-progress/:bookingId"
          element={protectedRoute("client", <InProgressBookingDetails />)}
        />
        <Route
          path="/client/my-bookings/completed/:bookingId"
          element={protectedRoute("client", <CompletedBookingDetails />)}
        />
        <Route
          path="/client/my-bookings/cancelled/:bookingId"
          element={protectedRoute("client", <CancelledBookingDetails />)}
        />
        <Route
          path="/client/my-bookings/upcoming/:bookingId"
          element={protectedRoute("client", <UpcomingBookingDetails />)}
        />
        <Route
          path="/client/my-bookings/reschedule-requested/:bookingId"
          element={protectedRoute("client", <RescheduleRequestedDetails />)}
        />
        <Route
          path="/client/my-bookings/reschedule-proposed/:bookingId"
          element={protectedRoute("client", <RescheduleProposedDetails />)}
        />
        <Route
          path="/client/my-bookings/paid/:bookingId"
          element={protectedRoute("client", <PaidBookingDetails />)}
        />

        <Route path="/provider" element={protectedRoute("provider", <ProviderDashboard />)} />
        <Route path="/provider/messages" element={protectedRoute("provider", <ClientMessages />)} />
        <Route path="/provider/earnings" element={protectedRoute("provider", <ProviderEarnings />)} />
        <Route path="/provider/profile" element={protectedRoute("provider", <Profile />)} />
        <Route path="/provider/availability" element={protectedRoute("provider", <Availability />)} />
        <Route
          path="/provider/notifications"
          element={protectedRoute("provider", <ProviderNotification />)}
        />
        <Route path="/provider/my-reviews" element={protectedRoute("provider", <Reviews />)} />
        <Route path="/provider/subscription" element={protectedRoute("provider", <Subscription />)} />
        <Route path="/provider/ai-assistant" element={protectedRoute("provider", <AIAssistant />)} />

        <Route
          path="/provider/subscription"
          element={protectedRoute("provider", <Subscription />)}
        />

        <Route path="/profile" element={<Profile />} />

        <Route path="/provider/my-jobs" element={protectedRoute("provider", <MyJobs />)} />
        <Route
          path="/provider/my-jobs/new/:id"
          element={protectedRoute("provider", <NewJobRequestDetails />)}
        />
        <Route
          path="/provider/my-jobs/accepted/:id"
          element={protectedRoute("provider", <AcceptedJobDetails />)}
        />
        <Route
          path="/provider/my-jobs/in-progress/:id"
          element={protectedRoute("provider", <InProgressJobDetails />)}
        />
        <Route
          path="/provider/my-jobs/completed/:id"
          element={protectedRoute("provider", <CompletedJobDetails />)}
        />
        <Route
          path="/provider/my-jobs/paid/:id"
          element={protectedRoute("provider", <PaidJobDetails />)}
        />
        <Route
          path="/provider/my-jobs/cancelled/:id"
          element={protectedRoute("provider", <CancelledJobDetails />)}
        />
        <Route path="/provider/my-jobs/reschedule-requested/:id" element={protectedRoute("provider", <RescheduleRequestedJobDetails />)} />
        <Route path="/provider/my-jobs/reschedule-proposed/:id" element={protectedRoute("provider", <RescheduleProposedJobDetails />)} />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
