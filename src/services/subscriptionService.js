import api from "./api";

const subscriptionService = {
  async getSubscription() {
    return await api.get("/subscriptions/me");
  },

  async getCommission() {
    return await api.get("/subscriptions/commission");
  },

  async upgradeToPremium() {
    return await api.post("/subscriptions/upgrade", {
      plan: "PREMIUM",
    });
  },
};

export default subscriptionService;