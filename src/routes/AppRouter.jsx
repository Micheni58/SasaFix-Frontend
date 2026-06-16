import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "../components/Navbar";

import Home from "../pages/Home";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";
import About from "../pages/About";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import ClientDashboard from "../pages/Client/ClientDashboard";
import ProviderDashboard from "../pages/ServiceProvider/ProviderDashboard";

import MyBookings from "../pages/Client/bookings/MyBookings";
import MyJobs from "../pages/ServiceProvider/Jobs/MyJobs";
import MyBookingDetails from "../pages/Client/bookings/MyBookingDetails";
import FindServices from "../pages/ServiceDiscovery/FindServices";

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
        <Route
          path="/admin"
          element={
            <>
              <Navbar role="admin" />
              <AdminDashboard />
            </>
          }
        />

        <Route
          path="/client"
          element={
            <>
              <Navbar role="client" />
              <ClientDashboard />
            </>
          }
        />

        <Route
          path="/provider"
          element={
            <>
              <Navbar role="provider" />
              <ProviderDashboard />
            </>
          }
        />

        <Route
          path="/client/my-bookings"
          element={
            <>
              <Navbar role="client" />
              <MyBookings />
            </>
          }
        />

        <Route
          path="/provider/my-jobs"
          element={
            <>
              <Navbar role="provider" />
              <MyJobs />
            </>
          }
        />

        <Route
          path="/client/find-services"
          element={
            <>
              <Navbar role="client" />
              <FindServices />
            </>
          }
        />

        <Route
          path="/client/my-bookings/:bookingId"
          element={
            <>
              <Navbar role="client" />
              <MyBookingDetails />
            </>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}