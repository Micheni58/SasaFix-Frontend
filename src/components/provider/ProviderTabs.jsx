// src/components/provider/ProviderTabs.jsx

const tabs = [
  {
    id: "overview",
    label: "Overview",
  },
  {
    id: "services",
    label: "Services",
  },
  {
    id: "reviews",
    label: "Reviews",
  },
  {
    id: "availability",
    label: "Availability",
  },
];

const ProviderTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="mt-8 rounded-t-xl border border-gray-200 border-b-0 bg-white">
      <div className="flex overflow-x-auto px-4 sm:px-6">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative
                whitespace-nowrap py-4 mr-7 text-sm sm:mr-9 sm:text-base
                font-semibold
                transition-all
                ${
                  active ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                }
              `}
            >
              {tab.label}

              {active && (
                <span className="absolute left-0 bottom-0 h-1 w-full rounded-full bg-blue-600"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderTabs;
