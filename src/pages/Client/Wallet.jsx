import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
    ArrowDownLeft,
    ArrowUpRight,
    CreditCard,
    Download,
    Filter,
    Phone,
    Plus,
    Wallet as WalletIcon,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { getSidebarRole } from "../../utils/sidebarRole";

// ─────────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────────

const paymentMethods = [
    {
        id: 1,
        type: "mpesa",
        label: "M-Pesa",
        detail: "+254 712 345 678",
        primary: true,
    },
    {
        id: 2,
        type: "visa",
        label: "Visa Card",
        detail: "**** **** **** 4242",
        primary: false,
    },
];

const transactions = [
    {
        id: 1,
        type: "payment",
        description: "Plumbing Repair — Michael Ochieng",
        date: "Jun 15, 2026",
        status: "completed",
        amount: -3000,
    },
    {
        id: 2,
        type: "topup",
        description: "Wallet Top Up via M-Pesa",
        date: "Jun 14, 2026",
        status: "completed",
        amount: 5000,
    },
    {
        id: 3,
        type: "payment",
        description: "House Cleaning — Sarah Wanjiru",
        date: "Jun 12, 2026",
        status: "completed",
        amount: -4500,
    },
    {
        id: 4,
        type: "refund",
        description: "Refund — Cancelled Booking",
        date: "Jun 10, 2026",
        status: "completed",
        amount: 2000,
    },
    {
        id: 5,
        type: "topup",
        description: "Wallet Top Up via M-Pesa",
        date: "Jun 08, 2026",
        status: "completed",
        amount: 8000,
    },
    {
        id: 6,
        type: "payment",
        description: "Electrical Repair — David Kariuki",
        date: "Jun 05, 2026",
        status: "pending",
        amount: -5000,
    },
];

const filterOptions = ["Day", "Week", "Month", "Year"];

const statusStyles = {
    completed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    failed: "bg-red-100 text-red-700",
};

const typeStyles = {
    payment: "bg-red-50 text-red-500",
    topup: "bg-green-50 text-green-600",
    refund: "bg-blue-50 text-[#056db3]",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatAmount(amount) {
    const abs = Math.abs(amount).toLocaleString();
    return amount < 0 ? `- KES ${abs}` : `+ KES ${abs}`;
}

function StatCard({ icon, iconBg, label, value, sub }) {
    return (
        <div className={`rounded-lg p-5 shadow-sm flex items-start gap-4 ${iconBg}`}>
            <div className="flex h-11 w-11 items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-bold text-gray-800">{value}</p>
                {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function Wallet() {
    const location = useLocation();
    const sidebarRole = getSidebarRole(location.pathname);
    const [activeFilter, setActiveFilter] = useState("Month");

    const totalSpent = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalAdded = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const handleExport = () => {
        const csv = [
            ["Type", "Description", "Date", "Status", "Amount"],
            ...transactions.map((t) => [
                t.type,
                t.description,
                t.date,
                t.status,
                t.amount,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transactions.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role={sidebarRole} />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-10 space-y-8">

                    {/* ── Page Header ── */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Wallet</h1>
                        <p className="mt-1 text-gray-500">
                            Manage your payments and transactions.
                        </p>
                    </div>

                    {/* ── Balance Card ── */}
                    <div className="relative overflow-hidden rounded-lg bg-[#056db3] p-8 text-white shadow-md">
                        {/* Background decoration */}
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/5" />

                        <div className="relative flex items-center justify-between gap-6">
                            {/* Left — balance */}
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Available Balance
                                </p>
                                <p className="mt-2 text-5xl font-bold tracking-tight">
                                    KES 4,200
                                </p>
                                <p className="mt-2 text-sm text-blue-200">
                                    Last updated today
                                </p>

                                <div className="mt-6 flex gap-3">
                                    <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#056db3] shadow transition-colors hover:bg-blue-50">
                                        Add Money
                                    </button>
                                    <button className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
                                        Withdraw
                                    </button>
                                </div>
                            </div>

                            {/* Right — icon */}
                            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:flex">
                                <WalletIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* ── Payment Methods ── */}
                        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Payment Methods
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <div
                                        key={method.id}
                                        className={`flex min-h-24 items-center justify-between rounded-sm border px-6 py-6 transition-colors ${
                                            method.primary
                                                ? "border-gray-300 bg-blue-50"
                                                : "border-gray-200 bg-white"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                                    method.type === "mpesa"
                                                        ? "bg-green-100"
                                                        : "bg-gray-100"
                                                }`}
                                            >
                                                {method.type === "mpesa" ? (
                                                    <Phone className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <CreditCard className="h-6 w-6 text-gray-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-base font-semibold text-gray-800">
                                                    {method.label}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {method.detail}
                                                </p>
                                            </div>
                                        </div>
                                        {method.primary && (
                                            <span className="rounded-full bg-[#056db3] px-3 py-1 text-xs font-semibold text-white">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}
                                <button className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#056db3] px-3 py-3 text-md font-bold text-[#056db3] transition-colors hover:bg-blue-100 hover:text-[#056db3]">
                                    <Plus className="h-4 w-4" />
                                    Add Payment Method
                                </button>
                            </div>
                        </div>

                        {/* ── Transaction Summary ── */}
                        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Transaction Summary
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <StatCard
                                    icon={<ArrowUpRight className="h-6 w-6 text-red-500" />}
                                    iconBg="bg-red-50"
                                    label="Total Spent"
                                    value={`KES ${totalSpent.toLocaleString()}`}
                                    sub="This month"
                                />
                                <StatCard
                                    icon={<ArrowDownLeft className="h-6 w-6 text-green-600" />}
                                    iconBg="bg-green-50"
                                    label="Total Added"
                                    value={`KES ${totalAdded.toLocaleString()}`}
                                    sub="This month"
                                />
                                <StatCard
                                    icon={<WalletIcon className="h-6 w-6 text-[#056db3]" />}
                                    iconBg="bg-blue-50"
                                    label="Transactions"
                                    value={transactions.length}
                                    sub="This month"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ── Transactions Table ── */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                            <h2 className="text-lg font-bold text-gray-800">
                                Transaction History
                            </h2>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600">
                                    <Filter className="h-4 w-4" />
                                    <select
                                        value={activeFilter}
                                        onChange={(event) => setActiveFilter(event.target.value)}
                                        className="bg-transparent text-sm font-medium text-gray-600 outline-none"
                                    >
                                        {filterOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full table-auto">
                                <thead className="border-b border-gray-100 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Type
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Description
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Amount
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {transactions.map((tx) => (
                                        <tr
                                            key={tx.id}
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold capitalize ${typeStyles[tx.type]}`}
                                                >
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-700">
                                                {tx.description}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">
                                                {tx.date}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[tx.status]}`}
                                                >
                                                    {tx.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <span
                                                    className={`text-sm font-bold ${
                                                        tx.amount < 0
                                                            ? "text-red-500"
                                                            : "text-green-600"
                                                    }`}
                                                >
                                                    {formatAmount(tx.amount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {transactions.length === 0 && (
                            <div className="py-10 text-center text-sm text-gray-500">
                                No transactions found.
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Wallet;
