import authService from "./api";

const subscriptionService = {
  getCurrent: async () => {
    return authService.get(
      "/subscriptions/me"
    );
  },

  upgrade: async (phoneNumber) => {
    return authService.post("/subscriptions/upgrade", {
      phone_number: phoneNumber,
    });
  },

  getPaymentStatus: async (
    paymentId
  ) => {
    return authService.get(
      `/subscriptions/payment/${paymentId}`
    );
  },

  getClientCurrent: async () => {
    return authService.get("/client-subscriptions/me");
  },

  upgradeClient: async (phoneNumber) => {
    return authService.post("/client-subscriptions/upgrade", {
      phone_number: phoneNumber,
    });
  },

  getClientPaymentStatus: async (paymentId) => {
    return authService.get(`/client-subscriptions/payment/${paymentId}`);
  },

  getClientAiUsage: async () => {
    return authService.get("/client-subscriptions/ai-usage");
  },
};

export default subscriptionService;