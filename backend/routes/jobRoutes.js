import express from "express";
import {
  extractJobDetails,
  uploadFileToSheets,
  addJobLegacy,
  addJobToSheet,
} from "../controllers/jobController.js";
import { authenticateToken, verifyJWTToken } from "../middleware/auth.js";

const router = express.Router();

// Extract job details from job description - requires JWT
router.post("/extract-job-details", verifyJWTToken, extractJobDetails);

// Upload file to Google Drive and convert to Sheets
router.get("/upload-file", authenticateToken, uploadFileToSheets);

// Add job to Google Sheet (legacy method) - requires JWT
router.post("/job", verifyJWTToken, addJobLegacy);

// Add job to specific Google Sheet - with authentication
router.post("/add-to-excel/:sheetId", authenticateToken, addJobToSheet);

export default router;
