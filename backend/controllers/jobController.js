import { AIService } from "../services/aiService.js";
import { GoogleSheetsService } from "../services/googleSheetsService.js";
import { google } from "googleapis";
import { getUserAuth, getValidUserAuth } from "../config/config.js";

const aiService = AIService;
const googleSheetsService = GoogleSheetsService;

const extractJobDetails = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const jobDetails = await aiService.extractJobDetails(jobDescription);
    res.json({
      success: true,
      data: jobDetails,
      message: "Job details extracted successfully",
    });
  } catch (error) {
    console.error("Error extracting job details:", error);
    res.status(500).json({
      success: false,
      data: "GeminiAI extraction failed",
      message: error.message,
    });
  }
};

const compareResumeWithJob = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;
    const comparison = await aiService.compareResumeWithJob(
      resumeText,
      jobDescription
    );
    res.json({
      success: true,
      data: comparison,
      message: "Resume comparison completed successfully",
    });
  } catch (error) {
    console.error("Error comparing resume with job:", error);
    res.status(500).json({
      success: false,
      data: "Resume comparison failed",
      message: error.message,
    });
  }
};

// New endpoint for uploading file to sheets (matches frontend expectation)
const uploadFileToSheets = async (req, res) => {
  try {
    const token = req.userToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        data: "No authorization token provided",
        message: "Authentication required",
      });
    }

    const result = await googleSheetsService.uploadFileToSheets(token);
    res.json({
      success: true,
      data: result.fileId,
      message: result.message,
    });
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    res.status(500).json({
      success: false,
      data: "Failed to upload file to Google Drive",
      message: error.message,
    });
  }
};

// New endpoint for adding job to specific sheet (matches frontend expectation)
const addJobToSheet = async (req, res) => {
  try {
    const { sheetId } = req.params;
    const jobData = req.body;
    const token = req.userToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        data: "No authorization token provided",
        message: "Authentication required",
      });
    }

    if (!sheetId) {
      return res.status(400).json({
        success: false,
        data: "Sheet ID is required",
        message: "Sheet ID is missing",
      });
    }

    // Validate required job data
    if (!jobData.company || !jobData.title) {
      return res.status(400).json({
        success: false,
        data: "Company and title are required",
        message: "Company and job title are required fields",
      });
    }

    // Use enhanced auth with token validation and refresh
    let auth, newTokens;
    try {
      const authResult = await getValidUserAuth({ access_token: token });
      auth = authResult.auth;
      newTokens = authResult.newTokens;
    } catch (authError) {
      console.error('Authentication failed:', authError);
      return res.status(401).json({
        success: false,
        data: "Invalid or expired token",
        message: "Please re-authenticate with Google",
      });
    }

    const sheets = google.sheets({ version: "v4", auth });

    const newRow = [
      jobData.company,
      jobData.title,
      jobData.salary || "",
      jobData.location || "",
      jobData.type || "",
      jobData.experience || "",
      jobData.workModel || "",
      jobData.education || "",
      new Date().toLocaleString(),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [newRow],
      },
    });

    const responseData = { jobAdded: true };
    
    // Include new tokens if they were refreshed
    if (newTokens) {
      responseData.newTokens = newTokens;
    }

    res.status(200).json({
      success: true,
      data: responseData,
      message: "Job added to sheet successfully!",
    });
  } catch (error) {
    console.error("Error adding job to sheet:", error);

    // Handle specific Google Sheets API errors
    if (error.code === 404) {
      return res.status(404).json({
        success: false,
        data: "Sheet not found",
        message:
          "The specified Google Sheet was not found or you don't have access to it",
      });
    }

    if (error.code === 401 || error.status === 401) {
      return res.status(401).json({
        success: false,
        data: "Authentication failed",
        message: "Your Google authentication has expired. Please sign in again.",
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        success: false,
        data: "Access denied",
        message: "You don't have permission to access this Google Sheet",
      });
    }

    res.status(500).json({
      success: false,
      data: "Failed to add job to sheet",
      message: error.message || "An unexpected error occurred",
    });
  }
};

// Export JobController object with all required methods
export const JobController = {
  extractJobDetails,
  compareResumeWithJob,
  addJobToSheet,
  uploadFileToSheets,
};
