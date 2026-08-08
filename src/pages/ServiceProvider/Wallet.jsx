// src/pages/ProviderWallet.jsx - Fully Fixed with Debugging & Mobile Responsive

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    ArrowUpRight,
    CreditCard,
    Phone,
    Plus,
    Edit2,
    TrendingUp,
    Calendar,
    DollarSign,
    History,
    Eye,
    EyeOff,
    RefreshCw,
    Filter,
    X,
    Loader2,
    AlertCircle,
    Trash2,
    Check,
    Wallet,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { getSidebarRole } from "../../utils/sidebarRole";
import walletService from "../../api/walletService";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const filterOptions = ["Day", "Week", "Month", "Year"];

const statusStyles = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    RELEASED: "bg-green-100 text-green-700",
    SUCCESS: "bg-green-100 text-green-700",
    PROCESSING: "bg-amber-100 text-amber-700",
};

const typeStyles = {
    payment: "bg-green-50 text-green-600",
    payout: "bg-red-50 text-red-500",
    refund: "bg-blue-50 text-[#056db3]",
    topup: "bg-purple-50 text-purple-600",
};

const paymentMethodIcons = {
    mpesa: Phone,
    visa: CreditCard,
    mastercard: CreditCard,
    bank: CreditCard,
};

const paymentMethodColors = {
    mpesa: "bg-green-100 text-green-600",
    visa: "bg-blue-100 text-blue-600",
    mastercard: "bg-purple-100 text-purple-600",
    bank: "bg-gray-100 text-gray-600",
};

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function StatCard({ icon, iconBg, label, value, sub, isLoading }) {
    return (
        <div className={`rounded-lg p-4 sm:p-5 shadow-sm flex items-start gap-4 ${iconBg}`}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white bg-opacity-50">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
                {isLoading ? (
                    <div className="mt-1 h-6 w-24 animate-pulse rounded bg-gray-200" />
                ) : (
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
                )}
                {sub && <p className="mt-1 text-xs text-gray-500 truncate">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ProviderWallet() {
    const location = useLocation();
    const sidebarRole = getSidebarRole(location.pathname);

    // ── State ──
    const [activeFilter, setActiveFilter] = useState("Month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBalanceVisible, setIsBalanceVisible] = useState(
        () => localStorage.getItem("provider-wallet-balance-visible") !== "false"
    );

    // Data states
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [user, setUser] = useState(null);
    const [showMethodModal, setShowMethodModal] = useState(false);
    const [editingMethod, setEditingMethod] = useState(null);
    const [methodFormData, setMethodFormData] = useState({
        type: "mpesa",
        label: "",
        detail: "",
        primary: false,
    });
    const [methodModalLoading, setMethodModalLoading] = useState(false);
    const [methodError, setMethodError] = useState(null);

    // ── Get user from localStorage ──
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user data", e);
            }
        }
    }, []);

    // ── Fetch wallet data ──
    useEffect(() => {
        if (!user) return;

        const fetchWalletData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 1. Fetch balance
                const balanceRes = await walletService.getWalletBalance(user.id);
                const rawBal = balanceRes?.balance ?? balanceRes?.data?.balance ?? 0;
                setBalance(typeof rawBal === "number" ? rawBal : parseFloat(rawBal) || 0);

                // 2. Fetch transactions
                const txRes = await walletService.getTransactionHistory(user.id, { 
                    filter: activeFilter.toLowerCase() 
                });
                const txList = Array.isArray(txRes)
                    ? txRes
                    : txRes?.transactions || txRes?.data?.transactions || [];
                
                setTransactions(txList);

                // 3. Fetch payment methods
                const pmRes = await walletService.getPaymentMethods(user.id);
                const pmList = Array.isArray(pmRes)
                    ? pmRes
                    : pmRes?.payment_methods || pmRes?.data?.payment_methods || [];
                setPaymentMethods(pmList);

            } catch (err) {
                console.error("Error loading wallet data:", err);
                if (err.status === 404) {
                    setTransactions([]);
                    setPaymentMethods([]);
                } else {
                    setError(err.message || "Failed to load wallet data");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [user, activeFilter]);

    // ── Resolve the displayed sign from the wallet effect ──
    const resolveTx = (tx) => {
        // Handle numeric amounts from both wallet_resource and escrow_resource schemas
        const net = tx.net_amount ?? tx.netAmount;
        const gross = tx.gross_amount ?? tx.grossAmount;
        const directAmt = tx.amount;

        let numAmount = 0;
        if (typeof directAmt === "number") {
            numAmount = directAmt;
        } else if (net !== undefined && net !== null) {
            numAmount = parseFloat(net);
        } else if (gross !== undefined && gross !== null) {
            numAmount = parseFloat(gross);
        } else if (typeof directAmt === "string") {
            numAmount = parseFloat(directAmt.replace(/[^0-9.-]+/g, "")) || 0;
        }

        const txType = (tx.type || "").toLowerCase();
        // A negative amount always removes money. Positive provider payments
        // are earnings; only explicit payout/debit types reduce this wallet.
        const isWithdrawal = ["payout", "withdrawal", "withdraw", "debit"].includes(txType) || numAmount < 0;

        // Provider receives positive value unless it's a withdrawal or negative debit
        const isIncoming = !isWithdrawal;
        const absoluteAmount = Math.abs(numAmount);
        
        const rawStatus = (tx.status || "PENDING").toUpperCase();
        const dateVal = tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date;
        const description = tx.description || (isIncoming ? "Job Earnings" : "Withdrawal Payout");

        return { absoluteAmount, isIncoming, rawStatus, dateVal, description, txType };
    };

    // ── Aggregations ──
    const totalEarned = transactions
        .map(resolveTx)
        .filter(t => t.isIncoming)
        .reduce((sum, t) => sum + t.absoluteAmount, 0);

    const totalWithdrawn = transactions
        .map(resolveTx)
        .filter(t => !t.isIncoming)
        .reduce((sum, t) => sum + t.absoluteAmount, 0);

    const hasTransactions = transactions.length > 0;

    // ── Toggle balance visibility ──
    const toggleBalanceVisibility = () => {
        setIsBalanceVisible((visible) => {
            const nextVisible = !visible;
            localStorage.setItem("provider-wallet-balance-visible", String(nextVisible));
            return nextVisible;
        });
    };

    // ── Handle filter change ──
    const handleFilterChange = (event) => {
        setActiveFilter(event.target.value);
    };

    const openAddMethodModal = () => {
        setEditingMethod(null);
        setMethodFormData({ type: "mpesa", label: "", detail: "", primary: false });
        setMethodError(null);
        setShowMethodModal(true);
    };

    const openEditMethodModal = (method) => {
        setEditingMethod(method);
        setMethodFormData({
            type: method.type,
            label: method.label,
            detail: method.detail,
            primary: Boolean(method.primary),
        });
        setMethodError(null);
        setShowMethodModal(true);
    };

    const handleSaveMethod = async () => {
        const { type, label, detail, primary } = methodFormData;
        if (!label.trim() || !detail.trim()) {
            setMethodError("Please enter a label and account details.");
            return;
        }

        setMethodModalLoading(true);
        setMethodError(null);
        try {
            const methodData = { type, label: label.trim(), detail: detail.trim(), primary };
            if (editingMethod) {
                await walletService.updatePaymentMethod(user.id, editingMethod.id, methodData);
            } else {
                await walletService.addPaymentMethod(user.id, methodData);
            }
            setPaymentMethods(await walletService.getPaymentMethods(user.id));
            setShowMethodModal(false);
            setEditingMethod(null);
        } catch (err) {
            setMethodError(err.message || "Failed to add payment method.");
        } finally {
            setMethodModalLoading(false);
        }
    };

    const handleSetPrimary = async (methodId) => {
        try {
            await walletService.setPrimaryPaymentMethod(user.id, methodId);
            setPaymentMethods(await walletService.getPaymentMethods(user.id));
        } catch (err) {
            alert(`Failed to set primary payment method: ${err.message}`);
        }
    };

    const handleDeleteMethod = async (methodId, label) => {
        if (!window.confirm(`Delete "${label}"?`)) return;
        try {
            await walletService.deletePaymentMethod(user.id, methodId);
            setPaymentMethods(await walletService.getPaymentMethods(user.id));
        } catch (err) {
            alert(`Failed to delete payment method: ${err.message}`);
        }
    };

    // ── Loading state with skeleton ──
    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role={sidebarRole} />
                <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                    <Navbar />
                    <main className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 space-y-6 max-w-7xl mx-auto">
                        <div className="animate-pulse">
                            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-64 bg-gray-200 rounded" />
                        </div>
                        <div className="h-32 bg-gray-200 rounded-xl" />
                        <div className="grid grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 bg-gray-200 rounded-lg" />
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="h-64 bg-gray-200 rounded-xl" />
                            <div className="h-64 bg-gray-200 rounded-xl" />
                        </div>
                        <div className="h-96 bg-gray-200 rounded-xl" />
                    </main>
                </div>
            </div>
        );
    }

    // ── Error state ──
    if (error) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role={sidebarRole} />
                <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                    <Navbar />
                    <main className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 max-w-7xl mx-auto">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-semibold text-red-700">Error Loading Wallet</h3>
                            <p className="mt-1 text-red-600">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role={sidebarRole} />
            <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                <Navbar />
                <main className="pt-20 md:pt-24 px-3 sm:px-6 pb-10 space-y-4 sm:space-y-6 max-w-7xl mx-auto">

                    {/* ── Page Header ── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">My Earnings</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">Track your earnings, payouts, and payment options.</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </button>
                    </div>

                    {/* ── Balance Banner ── */}
                    <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-[#056db3] to-[#0891b2] p-5 sm:p-8 text-white shadow-md">
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/5" />

                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                            <div>
                                <p className="text-xs sm:text-sm font-medium text-blue-100">Available Earnings</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <span className="inline-block text-2xl sm:text-4xl font-bold tracking-tight" aria-live="polite">
                                        {isBalanceVisible
                                            ? `KES ${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                                            : "KES ••••••"}
                                    </span>
                                    
                                    <button
                                        type="button"
                                        onClick={toggleBalanceVisibility}
                                        className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer shrink-0"
                                        aria-label={isBalanceVisible ? "Hide balance" : "Show balance"}
                                        aria-pressed={!isBalanceVisible}
                                    >
                                        {isBalanceVisible ? <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> : <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" />}
                                    </button>
                                </div>
                                <p className="mt-2 text-xs text-blue-200">
                                    {balance < 1000 ? "Minimum withdrawal amount is KES 1,000" : "Ready for withdrawal"}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={balance < 1000}
                                className={`rounded-xl px-5 py-3 text-sm font-bold shadow transition-colors w-full sm:w-auto ${
                                    balance >= 1000
                                        ? "bg-white text-[#056db3] hover:bg-blue-50 cursor-pointer"
                                        : "bg-white/20 text-white/50 cursor-not-allowed"
                                }`}
                            >
                                Withdraw Funds
                            </button>
                        </div>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        <StatCard
                            icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
                            iconBg="bg-green-50 border border-green-100"
                            label="Total Earned"
                            value={`KES ${totalEarned.toLocaleString()}`}
                            sub="Completed payouts"
                            isLoading={loading}
                        />
                        <StatCard
                            icon={<ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />}
                            iconBg="bg-red-50 border border-red-100"
                            label="Total Withdrawn"
                            value={`KES ${totalWithdrawn.toLocaleString()}`}
                            sub="Transfers to account"
                            isLoading={loading}
                        />
                        <StatCard
                            icon={<Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-[#056db3]" />}
                            iconBg="bg-blue-50 border border-blue-100"
                            label="Completed Jobs"
                            value={transactions.filter(t => resolveTx(t).isIncoming).length}
                            sub="Total recorded"
                            isLoading={loading}
                        />
                    </div>

                    {/* ── Middle Section: Payment Methods & Activity ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Payment Methods */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Payment Methods</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">Payout options for receiving earnings</p>

                            <div className="space-y-3">
                                {paymentMethods.length === 0 ? (
                                    <div className="py-6 text-center bg-gray-50 rounded-lg text-sm text-gray-500">
                                        No payment methods configured.
                                    </div>
                                ) : (
                                    paymentMethods.map((method) => {
                                        const IconComponent = paymentMethodIcons[method.type] || CreditCard;
                                        const colorClass = paymentMethodColors[method.type] || "bg-gray-100 text-gray-600";

                                        return (
                                            <div
                                                key={method.id}
                                                className={`flex items-center justify-between rounded-lg p-3 border ${
                                                    method.primary ? "border-blue-200 bg-blue-50/50" : "border-gray-100 bg-gray-50"
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${colorClass}`}>
                                                        <IconComponent className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{method.label}</p>
                                                        <p className="text-xs text-gray-500 truncate">{method.detail}</p>
                                                    </div>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    {method.primary ? (
                                                        <span className="rounded-full bg-[#056db3] px-2 py-0.5 text-xs font-semibold text-white">
                                                            Primary
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetPrimary(method.id)}
                                                            className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#056db3]"
                                                            aria-label={`Set ${method.label} as primary`}
                                                            title="Set as primary"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditMethodModal(method)}
                                                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                                                        aria-label={`Edit ${method.label}`}
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteMethod(method.id, method.label)}
                                                        className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                                                        aria-label={`Delete ${method.label}`}
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                <button
                                    type="button"
                                    onClick={openAddMethodModal}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[#056db3] py-2.5 text-sm font-bold text-[#056db3] hover:bg-blue-50 transition-colors mt-3"
                                >
                                    <Plus className="h-4 w-4" /> Add Payment Method
                                </button>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Recent Activity</h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {transactions.length}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">Latest balance activity</p>

                            {transactions.length === 0 ? (
                                <p className="py-6 text-center text-sm text-gray-500">No recent transactions found.</p>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.slice(0, 5).map((tx, idx) => {
                                        const { absoluteAmount, isIncoming, dateVal, description } = resolveTx(tx);
                                        return (
                                            <div key={tx.id || idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 gap-2">
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{description}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(dateVal)}</p>
                                                </div>
                                                <span className={`text-sm font-bold shrink-0 px-2 py-0.5 rounded ${
                                                    isIncoming ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                                                }`}>
                                                    {isIncoming ? "+" : "-"} KES {absoluteAmount.toLocaleString()}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Full Transaction History Table ── */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Transaction History</h2>
                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white">
                                    <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <select
                                        value={activeFilter}
                                        onChange={handleFilterChange}
                                        className="bg-transparent text-xs sm:text-sm font-medium text-gray-600 outline-none"
                                    >
                                        {filterOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                No transaction records available.
                            </div>
                        ) : (
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-xs sm:text-sm min-w-125">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-xs font-bold uppercase text-gray-500">
                                        <tr>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3">Type</th>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3">Description</th>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3">Date</th>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3">Status</th>
                                            <th className="px-3 sm:px-4 py-2 sm:py-3 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transactions.map((tx, idx) => {
                                            const { absoluteAmount, isIncoming, rawStatus, dateVal, description, txType } = resolveTx(tx);
                                            return (
                                                <tr key={tx.id || idx} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 capitalize font-medium text-gray-700 text-xs sm:text-sm">
                                                        <span className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize ${
                                                            typeStyles[txType] || "bg-gray-50 text-gray-500"
                                                        }`}>
                                                            {txType || "unknown"}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-800 text-xs sm:text-sm">
                                                        <div>
                                                            <p>{description}</p>
                                                            {tx.client_name && (
                                                                <p className="text-xs text-gray-400">From: {tx.client_name}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 text-gray-500 whitespace-nowrap text-xs sm:text-sm">
                                                        {formatDate(dateVal)}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                                            statusStyles[rawStatus] || "bg-gray-100 text-gray-700"
                                                        }`}>
                                                            {rawStatus}
                                                        </span>
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-2 sm:py-3 text-right font-bold whitespace-nowrap text-xs sm:text-sm ${
                                                        isIncoming ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                        {isIncoming ? "+" : "-"} KES {absoluteAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                </main>
            </div>

            {showMethodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{editingMethod ? "Edit Payment Method" : "Add Payment Method"}</h2>
                            <button type="button" onClick={() => { setShowMethodModal(false); setEditingMethod(null); }} className="rounded p-1 hover:bg-gray-100" aria-label="Close">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{editingMethod ? "Update your payout account details." : "Add an account for receiving payouts."}</p>
                        {methodError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{methodError}</p>}
                        <div className="mt-4 space-y-4">
                            <label className="block text-sm font-medium text-gray-700">Payment type
                                <select value={methodFormData.type} onChange={(event) => setMethodFormData({ ...methodFormData, type: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2">
                                    <option value="mpesa">M-Pesa</option><option value="visa">Visa Card</option><option value="mastercard">Mastercard</option><option value="bank">Bank Account</option>
                                </select>
                            </label>
                            <label className="block text-sm font-medium text-gray-700">Label
                                <input value={methodFormData.label} onChange={(event) => setMethodFormData({ ...methodFormData, label: event.target.value })} placeholder="e.g., My M-Pesa" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">Account details
                                <input value={methodFormData.detail} onChange={(event) => setMethodFormData({ ...methodFormData, detail: event.target.value })} placeholder="e.g., +2547XXXXXXXX" className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2" />
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input type="checkbox" checked={methodFormData.primary} onChange={(event) => setMethodFormData({ ...methodFormData, primary: event.target.checked })} /> Set as primary
                            </label>
                        </div>
                        <div className="mt-6 flex gap-3">
                            <button type="button" onClick={() => { setShowMethodModal(false); setEditingMethod(null); }} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700">Cancel</button>
                            <button type="button" onClick={handleSaveMethod} disabled={methodModalLoading} className="flex flex-1 items-center justify-center rounded-lg bg-[#056db3] px-4 py-2 text-white disabled:opacity-50">
                                {methodModalLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : editingMethod ? "Save Changes" : "Add Method"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProviderWallet;
