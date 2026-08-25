// src/components/TransactionSummaryPDF.jsx

import {
    Document,
    Page,
    Text,
    View,
    StyleSheet,
    Image,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
    page: {
        backgroundColor: "#ffffff",
        padding: 40,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 24,
        borderBottom: 1,
        borderBottomColor: "#e5e7eb",
        paddingBottom: 16,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontFamily: "Helvetica-Bold",
        color: "#056db3",
    },
    subtitle: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
    },
    period: {
        fontSize: 14,
        color: "#374151",
        marginTop: 4,
    },
    statsGrid: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
        backgroundColor: "#f8fafc",
        padding: 16,
        borderRadius: 8,
    },
    statItem: {
        flex: 1,
    },
    statLabel: {
        fontSize: 10,
        color: "#6b7280",
        fontFamily: "Helvetica-Bold",
        textTransform: "uppercase",
    },
    statValue: {
        fontSize: 18,
        color: "#1e293b",
        fontFamily: "Helvetica-Bold",
        marginTop: 2,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#f1f5f9",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderBottom: 1,
        borderBottomColor: "#e2e8f0",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderBottom: 1,
        borderBottomColor: "#f1f5f9",
    },
    colDate: { width: "20%", fontSize: 9, color: "#374151" },
    colDescription: { width: "35%", fontSize: 9, color: "#1e293b" },
    colStatus: { width: "15%", fontSize: 9, color: "#374151" },
    colAmount: { width: "15%", fontSize: 9, color: "#1e293b", textAlign: "right" },
    colNet: { width: "15%", fontSize: 9, color: "#10b981", textAlign: "right", fontFamily: "Helvetica-Bold" },
    footer: {
        marginTop: 32,
        paddingTop: 16,
        borderTop: 1,
        borderTopColor: "#e5e7eb",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    footerText: {
        fontSize: 8,
        color: "#9ca3af",
    },
    totalRow: {
        flexDirection: "row",
        backgroundColor: "#eff6ff",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTop: 2,
        borderTopColor: "#056db3",
    },
    totalLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#1e40af",
        width: "70%",
    },
    totalValue: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#056db3",
        width: "30%",
        textAlign: "right",
    },
    // Brand styles - Circular logo
    brandLogo: {
        width: 70,
        height: 70,
        borderRadius: 35,
        objectFit: "cover",
    },
    footerBrandLogo: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        objectFit: "cover",
    },
    footerBrand: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    // Client-specific styles
    clientTotalValue: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#dc2626",
        width: "30%",
        textAlign: "right",
    },
    clientTotalRow: {
        flexDirection: "row",
        backgroundColor: "#fef2f2",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderTop: 2,
        borderTopColor: "#dc2626",
    },
    clientTotalLabel: {
        fontSize: 11,
        fontFamily: "Helvetica-Bold",
        color: "#991b1b",
        width: "70%",
    },
    // Client table column adjustments
    clientColAmount: {
        width: "15%",
        fontSize: 9,
        color: "#dc2626",
        textAlign: "right",
        fontFamily: "Helvetica-Bold",
    },
});

export function TransactionSummaryPDF({ transactions, periodLabel, filter, role = "provider" }) {
    // Filter to only completed transactions
    const completedTransactions = transactions.filter(tx => {
        const status = (tx.status || "").toUpperCase();
        return status === "COMPLETED" || status === "SUCCESS" || status === "PAID";
    });

    const isProvider = role === "provider";
    const isClient = role === "client";

    // Calculate totals based on role
    let totalGross = 0;
    let totalCommission = 0;
    let totalNet = 0;
    let totalSpent = 0;

    completedTransactions.forEach(tx => {
        const gross = tx.gross_amount || tx.grossAmount || 0;
        const commission = tx.commission_amount || tx.commissionAmount || 0;
        const net = tx.net_amount || tx.netAmount || 0;
        const amount = tx.amount || net || gross || 0;

        if (isProvider) {
            totalGross += Number(gross);
            totalCommission += Number(commission);
            totalNet += Number(net);
        } else {
            // Client calculations - only track spending
            totalSpent += Number(amount);
        }
    });

    const formatCurrency = (amount) => {
        return `KES ${Number(amount).toLocaleString()}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusColor = (status) => {
        const s = (status || "").toUpperCase();
        if (s === "COMPLETED" || s === "SUCCESS" || s === "PAID") return "#10b981";
        if (s === "PENDING") return "#f59e0b";
        if (s === "FAILED") return "#ef4444";
        return "#6b7280";
    };

    // Get the appropriate title and subtitle
    const getTitle = () => {
        if (isProvider) return "Earnings Summary";
        return "Transaction Summary";
    };

    const getSubtitle = () => {
        if (isProvider) return "Sasafix Provider Earnings Report";
        return "Sasafix Payment History Report";
    };

    // Get stats grid content
    const renderStats = () => {
        if (isProvider) {
            return (
                <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Earned</Text>
                        <Text style={styles.statValue}>{formatCurrency(totalNet)}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Jobs Paid</Text>
                        <Text style={styles.statValue}>{completedTransactions.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Total Commission</Text>
                        <Text style={styles.statValue}>{formatCurrency(totalCommission)}</Text>
                    </View>
                </View>
            );
        }

        // Client stats - simple: Total Spent and Transactions
        return (
            <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Total Spent</Text>
                    <Text style={[styles.statValue, { color: "#dc2626" }]}>{formatCurrency(totalSpent)}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Transactions</Text>
                    <Text style={styles.statValue}>{completedTransactions.length}</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Avg. per Transaction</Text>
                    <Text style={styles.statValue}>
                        {completedTransactions.length > 0 
                            ? formatCurrency(totalSpent / completedTransactions.length) 
                            : formatCurrency(0)}
                    </Text>
                </View>
            </View>
        );
    };

    // Render total row
    const renderTotalRow = () => {
        if (isProvider) {
            return (
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(totalNet)}</Text>
                </View>
            );
        }

        // Client total row - red themed, just total spent
        return (
            <View style={styles.clientTotalRow}>
                <Text style={styles.clientTotalLabel}>Total Spent</Text>
                <Text style={styles.clientTotalValue}>{formatCurrency(totalSpent)}</Text>
            </View>
        );
    };

    // Get table headers
    const getTableHeaders = () => {
        if (isProvider) {
            return (
                <View style={styles.tableHeader}>
                    <Text style={styles.colDate}>Date</Text>
                    <Text style={styles.colDescription}>Description</Text>
                    <Text style={styles.colStatus}>Status</Text>
                    <Text style={styles.colAmount}>Gross</Text>
                    <Text style={styles.colNet}>Net</Text>
                </View>
            );
        }

        // Client table headers - simpler
        return (
            <View style={styles.tableHeader}>
                <Text style={{ ...styles.colDate, width: "25%" }}>Date</Text>
                <Text style={{ ...styles.colDescription, width: "40%" }}>Description</Text>
                <Text style={{ ...styles.colStatus, width: "20%" }}>Status</Text>
                <Text style={{ ...styles.clientColAmount, width: "15%" }}>Amount</Text>
            </View>
        );
    };

    // Render table rows
    const renderTableRows = () => {
        if (isProvider) {
            return completedTransactions.slice(0, 20).map((tx, idx) => {
                const net = tx.net_amount || tx.netAmount || 0;
                const gross = tx.gross_amount || tx.grossAmount || 0;
                const status = (tx.status || "PENDING").toUpperCase();
                const description = tx.description || "Transaction";
                const date = tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date;

                return (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={styles.colDate}>{formatDate(date)}</Text>
                        <Text style={styles.colDescription}>{description}</Text>
                        <Text style={{ ...styles.colStatus, color: getStatusColor(status) }}>{status}</Text>
                        <Text style={styles.colAmount}>{formatCurrency(gross)}</Text>
                        <Text style={styles.colNet}>{formatCurrency(net)}</Text>
                    </View>
                );
            });
        }

        // Client table rows - simpler
        return completedTransactions.slice(0, 20).map((tx, idx) => {
            const amount = tx.amount || tx.net_amount || tx.netAmount || 0;
            const status = (tx.status || "PENDING").toUpperCase();
            const description = tx.description || "Transaction";
            const date = tx.paid_at || tx.paidAt || tx.created_at || tx.createdAt || tx.date;
            const displayAmount = Math.abs(Number(amount));

            return (
                <View key={idx} style={styles.tableRow}>
                    <Text style={{ ...styles.colDate, width: "25%" }}>{formatDate(date)}</Text>
                    <Text style={{ ...styles.colDescription, width: "40%" }}>{description}</Text>
                    <Text style={{ ...styles.colStatus, width: "20%", color: getStatusColor(status) }}>{status}</Text>
                    <Text style={{ ...styles.clientColAmount, width: "15%" }}>
                        - {formatCurrency(displayAmount)}
                    </Text>
                </View>
            );
        });
    };

    return (
        <Document title={`${getTitle()} - ${periodLabel}`}>
            <Page size="A4" style={styles.page}>
                {/* Header with Brand - Circular Logo */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <View style={styles.titleContainer}>
                            <Text style={styles.title}>{getTitle()}</Text>
                            <Text style={styles.subtitle}>{getSubtitle()}</Text>
                        </View>
                        <Image 
                            src="/SasaFixLogo.jpeg" 
                            style={styles.brandLogo}
                        />
                    </View>
                    <Text style={styles.period}>Period: {periodLabel}</Text>
                    <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>
                        Generated: {new Date().toLocaleString("en-KE", { dateStyle: "full", timeStyle: "medium" })}
                    </Text>
                </View>

                {/* Stats */}
                {renderStats()}

                {/* Table Header */}
                {getTableHeaders()}

                {/* Table Rows */}
                {renderTableRows()}

                {completedTransactions.length > 20 && (
                    <Text style={{ fontSize: 9, color: "#6b7280", marginTop: 8 }}>
                        + {completedTransactions.length - 20} more transactions
                    </Text>
                )}

                {/* Total Row */}
                {renderTotalRow()}

                {/* Footer with Brand */}
                <View style={styles.footer}>
                    <View style={styles.footerBrand}>
                        <Image 
                            src="/SasaFixLogo.jpeg" 
                            style={styles.footerBrandLogo}
                        />
                        <Text style={{ fontSize: 8, color: "#9ca3af" }}>
                            • Trusted local services
                        </Text>
                    </View>
                    <Text style={styles.footerText}>Page 1 of 1</Text>
                </View>
            </Page>
        </Document>
    );
}