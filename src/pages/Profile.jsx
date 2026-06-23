import Sidebar from "../layout/Sidebar";
import Navbar from "../components/Navbar";

function Profile() {
  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />
      <div className="flex-1 ml-72">
        <Navbar />
        <main className="pt-24 px-6 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Profile</h1>
            <p className="text-gray-600">
              Manage your account details and personal information here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Profile;
