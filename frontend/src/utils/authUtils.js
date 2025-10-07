import { chromeStorageService } from "../services/chromeStorageService.js";

// Get Google OAuth token from storage
export const getGoogleToken = async () => {
  try {
    const data = await chromeStorageService.get(["googleToken"]);
    return data.googleToken || null;
  } catch (error) {
    console.error("Error getting Google token:", error);
    return null;
  }
};

// Store Google OAuth token in storage
export const storeGoogleToken = async (token) => {
  try {
    await chromeStorageService.set({ googleToken: token });
  } catch (error) {
    console.error("Error storing Google token:", error);
  }
};

// Remove Google OAuth token from storage
export const removeGoogleToken = async () => {
  try {
    await chromeStorageService.remove(["googleToken"]);
  } catch (error) {
    console.error("Error removing Google token:", error);
  }
};

// Create headers with Google OAuth token
// contentType: 'application/json' for JSON requests, null/undefined for FormData
export const createHeaders = async (
  contentType = null,
  additionalHeaders = {}
) => {
  const token = await getGoogleToken();
  const headers = {
    ...(token && { Authorization: `Bearer ${token}` }),
    ...additionalHeaders,
  };

  if (contentType) {
    headers["Content-Type"] = contentType;
  }

  return headers;
};

// Convenience function for JSON requests
export const createAuthHeaders = async (additionalHeaders = {}) => {
  return createHeaders("application/json", additionalHeaders);
};

// Convenience function for FormData requests
export const createFormDataHeaders = async () => {
  return createHeaders(null);
};
