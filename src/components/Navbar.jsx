import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  User,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [showDropdown, setShowDropdown] =
    useState(false);

  const navigate = useNavigate();

  const user = {
    name: "John Doe",
    role: "Client",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
      {/* Search Bar */}
      <div className="relative w-[50%]">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search for services or workers..."
          className="
            w-full
            pl-12
            pr-4
            py-3
            rounded-xl
            border
            border-gray-300
            bg-[#f8fafc]
            focus:outline-none
            focus:ring-2
            focus:ring-[#056db3]
            focus:border-[#056db3]
          "
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6 relative">
        {/* Notification Bell */}
        <button className="relative">
          <Bell
            size={22}
            className="text-gray-700 hover:text-[#056db3] transition"
          />

          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() =>
              setShowDropdown(!showDropdown)
            }
            className="flex items-center gap-3"
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-[#056db3] flex items-center justify-center text-white font-semibold text-sm">
              JD
            </div>

            {/* User Info */}
            <div className="hidden md:block text-left">
              <h3 className="font-semibold text-sm text-gray-800">
                {user.name}
              </h3>

              <p className="text-xs text-gray-500">
                {user.role}
              </p>
            </div>

            <ChevronDown
              size={18}
              className="text-gray-500"
            />
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute right-0 mt-4 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-50">
              <button
                onClick={() =>
                  navigate("/profile")
                }
                className="flex items-center gap-3 w-full px-5 py-4 hover:bg-gray-50 transition"
              >
                <User
                  size={18}
                  color="#056db3"
                />
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-5 py-4 text-red-500 hover:bg-red-50 transition"
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