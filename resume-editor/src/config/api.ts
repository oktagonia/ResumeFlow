// API configuration for different environments
const getApiUrl = (): string => {
  // Use environment override if provided (client or server)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Default to backend service URL
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

// Helper function for making API calls with the correct base URL
export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
