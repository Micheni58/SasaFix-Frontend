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
  Crown,
} from "lucide-react";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useInsideAuthenticatedLayout } from "./AuthenticatedLayoutContext";

const SCROLL_KEY = "sidebar_scroll";
const DESKTOP_QUERY = "(min-width: 1024px)";

function SidebarContent({ role = "client" }) {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia(DESKTOP_QUERY).matches
  );
  const [collapsed, setCollapsed] = useState(false); // desktop: icon strip
  const [mobileExpanded, setMobileExpanded] = useState(false); // mobile: full sidebar over the strip
  const [managementOpen, setManagementOpen] = useState(false);
  const [tip, setTip] = useState(null); // hover tooltip { label, top }
  const location = useLocation();
  const navRef = useRef(null);
  const navigate = useNavigate();

  // Full sidebar (labels visible) vs icon strip
  const expanded = isDesktop ? !collapsed : mobileExpanded;

  // Track the breakpoint; reset mobile state when crossing it
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event) => {
      setIsDesktop(event.matches);
      setMobileExpanded(false);
      setTip(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Publish desktop sidebar width so the navbar and page content can follow it
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-w",
      collapsed ? "5rem" : "18rem"
    );
    return () => document.documentElement.style.removeProperty("--sidebar-w");
  }, [collapsed]);

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

  useEffect(() => {
    if (isManagementActive) setManagementOpen(true);
  }, [isManagementActive]);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      sessionStorage.setItem(SCROLL_KEY, String(nav.scrollTop));
    };
    nav.addEventListener("scroll", onScroll, { passive: true });
    return () => nav.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const saved = sessionStorage.getItem(SCROLL_KEY);
    if (saved !== null) nav.scrollTop = Number(saved);
  }, [location.pathname]);

  // Tooltip only while in strip mode (fixed position so the scrolling nav can't clip it)
  const showTip = (event, label) => {
    if (expanded) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTip({ label, top: rect.top + rect.height / 2 });
  };
  const hideTip = () => setTip(null);

  const toggleSidebar = () => {
    hideTip();
    if (isDesktop) setCollapsed((prev) => !prev);
    else setMobileExpanded((prev) => !prev);
  };

  // After choosing a page on mobile, go back to the strip
  const handleLinkClick = () => {
    hideTip();
    setMobileExpanded(false);
  };

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

  // Premium card content (client + provider only). Same text/routes as before.
  const premium =
    role === "provider"
      ? {
          title: "Premium Subscription",
          text: "Upgrade to Premium and reduce your commission from 10% to 5%.",
          path: "/provider/subscription",
        }
      : role === "client"
      ? {
          title: "SasaFix Premium",
          text: "Unlock unlimited AI job-description improvements for KES 300/month.",
          path: "/client/subscription",
        }
      : null;

  return (
    <>
      {/* Mobile: dim backdrop while the full sidebar is open; tap to return to the strip */}
      {!isDesktop && mobileExpanded && (
        <div
          className="fixed inset-0 z-35 bg-black/30"
          onClick={() => setMobileExpanded(false)}
          aria-hidden="true"
        />
      )}

      {/* h-dvh so the bottom banner isn't cut off by mobile browser bars */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-dvh overflow-hidden
          bg-white border-r border-gray-200 shadow-sm
          transition-all duration-300 flex flex-col
          ${expanded ? "w-72" : isDesktop ? "w-20" : "w-16"}
        `}
      >
        {/* Header: name + menu button (button sits right of the name). Strip: button only. */}
        <div
          className={`h-20 flex items-center border-b border-gray-100 shrink-0 ${
            expanded ? "justify-between px-6 lg:px-8" : "justify-center"
          }`}
        >
          {expanded && (
            <h1 className="text-3xl font-bold tracking-tight text-[#056db3] whitespace-nowrap">
              SasaFix
            </h1>
          )}

          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl text-[#056db3] hover:bg-blue-50 transition"
            aria-label={
              isDesktop
                ? expanded
                  ? "Collapse sidebar"
                  : "Expand sidebar"
                : expanded
                ? "Close menu"
                : "Open menu"
            }
          >
            {/* Mobile expanded shows X; everything else shows the menu icon */}
            {!isDesktop && expanded ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Nav */}
        <nav
          ref={navRef}
          className={`flex-1 min-h-0 overflow-y-auto overscroll-contain py-6 space-y-1 ${
            expanded ? "px-5" : "px-2 lg:px-3"
          }`}
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
              onClick={handleLinkClick}
              onMouseEnter={(e) => showTip(e, link.name)}
              onMouseLeave={hideTip}
              className={({ isActive }) => {
                const isFindServicesActive =
                  link.path === "/client/find-services" &&
                  location.pathname.startsWith("/providers/");

                return `flex items-center py-3.5 rounded-2xl
                transition-all duration-200
                ${expanded ? "gap-4 px-5" : "justify-center px-0"}
                ${
                  isActive || isFindServicesActive
                    ? "bg-[#056db3] text-white shadow-sm font-semibold"
                    : "text-gray-600 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                }`;
              }}
            >
              <span>{link.icon}</span>
              {expanded && (
                <span className="text-[15px] whitespace-nowrap">{link.name}</span>
              )}
            </NavLink>
          ))}

          {/* Management Dropdown (admin only) */}
          {role === "admin" && (
            <div>
              <button
                onClick={() => setManagementOpen((prev) => !prev)}
                onMouseEnter={(e) => showTip(e, "Management")}
                onMouseLeave={hideTip}
                className={`
                  w-full flex items-center py-3.5 rounded-2xl
                  transition-all duration-200
                  ${expanded ? "gap-4 px-5" : "justify-center px-0"}
                  ${
                    isManagementActive
                      ? "bg-[#056db3] text-white shadow-sm font-semibold"
                      : "text-gray-600 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                  }
                `}
              >
                <ShieldCheck size={20} />
                {expanded && (
                  <>
                    <span className="text-[15px] flex-1 text-left whitespace-nowrap">
                      Management
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${
                        managementOpen || isManagementActive ? "rotate-180" : ""
                      }`}
                    />
                  </>
                )}
              </button>

              {(managementOpen || isManagementActive) && (
                <div
                  className={`mt-1 space-y-1 ${
                    expanded ? "ml-4 pl-4 border-l-2 border-blue-100" : ""
                  }`}
                >
                  {managementLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={handleLinkClick}
                      onMouseEnter={(e) => showTip(e, link.name)}
                      onMouseLeave={hideTip}
                      className={({ isActive }) =>
                        `flex items-center py-2.5 rounded-xl
                        transition-all duration-200 text-[14px]
                        ${expanded ? "gap-3 px-4" : "justify-center px-0"}
                        ${
                          isActive
                            ? "bg-blue-50 text-[#056db3] font-semibold dark-sidebar-active"
                            : "text-gray-500 hover:bg-blue-50 hover:text-[#056db3] dark-sidebar-link"
                        }`
                      }
                    >
                      <span>{link.icon}</span>
                      {expanded && <span className="whitespace-nowrap">{link.name}</span>}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Premium: full card when expanded, gradient crown icon in strip mode.
            pb uses the safe-area inset so it isn't hidden by phone browser bars. */}
        {premium && (
          <div
            className={`border-t border-gray-100 shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))] ${
              expanded ? "p-4" : "px-2 pt-4 lg:px-3"
            }`}
          >
            {expanded ? (
              <div className="rounded-2xl bg-linear-to-br from-[#056db3] to-[#0b86d5] p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} />
                  <h3 className="font-semibold text-sm">{premium.title}</h3>
                </div>
                <p className="text-[11px] leading-5 text-blue-100 mb-3">
                  {premium.text}
                </p>
                <button
                  onClick={() => {
                    handleLinkClick();
                    navigate(premium.path);
                  }}
                  className="w-full bg-white text-[#056db3] rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-100 transition"
                >
                  View Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  handleLinkClick();
                  navigate(premium.path);
                }}
                onMouseEnter={(e) => showTip(e, premium.title)}
                onMouseLeave={hideTip}
                aria-label={premium.title}
                className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#056db3] to-[#0b86d5] text-yellow-300 shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-lg hover:brightness-110 active:scale-95"
              >
                <Crown size={20} />
              </button>
            )}
          </div>
        )}
      </aside>

      {/* Strip tooltip */}
      {tip && !expanded && (
        <div
          style={{ top: tip.top, left: isDesktop ? "5.25rem" : "4.25rem" }}
          className="fixed z-60 -translate-y-1/2 pointer-events-none whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg"
        >
          {tip.label}
        </div>
      )}
    </>
  );
}

function Sidebar({ role = "client", shared = false }) {
  const insideAuthenticatedLayout = useInsideAuthenticatedLayout();
  if (insideAuthenticatedLayout && !shared) return null;
  return <SidebarContent role={role} />;
}

export default Sidebar;