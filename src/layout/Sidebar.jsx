import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Bell,
  User,
  Settings,
  Menu,
  X,
  Search,
  MessageCircle,
  Wallet,
  BarChart3,
  Users,
  Store,
  ShieldCheck,
  Star,
} from "lucide-react";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ role = "client" }) {
  const [isOpen, setIsOpen] = useState(false);

  const clientLinks = [
    {
      name: "Dashboard",
      path: "/client",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Find Services",
      path: "/client/find-services",
      icon: <Search size={20} />,
    },
    {
      name: "My Bookings",
      path: "/client/my-bookings",
      icon: <CalendarDays size={20} />,
    },
    {
      name: "Messages",
      path: "/client/messages",
      icon: <MessageCircle size={20} />,
    },
    {
      name: "Wallet",
      path: "/client/wallet",
      icon: <Wallet size={20} />,
    },
    {
      name: "Notifications",
      path: "/client/notifications",
      icon: <Bell size={20} />,
    },
    {
      name: "Profile",
      path: "/client/profile",
      icon: <User size={20} />,
    },
  ];

  const providerLinks = [
    {
      name: "Dashboard",
      path: "/provider",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "My Jobs",
      path: "/provider/my-jobs",
      icon: <Briefcase size={20} />,
    },
    {
      name: "Availability",
      path: "/provider/availability",
      icon: <CalendarDays size={20} />,
    },
    {
      name: "My Reviews",
      path: "/provider/my-reviews",
      icon: <Star size={20} />,
    },
    {
      name: "Notifications",
      path: "/provider/notifications",
      icon: <Bell size={20} />,
    },
    {
      name: "Messages",
      path: "/provider/messages",
      icon: <MessageCircle size={20} />,
    },
    {
      name: "Wallet",
      path: "/provider/wallet",
      icon: <Wallet size={20} />,
    },
    {
      name: "Subscriptions",
      path: "/provider/subscription",
      icon: <ShieldCheck size={20} />,
    },
    {
      name: "Profile",
      path: "/provider/profile",
      icon: <User size={20} />,
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users size={20} />,
    },
    {
      name: "Service Providers",
      path: "/admin/service-providers",
      icon: <Store size={20} />,
    },
    {
      name: "Bookings & Payments",
      path: "/admin/bookings-payments",
      icon: <CalendarDays size={20} />,
    },
    {
      id: "admin-escrow",
      name: "Escrow Management",
      icon: <Wallet className="h-5 w-5" />,
      path: "/admin/escrow",
    },
    {
      id: "admin-analytics",
      name: "Analytics & Reports",
      path: "/admin/reports",
      icon: <BarChart3 size={20} />,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: <Bell size={20} />,
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings size={20} />,
    },
  ];

  const links =
    role === "provider"
      ? providerLinks
      : role === "admin"
      ? adminLinks
      : clientLinks;

  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 bg-[#056db3] text-white p-2 rounded-xl shadow-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed
          top-0
          left-0
          z-40
          h-screen
          bg-white
          border-r
          border-gray-200
          shadow-sm
          transition-all
          duration-300
          flex
          flex-col
          ${isOpen ? "w-72" : "w-0 lg:w-72 overflow-hidden"}
        `}
      >
        {/* Logo */}
        <div className="h-24 flex items-center px-8 border-b border-gray-100 flex-shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-[#056db3]">
            SasaFix
          </h1>
        </div>

        {/* Navigation */}
        <nav
          className="
            flex-1
            overflow-y-auto
            px-5
            py-6
            space-y-2
          "
        >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `
                flex
                items-center
                gap-4
                px-5
                py-3.5
                rounded-2xl
                transition-all
                duration-200
                group
                ${
                  isActive
                    ? "bg-[#056db3] text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-blue-50 hover:text-[#056db3]"
                }
              `
              }
            >
              <span>{link.icon}</span>

              <span className="text-[15px]">
                {link.name}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Upgrade Card */}
        {role === "provider" && (
          <div className="border-t border-gray-100 p-4 flex-shrink-0">
            <div className="rounded-2xl bg-gradient-to-br from-[#056db3] to-[#0b86d5] p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} />

                <h3 className="font-semibold text-sm">
                  Premium Subscription
                </h3>
              </div>

              <p className="text-[11px] leading-5 text-blue-100 mb-3">
                Upgrade to Premium and reduce your commission from 10% to 5%.
              </p>

              <button
                onClick={() =>
                  navigate("/provider/subscription")
                }
                className="
                  w-full
                  bg-white
                  text-[#056db3]
                  rounded-xl
                  py-2.5
                  text-sm
                  font-semibold
                  hover:bg-gray-100
                  transition
                "
              >
                View Subscription
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;