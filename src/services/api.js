// Base URL for your backend API
const API_URL = "http://localhost:8000/api";

// Helper function to handle responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Generic fetch wrapper with auth header
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  return handleResponse(response);
};

// Auth services
const authService = {
  register: async (userData) => {
    const data = await fetchWithAuth("/users/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  login: async (credentials) => {
    const data = await fetchWithAuth("/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  getCurrentUser: async () => {
    return fetchWithAuth("/users/me", {
      method: "GET",
    });
  },

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
  },

  isAuthenticated: () => {
    const token = localStorage.getItem("access_token");
    return !!token;
  },

  getStoredUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};

export default authService; // ← MAKE SURE THIS LINE EXISTS
