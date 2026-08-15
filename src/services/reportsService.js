import authService from "./api";

const reportsService = {
  getReports: async (period = "6months") => {
    return authService.get(`/admin/reports?period=${period}`);
  },

  exportCSV: async (period = "6months") => {
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `http://localhost:8000/api/admin/reports/export/csv?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to export CSV");
    }

    const blob = await response.blob();

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
    const token = localStorage.getItem("access_token");

    const response = await fetch(
      `http://localhost:8000/api/admin/reports/export/pdf?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to export PDF");
    }

    const blob = await response.blob();

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