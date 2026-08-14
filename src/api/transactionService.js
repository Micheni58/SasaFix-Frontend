// src/api/transactionService.js - Transaction History & Earnings (No Wallet)

import axios from "axios";

const API_URL = "/api";

const client = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─────────────────────────────────────────────
// NORMALIZERS
// ─────────────────────────────────────────────

function normalizeTransaction(transaction) {
  return {
    id: transaction.id,
    bookingId: transaction.booking_id,
    clientId: transaction.client_id,
    providerId: transaction.provider_id,
    clientName: transaction.client_name || null,
    providerName: transaction.provider_name || null,
    type: transaction.type || "payment",
    status: transaction.status || "pending",
    grossAmount: Number(transaction.gross_amount || 0),
    netAmount: Number(transaction.net_amount || 0),
    commissionRate: Number(transaction.commission_rate || 0),
    commissionAmount: Number(transaction.commission_amount || 0),
    mpesaReference: transaction.mpesa_reference || null,
    checkoutRequestId: transaction.checkout_request_id || null,
    merchantRequestId: transaction.merchant_request_id || null,
    payerPhone: transaction.payer_phone || null,
    paidAt: transaction.paid_at || null,
    createdAt: transaction.created_at || null,
    raw: transaction,
  };
}

function normalizeTransactions(transactions) {
  return (transactions || []).map(normalizeTransaction);
}

// ─────────────────────────────────────────────
// TRANSACTION HISTORY
// ─────────────────────────────────────────────

/**
 * Get transaction history for a user (client or provider)
 */
export async function getTransactionHistory(userId, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append("status", params.status);
    if (params.type) queryParams.append("type", params.type);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.offset) queryParams.append("offset", params.offset);

    const url = `/transactions/user/${userId}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await client.get(url);

    return {
      transactions: normalizeTransactions(response.data.transactions || []),
      total: response.data.total || 0,
      limit: response.data.limit || params.limit || 50,
      offset: response.data.offset || params.offset || 0,
      raw: response.data,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("Transaction history endpoint not found - returning empty array");
      return {
        transactions: [],
        total: 0,
        limit: params.limit || 50,
        offset: params.offset || 0,
        raw: {},
      };
    }
    throw handleError(error);
  }
}

/**
 * Get transaction history for a provider
 */
export async function getProviderTransactions(providerId, params = {}) {
  return getTransactionHistory(providerId, params);
}

/**
 * Get transaction history for a client
 */
export async function getClientTransactions(clientId, params = {}) {
  return getTransactionHistory(clientId, params);
}

/**
 * Get a specific transaction by ID
 */
export async function getTransaction(transactionId) {
  try {
    const response = await client.get(`/transactions/${transactionId}`);
    return normalizeTransaction(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw handleError(error);
  }
}

/**
 * Get transaction status by transaction ID
 */
export async function getTransactionStatus(transactionId) {
  try {
    const response = await client.get(`/mpesa/transaction/${transactionId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// EARNINGS SUMMARY
// ─────────────────────────────────────────────

/**
 * Get earnings summary for a provider
 */
export async function getProviderEarnings(providerId, period = "month") {
  try {
    const response = await client.get(`/transactions/provider/${providerId}/earnings`, {
      params: { period }
    });
    return {
      totalEarned: response.data.total_earned || 0,
      totalJobs: response.data.total_jobs || 0,
      averagePerJob: response.data.average_per_job || 0,
      pendingCount: response.data.pending_count || 0,
      period: response.data.period || period,
      formattedTotal: response.data.formatted_total || `KES 0.00`,
      formattedAverage: response.data.formatted_average || `KES 0.00`,
      transactions: response.data.transactions || [],
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("Earnings summary endpoint not available yet");
      return {
        totalEarned: 0,
        totalJobs: 0,
        averagePerJob: 0,
        pendingCount: 0,
        period: period,
        formattedTotal: "KES 0.00",
        formattedAverage: "KES 0.00",
        transactions: [],
      };
    }
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// ADMIN FUNCTIONS
// ─────────────────────────────────────────────

/**
 * Get all transactions (admin only)
 */
export async function getAllTransactions(status = null, limit = 50, offset = 0) {
  try {
    const queryParams = new URLSearchParams();
    if (status) queryParams.append("status", status);
    queryParams.append("limit", limit);
    queryParams.append("offset", offset);
    
    const url = `/transactions/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await client.get(url);
    
    // ✅ Normalize the transactions to camelCase
    const transactions = normalizeTransactions(response.data.transactions || []);
    
    return {
      transactions: transactions,
      total: response.data.total || 0,
      limit: response.data.limit || limit,
      offset: response.data.offset || offset,
      raw: response.data,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("All transactions endpoint not available yet");
      return {
        transactions: [],
        total: 0,
        limit: limit,
        offset: offset,
        raw: {},
      };
    }
    throw handleError(error);
  }
}

/**
 * Get transaction summary (admin only)
 */
export async function getTransactionSummary() {
  try {
    const response = await client.get("/transactions/admin/summary");
    return {
      counts: {
        pending: response.data.counts?.pending || 0,
        completed: response.data.counts?.completed || 0,
        failed: response.data.counts?.failed || 0,
        total: response.data.counts?.total || 0,
      },
      totals: {
        total_gross: response.data.totals?.total_gross || 0,
        total_commission: response.data.totals?.total_commission || 0,
        total_net: response.data.totals?.total_net || 0,
      },
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("Transaction summary endpoint not available yet");
      return {
        counts: { pending: 0, completed: 0, failed: 0, total: 0 },
        totals: { total_gross: 0, total_commission: 0, total_net: 0 },
      };
    }
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

function handleError(error) {
  if (error.response) {
    const { data, status } = error.response;
    const message = data.detail || data.message || "An error occurred";
    
    if (status === 401) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return { status, message: "Session expired. Please login again." };
    }
    
    if (status === 403) {
      return { status, message: "You don't have permission to perform this action." };
    }
    
    if (status === 404) {
      return { status, message: "Resource not found." };
    }
    
    if (status === 400) {
      return { status, message: data.detail || "Invalid request." };
    }
    
    if (status === 500) {
      return { status, message: "Server error. Please try again later." };
    }
    
    return { status, message, data: data };
  } else if (error.request) {
    return { 
      status: 503, 
      message: "Network error. Please check your connection.",
    };
  } else {
    return { 
      status: 500, 
      message: error.message || "An unexpected error occurred",
    };
  }
}
export async function retryPayout(transactionId) {
  try {
    const response = await client.post(`/transactions/${transactionId}/retry-payout`);
    return normalizeTransaction(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to retry payout");
    }
    throw error;
  }
}

export async function resolveTransaction(transactionId, note) {
  try {
    const response = await client.post(`/transactions/${transactionId}/resolve`, { note });
    return normalizeTransaction(response.data);
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to mark as resolved");
    }
    throw error;
  }
}


// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

const transactionService = {
  // Transaction history
  getTransactionHistory,
  getProviderTransactions,
  getClientTransactions,
  getTransaction,
  getTransactionStatus,
  resolveTransaction,
  retryPayout,
  
  // Earnings
  getProviderEarnings,
  
  // Admin
  getAllTransactions,
  getTransactionSummary,
};

export default transactionService;