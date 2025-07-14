import { google } from "googleapis";
import { getAuth, getUserAuth, GOOGLE_CONFIG } from "../config/config.js";
import { getJobsFilePath } from "../utils/fileUtils.js";
import fs from "fs";

export class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.drive = null;
  }

  initializeServiceAuth() {
    this.auth = getAuth();
    this.sheets = google.sheets({ version: "v4", auth: this.auth });
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  initializeUserAuth(token) {
    this.auth = getUserAuth(token);
    this.sheets = google.sheets({ version: "v4", auth: this.auth });
    this.drive = google.drive({ version: "v3", auth: this.auth });
  }

  async uploadFileToSheets(token) {
    try {
      this.initializeUserAuth(token);
      const filePath = getJobsFilePath();

      const fileMetadata = {
        name: "Jobs_applied",
        parents: [],
      };

      const media = {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });

      const fileId = response.data.id;

      const copyResponse = await this.drive.files.copy({
        fileId: fileId,
        resource: {
          name: "Jobs_applied",
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
      });

      await this.drive.files.delete({ fileId: fileId });

      const sheetId = copyResponse.data.id;

      return {
        fileId: sheetId,
        message: "File uploaded and converted to Google Sheets",
      };
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      throw error;
    }
  }

  async addJobToSheet(sheetId, jobData) {
    try {
      const values = [
        [
          jobData.company,
          jobData.title,
          jobData.salary,
          jobData.location,
          jobData.type,
          jobData.experience,
          jobData.workModel,
          jobData.education,
          new Date().toLocaleString(),
        ],
      ];

      const response = this.sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1!A1",
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });

      return { message: "Job details added to Google Sheet successfully!" };
    } catch (error) {
      console.error(
        "Error adding row to Google Sheet:",
        error.message,
        error.response?.data
      );
      throw error;
    }
  }

  async saveResumeToGoogleDrive(token, resumeBlob, filename) {
    try {
      this.initializeUserAuth(token);

      let folderId = await this.getOrCreateResumeFolder();

      const fileMetadata = {
        name: filename,
        parents: [folderId],
      };

      const media = {
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        body: resumeBlob,
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name, webViewLink",
      });

      return {
        fileId: response.data.id,
        filename: response.data.name,
        webViewLink: response.data.webViewLink,
        message: "Resume saved to Google Drive successfully!",
      };
    } catch (error) {
      console.error("Error saving resume to Google Drive:", error);
      throw error;
    }
  }

  async getOrCreateResumeFolder() {
    try {
      const searchResponse = await this.drive.files.list({
        q: "name='resume' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: "files(id, name)",
      });

      if (searchResponse.data.files && searchResponse.data.files.length > 0) {
        return searchResponse.data.files[0].id;
      }

      const folderMetadata = {
        name: "resume",
        mimeType: "application/vnd.google-apps.folder",
      };

      const createResponse = await this.drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      return createResponse.data.id;
    } catch (error) {
      console.error("Error getting or creating resume folder:", error);
      throw error;
    }
  }

  async addJobLegacy(jobData) {
    try {
      this.initializeServiceAuth();
      const values = [
        [
          jobData.company,
          jobData.jdLink,
          jobData.salary,
          jobData.location,
          jobData.type,
          jobData.details,
          new Date().toISOString(),
        ],
      ];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: GOOGLE_CONFIG.SHEET_ID,
        range: "Sheet1!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: { values },
      });

      return { message: "Job added to Google Sheet" };
    } catch (error) {
      console.error("Error adding job to Google Sheet:", error);
      throw error;
    }
  }
}
