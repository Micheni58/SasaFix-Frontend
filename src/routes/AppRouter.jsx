import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import About from "../pages/About";

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
import MyBookingDetails from "../pages/Client/bookings/MyBookingDetails";
import ClientProfile from "../pages/Client/Profile";

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<About />} />

        {/* Protected/Dashboard Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/notifications" element={<AdminNotification />} />

        <Route path="/client" element={<ClientDashboard />} />
        <Route path="/client/find-services" element={<FindServices />} />
        <Route path="/client/messages" element={<ClientMessages />} />
        <Route path="/client/wallet" element={<ClientWallet />} />
        <Route path="/client/notifications" element={<ClientNotification />} />
        <Route path="/client/profile" element={<ClientProfile />} />

        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/messages" element={<ClientMessages />} />
        <Route path="/provider/wallet" element={<ClientWallet />} />
        <Route path="/provider/profile" element={<Profile />} />
        <Route path="/provider/availability" element={<Availability />} />
        <Route path="/provider/notifications" element={<ProviderNotification />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/client/my-bookings" element={<MyBookings />} />
        <Route path="/provider/my-jobs" element={<MyJobs />} />
        <Route path="/provider/my-jobs/new/:id" element={<NewJobRequestDetails />} />
        <Route path="/provider/my-jobs/accepted/:id" element={<AcceptedJobDetails />} />
        <Route path="/provider/my-jobs/in-progress/:id" element={<InProgressJobDetails />} />
        <Route path="/provider/my-jobs/completed/:id" element={<CompletedJobDetails />} />
        <Route path="/client/my-bookings/:bookingId" element={<MyBookingDetails />} />
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}
