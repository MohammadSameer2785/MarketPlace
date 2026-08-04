import axios from "axios";

// Backend URL: https://arovastore.onrender.com
// In production, VITE_API_URL should be set in Vercel environment variables
// If not set, default to the Render backend URL
const BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? "http://localhost:5002" : "https://arovastore.onrender.com");

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
