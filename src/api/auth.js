import api from "./api";

export const login = async (username, password) => {
  const { data } = await api.post("/api/auth/login/", {
    username,
    password,
  });

  localStorage.setItem("access_token", data.access);
  localStorage.setItem("refresh_token", data.refresh);

  return data;
};

export const register = async (userData) => {
  return await api.post("/api/auth/register/", userData);
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
};