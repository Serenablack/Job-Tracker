export const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header provided",
        details: "Authorization header is required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid authorization format",
        details: "Authorization header must start with 'Bearer '",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token || token.trim() === "") {
      return res.status(401).json({
        error: "No authorization token provided",
        details: "Token cannot be empty",
      });
    }

    req.userToken = token;
    next();
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error);
    return res.status(500).json({
      error: "Authentication middleware error",
      details: error.message,
    });
  }
};

// JWT Token verification middleware (for backward compatibility)
export const verifyJWTToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: "No authorization header provided",
        details: "JWT token is required",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Invalid authorization format",
        details: "Authorization header must start with 'Bearer '",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    if (!token || token.trim() === "") {
      return res.status(401).json({
        error: "No JWT token provided",
        details: "JWT token cannot be empty",
      });
    }

    req.user = { token };
    next();
  } catch (error) {
    console.error("Error in verifyJWTToken middleware:", error);
    return res.status(401).json({
      error: "Invalid JWT token",
      details: error.message,
    });
  }
};
