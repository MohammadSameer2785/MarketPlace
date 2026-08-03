import axios from "axios";

// In production, must set VITE_API_URL environment variable
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === "development" ? "http://localhost:5002" : "https://arovastore.onrender.com");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
