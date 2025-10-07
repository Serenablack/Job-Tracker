import { AIService } from "./aiService.js";
import { ResumeTemplateService } from "./resumeTemplateService.js";
import { AutomatedResumeService } from "./automatedResumeService.js";
import { LaTeXTemplateService } from "./latexTemplateService.js";

// Initialize services
const templateService = ResumeTemplateService;
const automatedService = AutomatedResumeService;
const latexService = LaTeXTemplateService;

// In-memory storage (in production, use a proper database)
const resumes = new Map();
const optimizedResumes = new Map();

export const ResumeService = {
  storeResume: (fileName, resumeText) => {
    const resumeId = `resume_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 9)}`;
    resumes.set(fileName, {
      id: resumeId,
      fileName,
      text: resumeText,
      uploadedAt: new Date().toISOString(),
      type: "original",
    });
    return resumeId;
  },

  getResumeByFileName: (fileName) => {
    return resumes.get(fileName);
  },

  storeOptimizedResume: (originalFileName, optimizedText) => {
    const optimizedId = `optimized_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const optimizedFileName = `optimized_${originalFileName}`;

    optimizedResumes.set(originalFileName, {
      id: optimizedId,
      originalFileName,
      optimizedFileName,
      text: optimizedText,
      createdAt: new Date().toISOString(),
      type: "optimized",
    });

    return optimizedId;
  },

  getOptimizedResume: (originalFileName) => {
    return optimizedResumes.get(originalFileName);
  },

  getResumeSummary: (resumeId) => {
    for (const [fileName, resume] of resumes) {
      if (resume.id === resumeId) {
        return {
          id: resume.id,
          fileName: resume.fileName,
          type: resume.type,
          uploadedAt: resume.uploadedAt,
          wordCount: resume.text.split(/\s+/).length,
          hasOptimizedVersion: optimizedResumes.has(fileName),
        };
      }
    }

    for (const [originalFileName, optimizedResume] of optimizedResumes) {
      if (optimizedResume.id === resumeId) {
        return {
          id: optimizedResume.id,
          fileName: optimizedResume.optimizedFileName,
          originalFileName: optimizedResume.originalFileName,
          type: optimizedResume.type,
          createdAt: optimizedResume.createdAt,
          wordCount: optimizedResume.text.split(/\s+/).length,
        };
      }
    }

    return null;
  },

  generateProfessionalResume: async (resumeData, jobData = null) => {
    try {
      const fileName = ResumeService.generateFileName(jobData);

      const pdfBuffer = await templateService.generateResume(resumeData);

      return {
        buffer: pdfBuffer,
        fileName: fileName,
        type: "pdf",
      };
    } catch (error) {
      console.error("Error generating professional resume:", error);
      throw error;
    }
  },

  generateFileName: (jobData) => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const jobTitle = jobData?.title?.replace(/[^a-zA-Z0-9]/g, "_") || "resume";
    return `${jobTitle}_resume_${timestamp}.pdf`;
  },

  generateEnhancedPDF: async (optimizedResumeText, jobData = null) => {
    try {
      const fileName = ResumeService.generateFileName(jobData);
      const pdfBuffer = await templateService.generateResume({
        content: optimizedResumeText,
      });

      return {
        buffer: pdfBuffer,
        fileName: fileName,
        type: "pdf",
      };
    } catch (error) {
      console.error("Error generating enhanced PDF:", error);
      throw error;
    }
  },

  generateAutomatedPDF: async (resumeData) => {
    try {
      const fileName = `automated_resume_${Date.now()}.pdf`;
      const pdfBuffer = await automatedService.generatePDF(resumeData);

      return {
        buffer: pdfBuffer,
        fileName: fileName,
        type: "pdf",
      };
    } catch (error) {
      console.error("Error generating automated PDF:", error);
      throw error;
    }
  },

  generateAutomatedDOCX: async (resumeData) => {
    try {
      const fileName = `automated_resume_${Date.now()}.docx`;
      const docxBuffer = await automatedService.generateDOCX(resumeData);

      return {
        buffer: docxBuffer,
        fileName: fileName,
        type: "docx",
      };
    } catch (error) {
      console.error("Error generating automated DOCX:", error);
      throw error;
    }
  },

  validateATSCompatibility: async (generatedContent) => {
    try {
      // Basic ATS validation logic
      const lines = generatedContent.split("\n");
      let hasContactInfo = false;
      let hasExperience = false;
      let hasSkills = false;

      for (const line of lines) {
        const trimmedLine = line.trim().toLowerCase();
        if (trimmedLine.includes("@") || trimmedLine.includes("phone")) {
          hasContactInfo = true;
        }
        if (
          trimmedLine.includes("experience") ||
          trimmedLine.includes("work")
        ) {
          hasExperience = true;
        }
        if (
          trimmedLine.includes("skills") ||
          trimmedLine.includes("competencies")
        ) {
          hasSkills = true;
        }
      }

      return {
        isATSCompatible: hasContactInfo && hasExperience && hasSkills,
        missingSections: {
          contactInfo: !hasContactInfo,
          experience: !hasExperience,
          skills: !hasSkills,
        },
      };
    } catch (error) {
      console.error("Error in ATS validation:", error);
      return {
        isATSCompatible: false,
        error: error.message,
      };
    }
  },

  isHeader: (line) => {
    const trimmedLine = line.trim();
    return (
      trimmedLine.length > 0 &&
      trimmedLine.length < 100 &&
      !trimmedLine.includes("•") &&
      !trimmedLine.includes("-") &&
      !trimmedLine.includes(":") &&
      trimmedLine.split(" ").length <= 8
    );
  },

  isContactInfo: (line) => {
    const trimmedLine = line.trim().toLowerCase();
    return (
      trimmedLine.includes("@") ||
      trimmedLine.includes("phone") ||
      trimmedLine.includes("linkedin") ||
      trimmedLine.includes("github")
    );
  },

  isDateRange: (line) => {
    const trimmedLine = line.trim();
    const datePattern = /\d{4}/;
    return datePattern.test(trimmedLine);
  },

  deleteResume: (resumeId) => {
    for (const [fileName, resume] of resumes) {
      if (resume.id === resumeId) {
        resumes.delete(fileName);
        return true;
      }
    }

    for (const [originalFileName, optimizedResume] of optimizedResumes) {
      if (optimizedResume.id === resumeId) {
        optimizedResumes.delete(originalFileName);
        return true;
      }
    }

    return false;
  },

  deleteResumeByFileName: (fileName) => {
    if (resumes.has(fileName)) {
      resumes.delete(fileName);
      return true;
    }

    if (optimizedResumes.has(fileName)) {
      optimizedResumes.delete(fileName);
      return true;
    }

    return false;
  },

  getAllResumes: () => {
    return Array.from(resumes.values());
  },

  getAllOptimizedResumes: () => {
    return Array.from(optimizedResumes.values());
  },

  generatePDFResume: async (resumeData) => {
    try {
      // Use LaTeX template service for professional PDF generation
      const resumeText =
        typeof resumeData === "string"
          ? resumeData
          : resumeData?.text ||
            resumeData?.content ||
            JSON.stringify(resumeData);

      const result = await latexService.processResume(resumeText);
      return result.pdf;
    } catch (error) {
      console.error("Error generating PDF resume:", error);
      throw new Error("Failed to generate PDF resume");
    }
  },

  generateDOCXResume: async (resumeData) => {
    try {
      // Use LaTeX template service for professional DOCX generation
      const resumeText =
        typeof resumeData === "string"
          ? resumeData
          : resumeData?.text ||
            resumeData?.content ||
            JSON.stringify(resumeData);

      const result = await latexService.processResume(resumeText);
      return result.docx;
    } catch (error) {
      console.error("Error generating DOCX resume:", error);
      throw new Error("Failed to generate DOCX resume");
    }
  },

  // Add method to get HTML preview for frontend
  generateHTMLPreview: async (resumeData) => {
    try {
      // Use LaTeX template service for HTML preview generation
      const resumeText =
        typeof resumeData === "string"
          ? resumeData
          : resumeData?.text ||
            resumeData?.content ||
            JSON.stringify(resumeData);

      const result = await latexService.processResume(resumeText);
      return result.html;
    } catch (error) {
      console.error("Error generating HTML preview:", error);
      throw new Error("Failed to generate HTML preview");
    }
  },

  // Add method to get structured data for frontend
  getStructuredResumeData: async (resumeData) => {
    try {
      const resumeText =
        typeof resumeData === "string"
          ? resumeData
          : resumeData?.text ||
            resumeData?.content ||
            JSON.stringify(resumeData);

      const structuredData = latexService.parseResumeText(resumeText);
      return structuredData;
    } catch (error) {
      console.error("Error parsing structured resume data:", error);
      throw new Error("Failed to parse structured resume data");
    }
  },
};
