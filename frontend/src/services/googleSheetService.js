import { createAuthHeaders } from "../utils/authUtils.js";
import { apiRequest } from "../utils/apiUtils.js";
import { API_CONFIG } from "../constants/constants.js";

export const API_BASE_URL = API_CONFIG.BASE_URL;

export const googleSheetService = {
  async createOrFindSheet(googleToken) {
    try {
      if (!googleToken) {
        throw new Error("No authentication token available");
      }

      // First check if sheet exists in Drive
      const searchRes = await fetch(
        `https://www.googleapis.com/drive/v3/files?q=name='Jobs_applied' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!searchRes.ok) {
        throw new Error(`Drive API error: ${searchRes.status}`);
      }

      const searchData = await searchRes.json();

      // If sheet exists, verify it's accessible
      if (searchData?.files?.length > 0) {
        const existingSheetId = searchData.files[0].id;

        try {
          const verifyRes = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${existingSheetId}`,
            {
              headers: {
                Authorization: `Bearer ${googleToken}`,
              },
            }
          );

          if (verifyRes.ok) {
            return { sheetId: existingSheetId, isNew: false };
          }
        } catch {
          console.log("Stored sheet no longer accessible, creating new one");
        }
      }

      // Create new sheet
      const response = await apiRequest(
        `${API_BASE_URL}/jobs/upload-file`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${googleToken}`,
          },
        },
        "Backend error occurred",
        "fileId"
      );

      return { sheetId: response.data, isNew: true };
    } catch (error) {
      throw new Error(`Error managing Google Sheet: ${error.message}`);
    }
  },

  async addJobToSheet(sheetId, jobData) {
    try {
      const headers = await createAuthHeaders();

      const response = await apiRequest(
        `${API_BASE_URL}/jobs/add-to-excel/${sheetId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify(jobData),
        },
        "Failed to add to Google Sheet"
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to add job to sheet: ${error.message}`);
    }
  },
};
