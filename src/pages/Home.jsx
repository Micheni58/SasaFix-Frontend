import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-50 to-slate-100">
      {/* ==== HERO SECTION ==== */}
      <div className="relative overflow-hidden pt-20 pb-24">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-linear-to-r from-[#056db3] to-[#056db3] opacity-90"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#056db3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#056db3] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Find Trusted Service Providers
              <span className="block text-blue-200">Near You</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-50 mb-12 max-w-2xl mx-auto">
              Connect instantly with verified mechanics, plumbers, electricians, and more — anywhere in Kenya
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 bg-[#056db3] text-white rounded-lg font-semibold hover:bg-[#045a9a] transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-8 py-4 bg-[#056db3] text-white rounded-lg font-semibold hover:bg-[#045a9a] transition-all duration-200 transform hover:scale-105 shadow-lg border-2 border-white"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==== SEARCH SECTION ==== */}
      <div className="relative -mt-12 mb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto z-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Find Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 transition-all">
                <option>All Services</option>
                <option>Mechanic</option>
                <option>Plumber</option>
                <option>Electrician</option>
                <option>Tyre Repair</option>
                <option>Boda Pickup</option>
              </select>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#056db3] focus:ring-2 focus:ring-[#056db3]/20 transition-all">
                <option>All Locations</option>
                <option>Nairobi</option>
                <option>Kinoo</option>
                <option>Thika</option>
                <option>Kisumu</option>
                <option>Mombasa</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="w-full bg-[#056db3] text-white font-semibold py-3 rounded-lg hover:bg-[#045a9a] transition-all duration-200 transform hover:scale-105">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==== FEATURES SECTION ==== */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Why Choose SasaFix?</h2>
          <p className="text-xl text-gray-600">Everything you need to find reliable service providers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group bg-white rounded-xl shadow-md p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-t-4 border-blue-600">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Verified Providers</h3>
            <p className="text-gray-600">All service providers are verified and rated by customers for quality and reliability</p>
          </div>

          {/* Feature 2 */}
          <div className="group bg-white rounded-xl shadow-md p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-t-4 border-[#056db3]">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Instant Connection</h3>
            <p className="text-gray-600">Connect with providers instantly via phone or email. No middlemen, direct contact</p>
          </div>

          {/* Feature 3 */}
          <div className="group bg-white rounded-xl shadow-md p-8 hover:shadow-2xl hover:scale-105 transition-all duration-300 border-t-4 border-[#056db3]">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Local & Fast</h3>
            <p className="text-gray-600">Find service providers near you in Kenya, available when you need them most</p>
          </div>
        </div>
      </div>

      {/* ==== SERVICES SHOWCASE ==== */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Services We Offer</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['🔧 Mechanic', '🚰 Plumber', '⚡ Electrician', '🛞 Tyre Repair', '🏍️ Boda Pickup', '🏠 More'].map((service, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 text-center hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-[#056db3]">
              <div className="text-3xl mb-2">{service.split(' ')[0]}</div>
              <p className="font-semibold text-gray-800">{service.split(' ')[1]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ==== CTA SECTION ==== */}
      <div className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-[#056db3] to-[#056db3] rounded-3xl max-w-6xl mx-auto mb-20">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of satisfied customers in Kenya</p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-[#056db3] text-white rounded-lg font-bold text-lg hover:bg-[#045a9a] transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* ==== FOOTER ==== */}
      <div className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-lg mb-2">SasaFix - Your Trusted Service Provider Network</p>
          <p className="text-sm text-gray-500">© 2026 SasaFix. All rights reserved.</p>
        </div>
      </div>

      {/* ==== GRADIENT ANIMATION ==== */}
      <style jsx>{`
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        .animate-gradient {
          animation: gradientBG 15s ease infinite;
        }
        .animate-pulse {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
