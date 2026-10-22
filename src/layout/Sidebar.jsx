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
  ChevronDown,
  Flag,
  Tag,
  CreditCard,
  FileText,
  MessageSquare,
} from "lucide-react";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useInsideAuthenticatedLayout } from "./AuthenticatedLayoutContext";

// ── Key for sessionStorage ──
const SCROLL_KEY = "sidebar_scroll";

function SidebarContent({ role = "client" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [managementOpen, setManagementOpen] = useState(false);
  const location = useLocation();
  const navRef = useRef(null);
  const navigate = useNavigate();

  // Auto-expand management dropdown if current route is under it
  const managementPaths = [
    "/admin/subscriptions",
    "/admin/reports-disputes",
    "/admin/categories",
    "/admin/transactions",
    "/admin/bookings-payments",
  ];
  const isManagementActive = managementPaths.some((p) =>
    location.pathname.startsWith(p)
  );

  // Keep managementOpen in sync when navigating directly to a management route
  useEffect(() => {
    if (isManagementActive) {
      setManagementOpen(true);
    }
  }, [isManagementActive]);

  // ── Save scroll position whenever it changes ──
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(nav.scrollTop));
    };
    nav.addEventListener("scroll", onScroll, { passive: true });
    return () => nav.removeEventListener("scroll", onScroll);
  }, []);

  // ── Restore scroll position BEFORE paint on every route change ──
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) {
      nav.scrollTop = Number(saved);
    }
  }, [location.pathname]);

  const clientLinks = [
    { name: "Dashboard", path: "/client", icon: <LayoutDashboard size={20} /> },
    { name: "Find Services", path: "/client/find-services", icon: <Search size={20} /> },
    { name: "My Bookings", path: "/client/my-bookings", icon: <CalendarDays size={20} /> },
    { name: "My Quote Requests", path: "/client/quotes", icon: <FileText size={20} /> },
    { name: "Messages", path: "/client/messages", icon: <MessageCircle size={20} /> },
    { name: "My Transactions", path: "/client/transactions", icon: <Wallet size={20} /> },
    { name: "Notifications", path: "/client/notifications", icon: <Bell size={20} /> },
    { name: "Profile", path: "/client/profile", icon: <User size={20} /> },
  ];

  const providerLinks = [
    { name: "Dashboard", path: "/provider", icon: <LayoutDashboard size={20} /> },
    { name: "My Jobs", path: "/provider/my-jobs", icon: <Briefcase size={20} /> },
    { name: "Quotes", path: "/provider/quotes", icon: <MessageSquare size={20} /> },
    { name: "Availability", path: "/provider/availability", icon: <CalendarDays size={20} /> },
    { name: "My Reviews", path: "/provider/my-reviews", icon: <Star size={20} /> },
    { name: "Notifications", path: "/provider/notifications", icon: <Bell size={20} /> },
    { name: "Messages", path: "/provider/messages", icon: <MessageCircle size={20} /> },
    { name: "My Earnings", path: "/provider/earnings", icon: <Wallet size={20} /> },
    { name: "Subscriptions", path: "/provider/subscription", icon: <ShieldCheck size={20} /> },
    { name: "Profile", path: "/provider/profile", icon: <User size={20} /> },
  ];

  const adminLinks = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Users", path: "/admin/users", icon: <Users size={20} /> },
    { name: "Service Providers", path: "/admin/service-providers", icon: <Store size={20} /> },
    { name: "Analytics", path: "/admin/analytics", icon: <BarChart3 size={20} /> },
    { name: "Notifications", path: "/admin/notifications", icon: <Bell size={20} /> },
    { name: "Settings", path: "/admin/settings", icon: <Settings size={20} /> },
  ];

  const managementLinks = [
    { name: "Bookings & Payments", path: "/admin/bookings-payments", icon: <CalendarDays size={17} /> },
    { name: "Transactions", path: "/admin/transactions", icon: <Wallet size={17} /> },
    { name: "Premium Subscriptions", path: "/admin/subscriptions", icon: <CreditCard size={17} /> },
    { name: "Reports & Disputes", path: "/admin/reports-disputes", icon: <Flag size={17} /> },
    { name: "Service Categories", path: "/admin/categories", icon: <Tag size={17} /> },
  ];

  const links =
    role === "provider"
      ? providerLinks
      : role === "admin"
      ? adminLinks
      : clientLinks;

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-5 left-5 z-50 bg-[#056db3] text-white p-2 rounded-xl shadow-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 flex flex-col
          ${isOpen ? "w-72" : "w-0 lg:w-72 overflow-hidden"}
        `}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
          <h1 className="text-3xl font-bold tracking-tight text-[#056db3]">
            SasaFix
          </h1>
        </div>

        {/* Nav */}
        <nav
          ref={navRef}
          className="flex-1 overflow-y-auto overscroll-contain px-5 py-6 space-y-1"
        >
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={
                link.path === "/admin" ||
                link.path === "/client" ||
                link.path === "/provider"
              }
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => {
                const isFindServicesActive =
                  link.path === "/client/find-services" &&
                  location.pathname.startsWith("/providers/");

                return `flex items-center gap-4 px-5 py-3.5 rounded-2xl
                transition-all duration-200
                ${
                  isActive || isFindServicesActive
                    ? "bg-[#056db3] text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                }`;
              }}
            >
              <span>{link.icon}</span>
              <span className="text-[15px]">{link.name}</span>
            </NavLink>
          ))}

          {/* Management Dropdown (admin only) */}
          {role === "admin" && (
            <div>
              <button
                onClick={() => setManagementOpen((prev) => !prev)}
                className={`
                  w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl
                  transition-all duration-200
                  ${
                    isManagementActive
                      ? "bg-[#056db3] text-white shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                  }
                `}
              >
                <ShieldCheck size={20} />
                <span className="text-[15px] flex-1 text-left">Management</span>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-200 ${
                    managementOpen || isManagementActive ? "rotate-180" : ""
                  }`}
                />
              </button>

              {(managementOpen || isManagementActive) && (
                <div className="mt-1 ml-4 pl-4 border-l-2 border-blue-100 space-y-1">
                  {managementLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl
                        transition-all duration-200 text-[14px]
                        ${
                          isActive
                            ? "bg-blue-50 text-[#056db3] font-semibold dark-sidebar-active"
                            : "text-gray-500 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                        }`
                      }
                    >
                      <span>{link.icon}</span>
                      <span>{link.name}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Provider Upgrade Card */}
        {role === "provider" && (
          <div className="border-t border-gray-100 p-4 shrink-0">
            <div className="rounded-2xl bg-linear-to-br from-[#056db3] to-[#0b86d5] p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={18} />
                <h3 className="font-semibold text-sm">Premium Subscription</h3>
              </div>
              <p className="text-[11px] leading-5 text-blue-100 mb-3">
                Upgrade to Premium and reduce your commission from 10% to 5%.
              </p>
              <button
                onClick={() => navigate("/provider/subscription")}
                className="w-full bg-white text-[#056db3] rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-100 transition"
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

function Sidebar({ role = "client", shared = false }) {
  const insideAuthenticatedLayout = useInsideAuthenticatedLayout();
  if (insideAuthenticatedLayout && !shared) return null;
  return <SidebarContent role={role} />;
}

export default Sidebar;