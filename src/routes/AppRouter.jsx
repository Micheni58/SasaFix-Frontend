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
              <Navbar />
              <AdminDashboard />
            </>
          }
        />

        <Route
          path="/client"
          element={
            <>
              <Navbar />
              <ClientDashboard />
            </>
          }
        />

        <Route
          path="/provider"
          element={
            <>
              <Navbar />
              <ProviderDashboard />
            </>
          }
        />

        <Route
          path="/client/my-bookings"
          element={
            <>
              <Navbar />
              <MyBookings />
            </>
          }
        />

        <Route
          path="/provider/my-jobs"
          element={
            <>
              <Navbar />
              <MyJobs />
            </>
          }
        />

        <Route
          path="/client/my-bookings/:bookingId"
          element={
            <>
              <Navbar />
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