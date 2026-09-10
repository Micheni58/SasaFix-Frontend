// src/pages/NotAuthorized.jsx

import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { getSidebarRole } from "../utils/sidebarRole";

function NotAuthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-18 h-18 mx-auto mb-5 rounded-full bg-red-100 flex items-center justify-center">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>

        <p className="text-5xl font-bold text-gray-800 tracking-tight">403</p>
        <p className="text-lg font-semibold text-gray-800 mt-2 mb-1.5">Access denied</p>
        <p className="text-sm text-gray-500 mb-7 leading-relaxed">
          You don't have permission to view this page. If you think this is a mistake, contact support.
        </p>

        <div className="flex items-center justify-center gap-2.5">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4.5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
          <button
            onClick={() => navigate(`/${getSidebarRole()}`)}
            className="flex items-center gap-1.5 rounded-lg bg-[#056db3] px-4.5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotAuthorized;