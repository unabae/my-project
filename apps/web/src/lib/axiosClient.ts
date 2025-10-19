import axios from "axios";

declare module "axios" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface AxiosError<T = unknown, D = any> {
    validationErrors?: Record<string, string[]>;
    displayMessage?: string;
    /** @internal Keeps the generic parameters referenced for lint rules. */
    readonly __meta?: {
      response?: T;
      request?: D;
    };
  }
}

// Define error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiError {
  validationErrors?: Record<string, string[]>;
  message?: string;
}

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
    if (error.response) {
      const validationErrors = error.response.data.details;

      if (validationErrors?.length > 0) {
        // Transform array of errors into field-based object
        const formattedErrors: Record<string, string[]> =
          validationErrors.reduce(
            (acc: Record<string, string[]>, curr: ValidationError) => {
              if (!acc[curr.field]) {
                acc[curr.field] = [];
              }
              acc[curr.field].push(curr.message);
              return acc;
            },
            {}
          );

        // Extend the error object with formatted validation errors
        error.validationErrors = formattedErrors;
      }

      const rawServerError = error.response.data?.error;
      if (rawServerError !== undefined) {
        error.displayMessage =
          typeof rawServerError === "string"
            ? rawServerError
            : (() => {
                try {
                  return JSON.stringify(rawServerError, null, 2);
                } catch {
                  return String(rawServerError);
                }
              })();
      } else if (!error.displayMessage) {
        error.displayMessage = error.message;
      }

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
