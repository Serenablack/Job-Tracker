import { APP_CONFIG } from "../config/config.js";

/**
 * Sends a standardized error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Additional error details (optional)
 */
export const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    data: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sends a standardized success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {Object} data - Response data
 * @param {string} message - Success message (optional)
 */
export const sendSuccessResponse = (res, statusCode, data, message = null) => {
  const response = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

/**
 * Handles authentication errors
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const handleAuthError = (res, message = "Authentication failed") => {
  return sendErrorResponse(res, 401, message);
};

/**
 * Handles validation errors
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {Object} details - Validation details (optional)
 */
export const handleValidationError = (res, message, details = null) => {
  return sendErrorResponse(res, 400, message, details);
};

/**
 * Handles not found errors
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 */
export const handleNotFoundError = (res, message = "Resource not found") => {
  return sendErrorResponse(res, 404, message);
};

/**
 * Handles internal server errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
export const handleInternalError = (res, error) => {
  console.error("Internal server error:", error);

  const message =
    APP_CONFIG.SERVER.NODE_ENV === "development"
      ? error.message
      : "Internal server error";

  return sendErrorResponse(res, 500, message);
};

/**
 * Handles Google API errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
export const handleGoogleAPIError = (res, error) => {
  console.error("Google API error:", error);

  let statusCode = 500;
  let message = "Google API error";

  if (error.response && error.response.status) {
    statusCode = error.response.status;

    switch (statusCode) {
      case 403:
        message =
          "Permission denied. The application may not have access to this resource.";
        break;
      case 404:
        message =
          "Resource not found. The provided ID might be incorrect or the resource was deleted.";
        break;
      case 429:
        message = "Rate limit exceeded. Please try again later.";
        break;
      default:
        message = `Google API error: ${error.message}`;
    }
  }

  return sendErrorResponse(res, statusCode, message);
};

/**
 * Handles file upload errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
export const handleFileUploadError = (res, error) => {
  console.error("File upload error:", error);

  let message = "File upload failed";
  let statusCode = 400;

  if (error.code === "LIMIT_FILE_SIZE") {
    message = "File size too large";
  } else if (error.code === "LIMIT_UNEXPECTED_FILE") {
    message = "Unexpected file field";
  } else if (error.message) {
    message = error.message;
  }

  return sendErrorResponse(res, statusCode, message);
};

/**
 * Handles AI service errors
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 */
export const handleAIError = (res, error) => {
  console.error("AI service error:", error);

  const message =
    APP_CONFIG.SERVER.NODE_ENV === "development"
      ? error.message
      : "AI service error";

  return sendErrorResponse(res, 500, message);
};
