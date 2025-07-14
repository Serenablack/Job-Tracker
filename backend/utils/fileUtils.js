import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mammoth from "mammoth";
import pdf from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getRootPath() {
  return path.join(__dirname, "..");
}

export function getAssetsPath() {
  return path.join(getRootPath(), "assets");
}

export function getJobsFilePath() {
  return path.join(getAssetsPath(), "Jobs_applied.xlsx");
}

export async function extractTextFromFile(filePath, mimeType) {
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
}

export function cleanAndParseJSON(text) {
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
}

export function validateFileUpload(file) {
  if (!file) {
    throw new Error("No file uploaded");
  }

  const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error(
      "Invalid file type. Only PDF, DOCX, and TXT files are allowed."
    );
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum 5MB allowed.");
  }
}
