// src/api/quoteService.js

import apiClient from "./apiClient";

const quoteService = {
  // Client methods
  getQuotesForRequest: async (requestId) => {
    const response = await apiClient.get(`/quotes/requests/${requestId}`);
    return response.data;
  },

  acceptQuote: async (quoteId) => {
    const response = await apiClient.post(`/quotes/${quoteId}/accept`);
    return response.data;
  },

  rejectQuote: async (quoteId) => {
    const response = await apiClient.post(`/quotes/${quoteId}/reject`);
    return response.data;
  },

  // Provider methods
  getMyQuotes: async () => {
    // FIX: was /booking-requests/my-quotes, should be /quotes/mine
    const response = await apiClient.get("/quotes/mine");
    return response.data;
  },

  submitQuote: async (requestId, payload) => {
    const response = await apiClient.post(`/quotes/requests/${requestId}`, payload);
    return response.data;
  },

  withdrawQuote: async (quoteId) => {
    const response = await apiClient.post(`/quotes/${quoteId}/withdraw`);
    return response.data;
  },
};

export default quoteService;