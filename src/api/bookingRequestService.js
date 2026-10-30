// src/api/bookingRequestService.js

import apiClient from "./apiClient";

const bookingRequestService = {
  createRequest: async (payload) => {
    const response = await apiClient.post("/booking-requests/", payload);
    return response.data;
  },

  getMyRequests: async () => {
    const response = await apiClient.get("/booking-requests/mine");
    return response.data;
  },

  getRequestDetails: async (requestId) => {
    const response = await apiClient.get(`/booking-requests/${requestId}`);
    return response.data;
  },

  cancelRequest: async (requestId) => {
    const response = await apiClient.post(`/booking-requests/${requestId}/cancel`);
    return response.data;
  },

  // Provider: list open + targeted requests in their category
  getOpenRequests: async (category) => {
    const params = category ? { category } : {};
    const response = await apiClient.get("/booking-requests/open", { params });
    return response.data;
  },
};

export default bookingRequestService;