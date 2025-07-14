import { AIService } from "../services/aiService.js";
import { ResumeService } from "../services/resumeService.js";
import { GoogleSheetsService } from "../services/googleSheetsService.js";

import { extractTextFromFile, validateFileUpload } from "../utils/fileUtils.js";

const aiService = new AIService();
const resumeService = new ResumeService();

export class ResumeController {
  static async uploadResume(req, res) {
    try {
      const file = req.file;
      const jobDescription = req.body.jobDescription;

      if (!file) {
        return res.status(400).json({ error: "Resume file is required." });
      }

      if (!jobDescription || !jobDescription.trim()) {
        return res.status(400).json({ error: "Job description is required." });
      }

      validateFileUpload(file);
      const resumeText = await extractTextFromFile(file.path, file.mimetype);

      const resumeId = resumeService.storeResume(file.originalname, resumeText);

      const analysisResult = await resumeService.analyzeResumeWithJob(
        resumeText,
        jobDescription
      );

      res.json({
        analysisResult,
        resumeText,
        resumeInfo: {
          fileName: file.originalname,
          resumeId: resumeId,
          wordCount: resumeText.split(/\s+/).length,
        },
      });
    } catch (error) {
      console.error("Error uploading/analyzing resume:", error);
      res.status(500).json({ error: "Failed to upload and analyze resume" });
    }
  }

  static async generateATSResume(req, res) {
    try {
      const {
        resumeText,
        resumeFileName,
        jobDescription,
        comparisonResult,
        geminiPrompt,
      } = req.body;
      if (!resumeText || !jobDescription || !comparisonResult) {
        return res.status(400).json({
          error:
            "Missing required parameters: resumeText, jobDescription, and comparisonResult are required",
        });
      }

      if (jobDescription.trim().length < 50) {
        return res.status(400).json({
          error:
            "Job description too short. Please provide a detailed job description with at least 50 characters.",
        });
      }

      if (
        !comparisonResult.missingSkills ||
        !comparisonResult.matchedSkills ||
        typeof comparisonResult.matchPercentage !== "number"
      ) {
        return res.status(400).json({
          error:
            "Invalid comparison result structure. Please ensure it contains missingSkills, matchedSkills, and matchPercentage.",
        });
      }

      const optimizationResult = await aiService.generateATSResume(
        resumeText,
        jobDescription,
        comparisonResult
      );

      if (
        !optimizationResult.optimizedResume ||
        optimizationResult.optimizedResume.trim().length < 200
      ) {
        throw new Error("Generated resume is too short or empty");
      }

      const missingSkills = comparisonResult.missingSkills || [];
      const incorporatedSkills = missingSkills.filter((skill) =>
        optimizationResult.optimizedResume
          .toLowerCase()
          .includes(skill.toLowerCase())
      );

      const incorporationRate =
        missingSkills.length > 0
          ? Math.round((incorporatedSkills.length / missingSkills.length) * 100)
          : 100;

      const optimizedResumeId = resumeService.storeOptimizedResume(
        resumeFileName || `optimized_${Date.now()}`,
        optimizationResult.optimizedResume
      );

      const response = {
        success: true,
        optimizedResumeId,
        optimizedResume: optimizationResult.optimizedResume,
        message:
          "ATS-optimized resume generated successfully using professional recruiter approach",
        analysis: {
          originalMatch: comparisonResult.matchPercentage,
          atsTarget: "95%+ Compatibility",
          estimatedNewMatch: optimizationResult.validation?.overallScore || 0,
          missingSkillsCount: missingSkills.length,
          incorporatedSkillsCount: incorporatedSkills.length,
          incorporationRate: incorporationRate,
          incorporatedSkills: incorporatedSkills,
          remainingMissingSkills:
            optimizationResult.validation?.missingSkills || [],
          atsCompatible: optimizationResult.validation?.atsCompatible || false,
          withinTolerance:
            optimizationResult.validation?.toleranceCheck || false,
        },
        optimization: {
          resumeLength: optimizationResult.optimizedResume.length,
          keywordDensity: ResumeController.calculateKeywordDensity(
            optimizationResult.optimizedResume,
            [...missingSkills, ...comparisonResult.matchedSkills]
          ),
          atsScore: ResumeController.calculateATSScore(
            optimizationResult.optimizedResume,
            jobDescription
          ),
          integrationStrategy:
            optimizationResult.processingDetails?.integrationStrategy ||
            "Professional Recruiter Approach",
        },
        validation: optimizationResult.validation || null,
      };

      if (optimizationResult.validation?.atsCompatible) {
        response.status = "EXCELLENT";
        response.message = "ATS resume achieved 95%+ compatibility target";
      } else if (optimizationResult.validation?.toleranceCheck) {
        response.status = "GOOD";
        response.message =
          "ATS resume within acceptable tolerance (1-2 missing keywords)";
      } else {
        response.status = "NEEDS_IMPROVEMENT";
        response.warning = `Resume may need further optimization. ${
          optimizationResult.validation?.stillMissingSkills || 0
        } skills still missing.`;
      }

      res.json(response);
    } catch (error) {
      console.error("Error generating ATS resume:", error);
      res.status(500).json({
        error: "Failed to generate ATS resume",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async downloadATSResume(req, res) {
    try {
      const {
        optimizedResumeText,
        originalFileName,
        templateType = "clean",
        jobData,
      } = req.body;

      if (!optimizedResumeText) {
        return res.status(400).json({
          error: "Missing required parameter: optimizedResumeText is required",
        });
      }

      const result = await resumeService.generateEnhancedPDF(
        optimizedResumeText,
        templateType,
        jobData
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.fileName}"`
      );

      res.send(result.buffer);
    } catch (error) {
      console.error("Error downloading ATS resume:", error);
      res.status(500).json({ error: "Failed to download resume" });
    }
  }

  static async getAvailableTemplates(req, res) {
    try {
      const templates = resumeService.getAvailableTemplates();
      res.json({
        success: true,
        templates: templates,
      });
    } catch (error) {
      console.error("Error getting available templates:", error);
      res.status(500).json({ error: "Failed to get available templates" });
    }
  }

  static async downloadResumeWithTemplate(req, res) {
    try {
      const {
        resumeText,
        templateType = "clean",
        jobData,
        filename,
      } = req.body;

      if (!resumeText) {
        return res.status(400).json({
          error: "Missing required parameter: resumeText is required",
        });
      }

      const result = await resumeService.generateProfessionalResume(
        resumeText,
        templateType,
        jobData
      );

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename || result.fileName}"`
      );

      res.send(result.buffer);
    } catch (error) {
      console.error("Error downloading resume with template:", error);
      res.status(500).json({
        error: "Failed to download resume with template",
        details: error.message,
      });
    }
  }

  static async generateDOCXResume(req, res) {
    try {
      const { resumeData } = req.body;
      const buffer = await resumeService.generateDOCXResume(resumeData);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=ATS_Resume.docx"
      );
      res.send(buffer);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      res.status(500).json({
        error: "Failed to generate document",
        details: error.message,
      });
    }
  }

  static async saveResumeToGoogleDrive(req, res) {
    try {
      const { resumeText, filename, googleToken } = req.body;

      if (!resumeText || !filename || !googleToken) {
        return res.status(400).json({
          error:
            "Missing required parameters: resumeText, filename, and googleToken are required",
        });
      }

      const buffer = await resumeService.generateDOCXResume(resumeText);

      const googleSheetsService = new GoogleSheetsService();
      const result = await googleSheetsService.saveResumeToGoogleDrive(
        googleToken,
        buffer,
        filename
      );

      res.json({
        success: true,
        ...result,
        message: "Resume saved to Google Drive successfully!",
      });
    } catch (error) {
      console.error("Error saving resume to Google Drive:", error);
      res.status(500).json({
        error: "Failed to save resume to Google Drive",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async cleanupTemporaryResume(req, res) {
    try {
      const { resumeId, resumeFileName } = req.body;

      let cleaned = false;

      if (resumeId) {
        cleaned = resumeService.deleteResume(resumeId);
      } else if (resumeFileName) {
        cleaned = resumeService.deleteResumeByFileName(resumeFileName);
      }

      if (cleaned) {
        res.json({
          success: true,
          message: "Temporary resume storage cleaned up successfully",
        });
      } else {
        res.status(404).json({
          error: "Resume not found in temporary storage",
        });
      }
    } catch (error) {
      console.error("Error cleaning up temporary resume:", error);
      res.status(500).json({
        error: "Failed to clean up temporary resume storage",
        details: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }

  static async generateFormattedResumeTemplate(req, res) {
    try {
      const {
        resumeText,
        jobDescription,
        comparisonResult,
        format = "markdown",
      } = req.body;

      if (!resumeText) {
        return res.status(400).json({
          error: "Missing required parameter: resumeText is required",
        });
      }

      if (!jobDescription) {
        return res.status(400).json({
          error: "Missing required parameter: jobDescription is required",
        });
      }

      if (!comparisonResult) {
        return res.status(400).json({
          error: "Missing required parameter: comparisonResult is required",
        });
      }

      const result = await aiService.generateFormattedResumeTemplate(
        resumeText,
        jobDescription,
        comparisonResult,
        format
      );

      res.json({
        success: true,
        formattedResume: result.formattedResume,
        format: result.format,
        message: result.message,
      });
    } catch (error) {
      console.error("Error generating formatted resume template:", error);
      res.status(500).json({
        error: "Failed to generate formatted resume template",
        details: error.message,
      });
    }
  }
}
