import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://campusiq-fwwt.onrender.com",
});

// attach token automatically
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const loginUser = (data) => API.post("/api/auth/login", data);
export const registerUser = (data) => API.post("/api/auth/register", data);
export const syncData = (token) => API.post("/api/sync", {}, {
    headers: {
        Authorization: `Bearer ${token}`,
    }
});

export default API;