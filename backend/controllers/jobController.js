import { AIService } from "../services/aiService.js";
import { GoogleSheetsService } from "../services/googleSheetsService.js";
import { google } from "googleapis";
import { getUserAuth } from "../config/config.js";

const aiService = new AIService();
const googleSheetsService = new GoogleSheetsService();

const extractJobDetails = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    const jobDetails = await aiService.extractJobDetails(jobDescription);
    res.json({ success: true, jobDetails });
  } catch (error) {
    console.error("Error extracting job details:", error);
    res.status(500).json({
      error: "GeminiAI extraction failed",
      details: error.message,
    });
  }
};

const addJobLegacy = async (req, res) => {
  try {
    const { company, jdLink, salary, location, type, details } = req.body;
    const result = await googleSheetsService.addJobLegacy({
      company,
      jdLink,
      salary,
      location,
      type,
      details,
    });
    res.json(result);
  } catch (error) {
    console.error("Error adding job to Google Sheet:", error);
    res.status(500).json({
      message: "Failed to add job to Google Sheet",
      error: error.message,
    });
  }
};

const addJobToSheet = async (req, res) => {
  const { sheetId } = req.params;
  try {
    const {
      company,
      title,
      salary,
      location,
      type,
      experience,
      workModel,
      education,
    } = req.body;

    const token = req.userToken;

    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const auth = getUserAuth(token);

    if (!sheetId) {
      return res.status(400).json({
        message: "Google Sheet ID is required in the request body.",
      });
    }

    const sheets = google.sheets({ version: "v4", auth });

    const newRow = [
      company,
      title,
      salary,
      location,
      type,
      experience,
      workModel,
      education,
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

    res.status(200).json({
      message: "Job details added to Google Sheet successfully!",
    });
  } catch (err) {
    console.error("Error adding row to Google Sheet:", err.message);
    res.status(500).json({
      message: "Failed to add job details to Google Sheet.",
      error: err.message,
    });
  }
};

const uploadFileToSheets = async (req, res) => {
  try {
    const token = req.userToken;
    if (!token) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const result = await googleSheetsService.uploadFileToSheets(token);
    res.json(result);
  } catch (error) {
    console.error("Error uploading file to Google Drive:", error);
    res.status(500).json({
      message: "Failed to upload file to Google Drive",
      error: error.message,
    });
  }
};

export { extractJobDetails, addJobLegacy, addJobToSheet, uploadFileToSheets };
