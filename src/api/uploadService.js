// src/api/uploadService.js

import apiClient from "./apiClient";

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/uploads/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data.url;
};