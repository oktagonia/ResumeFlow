// API configuration for different environments
const getApiUrl = (): string => {
  // Debug logging
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);

  // If NEXT_PUBLIC_API_URL is set, use it (regardless of NODE_ENV)
  if (process.env.NEXT_PUBLIC_API_URL) {
    console.log("Using configured API URL:", process.env.NEXT_PUBLIC_API_URL);
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Fallback to localhost for development
  console.log("Using development API URL: http://localhost:8000");
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

// Helper function for making API calls with the correct base URL
export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
