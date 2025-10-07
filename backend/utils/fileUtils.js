// Node.js built-ins
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Third-party packages
import mammoth from "mammoth";
import pdf from "pdf-parse";

// Local imports
import { APP_CONFIG } from "../config/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Gets the root path of the application
 * @returns {string} Root path
 */
export const getRootPath = () => {
  return path.join(__dirname, "..");
};

/**
 * Gets the assets directory path
 * @returns {string} Assets path
 */
export const getAssetsPath = () => {
  return path.join(getRootPath(), "assets");
};

/**
 * Gets the jobs file path
 * @returns {string} Jobs file path
 */
export const getJobsFilePath = () => {
  return path.join(getAssetsPath(), "Jobs_applied.xlsx");
};

/**
 * Extracts text content from various file types
 * @param {string} filePath - Path to the file
 * @param {string} mimeType - MIME type of the file
 * @returns {Promise<string>} Extracted text content
 */
export const extractTextFromFile = async (filePath, mimeType) => {
  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      return data.text;
    } else if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimeType === "text/plain") {
      return fs.readFileSync(filePath, "utf8");
    } else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }
  } catch (error) {
    console.error("Error extracting text from file:", error);
    throw error;
  }
};

/**
 * Cleans and parses JSON from text response
 * @param {string} text - Text containing JSON
 * @returns {Object} Parsed JSON object
 */
export const cleanAndParseJSON = (text) => {
  try {
    const cleanedText = text
      .replace(/^[^{]*/g, "")
      .replace(/[^}]*$/g, "")
      .trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        throw new Error("Failed to parse JSON response");
      }
    }
    throw new Error("No valid JSON found in response");
  }
};

/**
 * Validates file upload based on configuration
 * @param {Object} file - Uploaded file object
 * @throws {Error} If file validation fails
 */
export const validateFileUpload = (file) => {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } = APP_CONFIG.UPLOAD;

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    throw new Error(
      `Invalid file type. Only ${ALLOWED_MIME_TYPES.join(
        ", "
      )} files are allowed.`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    throw new Error(`File size too large. Maximum ${maxSizeMB}MB allowed.`);
  }
};
