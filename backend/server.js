// Node.js built-ins
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Third-party packages
import morgan from "morgan";

// Local imports
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { APP_CONFIG } from "./config/config.js";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5000",
  "http://localhost:5173", // Vite default port
  "chrome-extension://pohndemhgmcfnkgogpddgfghmmhcmnpf", // Chrome extension
  "chrome-extension://*", // Allow any Chrome extension (for development)
];

// Middleware setup
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Health check endpoints
app.get("/", (req, res) => {
  res.json({
    message: "Job Tracker API is running!",
    version: "1.0.0",
    environment: APP_CONFIG.SERVER.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: APP_CONFIG.SERVER.NODE_ENV,
  });
});

// API routes
app.use("/api/v1", routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const PORT = APP_CONFIG.SERVER.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${APP_CONFIG.SERVER.NODE_ENV}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Allowed origins: ${allowedOrigins.join(", ")}`);
});
