import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Bell, ChevronDown, User, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "../services/api";
import { fetchUnreadNotificationCount } from "../api/notificationService";
import { useInsideAuthenticatedLayout } from "../layout/AuthenticatedLayoutContext";

const getInitialUser = () => {
  try {
    return authService.getStoredUser();
  } catch {
    return null;
  }
};

function NavbarContent() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(() => !getInitialUser());
  const [unreadCount, setUnreadCount] = useState(0);
  const [animateNotificationDot, setAnimateNotificationDot] = useState(true);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const avatarImageRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        const storedUser = authService.getStoredUser();
        const mergedUser = {
          ...storedUser,
          ...currentUser,
          profile_photo_url:
            currentUser?.profile_photo_url ||
            storedUser?.profile_photo_url ||
            null,
        };
        authService.setStoredUser(mergedUser);
        setUser(mergedUser);
      } catch {
        const storedUser = authService.getStoredUser();
        if (storedUser) setUser(storedUser);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  useLayoutEffect(() => {
    setImgLoaded(false);
    setImgFailed(false);
  }, [user?.profile_photo_url]);

  useEffect(() => {
    if (avatarImageRef.current?.complete) {
      if (avatarImageRef.current.naturalWidth > 0) setImgLoaded(true);
      else setImgFailed(true);
    }
  }, [user?.profile_photo_url]);

  useEffect(() => {
    const syncUser = () => {
      const stored = authService.getStoredUser();
      if (stored) {
        setUser((previousUser) => ({
          ...previousUser,
          ...stored,
          profile_photo_url:
            stored.profile_photo_url || previousUser?.profile_photo_url || null,
        }));
      }
    };

    window.addEventListener("user-updated", syncUser);
    return () => window.removeEventListener("user-updated", syncUser);
  }, []);

  const handleLogout = () => {
    const userId = user?.id || user?.user_id || user?.client_id || user?.provider_id;
    if (userId) sessionStorage.removeItem(`notifications-dot-dismissed-${userId}`);
    authService.logout();
    navigate("/login");
  };

  const initials = user
    ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`
    : "U";

  const displayRole = () => {
    if (!user) return "";

    switch (user.role) {
      case "client":
        return "Client";
      case "service_provider":
      case "provider":
        return "Service Provider";
      case "admin":
        return "Administrator";
      default:
        return user.role;
    }
  };

  const handleNotifications = () => {
    setAnimateNotificationDot(false);
    const userId = user?.id || user?.user_id || user?.client_id || user?.provider_id;
    if (userId) sessionStorage.setItem(`notifications-dot-dismissed-${userId}`, "true");
    const notificationRoutes = {
      client: "/client/notifications",
      service_provider: "/provider/notifications",
      provider: "/provider/notifications",
      admin: "/admin/notifications",
    };

    navigate(notificationRoutes[user?.role] || "/client/notifications");
  };

  useEffect(() => {
    if (!user) return;

    const userId = user.id || user.user_id || user.client_id || user.provider_id;
    setAnimateNotificationDot(
      !userId || sessionStorage.getItem(`notifications-dot-dismissed-${userId}`) !== "true"
    );

    let isCurrent = true;
    const updateUnreadCount = async () => {
      try {
        const count = await fetchUnreadNotificationCount(userId);
        if (isCurrent) setUnreadCount(count);
      } catch {
        if (isCurrent) setUnreadCount(0);
      }
    };

    updateUnreadCount();
    window.addEventListener("notifications-updated", updateUnreadCount);
    return () => {
      isCurrent = false;
      window.removeEventListener("notifications-updated", updateUnreadCount);
    };
  }, [user]);

  return (
    <nav
      className="
        fixed
        top-0
        left-0
        lg:left-72
        right-0
        h-20
        bg-white
        border-b
        border-gray-100
        flex
        items-center
        justify-end
        px-4
        sm:px-6
        lg:px-8
        z-30
      "
    >
      {/* Right Side */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Notifications */}
        {loading ? (
          <div
            aria-label="Loading notifications"
            className="h-11 w-11 animate-pulse rounded-full bg-gray-100"
          />
        ) : (
          <button
            type="button"
            onClick={handleNotifications}
            aria-label="Open notifications"
            className="
              relative
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              hover:bg-gray-50
              transition
            "
          >
            <Bell size={20} className="text-gray-600" />

            {unreadCount > 0 && (
              <span
                className={`absolute top-2 right-1 w-2 h-2 rounded-full bg-red-500 ${
                  animateNotificationDot ? "animate-bounce" : ""
                }`}
              />
            )}
          </button>
        )}

        {/* Profile */}
        {loading ? (
          <div className="flex items-center gap-3 px-2 py-2" aria-label="Loading profile">
            <div className="h-11 w-11 animate-pulse rounded-full bg-gray-200" />
            <div className="hidden space-y-2 md:block">
              <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="hidden h-4 w-4 animate-pulse rounded bg-gray-100 md:block" />
          </div>
        ) : (
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="
              flex
              items-center
              gap-3
              rounded-2xl
              px-2
              py-2
              hover:bg-gray-50
              transition
            "
          >
            {/* Avatar */}
            <div
              className="
                w-11
                h-11
                relative
                rounded-full
                bg-[#056db3]
                flex
                items-center
                justify-center
                text-white
                font-semibold
                overflow-hidden
              "
            >
              {user?.profile_photo_url && !imgFailed ? (
                <>
                  {!imgLoaded && <div className="absolute inset-0 bg-gray-200" />}
                  <img
                    ref={avatarImageRef}
                    src={user.profile_photo_url}
                    alt="avatar"
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgFailed(true)}
                    className={`relative w-full h-full object-cover ${imgLoaded ? "" : "invisible"}`}
                  />
                </>
              ) : (
                initials
              )}
            </div>

            {/* User */}
            <div className="hidden md:block text-left">
              <h3 className="text-sm font-semibold text-gray-900">
                {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
              </h3>

              <p className="text-xs text-gray-500">
                {displayRole()}
              </p>
            </div>

            <ChevronDown
              size={18}
              className={`
                text-gray-500
                transition-transform
                ${showDropdown ? "rotate-180" : ""}
              `}
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div
              className="
                absolute
                right-0
                mt-3
                w-56
                bg-white
                rounded-2xl
                border
                border-gray-100
                shadow-xl
                overflow-hidden
                z-50
              "
            >
              <button
                onClick={() => {
                  if (user?.role === "client") {
                    navigate("/client/profile");
                  } else if (["service_provider", "provider"].includes(user?.role)) {
                    navigate("/provider/profile");
                  } else {
                    navigate("/profile");
                  }
                  setShowDropdown(false);
                }}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-5
                  py-4
                  hover:bg-gray-50
                  transition
                "
              >
                <User size={18} className="text-[#056db3]" />
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="
                  w-full
                  flex
                  items-center
                  gap-3
                  px-5
                  py-4
                  text-red-500
                  hover:bg-red-50
                  transition
                "
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </nav>
  );
}

function Navbar({ shared = false }) {
  const insideAuthenticatedLayout = useInsideAuthenticatedLayout();
  if (insideAuthenticatedLayout && !shared) return null;
  return <NavbarContent />;
}

export default Navbar;
