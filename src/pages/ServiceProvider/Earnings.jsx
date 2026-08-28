// src/pages/ProviderEarnings.jsx - Payout history with smooth transitions & transaction summary

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    TrendingUp,
    DollarSign,
    History,
    RefreshCw,
    Filter,
    AlertCircle,
    Smartphone,
    Briefcase,
    Receipt,
    FileText,
    File,
} from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Navbar from "../../components/Navbar";
import { getSidebarRole } from "../../utils/sidebarRole";
import transactionService from "../../api/transactionService";
import { TransactionSummaryPDF } from "../../components/TransactionSummaryPDF";
import { PDFDownloadLink } from "@react-pdf/renderer";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const filterOptions = ["Day", "Week", "Month", "Year"];

const statusStyles = {
    COMPLETED: "bg-green-100 text-green-700",
    SUCCESS: "bg-green-100 text-green-700",
    PAID: "bg-green-100 text-green-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
};

const typeStyles = {
    payment: "bg-green-50 text-green-600",
    payout: "bg-green-50 text-green-600",
    correction: "bg-red-50 text-red-500",
    reversal: "bg-red-50 text-red-500",
};

function getStoredUser() {
    try {
        const raw = localStorage.getItem("user");
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

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

function formatDateFull(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function getDateRange(filter) {
    const now = new Date();
    const start = new Date(now);
    const end = new Date(now);

    switch (filter.toLowerCase()) {
        case "day":
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case "week":
            const day = now.getDay();
            const diff = now.getDate() - day + (day === 0 ? -6 : 1);
            start.setDate(diff);
            start.setHours(0, 0, 0, 0);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
            break;
        case "month":
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
            break;
        case "year":
            start.setMonth(0, 1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(11, 31);
            end.setHours(23, 59, 59, 999);
            break;
        default:
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            end.setMonth(now.getMonth() + 1, 0);
            end.setHours(23, 59, 59, 999);
    }

    return { start, end };
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
                    <p className="mt-1 text-xl sm:text-2xl font-bold text-gray-900 truncate font-mono">{value}</p>
                )}
                {sub && <p className="mt-1 text-xs text-gray-500 truncate">{sub}</p>}
            </div>
        </div>
    );
}

// ── Skeleton Components ──

function StatCardSkeleton() {
    return (
        <div className="min-h-28 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex h-full items-center justify-between gap-4">
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-11 w-11 shrink-0 animate-pulse rounded-lg bg-gray-200" />
            </div>
        </div>
    );
}

function TransactionRowSkeleton() {
    return (
        <tr className="border-b border-gray-100">
            <td className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            </td>
            <td className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            </td>
            <td className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </td>
            <td className="px-3 sm:px-4 py-2 sm:py-3">
                <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
            </td>
            <td className="px-3 sm:px-4 py-2 sm:py-3 text-right">
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 ml-auto" />
            </td>
        </tr>
    );
}

// ─────────────────────────────────────────────
// TRANSACTION SUMMARY COMPONENT
// ─────────────────────────────────────────────

function TransactionSummary({ transactions, filter, periodLabel }) {
    const [isGeneratingCSV, setIsGeneratingCSV] = useState(false);

    // Filter to only completed/successful transactions
    const completedTransactions = transactions.filter(tx => {
        const status = (tx.status || "").toUpperCase();
        return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
    });

    const generateCSV = () => {
        if (completedTransactions.length === 0) {
            alert("No completed transactions to summarize for this period.");
            return;
        }

        setIsGeneratingCSV(true);

        try {
            // Calculate totals
            let totalGross = 0;
            let totalCommission = 0;
            let totalNet = 0;

            completedTransactions.forEach(tx => {
                const gross = tx.gross_amount || tx.grossAmount || 0;
                const commission = tx.commission_amount || tx.commissionAmount || 0;
                const net = tx.net_amount || tx.netAmount || 0;
                totalGross += Number(gross);
                totalCommission += Number(commission);
                totalNet += Number(net);
            });

            // Build summary data
            const summaryData = {
                period: periodLabel || "Selected Period",
                generatedAt: new Date().toLocaleString("en-KE", {
                    dateStyle: "full",
                    timeStyle: "medium",
                }),
                totals: {
                    totalEarned: totalNet,
                    totalCommission: totalCommission,
                    totalGross: totalGross,
                    jobsPaid: completedTransactions.length,
                },
                transactions: completedTransactions.map(tx => ({
                    id: tx.id,
                    description: tx.description || "Transaction",
                    date: formatDateFull(tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date),
                    amount: tx.amount || tx.net_amount || tx.netAmount || 0,
                    status: (tx.status || "PENDING").toUpperCase(),
                    type: tx.type || "payment",
                    gross: tx.gross_amount || tx.grossAmount || 0,
                    commission: tx.commission_amount || tx.commissionAmount || 0,
                    net: tx.net_amount || tx.netAmount || 0,
                    client: tx.client_name || null,
                })),
            };

            // Create CSV
            const headers = ["ID", "Description", "Date", "Status", "Gross (KES)", "Commission (KES)", "Net (KES)"];
            const rows = summaryData.transactions.map(t => [
                t.id,
                t.description,
                t.date,
                t.status,
                t.gross.toFixed(2),
                t.commission.toFixed(2),
                t.net.toFixed(2),
            ]);

            const csv = [
                "Sasafix Earnings Summary",
                "========================",
                `Period: ${summaryData.period}`,
                `Generated: ${summaryData.generatedAt}`,
                "",
                `Total Jobs Paid: ${summaryData.totals.jobsPaid}`,
                `Total Earned: KES ${summaryData.totals.totalEarned.toFixed(2)}`,
                `Total Commission: KES ${summaryData.totals.totalCommission.toFixed(2)}`,
                `Total Gross: KES ${summaryData.totals.totalGross.toFixed(2)}`,
                "",
                "Transaction Details",
                "-------------------",
                headers.join(","),
                ...rows.map(row => row.join(",")),
                "",
                "Sasafix - Trusted Local Services",
                `© ${new Date().getFullYear()} Sasafix. All rights reserved.`,
            ].join("\n");

            // Download CSV
            const blob = new Blob([csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `earnings_summary_${new Date().toISOString().split("T")[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating CSV:", error);
            alert("Failed to generate CSV. Please try again.");
        } finally {
            setIsGeneratingCSV(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            {/* CSV Download Button */}
            <button
                onClick={generateCSV}
                disabled={isGeneratingCSV || completedTransactions.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isGeneratingCSV ? (
                    <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        Generating CSV...
                    </>
                ) : (
                    <>
                        <FileText className="h-3.5 w-3.5" />
                        CSV
                    </>
                )}
            </button>

            {/* PDF Download Button - Only for completed transactions */}
            {completedTransactions.length > 0 ? (
                <PDFDownloadLink
                    document={
                        <TransactionSummaryPDF
                            transactions={completedTransactions}
                            periodLabel={periodLabel}
                            filter={filter}
                            role="provider"
                        />
                    }
                    fileName={`earnings_summary_${new Date().toISOString().split("T")[0]}.pdf`}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {({ loading }) => (
                        <>
                            {loading ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    Generating PDF...
                                </>
                            ) : (
                                <>
                                    <File className="h-3.5 w-3.5" />
                                    PDF
                                </>
                            )}
                        </>
                    )}
                </PDFDownloadLink>
            ) : (
                <button
                    disabled
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-400 opacity-40 cursor-not-allowed"
                >
                    <File className="h-3.5 w-3.5" />
                    PDF
                </button>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

function ProviderEarnings() {
    const location = useLocation();
    const sidebarRole = getSidebarRole(location.pathname);

    const [activeFilter, setActiveFilter] = useState("Month");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [transactions, setTransactions] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);

    // ── Get provider ID from localStorage ──
    const storedUser = getStoredUser();
    const providerId = Number(
        storedUser?.provider_id || 
        storedUser?.service_provider_id || 
        localStorage.getItem("providerId") ||
        storedUser?.id
    );

    // ── Fetch transactions ──
    const fetchTransactions = async (showRefresh = false, newFilter = null) => {
        if (!providerId) {
            setLoading(false);
            return;
        }

        if (newFilter !== null) {
            setIsFiltering(true);
        } else if (!showRefresh) {
            setLoading(true);
        }

        if (showRefresh) setRefreshing(true);
        setError(null);

        try {
            const txRes = await transactionService.getProviderTransactions(providerId);
            const txList = Array.isArray(txRes)
                ? txRes
                : txRes?.transactions || txRes?.data?.transactions || [];
            
            const filterToUse = newFilter !== null ? newFilter : activeFilter;
            const { start, end } = getDateRange(filterToUse);
            
            const filtered = txList.filter(tx => {
                const txDate = new Date(tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date);
                if (isNaN(txDate.getTime())) return false;
                return txDate >= start && txDate <= end;
            });
            
            setTransactions(filtered);
        } catch (err) {
            console.error("Error loading earnings:", err);
            if (err.status === 404) {
                setTransactions([]);
            } else {
                setError(err.message || "Failed to load earnings history");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsFiltering(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [providerId]);

    // ── Handle filter change with smooth transition ──
    const handleFilterChange = (value) => {
        if (value === activeFilter) return;
        setActiveFilter(value);
        fetchTransactions(false, value);
    };

    // ── Resolve transaction data ──
    const resolveTx = (tx) => {
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

        const txType = (tx.type || "payment").toLowerCase();
        const isIncoming = !(["correction", "reversal", "debit"].includes(txType) || numAmount < 0);
        const absoluteAmount = Math.abs(numAmount);

        const rawStatus = (tx.status || "PENDING").toUpperCase();
        const dateVal = tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date;
        const description = tx.description || (isIncoming ? "Job payout" : "Payout correction");

        return { absoluteAmount, isIncoming, rawStatus, dateVal, description, txType };
    };

    // ── Calculate stats from FILTERED and COMPLETED transactions only ──
    const successfulTxes = transactions.filter(tx => {
        const status = (tx.status || "").toUpperCase();
        return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
    });

    const incomingSuccessful = successfulTxes
        .map(resolveTx)
        .filter(t => t.isIncoming);

    const totalEarned = incomingSuccessful.reduce((sum, t) => sum + t.absoluteAmount, 0);
    const completedJobs = incomingSuccessful.length;
    const avgPerJob = completedJobs > 0 ? Math.round(totalEarned / completedJobs) : 0;

    // Get completed transactions for display
    const completedTransactions = transactions.filter(tx => {
        const status = (tx.status || "").toUpperCase();
        return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
    });

    const hasTransactions = completedTransactions.length > 0;
    const hasCompletedTransactions = completedJobs > 0;

    // ── Get period label ──
    const getPeriodLabel = () => {
        const { start, end } = getDateRange(activeFilter);
        const startStr = start.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
        const endStr = end.toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" });
        return `${startStr} - ${endStr}`;
    };

    // ── Loading State (only for initial load) ──
    if (loading) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role={sidebarRole} />
                <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                    <Navbar />
                    <main className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 space-y-6 max-w-7xl mx-auto">
                        {/* Loading skeletons... */}
                        <div className="animate-pulse">
                            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                            <div className="h-4 w-64 bg-gray-200 rounded" />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-12 bg-gray-200 animate-pulse rounded" />
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-7 w-12 bg-gray-200 animate-pulse rounded-full" />
                                    ))}
                                </div>
                            </div>
                            <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                            {[1, 2, 3].map((i) => (
                                <StatCardSkeleton key={i} />
                            ))}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {[1, 2].map((i) => (
                                <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                                    <div className="h-6 w-32 bg-gray-200 animate-pulse rounded mb-1" />
                                    <div className="h-4 w-48 bg-gray-200 animate-pulse rounded mb-4" />
                                    <div className="space-y-3">
                                        {[1, 2, 3].map((j) => (
                                            <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full shrink-0" />
                                                <div className="flex-1">
                                                    <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                                                    <div className="mt-1 h-3 w-48 bg-gray-200 animate-pulse rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="h-6 w-40 bg-gray-200 animate-pulse rounded" />
                                <div className="h-6 w-24 bg-gray-200 animate-pulse rounded" />
                            </div>
                            <div className="overflow-x-auto w-full">
                                <table className="w-full text-left text-xs sm:text-sm min-w-125">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <th key={i} className="px-3 sm:px-4 py-2 sm:py-3">
                                                    <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <TransactionRowSkeleton key={i} />
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

    if (error) {
        return (
            <div className="flex min-h-screen bg-[#f8fafc]">
                <Sidebar role={sidebarRole} />
                <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                    <Navbar />
                    <main className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 max-w-7xl mx-auto">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                            <h3 className="mt-2 text-lg font-semibold text-red-700">Error Loading Earnings</h3>
                            <p className="mt-1 text-red-600">{error}</p>
                            <button
                                onClick={() => fetchTransactions()}
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

    const periodLabel = getPeriodLabel();

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
            <Sidebar role={sidebarRole} />
            <div className="flex-1 w-full lg:ml-72 transition-all duration-300 min-w-0">
                <Navbar />
                <main className="pt-20 md:pt-24 px-3 sm:px-6 pb-10 space-y-4 sm:space-y-6 max-w-7xl mx-auto">

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Earnings & Transactions</h1>
                            <p className="mt-1 text-xs sm:text-sm text-gray-500">
                                Every job payout, paid straight to your M-Pesa the moment it's completed.
                            </p>
                        </div>
                        <button
                            onClick={() => fetchTransactions(true)}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full sm:w-auto disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </button>
                    </div>

                    {/* ── Filter and Period Display ── */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">Filter:</span>
                            <div className="flex gap-1">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => handleFilterChange(option)}
                                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                            activeFilter === option
                                                ? 'bg-[#056db3] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                                {hasTransactions ? periodLabel : "No completed transactions"}
                            </span>
                            <TransactionSummary 
                                transactions={transactions} 
                                filter={activeFilter}
                                periodLabel={periodLabel}
                            />
                        </div>
                    </div>

                    {/* ── Stat Cards ── */}
                    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 transition-opacity duration-300 ${isFiltering ? 'opacity-60' : 'opacity-100'}`}>
                        <StatCard
                            icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
                            iconBg="bg-green-50 border border-green-100"
                            label="Total Earned"
                            value={hasCompletedTransactions ? `KES ${totalEarned.toLocaleString()}` : "KES 0"}
                            sub={hasCompletedTransactions ? periodLabel : "No completed jobs"}
                            isLoading={isFiltering}
                        />
                        <StatCard
                            icon={<Briefcase className="h-5 w-5 sm:h-6 sm:w-6 text-[#056db3]" />}
                            iconBg="bg-blue-50 border border-blue-100"
                            label="Jobs Paid Out"
                            value={completedJobs}
                            sub={hasCompletedTransactions ? periodLabel : "No completed jobs"}
                            isLoading={isFiltering}
                        />
                        <StatCard
                            icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
                            iconBg="bg-purple-50 border border-purple-100"
                            label="Average per Job"
                            value={hasCompletedTransactions ? `KES ${avgPerJob.toLocaleString()}` : "KES 0"}
                            sub={hasCompletedTransactions ? periodLabel : "No completed jobs"}
                            isLoading={isFiltering}
                        />
                    </div>

                    {/* ── Recent Activity and How Payouts Work ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="text-base sm:text-lg font-bold text-gray-800">Recent Activity</h2>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {completedTransactions.length}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">
                                Your latest payouts {hasTransactions ? `for ${periodLabel}` : ""}
                            </p>

                            {!hasTransactions ? (
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                                        <div className="mt-1 rounded-full bg-[#056db3] p-1.5 shrink-0">
                                            <Briefcase className="h-4 w-4 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">Complete your first job</p>
                                            <p className="text-xs text-gray-500">Your payout will appear here as soon as the client pays</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {completedTransactions.slice(0, 5).map((tx, idx) => {
                                        const { absoluteAmount, isIncoming, dateVal, description } = resolveTx(tx);
                                        return (
                                            <div key={tx.id || idx} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 gap-2">
                                                <div className="min-w-0 pr-2">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{description}</p>
                                                    <p className="text-xs text-gray-400">{formatDate(dateVal)}</p>
                                                </div>
                                                <span className={`text-sm font-bold font-mono shrink-0 px-2 py-0.5 rounded ${
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

                        <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">How payouts work</h2>
                            <p className="text-xs sm:text-sm text-gray-500 mb-4">No wallet, no manual withdrawals</p>

                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <div className="mt-1 rounded-full bg-[#056db3] p-1.5 shrink-0">
                                        <Briefcase className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">You mark the job complete</p>
                                        <p className="text-xs text-gray-500">The client is prompted to pay right away</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <div className="mt-1 rounded-full bg-[#056db3] p-1.5 shrink-0">
                                        <Smartphone className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">Your share lands in M-Pesa</p>
                                        <p className="text-xs text-gray-500">Sent instantly to your registered number, minus the platform fee</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                                    <div className="mt-1 rounded-full bg-[#056db3] p-1.5 shrink-0">
                                        <Receipt className="h-4 w-4 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">It's logged right here</p>
                                        <p className="text-xs text-gray-500">Every payout shows up below with its M-Pesa reference</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mt-4 text-xs text-gray-400">
                                Need to change your payout number? Update it in your profile settings.
                            </p>
                        </div>
                    </div>

                    {/* ── Payout History Table ── */}
                    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-4 sm:px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-gray-800">Transaction History</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">
                                    {hasTransactions ? `${completedTransactions.length} completed transactions` : "No completed transactions"}
                                </span>
                            </div>
                        </div>

                        {!hasTransactions ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                                No completed payouts for this period. Complete a job to see it here.
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
                                        {completedTransactions.map((tx, idx) => {
                                            const { absoluteAmount, isIncoming, rawStatus, dateVal, description, txType } = resolveTx(tx);
                                            return (
                                                <tr key={tx.id || idx} className="hover:bg-gray-50">
                                                    <td className="px-3 sm:px-4 py-2 sm:py-3 capitalize font-medium text-gray-700 text-xs sm:text-sm">
                                                        <span className={`inline-flex whitespace-nowrap rounded px-2 py-0.5 text-xs font-semibold capitalize ${
                                                            typeStyles[txType] || "bg-gray-50 text-gray-500"
                                                        }`}>
                                                            {txType || "payment"}
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
                                                    <td className={`px-3 sm:px-4 py-2 sm:py-3 text-right font-bold font-mono whitespace-nowrap text-xs sm:text-sm ${
                                                        isIncoming ? "text-green-600" : "text-red-600"
                                                    }`}>
                                                        {isIncoming ? "+" : "-"} KES {absoluteAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                    {completedTransactions.length > 0 && (
                                        <tfoot className="bg-gray-50 border-t border-gray-200">
                                            <tr>
                                                <td colSpan="4" className="px-3 sm:px-4 py-2 text-right font-semibold text-gray-700">
                                                    Total:
                                                </td>
                                                <td className="px-3 sm:px-4 py-2 text-right font-bold text-green-600">
                                                    KES {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
}

export default ProviderEarnings;