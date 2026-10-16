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
      <div className="flex overflow-x-auto px-4 sm:px-6" role="tablist" aria-label="Provider profile sections">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative
                whitespace-nowrap py-4 mr-7 text-sm sm:mr-9 sm:text-base
                font-semibold
                transition-all
                ${
                  active ? "text-[#056db3]" : "text-gray-500 hover:text-[#056db3]"
                }
              `}
            >
              {tab.label}

              {active && (
                <span className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-[#056db3]"></span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderTabs;
