import express from "express";
import { ResumeController } from "../controllers/resumeController.js";
import multer from "multer";
import { UPLOAD_CONFIG } from "../config/config.js";
import { verifyJWTToken } from "../middleware/auth.js";

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  dest: UPLOAD_CONFIG.DEST,
  limits: UPLOAD_CONFIG.LIMITS,
});

// Upload resume - requires JWT
router.post(
  "/upload-resume",
  verifyJWTToken,
  upload.single("resume"),
  ResumeController.uploadResume
);

// Generate ATS-optimized resume - requires JWT
router.post(
  "/generate-ats-resume",
  verifyJWTToken,
  ResumeController.generateATSResume
);

// Download ATS-optimized resume as PDF - requires JWT
router.post(
  "/download-ats-resume",
  verifyJWTToken,
  ResumeController.downloadATSResume
);

// Get available resume templates - requires JWT
router.get(
  "/templates",
  verifyJWTToken,
  ResumeController.getAvailableTemplates
);

// Download resume with specific template - requires JWT
router.post(
  "/download-with-template",
  verifyJWTToken,
  ResumeController.downloadResumeWithTemplate
);

// Generate formatted resume template (markdown/LaTeX) - requires JWT
router.post(
  "/generate-formatted-template",
  verifyJWTToken,
  ResumeController.generateFormattedResumeTemplate
);

// Generate DOCX resume (legacy method) - requires JWT
router.post(
  "/download-resume",
  verifyJWTToken,
  ResumeController.generateDOCXResume
);

// Save resume to Google Drive - requires JWT
router.post(
  "/save-to-google-drive",
  verifyJWTToken,
  ResumeController.saveResumeToGoogleDrive
);

// Clean up temporary resume storage - requires JWT
router.post(
  "/cleanup-temporary-resume",
  verifyJWTToken,
  ResumeController.cleanupTemporaryResume
);

export default router;
