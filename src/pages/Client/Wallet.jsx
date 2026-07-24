// src/pages/ClientWallet.jsx - Fully Updated with Skeleton Loaders

import { useState, useEffect } from "react";
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
    Loader2,
    AlertCircle,
    X,
    Trash2,
    Check,
    Edit2,
    ShoppingBag,
    History,
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
    RELEASED: "bg-blue-100 text-blue-700",
};

const typeStyles = {
    payment: "bg-red-50 text-red-500",
    payout: "bg-purple-50 text-purple-600",
    refund: "bg-blue-50 text-[#056db3]",
    topup: "bg-green-50 text-green-600",
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

function formatAmount(amount) {
    const abs = Math.abs(amount).toLocaleString();
    return amount < 0 ? `- KES ${abs}` : `+ KES ${abs}`;
}

function formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

// ─────────────────────────────────────────────
// SKELETON COMPONENTS
// ─────────────────────────────────────────────

function SkeletonStatCard() {
    return (
        <div className="rounded-lg p-5 shadow-sm flex items-start gap-4 bg-gray-50">
            <div className="flex h-11 w-11 items-center justify-center bg-gray-200 animate-pulse rounded-lg" />
            <div className="flex-1">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2" />
                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                <div className="mt-1 h-3 w-16 bg-gray-200 animate-pulse rounded" />
            </div>
        </div>
    );
}

function SkeletonTransactionRow() {
    return (
        <tr className="border-b border-gray-100">
            <td className="px-6 py-4">
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded" />
            </td>
            <td className="px-4 py-4">
                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            </td>
            <td className="px-4 py-4">
                <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
            </td>
            <td className="px-4 py-4">
                <div className="h-6 w-20 bg-gray-200 animate-pulse rounded-full" />
            </td>
            <td className="px-4 py-4 text-right">
                <div className="h-4 w-20 bg-gray-200 animate-pulse rounded ml-auto" />
            </td>
        </tr>
    );
}

function SkeletonPaymentMethod() {
    return (
        <div className="flex min-h-20 items-center justify-between rounded-sm border border-gray-200 px-4 py-4">
            <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-xl" />
                <div>
                    <div className="h-5 w-32 bg-gray-200 animate-pulse rounded mb-1" />
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                </div>
            </div>
            <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────

function StatCard({ icon, iconBg, label, value, sub, isLoading }) {
    return (
        <div className={`rounded-lg p-5 shadow-sm flex items-start gap-4 ${iconBg}`}>
            <div className="flex h-11 w-11 items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                {isLoading ? (
                    <div className="mt-1 h-6 w-24 animate-pulse rounded bg-gray-200" />
                ) : (
                    <p className="mt-1 text-xl font-bold text-gray-800">{value}</p>
                )}
                {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ClientWallet() {
    const location = useLocation();
    const sidebarRole = getSidebarRole(location.pathname);

    // ── State ──
    const [activeFilter, setActiveFilter] = useState("Month");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [user, setUser] = useState(null);

    // Payment states
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        phone_number: "",
        amount: "",
    });
    const [paymentError, setPaymentError] = useState(null);

    // Payment Method Modal States
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
                const balanceData = await walletService.getWalletBalance(user.id);
                setBalance(balanceData.balance || 0);

                const txData = await walletService.getTransactionHistory(user.id, {
                    filter: activeFilter.toLowerCase(),
                });
                setTransactions(txData.transactions || []);

                const methods = await walletService.getPaymentMethods(user.id);
                setPaymentMethods(methods || []);

            } catch (err) {
                if (err.status === 404) {
                    setTransactions([]);
                    setPaymentMethods([]);
                } else {
                    setError(err.message || "Failed to load wallet data");
                }
                console.error("Wallet error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWalletData();
    }, [user, activeFilter]);

    // ── Handle filter change ──
    const handleFilterChange = (event) => {
        setActiveFilter(event.target.value);
    };

    // ── Handle Add Money ──
    const handleAddMoney = async () => {
        const phone = paymentData.phone_number.trim();
        const amount = parseFloat(paymentData.amount);

        if (!phone) {
            setPaymentError("Please enter your M-Pesa phone number");
            return;
        }

        if (!amount || amount <= 0) {
            setPaymentError("Please enter a valid amount (minimum KES 1)");
            return;
        }

        setPaymentLoading(true);
        setPaymentError(null);

        try {
            const result = await walletService.initiateSTKPush({
                phone_number: phone,
                amount: amount,
                booking_id: 1,
                client_id: user.id,
                provider_id: 1,
                commission_rate: 10,
            });

            alert(
                `✅ STK Push sent successfully!\n\n` +
                `Amount: KES ${amount.toLocaleString()}\n` +
                `Phone: ${phone}\n\n` +
                `Please check your phone and enter your M-Pesa PIN to complete the payment.`
            );

            setShowPaymentModal(false);
            setPaymentData({ phone_number: "", amount: "" });
            setPaymentError(null);

            const balanceData = await walletService.getWalletBalance(user.id);
            setBalance(balanceData.balance || 0);

            const txData = await walletService.getTransactionHistory(user.id, {
                filter: activeFilter.toLowerCase(),
            });
            setTransactions(txData.transactions || []);

        } catch (err) {
            setPaymentError(err.message || "Payment failed. Please try again.");
            console.error("Payment error:", err);
        } finally {
            setPaymentLoading(false);
        }
    };

    // ── Handle Withdraw ──
    const handleWithdraw = () => {
        alert("💳 Withdrawal feature coming soon!\n\nMinimum withdrawal: KES 1,000");
    };

    // ── Handle Export CSV ──
    const handleExport = () => {
        if (transactions.length === 0) {
            alert("No transactions to export");
            return;
        }

        const csv = [
            ["Type", "Description", "Date", "Status", "Amount"],
            ...transactions.map((t) => [
                t.type || "",
                t.description || "",
                t.date || "",
                t.status || "",
                t.amount || 0,
            ]),
        ]
            .map((row) => row.join(","))
            .join("\n");

        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // ── Payment Method Handlers ──
    const openAddMethodModal = () => {
        setEditingMethod(null);
        setMethodFormData({
            type: "mpesa",
            label: "",
            detail: "",
            primary: false,
        });
        setMethodError(null);
        setShowMethodModal(true);
    };

    const openEditMethodModal = (method) => {
        setEditingMethod(method);
        setMethodFormData({
            type: method.type,
            label: method.label,
            detail: method.detail,
            primary: method.primary,
        });
        setMethodError(null);
        setShowMethodModal(true);
    };

    const handleSaveMethod = async () => {
        const { type, label, detail, primary } = methodFormData;

        if (!label) {
            setMethodError("Please enter a label");
            return;
        }
        if (!detail) {
            setMethodError("Please enter the account details");
            return;
        }

        setMethodModalLoading(true);
        setMethodError(null);

        try {
            if (editingMethod) {
                alert("Update functionality coming soon!");
            } else {
                await walletService.addPaymentMethod(user.id, {
                    type,
                    label,
                    detail,
                    primary,
                });
            }

            const methods = await walletService.getPaymentMethods(user.id);
            setPaymentMethods(methods || []);

            setShowMethodModal(false);
            setMethodFormData({ type: "mpesa", label: "", detail: "", primary: false });
            setEditingMethod(null);

        } catch (err) {
            setMethodError(err.message || "Failed to save payment method");
        } finally {
            setMethodModalLoading(false);
        }
    };

    const handleSetPrimary = async (methodId) => {
        try {
            await walletService.setPrimaryPaymentMethod(user.id, methodId);
            const methods = await walletService.getPaymentMethods(user.id);
            setPaymentMethods(methods || []);
        } catch (err) {
            alert("Failed to set primary method: " + err.message);
        }
    };

    const handleDeleteMethod = async (methodId, methodLabel) => {
        if (!confirm(`Are you sure you want to delete "${methodLabel}"?`)) return;

        try {
            await walletService.deletePaymentMethod(user.id, methodId);
            const methods = await walletService.getPaymentMethods(user.id);
            setPaymentMethods(methods || []);
        } catch (err) {
            alert("Failed to delete payment method: " + err.message);
        }
    };

    // ── Calculate totals ──
    const totalSpent = transactions
        .filter((t) => t.amount < 0 || t.type === "payment")
        .reduce((sum, t) => sum + Math.abs(t.amount || t.grossAmount || 0), 0);

    const totalAdded = transactions
        .filter((t) => t.amount > 0 || t.type === "topup" || t.type === "refund")
        .reduce((sum, t) => sum + (t.amount || t.grossAmount || 0), 0);

    const hasTransactions = transactions.length > 0;
    const hasPaymentMethods = paymentMethods.length > 0;

    // ── Loading state ──
    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role={sidebarRole} />
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-10 space-y-8">
                        {/* Page Header Skeleton */}
                        <div>
                            <div className="h-9 w-48 bg-gray-200 animate-pulse rounded" />
                            <div className="mt-1 h-5 w-64 bg-gray-200 animate-pulse rounded" />
                        </div>

                        {/* Balance Card Skeleton */}
                        <div className="relative overflow-hidden rounded-lg bg-[#056db3] p-8 text-white shadow-md">
                            <div className="relative">
                                <div className="h-5 w-32 bg-white/20 animate-pulse rounded" />
                                <div className="mt-2 h-12 w-48 bg-white/20 animate-pulse rounded" />
                                <div className="mt-2 h-5 w-40 bg-white/20 animate-pulse rounded" />
                                <div className="mt-6 flex gap-3">
                                    <div className="h-11 w-28 bg-white/20 animate-pulse rounded-xl" />
                                    <div className="h-11 w-28 bg-white/20 animate-pulse rounded-xl" />
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid Skeleton */}
                        <div className="grid grid-cols-3 gap-6">
                            {[...Array(3)].map((_, i) => (
                                <SkeletonStatCard key={i} />
                            ))}
                        </div>

                        {/* Payment Methods & Quick Stats Skeleton */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mb-5">
                                    <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
                                    <div className="mt-1 h-4 w-48 bg-gray-200 animate-pulse rounded" />
                                </div>
                                <div className="space-y-3">
                                    {[...Array(2)].map((_, i) => (
                                        <SkeletonPaymentMethod key={i} />
                                    ))}
                                    <div className="h-12 w-full bg-gray-200 animate-pulse rounded-lg" />
                                </div>
                            </div>
                            <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                                <div className="mb-5">
                                    <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
                                    <div className="mt-1 h-4 w-48 bg-gray-200 animate-pulse rounded" />
                                </div>
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                            <div className="h-6 w-6 bg-gray-200 animate-pulse rounded-full" />
                                            <div className="flex-1">
                                                <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                                                <div className="mt-1 h-3 w-48 bg-gray-200 animate-pulse rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Transactions Table Skeleton */}
                        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
                                    <div className="h-5 w-8 bg-gray-200 animate-pulse rounded-full" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-xl" />
                                    <div className="h-10 w-28 bg-gray-200 animate-pulse rounded-xl" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full table-auto">
                                    <thead className="border-b border-gray-100 bg-gray-50">
                                        <tr>
                                            {[...Array(5)].map((_, i) => (
                                                <th key={i} className="px-6 py-3.5">
                                                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...Array(5)].map((_, i) => (
                                            <SkeletonTransactionRow key={i} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
                <div className="flex-1 ml-72">
                    <Navbar />
                    <main className="pt-24 px-6 pb-10">
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

    // ── Main view (rest of the component remains the same) ──
    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role={sidebarRole} />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="pt-24 px-6 pb-10 space-y-8">

                    {/* ── Page Header ── */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">My Wallet</h1>
                        <p className="mt-1 text-gray-500">
                            Manage your payments, transactions, and payment methods.
                        </p>
                    </div>

                    {/* ── Balance Card ── */}
                    <div className="relative overflow-hidden rounded-lg bg-[#056db3] p-8 text-white shadow-md">
                        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
                        <div className="absolute -right-4 bottom-0 h-24 w-24 rounded-full bg-white/5" />

                        <div className="relative flex items-center justify-between gap-6">
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Available Balance
                                </p>
                                <p className="mt-2 text-5xl font-bold tracking-tight">
                                    KES {balance.toLocaleString()}
                                </p>
                                <p className="mt-2 text-sm text-blue-200">
                                    {balance === 0 ? "Add money to start booking services" : "Ready to book your next service"}
                                </p>

                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPaymentModal(true);
                                            setPaymentError(null);
                                        }}
                                        className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#056db3] shadow transition-colors hover:bg-blue-50"
                                    >
                                        Add Money
                                    </button>
                                    <button
                                        onClick={handleWithdraw}
                                        className="rounded-xl border-2 border-white/40 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
                                    >
                                        Withdraw
                                    </button>
                                </div>
                            </div>

                            <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:flex">
                                <WalletIcon className="h-8 w-8 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* ── Stats Grid ── */}
                    <div className="grid grid-cols-3 gap-6">
                        <StatCard
                            icon={<ArrowUpRight className="h-6 w-6 text-red-500" />}
                            iconBg="bg-red-50"
                            label="Total Spent"
                            value={`KES ${totalSpent.toLocaleString()}`}
                            sub={hasTransactions ? "All time" : "No spending yet"}
                            isLoading={loading}
                        />
                        <StatCard
                            icon={<ArrowDownLeft className="h-6 w-6 text-green-600" />}
                            iconBg="bg-green-50"
                            label="Total Added"
                            value={`KES ${totalAdded.toLocaleString()}`}
                            sub={hasTransactions ? "All time" : "No deposits yet"}
                            isLoading={loading}
                        />
                        <StatCard
                            icon={<ShoppingBag className="h-6 w-6 text-[#056db3]" />}
                            iconBg="bg-blue-50"
                            label="Transactions"
                            value={transactions.length}
                            sub={hasTransactions ? "All time" : "No transactions yet"}
                            isLoading={loading}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* ── Payment Methods ── */}
                        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Payment Methods
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Manage how you pay for services
                                </p>
                            </div>

                            <div className="space-y-3">
                                {!hasPaymentMethods ? (
                                    <div className="py-8 text-center">
                                        <p className="text-sm text-gray-500">
                                            No payment methods added yet.
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Add M-Pesa or card for faster payments.
                                        </p>
                                    </div>
                                ) : (
                                    paymentMethods.map((method) => {
                                        const IconComponent = paymentMethodIcons[method.type] || CreditCard;
                                        const colorClass = paymentMethodColors[method.type] || "bg-gray-100 text-gray-600";
                                        
                                        return (
                                            <div
                                                key={method.id}
                                                className={`flex min-h-20 items-center justify-between rounded-sm border px-4 py-4 transition-colors ${
                                                    method.primary
                                                        ? "border-[#056db3] bg-blue-50"
                                                        : "border-gray-200 bg-white hover:border-gray-300"
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div
                                                        className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}
                                                    >
                                                        <IconComponent className="h-5 w-5" />
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
                                                <div className="flex items-center gap-2">
                                                    {method.primary && (
                                                        <span className="rounded-full bg-[#056db3] px-2.5 py-0.5 text-xs font-semibold text-white">
                                                            Primary
                                                        </span>
                                                    )}
                                                    <button
                                                        onClick={() => openEditMethodModal(method)}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    {!method.primary && (
                                                        <button
                                                            onClick={() => handleSetPrimary(method.id)}
                                                            className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-[#056db3] transition-colors"
                                                            title="Set as primary"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteMethod(method.id, method.label)}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
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
                                    onClick={openAddMethodModal}
                                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#056db3] px-3 py-3 text-md font-bold text-[#056db3] transition-colors hover:bg-blue-100 hover:text-[#056db3]"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Payment Method
                                </button>
                            </div>
                        </div>

                        {/* ── Quick Stats ── */}
                        <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="mb-5">
                                <h2 className="text-lg font-bold text-gray-800">
                                    {hasTransactions ? "Recent Activity" : "Getting Started"}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {hasTransactions ? "Your latest transactions" : "Tips to get started"}
                                </p>
                            </div>

                            {!hasTransactions ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                                        <div className="mt-1 rounded-full bg-[#056db3] p-1.5">
                                            <ShoppingBag className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Book a Service</p>
                                            <p className="text-xs text-gray-500">Find a provider and book your first service</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                                        <div className="mt-1 rounded-full bg-green-600 p-1.5">
                                            <ArrowDownLeft className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Add Money</p>
                                            <p className="text-xs text-gray-500">Fund your wallet to pay for services</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
                                        <div className="mt-1 rounded-full bg-purple-600 p-1.5">
                                            <Check className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Pay & Review</p>
                                            <p className="text-xs text-gray-500">Complete bookings and leave reviews</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.slice(0, 5).map((tx) => (
                                        <div key={tx.id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{tx.description}</p>
                                                <p className="text-xs text-gray-400">{tx.date}</p>
                                            </div>
                                            <span className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                                                {formatAmount(tx.amount)}
                                            </span>
                                        </div>
                                    ))}
                                    {transactions.length > 5 && (
                                        <p className="text-xs text-center text-gray-400 mt-2">
                                            + {transactions.length - 5} more transactions
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Transactions Table ── */}
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-gray-800">
                                    Transaction History
                                </h2>
                                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                                    {transactions.length}
                                </span>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600">
                                    <Filter className="h-4 w-4" />
                                    <select
                                        value={activeFilter}
                                        onChange={handleFilterChange}
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
                                    disabled={!hasTransactions}
                                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                                        hasTransactions
                                            ? "border-gray-200 text-gray-600 hover:bg-gray-50"
                                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                                    }`}
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {!hasTransactions ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                                <div className="rounded-full bg-gray-100 p-6 mb-6">
                                    <History className="h-16 w-16 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">No Transactions Yet</h3>
                                <p className="text-gray-500 max-w-md">
                                    You haven't made any transactions yet. Add money to your wallet or book a service to get started.
                                </p>
                            </div>
                        ) : (
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
                                                        className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold capitalize ${typeStyles[tx.type] || "bg-gray-50 text-gray-500"}`}
                                                    >
                                                        {tx.type || "unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {tx.description || "Transaction"}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-500">
                                                    {tx.date || formatDate(tx.createdAt || tx.paidAt)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[tx.status] || "bg-gray-50 text-gray-500"}`}
                                                    >
                                                        {tx.status || "unknown"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    <span
                                                        className={`text-sm font-bold ${
                                                            tx.amount < 0 || tx.type === "payment"
                                                                ? "text-red-500"
                                                                : "text-green-600"
                                                        }`}
                                                    >
                                                        {formatAmount(tx.amount || tx.grossAmount || 0)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* ── Add Money Modal ── */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">Add Money</h2>
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentError(null);
                                    setPaymentData({ phone_number: "", amount: "" });
                                }}
                                className="rounded-lg p-1 hover:bg-gray-100"
                            >
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            Enter your M-Pesa number and amount to top up your wallet.
                        </p>

                        {paymentError && (
                            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                <AlertCircle className="inline h-4 w-4 mr-1" />
                                {paymentError}
                            </div>
                        )}

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    M-Pesa Phone Number
                                </label>
                                <input
                                    type="tel"
                                    value={paymentData.phone_number}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            phone_number: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., 2547XXXXXXXX"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Format: 2547XXXXXXXX (without +)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Amount (KES)
                                </label>
                                <input
                                    type="number"
                                    value={paymentData.amount}
                                    onChange={(e) =>
                                        setPaymentData({
                                            ...paymentData,
                                            amount: e.target.value,
                                        })
                                    }
                                    placeholder="Enter amount"
                                    min="1"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                />
                                <p className="mt-1 text-xs text-gray-400">
                                    Minimum amount: KES 1
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setPaymentError(null);
                                    setPaymentData({ phone_number: "", amount: "" });
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMoney}
                                disabled={paymentLoading}
                                className="flex-1 rounded-lg bg-[#056db3] px-4 py-2 text-white hover:bg-[#045a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {paymentLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    "Add Money"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add/Edit Payment Method Modal ── */}
            {showMethodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowMethodModal(false);
                                    setMethodError(null);
                                    setEditingMethod(null);
                                }}
                                className="rounded-lg p-1 hover:bg-gray-100"
                            >
                                <X className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                            {editingMethod 
                                ? "Update your payment method details." 
                                : "Add a new payment method to your wallet."}
                        </p>

                        {methodError && (
                            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200">
                                <AlertCircle className="inline h-4 w-4 mr-1" />
                                {methodError}
                            </div>
                        )}

                        <div className="mt-4 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Payment Type
                                </label>
                                <select
                                    value={methodFormData.type}
                                    onChange={(e) =>
                                        setMethodFormData({
                                            ...methodFormData,
                                            type: e.target.value,
                                        })
                                    }
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                >
                                    <option value="mpesa">M-Pesa</option>
                                    <option value="visa">Visa Card</option>
                                    <option value="mastercard">Mastercard</option>
                                    <option value="bank">Bank Account</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Label
                                </label>
                                <input
                                    type="text"
                                    value={methodFormData.label}
                                    onChange={(e) =>
                                        setMethodFormData({
                                            ...methodFormData,
                                            label: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., My M-Pesa"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Account Details
                                </label>
                                <input
                                    type="text"
                                    value={methodFormData.detail}
                                    onChange={(e) =>
                                        setMethodFormData({
                                            ...methodFormData,
                                            detail: e.target.value,
                                        })
                                    }
                                    placeholder="e.g., +2547XXXXXXXX or ****4242"
                                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#056db3] focus:outline-none focus:ring-2 focus:ring-[#056db3]/20"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="primary-method"
                                    checked={methodFormData.primary}
                                    onChange={(e) =>
                                        setMethodFormData({
                                            ...methodFormData,
                                            primary: e.target.checked,
                                        })
                                    }
                                    className="h-4 w-4 rounded border-gray-300 text-[#056db3] focus:ring-[#056db3]"
                                />
                                <label htmlFor="primary-method" className="text-sm text-gray-700">
                                    Set as primary payment method
                                </label>
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowMethodModal(false);
                                    setMethodError(null);
                                    setEditingMethod(null);
                                }}
                                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMethod}
                                disabled={methodModalLoading}
                                className="flex-1 rounded-lg bg-[#056db3] px-4 py-2 text-white hover:bg-[#045a94] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {methodModalLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    editingMethod ? "Update" : "Add Method"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ClientWallet;