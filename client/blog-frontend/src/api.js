// src/utils/axios.js
import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add a request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Optionally, handle errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong!";
      if (error.response?.status === 401) {
      // auto logout if token expired
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    toast.error(message);
      }
    return Promise.reject(error);
  }
);

export default API;
