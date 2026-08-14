// src/api/paymentsService.js

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
// PAYMENT PROCESSING
// ─────────────────────────────────────────────

/**
 * Process payment for a completed booking
 * This triggers the payment flow for a booking
 */
export async function processBookingPayment(bookingId) {
  try {
    const response = await client.post(`/payments/booking/${bookingId}/process`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Payment processing failed");
    }
    throw error;
  }
}

/**
 * Check payment status for a booking
 */
export async function getBookingPaymentStatus(bookingId) {
  try {
    const response = await client.get(`/transactions/booking/${bookingId}`);
    const transaction = response.data;
    if (!transaction) {
      return { status: "not_found", message: "No payment found for this booking" };
    }
    return {
      status: transaction.status || "PENDING",
      transaction_id: transaction.id,
      checkout_request_id: transaction.checkout_request_id,
      mpesa_reference: transaction.mpesa_reference,
      paid_at: transaction.paid_at,
      gross_amount: transaction.gross_amount,
      net_amount: transaction.net_amount,
      raw: transaction,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { status: "not_found", message: "No payment found for this booking" };
    }
    throw error;
  }
}

// ─────────────────────────────────────────────
// ADMIN & TRANSACTION SUMMARY
// ─────────────────────────────────────────────

export async function getAdminStats() {
  try {
    const response = await client.get("/transactions/admin/summary");
    return {
      total_revenue: response.data.total_revenue || 0,
      total_commission: response.data.total_commission || 0,
      pending_payouts: response.data.pending_payouts || 0,
      total_pending: response.data.total_pending || 0,
      total_completed: response.data.total_completed || 0,
      total_pending_amount: response.data.total_pending_amount || 0,
      total_completed_amount: response.data.total_completed_amount || 0,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.warn("Admin stats endpoint not available yet - returning default stats");
      return {
        total_revenue: 0,
        total_commission: 0,
        pending_payouts: 0,
        total_pending: 0,
        total_completed: 0,
        total_pending_amount: 0,
        total_completed_amount: 0,
      };
    }
    throw error;
  }
}

// ─────────────────────────────────────────────
// STK PUSH ENDPOINTS
// ─────────────────────────────────────────────

export async function initiateSTKPush(data) {
  try {
    const response = await client.post("/mpesa/stk-push", {
      phone_number: data.phone_number,
      amount: data.amount,
      booking_id: data.booking_id,
      client_id: data.client_id,
      provider_id: data.provider_id,
      commission_rate: data.commission_rate || 10,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Payment initiation failed");
    }
    throw error;
  }
}

export async function checkTransactionStatus(transactionId) {
  try {
    const response = await client.get(`/mpesa/transaction/${transactionId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Failed to check status");
    }
    throw error;
  }
}

export async function triggerManualCallback(checkoutRequestId, resultCode = 0, amount = null) {
  try {
    const response = await client.post("/mpesa/callback", {
      checkout_request_id: checkoutRequestId,
      result_code: resultCode,
      result_desc: resultCode === 0 ? "Success" : "Failed",
      mpesa_reference: `TEST-${Date.now()}`,
      amount: amount
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || "Manual callback failed");
    }
    throw error;
  }
}

// ─────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────

const paymentsService = {
  // Payment Processing
  processBookingPayment,
  getBookingPaymentStatus,
  
  // Admin & Stats
  getAdminStats,
  
  // STK Push
  initiateSTKPush,
  checkTransactionStatus,
  triggerManualCallback,
};

export default paymentsService;