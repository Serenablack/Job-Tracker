import { APP_CONFIG } from "../config/config.js";

/**
 * Global error handling middleware
 * @param {Error} error - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorHandler = (error, req, res, next) => {
  console.error("Global error handler:", error);

  // Handle validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      data: "Validation failed",
    });
  }

  // Handle Google API errors
  if (error.code && error.code.startsWith("GOOGLE_API_")) {
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

    return res.status(statusCode).json({
      success: false,
      data: message,
    });
  }

  // Handle file upload errors
  if (
    error.code === "LIMIT_FILE_SIZE" ||
    error.code === "LIMIT_UNEXPECTED_FILE"
  ) {
    return res.status(400).json({
      success: false,
      data: "File upload failed",
    });
  }

  // Handle AI service errors
  if (error.message && error.message.includes("AI")) {
    return res.status(500).json({
      success: false,
      data: "AI service error",
    });
  }

  // Handle general internal server errors
  const message =
    APP_CONFIG.SERVER.NODE_ENV === "development"
      ? error.message
      : "Internal server error";

  return res.status(500).json({
    success: false,
    data: message,
  });
};

/**
 * 404 Not Found handler
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json({
    success: false,
    data: "Endpoint not found",
  });
};
