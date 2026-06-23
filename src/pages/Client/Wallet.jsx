import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

function Wallet() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="client" />
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
