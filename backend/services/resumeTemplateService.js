import PDFDocument from "pdfkit";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

export const ResumeTemplateService = {
  generateResume: async (resumeData) => {
    try {
      const parsedData = ResumeTemplateService.parseResumeData(resumeData);
      return await ResumeTemplateService.generateCleanTemplate(parsedData);
    } catch (error) {
      console.error("Error generating resume:", error);
      throw error;
    }
  },

  parseResumeData: (resumeData) => {
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

    return ResumeTemplateService.extractStructuredData(resumeText);
  },

  extractStructuredData: (resumeText) => {
    const lines = resumeText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const sections = {};
    let currentSection = null;
    let personalInfo = {};

    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex =
      /(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
    const githubRegex = /github\.com\/[\w-]+/i;
    const websiteRegex = /https?:\/\/[\w.-]+/i;

    for (let i = 0; i < Math.min(15, lines.length); i++) {
      const line = lines[i];

      if (
        i === 0 &&
        !ResumeTemplateService.isSection(line) &&
        !emailRegex.test(line) &&
        !phoneRegex.test(line)
      ) {
        personalInfo.name = line;
      } else if (emailRegex.test(line)) {
        personalInfo.email = line.match(emailRegex)[0];
      } else if (phoneRegex.test(line)) {
        personalInfo.phone = line.match(phoneRegex)[0];
      } else if (linkedinRegex.test(line)) {
        personalInfo.linkedin = line;
      } else if (githubRegex.test(line)) {
        personalInfo.github = line;
      } else if (
        websiteRegex.test(line) &&
        !line.includes("linkedin") &&
        !line.includes("github")
      ) {
        personalInfo.website = line;
      }
    }

    // Process all lines to extract sections
    for (const line of lines) {
      if (ResumeTemplateService.isSection(line)) {
        currentSection = ResumeTemplateService.normalizeSectionName(line);
        sections[currentSection] = [];
      } else if (currentSection && line.length > 0) {
        sections[currentSection].push(line);
      }
    }

    return {
      personalInfo,
      sections,
      rawText: resumeText,
    };
  },

  isSection: (line) => {
    const sectionKeywords = [
      "summary",
      "objective",
      "experience",
      "education",
      "skills",
      "certifications",
      "projects",
      "achievements",
      "awards",
      "publications",
      "languages",
      "interests",
      "references",
      "professional summary",
      "work experience",
      "technical skills",
      "core competencies",
      "professional experience",
      "employment history",
      "academic background",
      "qualifications",
      "competencies",
      "expertise",
      "proficiencies",
      "capabilities",
      "strengths",
      "background",
      "profile",
      "overview",
      "highlights",
    ];

    const normalizedLine = line.toLowerCase().trim();
    return sectionKeywords.some((keyword) => normalizedLine.includes(keyword));
  },

  normalizeSectionName: (line) => {
    const normalized = line.toLowerCase().trim();
    const sectionMappings = {
      "professional summary": "summary",
      summary: "summary",
      objective: "summary",
      "work experience": "experience",
      "professional experience": "experience",
      "employment history": "experience",
      experience: "experience",
      education: "education",
      "academic background": "education",
      "technical skills": "skills",
      "core competencies": "skills",
      competencies: "skills",
      expertise: "skills",
      proficiencies: "skills",
      capabilities: "skills",
      strengths: "skills",
      skills: "skills",
      certifications: "certifications",
      projects: "projects",
      achievements: "achievements",
      awards: "achievements",
      publications: "publications",
      languages: "languages",
      interests: "interests",
      references: "references",
      background: "summary",
      profile: "summary",
      overview: "summary",
      highlights: "achievements",
    };

    for (const [key, value] of Object.entries(sectionMappings)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return "other";
  },

  generateDOCX: async (resumeData) => {
    try {
      const parsedData = ResumeTemplateService.parseResumeData(resumeData);
      const docxContent = ResumeTemplateService.generateDOCXContent(parsedData);
      return await Packer.toBuffer(docxContent);
    } catch (error) {
      console.error("Error generating professional DOCX:", error);
      throw error;
    }
  },

  generateDOCXContent: (data) => {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Header with name and contact info
            new Paragraph({
              children: [
                new TextRun({
                  text: data.personalInfo.name || "Professional Resume",
                  size: 32,
                  bold: true,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            // Contact information
            new Paragraph({
              children: [
                new TextRun({
                  text: [
                    data.personalInfo.email,
                    data.personalInfo.phone,
                    data.personalInfo.linkedin,
                    data.personalInfo.github,
                  ]
                    .filter(Boolean)
                    .join(" | "),
                  size: 20,
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 600 },
            }),
            // Summary section
            ...(data.sections.summary
              ? ResumeTemplateService.generateSectionContent(
                  "Professional Summary",
                  data.sections.summary
                )
              : []),
            // Experience section
            ...(data.sections.experience
              ? ResumeTemplateService.generateExperienceSection(
                  "Professional Experience",
                  data.sections.experience
                )
              : []),
            // Skills section
            ...(data.sections.skills
              ? ResumeTemplateService.generateSectionContent(
                  "Skills",
                  data.sections.skills
                )
              : []),
            // Education section
            ...(data.sections.education
              ? ResumeTemplateService.generateSectionContent(
                  "Education",
                  data.sections.education
                )
              : []),
            // Other sections
            ...Object.entries(data.sections)
              .filter(
                ([key]) =>
                  !["summary", "experience", "skills", "education"].includes(
                    key
                  )
              )
              .flatMap(([key, content]) =>
                ResumeTemplateService.generateSectionContent(key, content)
              ),
          ],
        },
      ],
    });

    return doc;
  },

  generateSectionContent: (title, content) => {
    const children = [
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            size: 24,
            bold: true,
            color: "2E5AA0",
          }),
        ],
        spacing: { before: 400, after: 200 },
      }),
    ];

    if (Array.isArray(content)) {
      content.forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    } else if (typeof content === "string") {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: content,
              size: 20,
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    return children;
  },

  generateExperienceSection: (title, experienceItems) => {
    const children = [
      new Paragraph({
        children: [
          new TextRun({
            text: title.toUpperCase(),
            size: 24,
            bold: true,
            color: "2E5AA0",
          }),
        ],
        spacing: { before: 400, after: 200 },
      }),
    ];

    if (Array.isArray(experienceItems)) {
      experienceItems.forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${item}`,
                size: 20,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      });
    }

    return children;
  },

  // Template generation methods
  generateCleanTemplate: async (data) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    // Header
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text(data.personalInfo.name || "Professional Resume", {
        align: "center",
      });

    // Contact info
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.linkedin,
      data.personalInfo.github,
    ]
      .filter(Boolean)
      .join(" | ");

    doc
      .fontSize(12)
      .font("Helvetica")
      .text(contactInfo, { align: "center" })
      .moveDown(2);

    // Sections
    for (const [sectionName, content] of Object.entries(data.sections)) {
      if (content && content.length > 0) {
        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .text(sectionName.toUpperCase())
          .moveDown(0.5);

        content.forEach((item) => {
          doc.fontSize(12).font("Helvetica").text(`• ${item}`);
        });

        doc.moveDown(1);
      }
    }

    doc.end();
    return new Promise((resolve) => {
      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
    });
  },
};
