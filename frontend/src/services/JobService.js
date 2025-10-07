import { createAuthHeaders } from "../utils/authUtils.js";
import { apiRequest, handleBlobResponse } from "../utils/apiUtils.js";
import { API_CONFIG } from "../constants/constants.js";

const API_BASE_URL = API_CONFIG.BASE_URL;

export const extractJobDetails = async (jobDescription) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/jobs/extract-job-details`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ jobDescription }),
      },
      "Failed to extract job details"
    );

    return response.data;
  } catch (error) {
    throw new Error(`Error extracting job details: ${error.message}`);
  }
};

export const generateResume = async (
  resumeText,
  jobDescription,
  comparisonResult,
  resumeFileName
) => {
  try {
    // Validate input parameters
    if (
      !resumeText ||
      typeof resumeText !== "string" ||
      resumeText.trim() === ""
    ) {
      throw new Error("Resume text is required and must be a non-empty string");
    }

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      jobDescription.trim() === ""
    ) {
      throw new Error(
        "Job description is required and must be a non-empty string"
      );
    }

    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/generate-ats-resume`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeText,
          jobDescription,
          comparisonResult,
          resumeFileName,
        }),
      },
      "Failed to generate resume"
    );

    // Log the response structure for debugging
    console.log("Generate resume response structure:", {
      hasData: !!response.data,
      dataType: typeof response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      rawResponse: response.data,
    });

    // Return the response data, or the whole response if no data property
    return response.data;
  } catch (error) {
    console.error("Generate resume error details:", {
      message: error.message,
      stack: error.stack,
      resumeTextLength: resumeText?.length,
      jobDescriptionLength: jobDescription?.length,
      comparisonResultKeys: comparisonResult
        ? Object.keys(comparisonResult)
        : [],
    });
    throw new Error(`Error generating resume: ${error.message}`);
  }
};

export const downloadResume = async (resumeData, format = "docx") => {
  try {
    const headers = await createAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/resume/download-resume`, {
      method: "POST",
      headers,
      body: JSON.stringify({ resumeData, format }),
    });

    return await handleBlobResponse(response, "Failed to download resume");
  } catch (error) {
    throw new Error(`Error downloading resume: ${error.message}`);
  }
};

export const downloadResumePDF = async (resumeData, jobData = null) => {
  try {
    const headers = await createAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/resume/download-resume`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        resumeData,
        jobData,
      }),
    });

    return await handleBlobResponse(response, "Failed to download PDF resume");
  } catch (error) {
    throw new Error(`Error downloading PDF resume: ${error.message}`);
  }
};

import { createFormDataHeaders } from "../utils/authUtils.js";

export const uploadResumeFile = async (file, jobDescription) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription || "");

    const headers = await createFormDataHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/upload-resume`,
      {
        method: "POST",
        headers,
        body: formData,
      },
      "Failed to upload resume"
    );

    return {
      analysisResult: response.data.analysisResult,
      resumeText: response.data.resumeText,
      resumeInfo: response.data.resumeInfo,
      message: response.message,
    };
  } catch (error) {
    throw new Error(`Error uploading resume: ${error.message}`);
  }
};

// New function to upload resume file without analysis
export const uploadResumeFileOnly = async (file) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const headers = await createFormDataHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/upload-resume-only`,
      {
        method: "POST",
        headers,
        body: formData,
      },
      "Failed to upload resume"
    );

    return {
      resumeId: response.data.resumeId,
      resumeInfo: response.data.resumeInfo,
      message: response.message,
    };
  } catch (error) {
    throw new Error(`Error uploading resume: ${error.message}`);
  }
};

// New function to analyze uploaded resume
export const analyzeResume = async (resumeId, jobDescription) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/analyze-resume`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeId,
          jobDescription,
        }),
      },
      "Failed to analyze resume"
    );

    return {
      analysisResult: response.data.analysisResult,
      resumeText: response.data.resumeText,
      message: response.message,
    };
  } catch (error) {
    throw new Error(`Error analyzing resume: ${error.message}`);
  }
};

export const saveResumeToGoogleDrive = async (
  resumeText,
  filename,
  googleToken,
  format = "docx"
) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/save-to-drive`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          resumeText,
          filename,
          googleToken,
          format,
        }),
      },
      "Failed to save resume to Google Drive"
    );

    return {
      fileId: response.data.fileId,
      fileUrl: response.data.fileUrl,
      message: response.message,
    };
  } catch (error) {
    throw new Error(`Error saving resume to Google Drive: ${error.message}`);
  }
};

export const cleanupTemporaryResume = async (resumeId, resumeFileName) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}/resume/cleanup`,
      {
        method: "DELETE",
        headers,
        body: JSON.stringify({
          resumeId,
          resumeFileName,
        }),
      },
      "Failed to cleanup temporary resume"
    );

    return {
      message: response.message,
    };
  } catch (error) {
    throw new Error(`Error cleaning up temporary resume: ${error.message}`);
  }
};

// ============================================================================
// NEW LaTeX TEMPLATE FUNCTIONS
// ============================================================================

/**
 * Generate HTML preview using LaTeX template system
 * @param {string} resumeData - Resume text or structured data
 * @returns {Promise<string>} HTML content for preview
 */
export const generateHTMLPreview = async (resumeData) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.RESUME.PREVIEW_HTML}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ resumeData }),
      },
      "Failed to generate HTML preview"
    );

    return response.data.html;
  } catch (error) {
    throw new Error(`Error generating HTML preview: ${error.message}`);
  }
};

/**
 * Get structured resume data using LaTeX parser
 * @param {string} resumeData - Resume text to parse
 * @returns {Promise<Object>} Structured resume data
 */
export const getStructuredResumeData = async (resumeData) => {
  try {
    const headers = await createAuthHeaders();

    const response = await apiRequest(
      `${API_BASE_URL}${API_CONFIG.ENDPOINTS.RESUME.STRUCTURED_DATA}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ resumeData }),
      },
      "Failed to get structured resume data"
    );

    return response.data.structuredData;
  } catch (error) {
    throw new Error(`Error getting structured resume data: ${error.message}`);
  }
};

/**
 * Enhanced download function using LaTeX template system
 * @param {string} resumeData - Resume text or structured data
 * @param {string} format - "pdf" or "docx"
 * @returns {Promise<Blob>} File blob for download
 */
export const downloadResumeWithLatex = async (resumeData, format = "docx") => {
  try {
    const headers = await createAuthHeaders();

    const response = await fetch(`${API_BASE_URL}/resume/download-resume`, {
      method: "POST",
      headers,
      body: JSON.stringify({ resumeData, format }),
    });

    return await handleBlobResponse(
      response,
      "Failed to download resume with LaTeX template"
    );
  } catch (error) {
    throw new Error(`Error downloading resume with LaTeX: ${error.message}`);
  }
};

/**
 * Generate and preview structured resume data
 * @param {string} resumeText - Raw resume text from Gemini
 * @returns {Promise<Object>} Contains HTML preview and structured data
 */
export const processResumeWithLatex = async (resumeText) => {
  try {
    const [htmlPreview, structuredData] = await Promise.all([
      generateHTMLPreview(resumeText),
      getStructuredResumeData(resumeText),
    ]);

    return {
      htmlPreview,
      structuredData,
      originalText: resumeText,
    };
  } catch (error) {
    throw new Error(`Error processing resume with LaTeX: ${error.message}`);
  }
};
