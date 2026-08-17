import authService from "./api";

const adminProvidersService = {
  getProviders: async ({
    verification = "all",
    search = "",
  } = {}) => {
    const params = new URLSearchParams();

    if (verification !== "all") {
      params.set("verification", verification);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const query = params.toString();

    return authService.get(
      `/admin/service-providers${
        query ? `?${query}` : ""
      }`
    );
  },

  approveProvider: async (providerId) => {
    return authService.patch(
      `/admin/service-providers/${providerId}/verification`,
      {
        status: "verified",
      }
    );
  },

  rejectProvider: async (
    providerId,
    reason
  ) => {
    return authService.patch(
      `/admin/service-providers/${providerId}/verification`,
      {
        status: "rejected",
        reason,
      }
    );
  },
};

export default adminProvidersService;