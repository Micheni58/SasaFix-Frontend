// src/api/reportService.js

import apiClient from "./apiClient";

/**
 * reportService
 *
 * Covers all report and dispute endpoints for clients, providers, and admins.
 * The backend derives reporter_role from the JWT — never send it from the frontend.
 */
const reportService = {

  // ─────────────────────────────────────────────
  // CLIENT & PROVIDER
  // ─────────────────────────────────────────────

  /**
   * File a new report or update an existing one.
   * Works for both clients (reporting a provider) and
   * providers (reporting a client).
   * The backend determines reporter_role from the token automatically.
   *
   * If a report already exists for the booking and is still open,
   * it will be updated instead of creating a new one.
   *
   * @param {Object} payload
   * @param {number} payload.booking_id
   * @param {number} payload.reported_user_id  — the user being reported
   * @param {string} payload.category          — must match ReportCategory enum
   * @param {string} payload.description
   * @returns {Promise<Object>} created/updated report
   */
  async createOrUpdateReport(payload) {
    const res = await apiClient.post("/reports/", payload);
    return res.data;
  },

  /**
   * Get all reports filed BY the current user (client or provider).
   * @returns {Promise<Array>}
   */
  async getMyReports() {
    const res = await apiClient.get("/reports/my");
    return res.data;
  },

  /**
   * Get the report filed by the current user for a specific booking.
   * Returns null if no report exists.
   * @param {number} bookingId
   * @returns {Promise<Object|null>}
   */
  async getMyReportForBooking(bookingId) {
    try {
      const res = await apiClient.get(`/reports/booking/${bookingId}/my-report`);
      return res.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get resolved/dismissed reports filed AGAINST the current user.
   * Intended for providers to see their complaint history.
   * @returns {Promise<Array>}
   */
  async getReportsAgainstMe() {
    const res = await apiClient.get("/reports/against-me");
    return res.data;
  },

  // ─────────────────────────────────────────────
  // ADMIN
  // ─────────────────────────────────────────────

  /**
   * Get all reports with optional filters.
   *
   * @param {Object} filters
   * @param {string}  [filters.status]           — "Submitted"|"Under Review"|"Resolved"|"Dismissed"
   * @param {string}  [filters.priority]         — "High"|"Medium"|"Low"
   * @param {string}  [filters.category]         — ReportCategory enum value
   * @param {string}  [filters.reporter_role]    — "client"|"provider"
   * @param {number}  [filters.reported_user_id] — filter by the user being reported
   * @param {number}  [filters.skip]
   * @param {number}  [filters.limit]
   * @returns {Promise<Array>}
   */
  async getAllReports(filters = {}) {
    const params = {};
    if (filters.status)           params.status = filters.status;
    if (filters.priority)         params.priority = filters.priority;
    if (filters.category)         params.category = filters.category;
    if (filters.reporter_role)    params.reporter_role = filters.reporter_role;
    if (filters.reported_user_id) params.reported_user_id = filters.reported_user_id;
    if (filters.skip)             params.skip = filters.skip;
    if (filters.limit)            params.limit = filters.limit;

    const res = await apiClient.get("/reports/", { params });
    return res.data;
  },

  /**
   * Get stat counts for the admin page stat cards.
   * Includes filed_by_clients and filed_by_providers breakdown.
   *
   * @returns {Promise<Object>} {
   *   total, submitted, under_review, resolved, dismissed,
   *   high_priority_open, filed_by_clients, filed_by_providers
   * }
   */
  async getReportSummary() {
    const res = await apiClient.get("/reports/summary");
    return res.data;
  },

  /**
   * Get a single report by ID.
   * @param {number} reportId
   * @returns {Promise<Object>}
   */
  async getReport(reportId) {
    const res = await apiClient.get(`/reports/${reportId}`);
    return res.data;
  },

  /**
   * Update the status of a report.
   * @param {number} reportId
   * @param {string} newStatus
   * @returns {Promise<Object>}
   */
  async updateStatus(reportId, newStatus) {
    const res = await apiClient.patch(`/reports/${reportId}/status`, {
      status: newStatus,
    });
    return res.data;
  },

  /**
   * Update the priority of a report.
   * @param {number} reportId
   * @param {string} priority — "High"|"Medium"|"Low"
   * @returns {Promise<Object>}
   */
  async updatePriority(reportId, priority) {
    const res = await apiClient.patch(`/reports/${reportId}/priority`, {
      priority,
    });
    return res.data;
  },

  /**
   * Mark a report as resolved with a mandatory resolution note.
   * @param {number} reportId
   * @param {string} resolutionNote
   * @returns {Promise<Object>}
   */
  async resolveReport(reportId, resolutionNote) {
    const res = await apiClient.patch(`/reports/${reportId}/resolve`, {
      resolution_note: resolutionNote,
    });
    return res.data;
  },

  /**
   * Dismiss a report as unfounded with a mandatory reason.
   * @param {number} reportId
   * @param {string} resolutionNote
   * @returns {Promise<Object>}
   */
  async dismissReport(reportId, resolutionNote) {
    const res = await apiClient.patch(`/reports/${reportId}/dismiss`, {
      resolution_note: resolutionNote,
    });
    return res.data;
  },

  // ─────────────────────────────────────────────
  // LEGACY - Keep for backward compatibility
  // ─────────────────────────────────────────────

  /**
   * @deprecated Use createOrUpdateReport instead
   */
  async createReport(payload) {
    return this.createOrUpdateReport(payload);
  },
};

export default reportService;