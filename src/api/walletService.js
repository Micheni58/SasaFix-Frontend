// src/api/walletService.js - Complete Wallet Service

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

function normalizeWallet(wallet) {
  return {
    id: wallet.id,
    userId: wallet.user_id,
    balance: Number(wallet.balance || 0),
    currency: wallet.currency || "KES",
    createdAt: wallet.created_at || null,
    updatedAt: wallet.updated_at || null,
    raw: wallet,
  };
}

function normalizeTransaction(transaction) {
  return {
    id: transaction.id,
    bookingId: transaction.booking_id,
    clientId: transaction.client_id,
    providerId: transaction.provider_id,
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

function normalizePaymentMethod(method) {
  return {
    id: method.id,
    type: method.type || "mpesa",
    label: method.label || "",
    detail: method.detail || "",
    primary: Boolean(method.primary),
    raw: method,
  };
}

function normalizePaymentMethods(methods) {
  return (methods || []).map(normalizePaymentMethod);
}

function normalizeBalance(balanceData) {
  return {
    userId: balanceData.user_id,
    balance: Number(balanceData.balance || 0),
    currency: balanceData.currency || "KES",
    formattedBalance: balanceData.formatted_balance || `KES 0.00`,
    raw: balanceData,
  };
}

// ─────────────────────────────────────────────
// WALLET ENDPOINTS
// ─────────────────────────────────────────────

/**
 * Get wallet details for a specific user
 */
export async function getWallet(userId) {
  try {
    const response = await client.get(`/wallets/user/${userId}`);
    return normalizeWallet(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Get wallet balance for a specific user
 */
export async function getWalletBalance(userId) {
  try {
    const response = await client.get(`/wallets/user/${userId}/balance`);
    return normalizeBalance(response.data);
  } catch (error) {
    // If wallet doesn't exist yet, return 0 balance instead of throwing
    if (error.response && error.response.status === 404) {
      return {
        userId: userId,
        balance: 0,
        currency: "KES",
        formattedBalance: "KES 0.00",
        raw: {},
      };
    }
    throw handleError(error);
  }
}

/**
 * Create a wallet for a user
 */
export async function createWallet(userId, currency = "KES") {
  try {
    const response = await client.post("/wallets/", {
      user_id: userId,
      currency: currency,
    });
    return normalizeWallet(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Deposit to wallet (called after M-Pesa payment confirmation)
 */
export async function depositToWallet(userId, amount) {
  try {
    const response = await client.patch(`/wallets/user/${userId}/deposit`, {
      amount: amount,
    });
    return normalizeWallet(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Withdraw from wallet
 */
export async function withdrawFromWallet(userId, amount) {
  try {
    const response = await client.patch(`/wallets/user/${userId}/withdraw`, {
      amount: amount,
    });
    return normalizeWallet(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Credit provider wallet (internal use)
 */
export async function creditProviderWallet(userId, amount) {
  try {
    const response = await client.patch(`/wallets/user/${userId}/credit`, {
      amount: amount,
    });
    return normalizeWallet(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// TRANSACTION HISTORY
// ─────────────────────────────────────────────

/**
 * Get transaction history for a user
 */
export async function getTransactionHistory(userId, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.filter) queryParams.append("filter", params.filter);
    if (params.status) queryParams.append("status", params.status);
    if (params.type) queryParams.append("type", params.type);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.offset) queryParams.append("offset", params.offset);
    
    const url = `/wallets/user/${userId}/transactions?${queryParams.toString()}`;
    const response = await client.get(url);
    
    return {
      transactions: response.data.transactions || [],
      total: response.data.total || 0,
      raw: response.data,
    };
  } catch (error) {
    // If endpoint returns 404, return empty array instead of throwing
    if (error.response && error.response.status === 404) {
      return {
        transactions: [],
        total: 0,
        raw: {},
      };
    }
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// PAYMENT METHODS (UPDATED WITH REAL ENDPOINTS)
// ─────────────────────────────────────────────

/**
 * Get all payment methods for a user
 */
export async function getPaymentMethods(userId) {
  try {
    const response = await client.get(`/wallets/user/${userId}/payment-methods`);
    return response.data.payment_methods || [];
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("Payment methods endpoint not available yet");
      return [];
    }
    throw handleError(error);
  }
}

/**
 * Add a new payment method
 */
export async function addPaymentMethod(userId, methodData) {
  try {
    const response = await client.post(`/wallets/user/${userId}/payment-methods`, {
      type: methodData.type,
      label: methodData.label,
      detail: methodData.detail,
      primary: methodData.primary || false,
    });
    return normalizePaymentMethod(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Set primary payment method
 */
export async function setPrimaryPaymentMethod(userId, methodId) {
  try {
    const response = await client.patch(
      `/wallets/user/${userId}/payment-methods/${methodId}/primary`
    );
    return normalizePaymentMethod(response.data);
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Delete a payment method
 */
export async function deletePaymentMethod(userId, methodId) {
  try {
    await client.delete(`/wallets/user/${userId}/payment-methods/${methodId}`);
    return { success: true };
  } catch (error) {
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// M-PESA PAYMENT ENDPOINTS (CORRECTED)
// ─────────────────────────────────────────────

/**
 * Initiate STK Push payment
 */
export async function initiateSTKPush(paymentData) {
  try {
    // ✅ Using /transactions/stk-push endpoint from escrow_resource.py
    const response = await client.post("/transactions/stk-push", {
      phone_number: paymentData.phone_number,
      amount: paymentData.amount,
      booking_id: paymentData.booking_id || 1,
      client_id: paymentData.client_id,
      provider_id: paymentData.provider_id || 1,
      commission_rate: paymentData.commission_rate || 10,
    });
    
    return {
      message: response.data.message,
      transactionId: response.data.transaction_id,
      checkoutRequestId: response.data.checkout_request_id,
      merchantRequestId: response.data.merchant_request_id,
      status: response.data.status,
      raw: response.data,
    };
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Get transaction status
 */
export async function getTransactionStatus(checkoutRequestId) {
  try {
    // ✅ Using /transactions/status endpoint from escrow_resource.py
    const response = await client.get(`/transactions/status/${checkoutRequestId}`);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
}

/**
 * Manual callback for testing
 */
export async function triggerManualCallback(checkoutRequestId, resultCode = 0, amount = null) {
  try {
    // ✅ Using /transactions/mpesa/manual-callback endpoint from escrow_resource.py
    const response = await client.post("/transactions/mpesa/manual-callback", {
      checkout_request_id: checkoutRequestId,
      result_code: resultCode,
      result_desc: resultCode === 0 ? "Success" : "Failed",
      mpesa_reference: `TEST-${Date.now()}`,
      amount: amount
    });
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
}

// ─────────────────────────────────────────────
// ERROR HANDLING
// ─────────────────────────────────────────────

function handleError(error) {
  // Handle network errors
  if (error.response) {
    // Server responded with error
    const { data, status } = error.response;
    const message = data.detail || data.message || "An error occurred";
    
    // Handle specific status codes
    if (status === 401) {
      // Unauthorized - clear token and redirect
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
    // Request was made but no response
    return { 
      status: 503, 
      message: "Network error. Please check your connection.",
    };
  } else {
    // Something else happened
    return { 
      status: 500, 
      message: error.message || "An unexpected error occurred",
    };
  }
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

const walletService = {
  // Wallet endpoints
  getWallet,
  getWalletBalance,
  createWallet,
  depositToWallet,
  withdrawFromWallet,
  creditProviderWallet,

  // Transaction history
  getTransactionHistory,

  // Payment methods
  getPaymentMethods,
  addPaymentMethod,
  setPrimaryPaymentMethod,
  deletePaymentMethod,

  // M-Pesa endpoints
  initiateSTKPush,
  getTransactionStatus,
  triggerManualCallback,
};

export default walletService;