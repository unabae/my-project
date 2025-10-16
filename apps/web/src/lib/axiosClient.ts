import axios from "axios";

// Create an Axios instance with default configuration
export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - runs before each request is sent
axiosClient.interceptors.request.use(
  (config) => {
    // Optional: add custom headers or log requests
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    // display the config object
    console.log(config); // Logs request config for debugging
    return config;
  },
  (error) => {
    // Handle request errors here
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - handles responses and global errors
axiosClient.interceptors.response.use(
  (response) => {
    // Optional: log responses
    console.log(`[Response] ${response.status} ${response.config.url}`);
    console.log(response);
    return response;
  },
  (error) => {
    // Handle global errors here
    if (error.response) {
      console.error("Response error:", error.response);
      // You can handle specific status codes globally
      if (error.response.status === 401) {
        // e.g., redirect to login page
        console.warn("Unauthorized! Redirecting to login...");
      }
    } else {
      console.error("Network or server error:", error);
    }
    console.log("Error during response:", error);
    return Promise.reject(error);
  }
);
