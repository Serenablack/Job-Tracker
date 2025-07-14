import { Document, Packer, Paragraph, TextRun } from "docx";
import PDFDocument from "pdfkit";
import { AIService } from "./aiService.js";
import { ResumeTemplateService } from "./resumeTemplateService.js";

export class ResumeService {
  constructor() {
    this.resumes = new Map();
    this.optimizedResumes = new Map();
    this.templateService = new ResumeTemplateService();
  }

  storeResume(fileName, resumeText) {
    const resumeId = `resume_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    this.resumes.set(fileName, {
      id: resumeId,
      fileName,
      text: resumeText,
      uploadedAt: new Date().toISOString(),
      type: "original",
    });
    return resumeId;
  }

  getResumeByFileName(fileName) {
    return this.resumes.get(fileName);
  }

  storeOptimizedResume(originalFileName, optimizedText) {
    const optimizedId = `optimized_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const optimizedFileName = `optimized_${originalFileName}`;

    this.optimizedResumes.set(originalFileName, {
      id: optimizedId,
      originalFileName,
      optimizedFileName,
      text: optimizedText,
      createdAt: new Date().toISOString(),
      type: "optimized",
    });

    return optimizedId;
  }

  getOptimizedResume(originalFileName) {
    return this.optimizedResumes.get(originalFileName);
  }

  getResumeSummary(resumeId) {
    for (const [fileName, resume] of this.resumes) {
      if (resume.id === resumeId) {
        return {
          id: resume.id,
          fileName: resume.fileName,
          type: resume.type,
          uploadedAt: resume.uploadedAt,
          wordCount: resume.text.split(/\s+/).length,
          hasOptimizedVersion: this.optimizedResumes.has(fileName),
        };
      }
    }

    for (const [originalFileName, optimizedResume] of this.optimizedResumes) {
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
  }

  async analyzeResumeWithJob(resumeText, jobDescription) {
    const aiService = new AIService();
    return await aiService.compareResumeWithJob(resumeText, jobDescription);
  }

  async generateProfessionalResume(
    resumeData,
    templateType = "clean",
    jobData = null
  ) {
    try {
      const fileName = this.generateFileName(templateType, jobData);

      const pdfBuffer = await this.templateService.generateResume(
        resumeData,
        templateType
      );

      return {
        buffer: pdfBuffer,
        fileName: fileName,
        templateType: templateType,
      };
    } catch (error) {
      console.error("Error generating professional resume:", error);
      throw error;
    }
  }

  generateFileName(templateType, jobData) {
    const timestamp = new Date().toISOString().split("T")[0];
    let baseName = `Resume_${templateType}_${timestamp}`;

    if (jobData) {
      const companyName =
        jobData.company ||
        jobData.companyName ||
        jobData.employer ||
        jobData["Company Name"] ||
        "Company";

      const cleanCompanyName = companyName
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .substring(0, 20);

      baseName = `${cleanCompanyName}_${templateType}_Resume_${timestamp}`;
    }

    return `${baseName}.pdf`;
  }

  getAvailableTemplates() {
    return this.templateService.getAvailableTemplates();
  }

  async generateEnhancedPDF(
    optimizedResumeText,
    templateType = "clean",
    jobData = null
  ) {
    try {
      const result = await this.generateProfessionalResume(
        optimizedResumeText,
        templateType,
        jobData
      );

      return {
        buffer: result.buffer,
        fileName: result.fileName,
        templateType: result.templateType,
      };
    } catch (error) {
      console.error("Error generating enhanced PDF:", error);
      throw error;
    }
  }

  async generateDOCXResume(resumeData) {
    try {
      let resumeText;
      if (typeof resumeData === "string") {
        resumeText = resumeData;
      } else if (resumeData && typeof resumeData === "object") {
        resumeText =
          resumeData.text ||
          resumeData.content ||
          resumeData.summary ||
          JSON.stringify(resumeData);
      } else {
        throw new Error("Invalid resume data provided");
      }

      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("Resume text is empty");
      }

      const resumeLines = resumeText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const children = [];

      resumeLines.forEach((line) => {
        if (this.isHeader(line)) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  bold: true,
                  size: 28,
                }),
              ],
            })
          );
        } else if (line.startsWith("•") || line.startsWith("-")) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
            })
          );
        } else if (this.isContactInfo(line)) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
            })
          );
        } else if (this.isDateRange(line)) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 20,
                  italics: true,
                }),
              ],
            })
          );
        } else {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line,
                  size: 22,
                }),
              ],
            })
          );
        }
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      return await Packer.toBuffer(doc);
    } catch (error) {
      console.error("Error generating DOCX:", error);
      throw error;
    }
  }

  isHeader(line) {
    const headers = [
      "PROFESSIONAL SUMMARY",
      "SUMMARY",
      "OBJECTIVE",
      "CORE COMPETENCIES",
      "SKILLS",
      "TECHNICAL SKILLS",
      "PROFESSIONAL EXPERIENCE",
      "WORK EXPERIENCE",
      "EXPERIENCE",
      "EDUCATION",
      "CERTIFICATIONS",
      "PROJECTS",
      "ACHIEVEMENTS",
    ];
    return headers.some((header) => line.toUpperCase().includes(header));
  }

  isContactInfo(line) {
    return (
      /@/.test(line) ||
      /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line) ||
      line.toLowerCase().includes("linkedin") ||
      line.toLowerCase().includes("github")
    );
  }

  isDateRange(line) {
    return (
      /\d{1,2}\/\d{4}/.test(line) ||
      /\d{4}\s*-\s*\d{4}/.test(line) ||
      /\d{4}\s*-\s*Present/.test(line)
    );
  }

  deleteResume(resumeId) {
    for (const [fileName, resume] of this.resumes) {
      if (resume.id === resumeId) {
        this.resumes.delete(fileName);
        return true;
      }
    }

    for (const [originalFileName, optimizedResume] of this.optimizedResumes) {
      if (optimizedResume.id === resumeId) {
        this.optimizedResumes.delete(originalFileName);
        return true;
      }
    }

    return false;
  }

  deleteResumeByFileName(fileName) {
    const deleted = this.resumes.delete(fileName);
    const optimizedDeleted = this.optimizedResumes.delete(fileName);
    return deleted || optimizedDeleted;
  }
}
