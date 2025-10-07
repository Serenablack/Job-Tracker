// Third-party packages
import express from "express";

// Local imports
import { JobController } from "../controllers/jobController.js";
import { authenticateToken, verifyJWTToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * Extract job details from job description - requires JWT
 * POST /api/v1/jobs/extract-job-details
 */
router.post(
  "/extract-job-details",
  verifyJWTToken,
  JobController.extractJobDetails
);

/**
 * Compare resume with job description
 * POST /api/v1/jobs/compare-resume
 */
router.post(
  "/compare-resume",
  verifyJWTToken,
  JobController.compareResumeWithJob
);

/**
 * Upload file to Google Sheets (matches frontend expectation)
 * GET /api/v1/jobs/upload-file
 */
router.get("/upload-file", authenticateToken, JobController.uploadFileToSheets);

/**
 * Add job to specific sheet (matches frontend expectation)
 * POST /api/v1/jobs/add-to-excel/:sheetId
 */
router.post(
  "/add-to-excel/:sheetId",
  authenticateToken,
  JobController.addJobToSheet
);

/**
 * Legacy endpoint for adding jobs
 * POST /api/v1/jobs/add-legacy
 */

export default router;
