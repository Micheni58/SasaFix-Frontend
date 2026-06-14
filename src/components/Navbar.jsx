import { useState } from "react";
import { Bell, ChevronDown, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

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
    <nav className="w-full bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      {/* Search */}
      <div className="relative w-[45%]">
        <Search
          className="absolute left-4 top-3 text-gray-400"
          size={18}
        />

        <input
          type="text"
          placeholder="Search for services or workers..."
          className="w-full pl-12 pr-4 py-3 border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-6 relative">
        {/* Notifications */}
        <div className="relative cursor-pointer">
          <Bell size={22} />

          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
        </div>

        {/* Profile */}
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-3 cursor-pointer relative"
        >
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
            JD
          </div>

          <div className="hidden md:block">
            <h4 className="font-semibold text-sm">
              {user.name}
            </h4>

            <p className="text-xs text-gray-500">
              {user.role}
            </p>
          </div>

          <ChevronDown size={18} />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-16 right-0 w-48 bg-white rounded-xl shadow-lg border z-50">
              <button
                onClick={() => navigate("/profile")}
                className="w-full text-left px-4 py-3 hover:bg-gray-100"
              >
                My Profile
              </button>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-500 hover:bg-red-50"
              >
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