import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronRight,
  Download,
  Eye,
  Mail,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import adminSubscriptionsService from "../../services/adminSubscriptionsService";

const statusStyles = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-gray-100 text-gray-600",
};

const dateFormatter = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value) {
  if (!value) return "-";
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? "-" : dateFormatter.format(date);
}

function getInitials(provider) {
  return provider.provider.split(" ").map((part) => part[0]).join("").toUpperCase();
}

function normalizeSubscription(item) {
  const providerName = `${item.first_name || ""} ${item.last_name || ""}`.trim();
  const commissionRate = Number(item.commission_rate) || 0;

  return {
    ...item,
    id: item.provider_id,
    providerId: item.provider_id,
    provider: providerName || "Unnamed provider",
    email: item.email || "-",
    startDate: item.start_date,
    endDate: item.end_date,
    status: item.is_active ? "Active" : "Inactive",
    plan: item.plan || "free",
    commissionRate: commissionRate <= 1 ? commissionRate * 100 : commissionRate,
    pricePaid: Number(item.price_paid) || 0,
  };
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, detail, tone = "blue" }) {
  const tones = {
    blue: "bg-blue-50 text-[#056db3]",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>
        <ShieldCheck size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-2 text-xs text-gray-400">{detail}</p>
    </div>
  );
}

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, premium: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [notice, setNotice] = useState("");

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await adminSubscriptionsService.list({
        plan: planFilter,
        status: statusFilter,
        search: search.trim(),
      });
      const items = response.subscriptions || [];
      setSubscriptions(items.map(normalizeSubscription));
      setSummary({
        total: Number(response.total) || 0,
        active: Number(response.active) || 0,
        premium: Number(response.premium) || 0,
      });
    } catch (loadError) {
      setError(loadError.message || "Failed to load subscriptions from the backend.");
    } finally {
      setLoading(false);
    }
  }, [planFilter, search, statusFilter]);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const filteredSubscriptions = useMemo(() => subscriptions.filter((subscription) => {
    const matchesStart = !startDate || subscription.startDate >= startDate;
    const matchesEnd = !endDate || (subscription.startDate && subscription.startDate <= endDate);
    return matchesStart && matchesEnd;
  }), [subscriptions, startDate, endDate]);

  const stats = useMemo(() => ({
    active: summary.active,
    premium: summary.premium,
    total: summary.total,
  }), [summary]);

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  };

  const updateSubscription = async (subscription, isActive) => {
    try {
      await adminSubscriptionsService.updateStatus(subscription.providerId, isActive);
      await loadSubscriptions();
      showNotice(`${subscription.provider} subscription ${isActive ? "activated" : "deactivated"}.`);
    } catch (actionError) {
      setError(actionError.message || "Subscription update failed.");
    }
  };

  const exportCsv = () => {
    const headers = ["Provider", "Email", "Plan", "Start date", "End date", "Status", "Commission rate", "Price paid"];
    const rows = filteredSubscriptions.map((item) => [
      item.provider, item.email, item.plan, item.startDate, item.endDate, item.status,
      `${item.commissionRate}%`, item.pricePaid,
    ]);
    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "sasafix-subscriptions.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-layout-shell min-h-screen bg-[#f8fafc]">
      <Sidebar role="admin" />
      <div className="ml-0 min-w-0 lg:ml-72">
        <Navbar />
        <main className="px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          {notice && (
            <div className="fixed left-4 right-4 top-24 z-50 rounded-lg bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg sm:left-auto sm:right-6">
              {notice}
            </div>
          )}

          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#056db3]">Management</p>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Premium subscriptions</h1>
              <p className="mt-2 text-sm text-gray-500">Monitor billing, commission benefits, and provider access.</p>
            </div>
            <button onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#056db3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#04599a]">
              <Download size={17} /> Export CSV
            </button>
          </div>

          {error && (
            <div className="mb-5 flex items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <span>{error}</span>
              <button onClick={loadSubscriptions} className="font-semibold underline">Retry</button>
            </div>
          )}

          <section className="mb-7 grid gap-4 sm:grid-cols-3">
            <StatCard label="Active subscriptions" value={stats.active} detail="Includes providers without a subscription record" tone="green" />
            <StatCard label="Premium plans" value={stats.premium} detail="Providers on the premium plan" tone="amber" />
            <StatCard label="Service providers" value={stats.total} detail="Matching the selected filters" />
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative min-w-0 flex-1 xl:max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or category" className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm outline-none focus:border-[#056db3] focus:ring-2 focus:ring-blue-100" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[{ value: "all", label: "All status" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }].map((status) => (
                    <button key={status.value} onClick={() => setStatusFilter(status.value)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${statusFilter === status.value ? "bg-[#056db3] text-white" : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#056db3]"}`}>
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Plan</span>
                {[{ value: "all", label: "All plans" }, { value: "free", label: "Free" }, { value: "premium", label: "Premium" }].map((plan) => (
                  <button key={plan.value} onClick={() => setPlanFilter(plan.value)} className={`rounded-lg px-3 py-2 text-sm font-medium transition ${planFilter === plan.value ? "bg-[#056db3] text-white" : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-[#056db3]"}`}>
                    {plan.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Start date</span>
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600" />
                <span className="hidden text-sm text-gray-400 sm:block">to</span>
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600" />
                {(search || startDate || endDate || statusFilter !== "all" || planFilter !== "all") && <button onClick={() => { setSearch(""); setStartDate(""); setEndDate(""); setStatusFilter("all"); setPlanFilter("all"); }} className="text-left text-sm font-semibold text-[#056db3]">Clear filters</button>}
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-sm text-gray-500">Loading subscriptions...</div>
            ) : <div className="overflow-x-auto">
              <table className="w-full min-w-230 text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Provider</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Plan & dates</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Commission</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscriptions.map((subscription) => (
                      <tr key={subscription.id} className="align-middle transition-colors hover:bg-gray-50">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-[#056db3]">{getInitials(subscription)}</div><div><p className="font-semibold text-gray-800">{subscription.provider}</p><p className="text-xs text-gray-400">Provider #{subscription.providerId}</p></div></div></td>
                        <td className="px-5 py-4 text-sm text-gray-600">{subscription.email}</td>
                        <td className="px-5 py-4 text-sm"><p className="font-medium capitalize text-gray-700">{subscription.plan}</p><p className="mt-1 text-xs text-gray-400">{formatDate(subscription.startDate)} – {formatDate(subscription.endDate)}</p></td>
                        <td className="px-5 py-4"><StatusBadge status={subscription.status} /></td>
                        <td className="px-5 py-4"><span className="font-semibold text-gray-700">{subscription.commissionRate}%</span></td>
                        <td className="px-5 py-4"><div className="flex items-center justify-end gap-2"><button title="View subscription details" onClick={() => setSelectedProvider(subscription)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:border-blue-200 hover:text-[#056db3]"><Eye size={16} /></button><button onClick={() => updateSubscription(subscription, subscription.status !== "Active")} className={`rounded-lg px-3 py-2 text-xs font-semibold ${subscription.status === "Active" ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}>{subscription.status === "Active" ? "Deactivate" : "Activate"}</button></div></td>
                      </tr>
                  ))}
                </tbody>
              </table>
              {!filteredSubscriptions.length && <div className="p-12 text-center text-sm text-gray-500">No subscriptions match these filters.</div>}
            </div>}
            <div className="border-t border-gray-100 px-5 py-4 text-sm text-gray-400">Showing {filteredSubscriptions.length} of {stats.total} providers</div>
          </section>
        </main>
      </div>

      {selectedProvider && (
        <div className="fixed inset-0 z-40 bg-gray-900/30" onClick={() => setSelectedProvider(null)}>
          <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Subscription details</h2>
              <button onClick={() => setSelectedProvider(null)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Close details">
                <X size={20} />
              </button>
            </div>
            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-[#056db3]">
                {getInitials(selectedProvider)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedProvider.provider}</h3>
                <StatusBadge status={selectedProvider.status} />
              </div>
            </div>
            <div className="space-y-4 border-y border-gray-100 py-5 text-sm">
              <div className="flex items-center gap-3 text-gray-600"><Mail size={17} /> {selectedProvider.email}</div>
              <div className="flex items-center gap-3 text-gray-600"><CalendarDays size={17} /> Started {formatDate(selectedProvider.startDate)}</div>
              <div className="flex items-center justify-between text-gray-600"><span>Plan</span><span className="font-semibold capitalize text-gray-800">{selectedProvider.plan}</span></div>
              <div className="flex items-center justify-between text-gray-600"><span>Commission rate</span><span className="font-semibold text-gray-800">{selectedProvider.commissionRate}%</span></div>
              <div className="flex items-center justify-between text-gray-600"><span>Price paid</span><span className="font-semibold text-gray-800">KES {selectedProvider.pricePaid.toLocaleString()}</span></div>
              <div className="flex items-center justify-between text-gray-600"><span>End date</span><span className="font-semibold text-gray-800">{formatDate(selectedProvider.endDate)}</span></div>
            </div>
            <button onClick={() => setSelectedProvider(null)} className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">
              Close details <ChevronRight size={16} />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}
