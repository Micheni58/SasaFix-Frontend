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
};

export default subscriptionService;