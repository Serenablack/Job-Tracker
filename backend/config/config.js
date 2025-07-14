import dotenv from "dotenv";
import { google } from "googleapis";
import fs from "fs";

dotenv.config();

export const GOOGLE_CONFIG = {
  SCOPES: [
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
  ],
  CREDENTIALS_PATH: process.env.GOOGLE_CREDENTIALS_PATH || "credentials.json",
  SHEET_ID: process.env.SHEET_ID,
};

export const AI_CONFIG = {
  API_KEY: process.env.GOOGLE_API_KEY,
  MODEL: "gemini-1.5-flash",
};

export const UPLOAD_CONFIG = {
  DEST: "uploads/",
  LIMITS: { fileSize: 5 * 1024 * 1024 },
};

export const SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
};

export function getAuth() {
  const credentials = JSON.parse(
    fs.readFileSync(GOOGLE_CONFIG.CREDENTIALS_PATH, "utf8")
  );
  const { client_email, private_key } = credentials;
  return new google.auth.JWT(
    client_email,
    null,
    private_key,
    GOOGLE_CONFIG.SCOPES
  );
}

export function getUserAuth(token) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token });
  return oauth2Client;
}
