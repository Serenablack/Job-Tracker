import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";

dotenv.config();

// Main APP_CONFIG object that matches the expected structure
export const APP_CONFIG = {
  SERVER: {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
  },
  UPLOAD: {
    DEST: "uploads/",
    LIMITS: { fileSize: 5 * 1024 * 1024 },
    ALLOWED_MIME_TYPES: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  },
  GOOGLE: {
    SCOPES: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
    CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH || "credentials.json",
    SHEET_ID: process.env.SHEET_ID,
  },
  AI: {
    API_KEY: process.env.GOOGLE_API_KEY,
    MODEL: "gemini-1.5-flash-002",
  },
};

export function getAuth() {
  const credentials = JSON.parse(
    fs.readFileSync(APP_CONFIG.GOOGLE.CREDENTIALS_PATH, "utf8")
  );
  const { client_email, private_key } = credentials;
  return new google.auth.JWT(
    client_email,
    null,
    private_key,
    APP_CONFIG.GOOGLE.SCOPES
  );
}

export function getUserAuth(token) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return oauth2Client;
}
