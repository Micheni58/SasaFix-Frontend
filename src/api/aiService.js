// src/api/aiService.js

import apiClient from './apiClient';

const aiService = {
  /** Improve a client's rough booking request. */
  async improveJobDescription(description) {
    try {
      const response = await apiClient.post('/ai/improve-job-description', {
        description,
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        const detail = error.response.data?.detail;
        throw new Error(
          error.response.status === 503
            ? 'The AI backend could not generate a suggestion. Check the backend AI provider configuration and logs.'
            : detail || `The AI request failed with status ${error.response.status}.`
        );
      }
      throw new Error(
        'Could not reach the API server. Check that the backend is running and the API URL is correct.'
      );
    }
  },

  /** Generate a professional service description from a raw bio. */
  async generateDescription(providerId, bio) {
    try {
      const response = await apiClient.post(
        `/providers/ai/${providerId}/generate-description`,
        { bio }
      );
      return response.data;
    } catch (error) {
      console.error('AI description generation failed:', error);
      throw error.response?.data || {
        detail: 'AI service temporarily unavailable. Please try again later.',
      };
    }
  },

  /** Get price suggestions based on market data. */
  async getPriceSuggestion(providerId, serviceCategory, location) {
    try {
      const response = await apiClient.post(
        `/providers/ai/${providerId}/price-suggestion`,
        {
          service_category: serviceCategory,
          location: location,
        }
      );
      return response.data;
    } catch (error) {
      console.error('Price suggestion failed:', error);
      throw error.response?.data || {
        detail: 'Failed to get price suggestion. Please try again.',
      };
    }
  },

  /** Get review analysis and feedback. */
  async getReviewAnalysis(providerId) {
    try {
      const response = await apiClient.get(
        `/providers/ai/${providerId}/reviews/analysis`
      );
      return response.data;
    } catch (error) {
      console.error('Review analysis failed:', error);
      throw error.response?.data || {
        detail: 'Failed to analyze reviews. Please try again.',
      };
    }
  },

  /** Get market data for all services. */
  async getMarketData(serviceCategory = null, location = null) {
    try {
      const params = {};
      if (serviceCategory) params.service_category = serviceCategory;
      if (location) params.location = location;

      const response = await apiClient.get('/providers/ai/market-data', { params });
      return response.data;
    } catch (error) {
      console.error('Market data fetch failed:', error);
      throw error.response?.data || { detail: 'Market data unavailable.' };
    }
  },
};

export default aiService;