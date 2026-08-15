// src/api/aiService.js

import axios from 'axios';

// ✅ Vite environment variables (must start with VITE_)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const aiService = {
  /**
   * Generate a professional service description from a raw bio
   */
  async generateDescription(providerId, bio) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/providers/ai/${providerId}/generate-description`,
        { bio }
      );
      return response.data;
    } catch (error) {
      console.error('AI description generation failed:', error);
      throw error.response?.data || { detail: 'AI service temporarily unavailable. Please try again later.' };
    }
  },

  /**
   * Get price suggestions based on market data
   */
  async getPriceSuggestion(providerId, serviceCategory, location) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/providers/ai/${providerId}/price-suggestion`,
        {
          service_category: serviceCategory,
          location: location
        }
      );
      return response.data;
    } catch (error) {
      console.error('Price suggestion failed:', error);
      throw error.response?.data || { detail: 'Failed to get price suggestion. Please try again.' };
    }
  },

  /**
   * Get review analysis and feedback
   */
  async getReviewAnalysis(providerId) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/providers/ai/${providerId}/reviews/analysis`
      );
      return response.data;
    } catch (error) {
      console.error('Review analysis failed:', error);
      throw error.response?.data || { detail: 'Failed to analyze reviews. Please try again.' };
    }
  },

  /**
   * Get market data for all services
   */
  async getMarketData(serviceCategory = null, location = null) {
    try {
      const params = {};
      if (serviceCategory) params.service_category = serviceCategory;
      if (location) params.location = location;
      
      const response = await axios.get(
        `${API_BASE_URL}/providers/ai/market-data`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Market data fetch failed:', error);
      throw error.response?.data || { detail: 'Market data unavailable.' };
    }
  }
};

export default aiService;