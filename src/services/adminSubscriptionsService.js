import authService from "./api";
import apiClient from "../api/apiClient";

const adminSubscriptionsService = {
  list: async (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });

    const suffix = query.toString() ? `?${query.toString()}` : "";
    return authService.get(`/admin/subscriptions${suffix}`);
  },

  updateStatus: (providerId, isActive) =>
    apiClient.patch(`/admin/subscriptions/${providerId}/status`, {
      is_active: isActive,
    }),
};

export default adminSubscriptionsService;
