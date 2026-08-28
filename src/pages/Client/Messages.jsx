import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole } from "../../utils/sidebarRole";

function Messages() {
  const location = useLocation();
  const sidebarRole = getSidebarRole(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Messages</h1>
            <p className="text-gray-600">
              Your conversations and message center will appear here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Messages;
