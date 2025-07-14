// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Handle specific error types
  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      details: err.message,
    });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      details: err.message,
    });
  }

  // Handle Google API errors
  if (err.response && err.response.status) {
    const status = err.response.status;
    let message = "Google API error";

    switch (status) {
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
        message = `Google API error: ${err.message}`;
    }

    return res.status(status).json({
      error: message,
      details: err.response.data,
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal Server Error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
  });
};
