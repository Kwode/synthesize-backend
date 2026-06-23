import axios from "axios";

// Helper to find out which API endpoint we should target
export const getApiBaseUrl = (): string => {
  const mode = localStorage.getItem("api_mode") || "sandbox";
  return mode === "live" ? "http://localhost:8000" : "";
};

// Create axios instance
const api = axios.create({
  // BaseURL will be set dynamically inside the request interceptor to allow on-the-fly toggling
});

// Request interceptor to attach bearer token and current Base URL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthorized (401) errors or network issues
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_email");
      
      // Dispatch custom event to let React App refresh state immediately
      window.dispatchEvent(new Event("auth_unauthorized"));
      
      // Redirect to login safely if not there
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
