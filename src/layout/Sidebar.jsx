import {
  LayoutDashboard,
  CalendarDays,
  Briefcase,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  MessageCircle,
  Wallet,
  Gift,
  ShieldCheck,
  BarChart3,
  Users,
  Store,
  UserCog,
} from "lucide-react";

import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ role = "client" }) {
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
      name: "Referrals",
      path: "/client/referrals",
      icon: <Gift size={20} />,
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
      id: "admin-users",
      name: "Users",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users",
    },
    {
      id: "admin-providers",
      name: "Service Providers",
      icon: <Store className="h-5 w-5" />,
      path: "/admin/service-providers",
    },
    {
      name: "Bookings & Payments",
      path: "/admin/bookings-payments",
      icon: <CalendarDays size={20} />,
    },
    {
      id: "admin-analytics",
      name: "Analytics & Reports",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/admin/reports",
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

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          lg:hidden
          fixed
          top-5
          left-5
          z-50
          bg-[#056db3]
          text-white
          p-2
          rounded-lg
          shadow-md
        "
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          bg-white
          border-r
          border-gray-200
          shadow-sm
          h-screen
          fixed
          top-0
          left-0
          z-40
          transition-all
          duration-300
          overflow-y-auto
          ${isOpen ? "w-72" : "w-0 lg:w-72 overflow-hidden"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-8 py-8 border-b">
            <h1 className="text-3xl font-bold text-[#056db3]">SasaFix</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
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
                  py-4
                  rounded-xl
                  font-medium
                  transition-all
                  ${
                    isActive
                      ? "bg-[#056db3] text-white shadow-md"
                      : "text-gray-700 hover:bg-[#056db3]/10 hover:text-[#056db3]"
                  }
                `
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Premium Card (Client Only) */}
          {role === "client" && (
            <div className="px-4 pb-4">
              <div className="bg-[#056db3] rounded-2xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={20} />
                  <h3 className="font-semibold">Premium</h3>
                </div>

                <p className="text-sm text-blue-100 mb-4">
                  Unlock premium workers, faster bookings & priority support.
                </p>

                <button className="bg-white text-[#056db3] font-semibold w-full py-3 rounded-xl hover:bg-gray-100 transition">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="border-t p-4">
            <button
              onClick={handleLogout}
              className="
                flex
                items-center
                gap-3
                w-full
                px-5
                py-4
                rounded-xl
                text-red-500
                hover:bg-red-50
                transition
              "
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
