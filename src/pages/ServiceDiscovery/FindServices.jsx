import { useState } from "react";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  Filter,
} from "lucide-react";

import Sidebar from "../../layout/Sidebar";

function FindServices() {
  const [search, setSearch] =
    useState("");

  const workers = [
    {
      id: 1,
      name: "Sarah Wanjiru",
      service: "Plumber",
      rating: 4.9,
      reviews: 127,
      location: "Westlands",
      premium: true,
      verified: true,
      price: "KES 2,500",
      image:
        "https://img.magnific.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: 2,
      name: "Michael Ochieng",
      service: "Electrician",
      rating: 4.8,
      reviews: 84,
      location: "Kilimani",
      premium: true,
      verified: true,
      price: "KES 3,000",
      image:
        "https://img.magnific.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: 3,
      name: "Jane Mwikali",
      service: "Cleaner",
      rating: 4.7,
      reviews: 53,
      location: "Karen",
      premium: false,
      verified: true,
      price: "KES 1,800",
      image:
        "https://img.magnific.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
    },
    {
      id: 4,
      name: "Kevin Kamau",
      service: "Carpenter",
      rating: 4.8,
      reviews: 91,
      location: "Lavington",
      premium: false,
      verified: true,
      price: "KES 4,200",
      image:
        "https://img.magnific.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740&q=80",
    },
  ];

  const filteredWorkers =
    workers.filter((worker) =>
      worker.name
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  const premiumWorkers =
    workers.filter(
      (worker) => worker.premium
    );

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar */}
      <Sidebar role="client" />

      {/* Main Content */}
      <main className="flex-1 ml-72 pt-28 p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Find Services
          </h1>

          <p className="text-gray-600 mt-2">
            Find trusted professionals
            near you
          </p>
        </div>

        {/* Search */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />

              <input
                type="text"
                placeholder="Search workers or services..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
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
                "
              />
            </div>

            {/* Service */}
            <select className="border border-gray-300 rounded-xl px-4 py-3 bg-[#f8fafc]">
              <option>
                Select Service
              </option>
              <option>Plumber</option>
              <option>
                Electrician
              </option>
              <option>Cleaner</option>
              <option>Painter</option>
            </select>

            {/* Location */}
            <select className="border border-gray-300 rounded-xl px-4 py-3 bg-[#f8fafc]">
              <option>Location</option>
              <option>Westlands</option>
              <option>Karen</option>
              <option>Kilimani</option>
            </select>
          </div>

          <div className="flex justify-between items-center mt-5">
            <button className="flex items-center gap-2 text-gray-600 hover:text-[#056db3]">
              <Filter size={18} />
              More Filters
            </button>

            <button className="bg-[#056db3] hover:bg-[#045ca0] text-white px-6 py-3 rounded-xl font-medium transition">
              Search
            </button>
          </div>
        </section>

        {/* Premium Workers */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800">
              Premium Workers
            </h2>

            <button className="text-[#056db3] font-medium hover:underline">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumWorkers.map(
              (worker) => (
                <div
                  key={worker.id}
                  className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex gap-4">
                    <img
                      src={worker.image}
                      alt={worker.name}
                      className="w-24 h-24 rounded-xl object-cover"
                    />

                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-bold text-lg">
                            {worker.name}
                          </h3>

                          <p className="text-gray-600">
                            {
                              worker.service
                            }
                          </p>
                        </div>

                        <span className="bg-[#056db3] text-white text-xs px-3 py-1 rounded-full h-fit">
                          Premium
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-2 text-sm">
                        <div className="flex items-center">
                          <Star
                            className="text-yellow-500 mr-1"
                            size={16}
                          />
                          {
                            worker.rating
                          }
                        </div>

                        <span className="text-gray-500">
                          (
                          {
                            worker.reviews
                          }{" "}
                          reviews)
                        </span>
                      </div>

                      <div className="flex items-center mt-2 text-gray-600 text-sm">
                        <MapPin
                          size={16}
                          className="mr-1"
                        />
                        {
                          worker.location
                        }
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div>
                          <p className="font-bold text-[#056db3]">
                            {
                              worker.price
                            }
                          </p>
                        </div>

                        <button className="bg-[#056db3] text-white px-5 py-2 rounded-xl hover:bg-[#045ca0] transition">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* All Workers */}
        <section>
          <h2 className="text-xl font-bold text-gray-800 mb-5">
            All Workers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredWorkers.map(
              (worker) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <img
                    src={worker.image}
                    alt={worker.name}
                    className="h-52 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-bold text-lg">
                          {worker.name}
                        </h3>

                        <p className="text-gray-600">
                          {
                            worker.service
                          }
                        </p>
                      </div>

                      {worker.verified && (
                        <ShieldCheck className="text-[#056db3]" />
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <Star
                        className="text-yellow-500"
                        size={16}
                      />

                      <span className="font-medium">
                        {
                          worker.rating
                        }
                      </span>

                      <span className="text-gray-500 text-sm">
                        (
                        {
                          worker.reviews
                        }
                        )
                      </span>
                    </div>

                    <div className="flex items-center mt-2 text-gray-600">
                      <MapPin
                        size={16}
                        className="mr-1"
                      />
                      {
                        worker.location
                      }
                    </div>

                    <div className="flex justify-between items-center mt-5">
                      <span className="font-bold text-[#056db3]">
                        {
                          worker.price
                        }
                      </span>

                      <button className="bg-[#056db3] text-white px-5 py-2 rounded-xl hover:bg-[#045ca0]">
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default FindServices;