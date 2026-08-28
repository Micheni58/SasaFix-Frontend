import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";

function ServiceProviders() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="flex-1 ml-0 lg:ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Service Providers</h1>
            <p className="text-gray-600">
              Manage service providers and their accounts.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ServiceProviders;
