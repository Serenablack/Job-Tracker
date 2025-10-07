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
    MODEL: "gemini-2.0-flash",
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
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
  );
  
  // Set the access token
  oauth2Client.setCredentials({ access_token: token });
  
  return oauth2Client;
}

// Enhanced function to validate and refresh tokens if needed
export async function getValidUserAuth(tokenData) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback'
    );

    // If we have both access and refresh tokens
    if (tokenData.refresh_token) {
      oauth2Client.setCredentials({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expiry_date: tokenData.expiry_date
      });

      // Check if token needs refresh
      const now = new Date().getTime();
      if (tokenData.expiry_date && now >= tokenData.expiry_date) {
        console.log('Token expired, refreshing...');
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        return { auth: oauth2Client, newTokens: credentials };
      }
    } else {
      // Only access token provided
      oauth2Client.setCredentials({ access_token: tokenData.access_token || tokenData });
    }

    return { auth: oauth2Client, newTokens: null };
  } catch (error) {
    console.error('Error setting up user auth:', error);
    throw new Error('Invalid or expired authentication token');
  }
}
