// src/components/pdf/SasaFixReceipt.jsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#f8fafc",
    padding: 0,
    fontFamily: "Helvetica",
  },

  // ── Header Banner ──
  header: {
    backgroundColor: "#056db3",
    paddingVertical: 20,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 100,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  headerLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    objectFit: "cover",
  },
  headerTextContainer: {
    flexDirection: "column",
  },
  brandName: {
    fontSize: 26,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 1,
  },
  brandTagline: {
    fontSize: 9,
    color: "#bfdbfe",
    marginTop: 3,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  receiptLabel: {
    fontSize: 10,
    color: "#bfdbfe",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  receiptId: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginTop: 2,
  },

  // ── Status Badge ──
  statusSection: {
    backgroundColor: "#ecfdf5",
    borderBottomWidth: 1,
    borderBottomColor: "#a7f3d0",
    paddingVertical: 12,
    paddingHorizontal: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    color: "#065f46",
    fontFamily: "Helvetica-Bold",
  },
  statusSub: {
    fontSize: 10,
    color: "#6b7280",
    marginLeft: 6,
  },

  // ── Body ──
  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 40,
  },

  // ── Section ──
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  sectionTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  // ── Row ──
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  rowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  rowLabel: {
    fontSize: 10,
    color: "#6b7280",
    flex: 1,
  },
  rowValue: {
    fontSize: 10,
    color: "#1e293b",
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
    flex: 1,
  },

  // ── Divider ──
  divider: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginVertical: 10,
  },

  // ── Total Row ──
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#1e40af",
  },
  totalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#056db3",
  },

  // ── Two-Column Grid ──
  grid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  gridCol: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
  },

  // ── Provider Avatar ──
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#056db3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
  },
  providerName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  providerTrade: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },

  // ── Timeline ──
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10b981",
    marginRight: 10,
  },
  timelineText: {
    fontSize: 10,
    color: "#374151",
  },

  // ── Footer ──
  footer: {
    backgroundColor: "#1e293b",
    paddingVertical: 18,
    paddingHorizontal: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    minHeight: 80,
  },
  footerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerLogo: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    objectFit: "cover",
  },
  footerTextContainer: {
    flexDirection: "column",
  },
  footerBrand: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#f8fafc",
  },
  footerSub: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 3,
  },
  footerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  footerNote: {
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "right",
  },
});

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatReceiptDate(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-KE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function formatReceiptTime(isoString) {
  if (!isoString) return "—";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("en-KE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

// ─────────────────────────────────────────────
// RECEIPT DOCUMENT
// ─────────────────────────────────────────────

/**
 * SasaFixReceipt
 *
 * Props:
 *  - booking  {object}  the `ui` object from PaidBookingDetails
 *  - role     "client" | "provider"
 */
export function SasaFixReceipt({ booking, role = "client" }) {
  const isProvider = role === "provider";

  // For providers: they receive 90% (or 95% if premium)
  const isPremium = booking.isPremium || false;
  const commissionRate = isPremium ? 0.05 : 0.1;
  const rawAmount = booking.amountRaw || 0;
  const commissionAmount = Math.round(rawAmount * commissionRate);
  const providerReceives = rawAmount - commissionAmount;

  const timeline = [
    "Booking Requested",
    "Provider Accepted",
    "Work In Progress",
    "Work Completed",
    "Payment Processed",
  ];

  return (
    <Document
      title={`SasaFix Receipt - Booking #${booking.id}`}
      author="SasaFix"
      subject="Payment Receipt"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header with Logo ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image 
              src="/SasaFixLogo.jpeg" 
              style={styles.headerLogo}
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.brandName}>SasaFix</Text>
              <Text style={styles.brandTagline}>Local Services · Anytime, Anywhere</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.receiptLabel}>
              {isProvider ? "Provider Receipt" : "Payment Receipt"}
            </Text>
            <Text style={styles.receiptId}>#{booking.id}</Text>
          </View>
        </View>

        {/* ── Payment Status ── */}
        <View style={styles.statusSection}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Payment Successful</Text>
          <Text style={styles.statusSub}>
            · Paid on {formatReceiptDate(booking.paidAt)} at {formatReceiptTime(booking.paidAt)}
          </Text>
        </View>

        {/* ── Body ── */}
        <View style={styles.body}>

          {/* ── Two-column: Booking Info + Provider Info ── */}
          <View style={styles.grid}>

            {/* Booking Info */}
            <View style={styles.gridCol}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Booking Details</Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Service</Text>
                  <Text style={styles.rowValue}>{booking.service || "—"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Date</Text>
                  <Text style={styles.rowValue}>{booking.date || "—"}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Time</Text>
                  <Text style={styles.rowValue}>{booking.time || "—"}</Text>
                </View>
                <View style={styles.rowLast}>
                  <Text style={styles.rowLabel}>Location</Text>
                  <Text style={styles.rowValue}>{booking.location || "—"}</Text>
                </View>
              </View>
            </View>

            {/* Provider Info */}
            <View style={styles.gridCol}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {isProvider ? "Your Profile" : "Service Provider"}
                </Text>
              </View>
              <View style={styles.sectionBody}>
                <View style={styles.providerRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {booking.worker?.initials || "--"}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.providerName}>
                      {booking.worker?.name || "Provider"}
                    </Text>
                    {booking.worker?.trade && (
                      <Text style={styles.providerTrade}>
                        {booking.worker.trade}
                      </Text>
                    )}
                  </View>
                </View>
                {booking.worker?.phone && (
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Phone</Text>
                    <Text style={styles.rowValue}>{booking.worker.phone}</Text>
                  </View>
                )}
                {booking.worker?.email && (
                  <View style={styles.rowLast}>
                    <Text style={styles.rowLabel}>Email</Text>
                    <Text style={styles.rowValue}>{booking.worker.email}</Text>
                  </View>
                )}
                {isPremium && (
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ fontSize: 9, color: "#d97706", fontFamily: "Helvetica-Bold" }}>
                      ★ Premium Provider — 5% Commission Rate
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* ── Payment Breakdown ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Service Fee</Text>
                <Text style={styles.rowValue}>
                  KES {rawAmount.toLocaleString()}
                </Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.rowLabel}>
                  SasaFix Commission ({isPremium ? "5%" : "10%"})
                </Text>
                <Text style={styles.rowValue}>
                  KES {commissionAmount.toLocaleString()}
                </Text>
              </View>

              {isProvider && (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>You Receive</Text>
                  <Text style={[styles.rowValue, { color: "#10b981" }]}>
                    KES {providerReceives.toLocaleString()}
                  </Text>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {isProvider ? "Net Payout" : "Total Paid"}
                </Text>
                <Text style={styles.totalValue}>
                  KES{" "}
                  {isProvider
                    ? providerReceives.toLocaleString()
                    : rawAmount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Booking Timeline ── */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Booking Timeline</Text>
            </View>
            <View style={styles.sectionBody}>
              {timeline.map((step, i) => (
                <View key={i} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <Text style={styles.timelineText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* ── Notes ── */}
          {booking.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Job Notes</Text>
              </View>
              <View style={styles.sectionBody}>
                <Text style={{ fontSize: 10, color: "#374151", lineHeight: 1.5 }}>
                  {booking.description}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Footer with Logo ── */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Image 
              src="/SasaFixLogo.jpeg" 
              style={styles.footerLogo}
            />
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerBrand}>SasaFix</Text>
              <Text style={styles.footerSub}>
                Connecting clients with trusted local professionals
              </Text>
            </View>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerNote}>
              This is an official SasaFix payment receipt.
            </Text>
            <Text style={styles.footerNote}>
              Generated on {new Date().toLocaleDateString("en-KE")}
            </Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}