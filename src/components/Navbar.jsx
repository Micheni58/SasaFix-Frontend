import { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  User,
  LogOut,
} from "lucide-react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import authService from "../services/api";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser =
          await authService.getCurrentUser();

        setUser(currentUser);
      } catch (err) {
        const storedUser =
          authService.getStoredUser();

        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const initials =
    user
      ? `${user.first_name?.charAt(0) ?? ""}${user.last_name?.charAt(0) ?? ""}`
      : "U";

  const displayRole = () => {
    if (!user) return "";

    switch (user.role) {
      case "client":
        return "Client";

      case "service_provider":
        return "Service Provider";

      case "admin":
        return "Administrator";

      default:
        return user.role;
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(
        `/client/find-services?search=${encodeURIComponent(search)}`
      );
    }
  };

  return (
    <nav
      className="
        fixed
        top-0
        left-72
        right-0
        h-20
        bg-white
        border-b
        border-gray-100
        flex
        items-center
        justify-between
        px-8
        z-30
      "
    >
      {/* Search */}

      <div className="flex-1 max-w-2xl">

        <div className="relative">

          <Search
            size={18}
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-gray-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            onKeyDown={handleSearch}
            placeholder="Search services or providers..."
            className="
              w-full
              h-12
              rounded-2xl
              bg-[#F8FAFC]
              border
              border-gray-200
              pl-12
              pr-4
              text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[#056db3]
              focus:border-[#056db3]
              transition
            "
          />

        </div>

      </div>

      {/* Right Side */}

      <div className="flex items-center gap-6 relative">
        {/* Notifications */}

        <button
          className="
            relative
            w-11
            h-11
            rounded-full
            border
            border-gray-200
            flex
            items-center
            justify-center
            hover:bg-gray-50
            transition
          "
        >
          <Bell
            size={20}
            className="text-gray-600"
          />

          <span
            className="
              absolute
              top-2
              right-2
              w-2
              h-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* Profile */}

        <div className="relative">

          <button
            onClick={() =>
              setShowDropdown(!showDropdown)
            }
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
                rounded-full
                bg-[#056db3]
                flex
                items-center
                justify-center
                text-white
                font-semibold
              "
            >
              {loading ? "..." : initials}
            </div>

            {/* User */}

            <div className="hidden md:block text-left">

              <h3 className="text-sm font-semibold text-gray-900">

                {loading
                  ? "Loading..."
                  : `${user?.first_name ?? ""} ${user?.last_name ?? ""}`}

              </h3>

              <p className="text-xs text-gray-500">

                {loading ? "" : displayRole()}

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
                  } else if (
                    user?.role === "service_provider"
                  ) {
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

                <User
                  size={18}
                  className="text-[#056db3]"
                />

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

      </div>

    </nav>
  );
}

export default Navbar;