import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { useLocation } from "react-router-dom";
import { getSidebarRole } from "../../utils/sidebarRole";

function Wallet() {
  const location = useLocation();
  const sidebarRole = getSidebarRole(location.pathname);

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role={sidebarRole} />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Wallet</h1>
            <p className="text-gray-600">
              Your wallet balance, payouts, and payment history will be displayed here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Wallet;
