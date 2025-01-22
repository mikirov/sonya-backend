import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL, // Base URL from environment variables
  headers: {
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity, // Allow large responses
  maxContentLength: Infinity, // Allow large content
  httpAgent: new (require('http').Agent)({ keepAlive: true, insecureHTTPParser: true }),
  httpsAgent: new (require('https').Agent)({ keepAlive: true, insecureHTTPParser: true }),
});

// Add a method to set the Authorization token dynamically
export const setAuthToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

// Add a request interceptor (optional for logging/debugging)
axiosInstance.interceptors.request.use(
  (config) => {
    console.log("Request made with config:", config);
    return config;
  },
  (error) => {
    console.error("Error in request:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor (optional for logging/debugging)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  (error) => {
    console.error("Error in response:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;