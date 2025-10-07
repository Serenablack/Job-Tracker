// Third-party packages
import express from "express";
import multer from "multer";

// Local imports
import { ResumeController } from "../controllers/resumeController.js";
import { APP_CONFIG } from "../config/config.js";
import { verifyJWTToken } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: APP_CONFIG.UPLOAD.DEST,
  limits: APP_CONFIG.UPLOAD.LIMITS,
});

/**
 * Upload and analyze resume - requires JWT
 * POST /api/v1/resume/upload-resume
 */
router.post(
  "/upload-resume",
  verifyJWTToken,
  upload.single("resume"),
  ResumeController.uploadResume
);

/**
 * Analyze uploaded resume - requires JWT
 * POST /api/v1/resume/analyze-resume
 */
router.post("/analyze-resume", verifyJWTToken, ResumeController.analyzeResume);

/**
 * Generate ATS-optimized resume - requires JWT
 * POST /api/v1/resume/generate-ats-resume
 */
router.post(
  "/generate-ats-resume",
  verifyJWTToken,
  ResumeController.generateATSResume
);

/**
 * Download generated resume - requires JWT
 * POST /api/v1/resume/download-resume (matches frontend expectation)
 */
router.post(
  "/download-resume",
  verifyJWTToken,
  ResumeController.downloadResumePost
);

/**
 * Download generated resume - requires JWT
 * GET /api/v1/resume/download/:resumeId/:format?
 */
router.get(
  "/download/:resumeId/:format?",
  verifyJWTToken,
  ResumeController.downloadResume
);

/**
 * Save resume to Google Drive - requires JWT
 * POST /api/v1/resume/save-to-drive
 */
router.post(
  "/save-to-drive",
  verifyJWTToken,
  ResumeController.saveResumeToGoogleDrive
);

/**
 * Cleanup temporary resume - requires JWT
 * DELETE /api/v1/resume/cleanup
 */
router.delete(
  "/cleanup",
  verifyJWTToken,
  ResumeController.cleanupTemporaryResume
);

/**
 * Get resume analysis history - requires JWT
 * GET /api/v1/resume/history
 */
router.get("/history", verifyJWTToken, ResumeController.getResumeHistory);

/**
 * Generate HTML preview using LaTeX template - requires JWT
 * POST /api/v1/resume/preview-html
 */
router.post(
  "/preview-html",
  verifyJWTToken,
  ResumeController.generateHTMLPreview
);

/**
 * Get structured resume data using LaTeX parser - requires JWT
 * POST /api/v1/resume/structured-data
 */
router.post(
  "/structured-data",
  verifyJWTToken,
  ResumeController.getStructuredResumeData
);

export default router;
