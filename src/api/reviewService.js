import axios from "axios";

const API_URL = "/api/reviews/";

// Create a new review
const createReview = async (reviewData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, reviewData, config);
  return response.data;
};

// Get all reviews for a product
const getReviewsByProductId = async (productId) => {
  const response = await axios.get(`${API_URL}product/${productId}`);
  return response.data;
};

// Get a review by ID
const getReviewById = async (reviewId) => {
  const response = await axios.get(`${API_URL}${reviewId}`);
  return response.data;
};

// Update a review
const updateReview = async (reviewId, reviewData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}${reviewId}`, reviewData, config) ;
  return response.data;
};

// Delete a review
const deleteReview = async (reviewId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(`${API_URL}${reviewId}`, config);
  return response.data;
};

const reviewService = {
  createReview,
  getReviewsByProductId,
  getReviewById,
  updateReview,
  deleteReview,
};

export default reviewService;