// Local imports
import { AIService } from "../services/aiService.js";
import { ResumeService } from "../services/resumeService.js";
import { GoogleSheetsService } from "../services/googleSheetsService.js";
import { extractTextFromFile, validateFileUpload } from "../utils/fileUtils.js";

const aiService = AIService;
const resumeService = ResumeService;

export const ResumeController = {
  /**
   * Upload and analyze resume with job description
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadResume: async (req, res) => {
    try {
      const file = req.file;
      const jobDescription = req.body.jobDescription;

      if (!file) {
        return res.status(400).json({
          success: false,
          data: "Resume file is required",
        });
      }

      if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({
          success: false,
          data: "Job description is required",
        });
      }

      validateFileUpload(file);
      const resumeText = await extractTextFromFile(file.path, file.mimetype);

      // Analyze resume with job description using AI
      const analysisResult = await AIService.compareResumeWithJob(
        resumeText,
        jobDescription
      );

      // Check if analysis failed
      if (analysisResult.error) {
        return res.status(400).json({
          success: false,
          data: analysisResult.error,
        });
      }

      const resumeId = resumeService.storeResume(file.originalname, resumeText);

      const responseData = {
        analysisResult,
        resumeText,
        resumeInfo: {
          fileName: file.originalname,
          resumeId: resumeId,
          wordCount: resumeText.split(/\s+/).length,
          validationDetails: analysisResult.resumeValidation || null,
        },
      };

      return res.status(201).json({
        success: true,
        data: responseData,
      });
    } catch (error) {
      console.error("Error uploading/analyzing resume:", error);
      return res.status(400).json({
        success: false,
        data: error.message || "File upload failed",
      });
    }
  },

  /**
   * Upload resume without analysis
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  uploadResumeOnly: async (req, res) => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          data: "Resume file is required",
        });
      }

      validateFileUpload(file);
      const resumeText = await extractTextFromFile(file.path, file.mimetype);
      const resumeId = resumeService.storeResume(file.originalname, resumeText);

      const responseData = {
        resumeId: resumeId,
        resumeInfo: {
          fileName: file.originalname,
          resumeId: resumeId,
          wordCount: resumeText.split(/\s+/).length,
        },
      };

      return res.status(201).json({
        success: true,
        data: responseData,
        message: "Resume uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading resume:", error);
      return res.status(400).json({
        success: false,
        data: error.message || "File upload failed",
      });
    }
  },

  /**
   * Analyze uploaded resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  analyzeResume: async (req, res) => {
    try {
      const { resumeId, jobDescription } = req.body;

      if (!resumeId || !jobDescription) {
        return res.status(400).json({
          success: false,
          data: "Resume ID and job description are required",
        });
      }

      const resume = resumeService.getResumeByFileName(resumeId);
      if (!resume) {
        return res.status(404).json({
          success: false,
          data: "Resume not found",
        });
      }

      const analysisResult = await resumeService.analyzeResumeWithJob(
        resume.text,
        jobDescription
      );

      if (analysisResult.error) {
        return res.status(400).json({
          success: false,
          data: analysisResult.error,
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          analysisResult,
          resumeText: resume.text,
        },
        message: "Resume analyzed successfully",
      });
    } catch (error) {
      console.error("Error analyzing resume:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Resume analysis failed",
      });
    }
  },

  /**
   * Generate ATS-optimized resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateATSResume: async (req, res) => {
    try {
      const { resumeText, jobDescription, comparisonResult, resumeFileName } =
        req.body;

      if (!resumeText || !jobDescription || !comparisonResult) {
        return res.status(400).json({
          success: false,
          data: "Missing required parameters: resumeText, jobDescription, and comparisonResult are required",
        });
      }

      if (jobDescription.trim().length < 50) {
        return res.status(400).json({
          success: false,
          data: "Job description too short. Please provide a detailed job description with at least 50 characters.",
        });
      }

      // Generate optimized resume text using AI
      const optimizedResumeText = await aiService.generateATSResume(
        resumeText,
        jobDescription,
        comparisonResult
      );

      // Store the optimized resume for later use
      if (resumeFileName) {
        resumeService.storeOptimizedResume(resumeFileName, optimizedResumeText);
      }

      return res.status(200).json({
        success: true,
        data: {
          optimizedResume: optimizedResumeText,
          message: "ATS-optimized resume generated successfully",
          improvements:
            comparisonResult.recommendations ||
            comparisonResult.suggestions ||
            [],
        },
      });
    } catch (error) {
      console.error("Error generating ATS resume:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to generate ATS resume",
      });
    }
  },

  /**
   * Download resume (POST method for frontend compatibility)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  downloadResumePost: async (req, res) => {
    try {
      const { resumeData, format = "pdf" } = req.body;

      if (!resumeData) {
        return res.status(400).json({
          success: false,
          data: "Resume data is required",
        });
      }

      let fileBuffer;
      let contentType;
      let filename;

      if (format.toLowerCase() === "docx") {
        fileBuffer = await resumeService.generateDOCXResume(resumeData);
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = `ATS_Resume_${Date.now()}.docx`;
      } else {
        fileBuffer = await resumeService.generatePDFResume(resumeData);
        contentType = "application/pdf";
        filename = `ATS_Resume_${Date.now()}.pdf`;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);

      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading resume:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to download resume",
      });
    }
  },

  /**
   * Download generated resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  downloadResume: async (req, res) => {
    try {
      const { resumeId, format = "pdf" } = req.params;

      if (!resumeId) {
        return res.status(400).json({
          success: false,
          data: "Resume ID is required",
        });
      }

      const optimizedResume = resumeService.getOptimizedResume(resumeId);
      if (!optimizedResume) {
        return res.status(404).json({
          success: false,
          data: "Optimized resume not found",
        });
      }

      let fileBuffer;
      let contentType;
      let filename;

      if (format.toLowerCase() === "docx") {
        fileBuffer = await resumeService.generateDOCXResume(optimizedResume);
        contentType =
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        filename = `ATS_Resume_${resumeId}.docx`;
      } else {
        fileBuffer = await resumeService.generatePDFResume(optimizedResume);
        contentType = "application/pdf";
        filename = `ATS_Resume_${resumeId}.pdf`;
      }

      res.setHeader("Content-Type", contentType);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);

      return res.send(fileBuffer);
    } catch (error) {
      console.error("Error downloading resume:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to download resume",
      });
    }
  },

  /**
   * Get resume analysis history
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getResumeHistory: async (req, res) => {
    try {
      const resumes = resumeService.getAllResumes();
      const optimizedResumes = resumeService.getAllOptimizedResumes();

      const history = resumes.map((resume) => {
        const optimized = optimizedResumes.find(
          (opt) => opt.originalResumeId === resume.id
        );
        return {
          id: resume.id,
          fileName: resume.fileName,
          uploadDate: resume.uploadDate,
          hasOptimizedVersion: !!optimized,
          optimizedResumeId: optimized?.id || null,
        };
      });

      return res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error) {
      console.error("Error getting resume history:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to get resume history",
      });
    }
  },

  /**
   * Save resume to Google Drive
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  saveResumeToGoogleDrive: async (req, res) => {
    try {
      const { resumeText, filename, googleToken, format = "docx" } = req.body;

      if (!resumeText || !filename || !googleToken) {
        return res.status(400).json({
          success: false,
          data: "Missing required parameters: resumeText, filename, and googleToken are required",
        });
      }

      let buffer;
      if (format.toLowerCase() === "pdf") {
        buffer = await resumeService.generatePDFResume(resumeText);
      } else {
        buffer = await resumeService.generateDOCXResume(resumeText);
      }

      const googleSheetsService = new GoogleSheetsService();
      const result = await googleSheetsService.saveResumeToGoogleDrive(
        googleToken,
        buffer,
        filename
      );

      res.json({
        success: true,
        data: {
          fileId: result.fileId,
          fileUrl: result.fileUrl,
        },
        message: "Resume saved to Google Drive successfully!",
      });
    } catch (error) {
      console.error("Error saving resume to Google Drive:", error);
      res.status(500).json({
        success: false,
        data: "Failed to save resume to Google Drive",
        message: error.message,
      });
    }
  },

  /**
   * Cleanup temporary resume
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  cleanupTemporaryResume: async (req, res) => {
    try {
      const { resumeId, resumeFileName } = req.body;

      if (!resumeId) {
        return res.status(400).json({
          success: false,
          data: "Resume ID is required",
        });
      }

      // Clean up from storage
      resumeService.deleteResume(resumeId);

      return res.status(200).json({
        success: true,
        data: { cleaned: true },
        message: "Temporary resume cleaned up successfully",
      });
    } catch (error) {
      console.error("Error cleaning up temporary resume:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to cleanup temporary resume",
      });
    }
  },

  /**
   * Generate HTML preview of resume using LaTeX template
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  generateHTMLPreview: async (req, res) => {
    try {
      const { resumeData } = req.body;

      if (!resumeData) {
        return res.status(400).json({
          success: false,
          data: "Resume data is required",
        });
      }

      const htmlContent = await resumeService.generateHTMLPreview(resumeData);

      return res.status(200).json({
        success: true,
        data: {
          html: htmlContent,
        },
        message: "HTML preview generated successfully",
      });
    } catch (error) {
      console.error("Error generating HTML preview:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to generate HTML preview",
      });
    }
  },

  /**
   * Get structured resume data using LaTeX parser
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getStructuredResumeData: async (req, res) => {
    try {
      const { resumeData } = req.body;

      if (!resumeData) {
        return res.status(400).json({
          success: false,
          data: "Resume data is required",
        });
      }

      const structuredData = await resumeService.getStructuredResumeData(
        resumeData
      );

      return res.status(200).json({
        success: true,
        data: {
          structuredData,
        },
        message: "Structured resume data parsed successfully",
      });
    } catch (error) {
      console.error("Error parsing structured resume data:", error);
      return res.status(500).json({
        success: false,
        data: error.message || "Failed to parse structured resume data",
      });
    }
  },
};
