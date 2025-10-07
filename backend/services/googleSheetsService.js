import { google } from "googleapis";
import { getAuth, getUserAuth, APP_CONFIG } from "../config/config.js";
import { getJobsFilePath } from "../utils/fileUtils.js";
import fs from "fs";

export const GoogleSheetsService = {
  auth: null,
  sheets: null,
  drive: null,

  initializeServiceAuth: () => {
    GoogleSheetsService.auth = getAuth();
    GoogleSheetsService.sheets = google.sheets({
      version: "v4",
      auth: GoogleSheetsService.auth,
    });
    GoogleSheetsService.drive = google.drive({
      version: "v3",
      auth: GoogleSheetsService.auth,
    });
  },

  initializeUserAuth: (token) => {
    GoogleSheetsService.auth = getUserAuth(token);
    GoogleSheetsService.sheets = google.sheets({
      version: "v4",
      auth: GoogleSheetsService.auth,
    });
    GoogleSheetsService.drive = google.drive({
      version: "v3",
      auth: GoogleSheetsService.auth,
    });
  },

  uploadFileToSheets: async (token) => {
    try {
      GoogleSheetsService.initializeUserAuth(token);
      const filePath = getJobsFilePath();

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`Jobs file not found at path: ${filePath}`);
      }

      const fileMetadata = {
        name: "Jobs_applied",
        parents: [],
      };

      const media = {
        mimeType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        body: fs.createReadStream(filePath),
      };

      const response = await GoogleSheetsService.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id",
      });

      const fileId = response.data.id;

      const copyResponse = await GoogleSheetsService.drive.files.copy({
        fileId: fileId,
        resource: {
          name: "Jobs_applied",
          mimeType: "application/vnd.google-apps.spreadsheet",
        },
      });

      await GoogleSheetsService.drive.files.delete({ fileId: fileId });
      const sheetId = copyResponse.data.id;

      return {
        fileId: sheetId,
        message: "File uploaded and converted to Google Sheets",
      };
    } catch (error) {
      console.error("Error uploading file to Google Drive:", error);
      throw error;
    }
  },

  addJobToSheet: async (sheetId, jobData) => {
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

      const response =
        await GoogleSheetsService.sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: "Sheet1!A1",
          valueInputOption: "USER_ENTERED",
          resource: { values },
        });

      return { message: "Job details added to Google Sheet successfully!" };
    } catch (error) {
      console.error("Error adding job to Google Sheet:", error.message);
      throw error;
    }
  },

  saveResumeToGoogleDrive: async (resumeText, fileName, jobData) => {
    try {
      GoogleSheetsService.initializeServiceAuth();

      // Create a simple text file with resume content
      const tempFilePath = `./temp_${fileName}.txt`;
      fs.writeFileSync(tempFilePath, resumeText);

      const fileMetadata = {
        name: fileName,
        parents: [],
      };

      const media = {
        mimeType: "text/plain",
        body: fs.createReadStream(tempFilePath),
      };

      const response = await GoogleSheetsService.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      // Clean up temporary file
      fs.unlinkSync(tempFilePath);

      return {
        fileId: response.data.id,
        fileUrl: response.data.webViewLink,
        message: "Resume saved to Google Drive successfully",
      };
    } catch (error) {
      console.error("Error saving resume to Google Drive:", error);
      throw error;
    }
  },

  getOrCreateResumeFolder: async () => {
    try {
      GoogleSheetsService.initializeServiceAuth();

      // Search for existing resume folder
      const response = await GoogleSheetsService.drive.files.list({
        q: "name='Resume Folder' and mimeType='application/vnd.google-apps.folder'",
        spaces: "drive",
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create new folder if it doesn't exist
      const folderMetadata = {
        name: "Resume Folder",
        mimeType: "application/vnd.google-apps.folder",
      };

      const folder = await GoogleSheetsService.drive.files.create({
        resource: folderMetadata,
        fields: "id",
      });

      return folder.data.id;
    } catch (error) {
      console.error("Error getting or creating resume folder:", error);
      throw error;
    }
  },

  addJobLegacy: async (jobData) => {
    try {
      GoogleSheetsService.initializeServiceAuth();

      const values = [
        [
          jobData.company,
          jobData.jdLink,
          jobData.salary,
          jobData.location,
          jobData.type,
          jobData.details,
          new Date().toLocaleString(),
        ],
      ];

      const response = GoogleSheetsService.sheets.spreadsheets.values.append({
        spreadsheetId: APP_CONFIG.GOOGLE.SHEET_ID,
        range: "Sheet1!A1",
        valueInputOption: "USER_ENTERED",
        resource: { values },
      });

      return { message: "Job details added to Google Sheet successfully!" };
    } catch (error) {
      console.error("Error adding job to Google Sheet:", error);
      throw error;
    }
  },
};
