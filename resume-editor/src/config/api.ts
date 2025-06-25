// API configuration for different environments
const getApiUrl = (): string => {
  // In production (Docker), use the API_URL environment variable
  if (
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_API_URL
  ) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // For development, use localhost
  return "http://localhost:8000";
};

export const API_BASE_URL = getApiUrl();

// Helper function for making API calls with the correct base URL
export const apiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};
