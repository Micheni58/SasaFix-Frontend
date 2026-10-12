import authService from "./api";
import apiClient from "../api/apiClient";

const reportsService = {
  getReports: async (period = "6months") => {
    return authService.get(`/admin/reports?period=${period}`);
  },

  exportCSV: async (period = "6months") => {
    const response = await apiClient.get(
      `/admin/reports/export/csv?period=${period}`,
      { responseType: "blob", validateStatus: () => true },
    );

    if (response.status < 200 || response.status >= 300) {
      const error = await response.data.text().then(JSON.parse).catch(() => ({}));
      throw new Error(error.detail || "Failed to export CSV");
    }

    const blob = response.data;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "servicehub-reports.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },

  exportPDF: async (period = "6months") => {
    const response = await apiClient.get(
      `/admin/reports/export/pdf?period=${period}`,
      { responseType: "blob", validateStatus: () => true },
    );

    if (response.status < 200 || response.status >= 300) {
      const error = await response.data.text().then(JSON.parse).catch(() => ({}));
      throw new Error(error.detail || "Failed to export PDF");
    }

    const blob = response.data;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "servicehub-reports.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  },
};

export default reportsService;