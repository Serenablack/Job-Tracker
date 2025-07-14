import PDFDocument from "pdfkit";

export class ResumeTemplateService {
  constructor() {
    this.templates = {
      clean: this.generateCleanTemplate.bind(this),
      modern: this.generateModernTemplate.bind(this),
      "ats-friendly": this.generateATSTemplate.bind(this),
      executive: this.generateExecutiveTemplate.bind(this),
    };
  }

  async generateResume(resumeData, templateType = "clean") {
    try {
      if (!this.templates[templateType]) {
        throw new Error(`Template type "${templateType}" not found`);
      }

      const parsedData = this.parseResumeData(resumeData);
      return await this.templates[templateType](parsedData);
    } catch (error) {
      console.error("Error generating resume:", error);
      throw error;
    }
  }

  parseResumeData(resumeData) {
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

    return this.extractStructuredData(resumeText);
  }

  extractStructuredData(resumeText) {
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
        !this.isSection(line) &&
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

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (this.isSection(line)) {
        currentSection = this.normalizeSectionName(line);
        sections[currentSection] = [];
      } else if (currentSection && line.trim() !== "") {
        sections[currentSection].push(line);
      }
    }

    return {
      personalInfo,
      sections,
      rawText: resumeText,
    };
  }

  isSection(line) {
    const sectionKeywords = [
      "PROFESSIONAL SUMMARY",
      "EXECUTIVE SUMMARY",
      "SUMMARY",
      "OBJECTIVE",
      "PROFILE",
      "CAREER OBJECTIVE",
      "PROFESSIONAL PROFILE",
      "EXPERIENCE",
      "WORK EXPERIENCE",
      "PROFESSIONAL EXPERIENCE",
      "EMPLOYMENT HISTORY",
      "EMPLOYMENT",
      "CAREER HISTORY",
      "EDUCATION",
      "ACADEMIC BACKGROUND",
      "ACADEMIC QUALIFICATIONS",
      "SKILLS",
      "TECHNICAL SKILLS",
      "CORE COMPETENCIES",
      "CORE SKILLS",
      "EXPERTISE",
      "TECHNICAL EXPERTISE",
      "PROJECTS",
      "KEY PROJECTS",
      "NOTABLE PROJECTS",
      "SELECTED PROJECTS",
      "CERTIFICATIONS",
      "CERTIFICATES",
      "PROFESSIONAL CERTIFICATIONS",
      "QUALIFICATIONS",
      "ACHIEVEMENTS",
      "ACCOMPLISHMENTS",
      "AWARDS",
      "HONORS",
      "ADDITIONAL INFORMATION",
      "ADDITIONAL SKILLS",
      "LANGUAGES",
      "PUBLICATIONS",
      "VOLUNTEER EXPERIENCE",
      "VOLUNTEER WORK",
    ];

    const upperLine = line.toUpperCase().trim();

    return sectionKeywords.some(
      (keyword) =>
        upperLine === keyword ||
        upperLine.startsWith(keyword + ":") ||
        upperLine.startsWith(keyword + " -") ||
        (upperLine.includes(keyword) && upperLine.length <= keyword.length + 10)
    );
  }

  normalizeSectionName(line) {
    const upperLine = line.toUpperCase().trim();

    if (
      upperLine.includes("SUMMARY") ||
      upperLine.includes("OBJECTIVE") ||
      upperLine.includes("PROFILE")
    ) {
      return "summary";
    } else if (
      upperLine.includes("EXPERIENCE") ||
      upperLine.includes("EMPLOYMENT") ||
      upperLine.includes("CAREER")
    ) {
      return "experience";
    } else if (
      upperLine.includes("EDUCATION") ||
      upperLine.includes("ACADEMIC")
    ) {
      return "education";
    } else if (
      upperLine.includes("SKILLS") ||
      upperLine.includes("COMPETENCIES") ||
      upperLine.includes("EXPERTISE")
    ) {
      return "skills";
    } else if (
      upperLine.includes("PROJECTS") ||
      upperLine.includes("KEY PROJECTS")
    ) {
      return "projects";
    } else if (
      upperLine.includes("CERTIFICATIONS") ||
      upperLine.includes("CERTIFICATES") ||
      upperLine.includes("QUALIFICATIONS")
    ) {
      return "certifications";
    } else if (
      upperLine.includes("ACHIEVEMENTS") ||
      upperLine.includes("ACCOMPLISHMENTS") ||
      upperLine.includes("AWARDS") ||
      upperLine.includes("HONORS")
    ) {
      return "achievements";
    } else if (
      upperLine.includes("LANGUAGES") ||
      upperLine.includes("LANGUAGE")
    ) {
      return "languages";
    } else if (
      upperLine.includes("PUBLICATIONS") ||
      upperLine.includes("PUBLICATION")
    ) {
      return "publications";
    } else if (
      upperLine.includes("VOLUNTEER") ||
      upperLine.includes("VOLUNTEERING")
    ) {
      return "volunteer";
    } else if (
      upperLine.includes("ADDITIONAL") ||
      upperLine.includes("OTHER")
    ) {
      return "additional";
    } else {
      return "other";
    }
  }

  // Clean, ATS-friendly template
  async generateCleanTemplate(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Colors for clean template
        const primaryColor = "#2C3E50";
        const secondaryColor = "#555555";
        const accentColor = "#2C3E50";

        // Header
        doc.fontSize(24).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text(data.personalInfo.name || "Your Name", 50, 50);

        // Contact info
        let contactY = 80;
        doc.fontSize(10).fillColor(secondaryColor).font("Helvetica");
        const contactInfo = [
          data.personalInfo.email,
          data.personalInfo.phone,
          data.personalInfo.linkedin,
          data.personalInfo.github,
        ].filter(Boolean);

        if (contactInfo.length > 0) {
          doc.text(contactInfo.join(" | "), 50, contactY);
          contactY += 20;
        }

        // Divider line
        doc
          .moveTo(50, contactY)
          .lineTo(545, contactY)
          .strokeColor(accentColor)
          .lineWidth(2)
          .stroke();

        let currentY = contactY + 20;

        // Professional Summary
        if (data.sections.summary) {
          currentY = this.addSection(
            doc,
            "PROFESSIONAL SUMMARY",
            data.sections.summary,
            currentY,
            primaryColor
          );
        }

        // Professional Experience
        if (data.sections.experience) {
          const experienceItems = this.groupExperienceItems(
            data.sections.experience
          );
          currentY = this.addExperienceSection(
            doc,
            "PROFESSIONAL EXPERIENCE",
            experienceItems,
            currentY,
            primaryColor
          );
        }

        // Technical Skills
        if (data.sections.skills) {
          currentY = this.addSection(
            doc,
            "TECHNICAL SKILLS",
            data.sections.skills,
            currentY,
            primaryColor
          );
        }

        // Education
        if (data.sections.education) {
          currentY = this.addSection(
            doc,
            "EDUCATION",
            data.sections.education,
            currentY,
            primaryColor
          );
        }

        // Certifications
        if (data.sections.certifications) {
          currentY = this.addSection(
            doc,
            "CERTIFICATIONS",
            data.sections.certifications,
            currentY,
            primaryColor
          );
        }

        // Projects
        if (data.sections.projects) {
          currentY = this.addSection(
            doc,
            "KEY PROJECTS",
            data.sections.projects,
            currentY,
            primaryColor
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Modern template with teal accent
  async generateModernTemplate(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Colors for modern template
        const primaryColor = "#00695C";
        const secondaryColor = "#004D40";
        const accentColor = "#4DB6AC";
        const lightBg = "#E8F6F3";

        // Header with background
        doc.rect(30, 30, 535, 80).fillColor(lightBg).fill();

        // Name
        doc.fontSize(26).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text(data.personalInfo.name || "Your Name", 50, 50);

        // Contact info with styled background
        let contactY = 80;
        doc.fontSize(10).fillColor(primaryColor).font("Helvetica");
        const contactInfo = [
          data.personalInfo.email,
          data.personalInfo.phone,
          data.personalInfo.linkedin,
          data.personalInfo.github,
        ].filter(Boolean);

        if (contactInfo.length > 0) {
          doc.text(contactInfo.join(" | "), 50, contactY);
        }

        let currentY = 130;

        // Professional Summary
        if (data.sections.summary) {
          currentY = this.addSection(
            doc,
            "PROFESSIONAL SUMMARY",
            data.sections.summary,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Professional Experience
        if (data.sections.experience) {
          const experienceItems = this.groupExperienceItems(
            data.sections.experience
          );
          currentY = this.addExperienceSection(
            doc,
            "PROFESSIONAL EXPERIENCE",
            experienceItems,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Technical Skills
        if (data.sections.skills) {
          currentY = this.addSection(
            doc,
            "TECHNICAL SKILLS",
            data.sections.skills,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Education
        if (data.sections.education) {
          currentY = this.addSection(
            doc,
            "EDUCATION",
            data.sections.education,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Certifications
        if (data.sections.certifications) {
          currentY = this.addSection(
            doc,
            "CERTIFICATIONS",
            data.sections.certifications,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Projects
        if (data.sections.projects) {
          currentY = this.addSection(
            doc,
            "KEY PROJECTS",
            data.sections.projects,
            currentY,
            primaryColor,
            accentColor
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // ATS-friendly template (simple and clean)
  async generateATSTemplate(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 60, bottom: 60, left: 60, right: 60 },
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Simple black text for ATS
        const textColor = "#000000";

        // Header - centered
        doc.fontSize(20).fillColor(textColor).font("Helvetica-Bold");
        const nameWidth = doc.widthOfString(
          data.personalInfo.name || "Your Name"
        );
        const centerX = (doc.page.width - nameWidth) / 2;
        doc.text(data.personalInfo.name || "Your Name", centerX, 60);

        // Contact info - centered
        let contactY = 90;
        doc.fontSize(10).fillColor(textColor).font("Helvetica");
        const contactInfo = [
          data.personalInfo.email,
          data.personalInfo.phone,
          data.personalInfo.linkedin,
          data.personalInfo.github,
        ].filter(Boolean);

        if (contactInfo.length > 0) {
          const contactText = contactInfo.join(" | ");
          const contactWidth = doc.widthOfString(contactText);
          const contactCenterX = (doc.page.width - contactWidth) / 2;
          doc.text(contactText, contactCenterX, contactY);
        }

        let currentY = 120;

        // All sections with simple formatting
        if (data.sections.summary) {
          currentY = this.addSimpleSection(
            doc,
            "PROFESSIONAL SUMMARY",
            data.sections.summary,
            currentY,
            textColor
          );
        }

        if (data.sections.experience) {
          const experienceItems = this.groupExperienceItems(
            data.sections.experience
          );
          currentY = this.addSimpleExperienceSection(
            doc,
            "PROFESSIONAL EXPERIENCE",
            experienceItems,
            currentY,
            textColor
          );
        }

        if (data.sections.skills) {
          currentY = this.addSimpleSection(
            doc,
            "TECHNICAL SKILLS",
            data.sections.skills,
            currentY,
            textColor
          );
        }

        if (data.sections.education) {
          currentY = this.addSimpleSection(
            doc,
            "EDUCATION",
            data.sections.education,
            currentY,
            textColor
          );
        }

        if (data.sections.certifications) {
          currentY = this.addSimpleSection(
            doc,
            "CERTIFICATIONS",
            data.sections.certifications,
            currentY,
            textColor
          );
        }

        if (data.sections.projects) {
          currentY = this.addSimpleSection(
            doc,
            "KEY PROJECTS",
            data.sections.projects,
            currentY,
            textColor
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Executive template
  async generateExecutiveTemplate(data) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: "A4",
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Colors for executive template
        const primaryColor = "#1A237E";
        const secondaryColor = "#3F51B5";
        const accentColor = "#3F51B5";

        // Header
        doc.fontSize(28).fillColor(primaryColor).font("Helvetica-Bold");
        doc.text(data.personalInfo.name || "Your Name", 50, 50);

        // Contact info
        let contactY = 85;
        doc.fontSize(10).fillColor("#555555").font("Helvetica");
        const contactInfo = [
          data.personalInfo.email,
          data.personalInfo.phone,
          data.personalInfo.linkedin,
          data.personalInfo.github,
        ].filter(Boolean);

        if (contactInfo.length > 0) {
          doc.text(contactInfo.join(" | "), 50, contactY);
          contactY += 20;
        }

        // Bold divider line
        doc
          .moveTo(50, contactY)
          .lineTo(545, contactY)
          .strokeColor(primaryColor)
          .lineWidth(3)
          .stroke();

        let currentY = contactY + 25;

        // Professional Summary
        if (data.sections.summary) {
          currentY = this.addSection(
            doc,
            "PROFESSIONAL SUMMARY",
            data.sections.summary,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Professional Experience
        if (data.sections.experience) {
          const experienceItems = this.groupExperienceItems(
            data.sections.experience
          );
          currentY = this.addExperienceSection(
            doc,
            "PROFESSIONAL EXPERIENCE",
            experienceItems,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Technical Skills
        if (data.sections.skills) {
          currentY = this.addSection(
            doc,
            "TECHNICAL SKILLS",
            data.sections.skills,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Education
        if (data.sections.education) {
          currentY = this.addSection(
            doc,
            "EDUCATION",
            data.sections.education,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Certifications
        if (data.sections.certifications) {
          currentY = this.addSection(
            doc,
            "CERTIFICATIONS",
            data.sections.certifications,
            currentY,
            primaryColor,
            accentColor
          );
        }

        // Projects
        if (data.sections.projects) {
          currentY = this.addSection(
            doc,
            "KEY PROJECTS",
            data.sections.projects,
            currentY,
            primaryColor,
            accentColor
          );
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Helper method to add a section
  addSection(
    doc,
    title,
    items,
    startY,
    primaryColor,
    accentColor = primaryColor
  ) {
    let currentY = startY;

    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    // Section title
    doc.fontSize(14).fillColor(primaryColor).font("Helvetica-Bold");
    doc.text(title, 50, currentY);
    currentY += 20;

    // Underline
    doc
      .moveTo(50, currentY)
      .lineTo(200, currentY)
      .strokeColor(accentColor)
      .lineWidth(2)
      .stroke();
    currentY += 15;

    // Section content
    doc.fontSize(11).fillColor("#333333").font("Helvetica");

    items.forEach((item) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 50;
      }

      const text = item.replace(/^[•\-\*]\s*/, "");
      const lines = doc.heightOfString(text, { width: 495 });

      if (
        item.startsWith("•") ||
        item.startsWith("-") ||
        item.startsWith("*")
      ) {
        doc.text(`• ${text}`, 65, currentY, { width: 480 });
      } else {
        doc.text(text, 50, currentY, { width: 495 });
      }

      currentY += lines + 5;
    });

    return currentY + 15;
  }

  // Helper method to add simple section for ATS template
  addSimpleSection(doc, title, items, startY, textColor) {
    let currentY = startY;

    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 60;
    }

    // Section title
    doc.fontSize(12).fillColor(textColor).font("Helvetica-Bold");
    doc.text(title, 60, currentY);
    currentY += 20;

    // Section content
    doc.fontSize(11).fillColor(textColor).font("Helvetica");

    items.forEach((item) => {
      if (currentY > 750) {
        doc.addPage();
        currentY = 60;
      }

      const text = item.replace(/^[•\-\*]\s*/, "");
      const lines = doc.heightOfString(text, { width: 475 });

      if (
        item.startsWith("•") ||
        item.startsWith("-") ||
        item.startsWith("*")
      ) {
        doc.text(`• ${text}`, 75, currentY, { width: 460 });
      } else {
        doc.text(text, 60, currentY, { width: 475 });
      }

      currentY += lines + 3;
    });

    return currentY + 15;
  }

  // Helper method to add experience section
  addExperienceSection(
    doc,
    title,
    experienceItems,
    startY,
    primaryColor,
    accentColor = primaryColor
  ) {
    let currentY = startY;

    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 50;
    }

    // Section title
    doc.fontSize(14).fillColor(primaryColor).font("Helvetica-Bold");
    doc.text(title, 50, currentY);
    currentY += 20;

    // Underline
    doc
      .moveTo(50, currentY)
      .lineTo(200, currentY)
      .strokeColor(accentColor)
      .lineWidth(2)
      .stroke();
    currentY += 15;

    // Experience items
    experienceItems.forEach((exp) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }

      // Job title
      doc.fontSize(12).fillColor(primaryColor).font("Helvetica-Bold");
      doc.text(exp.title, 50, currentY);
      currentY += 15;

      // Company
      if (exp.company) {
        doc.fontSize(11).fillColor("#555555").font("Helvetica-Bold");
        doc.text(exp.company, 50, currentY);
        currentY += 12;
      }

      // Duration
      if (exp.duration) {
        doc.fontSize(10).fillColor("#777777").font("Helvetica-Oblique");
        doc.text(exp.duration, 50, currentY);
        currentY += 15;
      }

      // Bullet points
      doc.fontSize(11).fillColor("#333333").font("Helvetica");
      exp.bullets.forEach((bullet) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 50;
        }

        const lines = doc.heightOfString(bullet, { width: 480 });
        doc.text(`• ${bullet}`, 65, currentY, { width: 480 });
        currentY += lines + 3;
      });

      currentY += 10;
    });

    return currentY + 5;
  }

  // Helper method to add simple experience section for ATS template
  addSimpleExperienceSection(doc, title, experienceItems, startY, textColor) {
    let currentY = startY;

    // Check if we need a new page
    if (currentY > 700) {
      doc.addPage();
      currentY = 60;
    }

    // Section title
    doc.fontSize(12).fillColor(textColor).font("Helvetica-Bold");
    doc.text(title, 60, currentY);
    currentY += 20;

    // Experience items
    experienceItems.forEach((exp) => {
      if (currentY > 700) {
        doc.addPage();
        currentY = 60;
      }

      // Job title
      doc.fontSize(12).fillColor(textColor).font("Helvetica-Bold");
      doc.text(exp.title, 60, currentY);
      currentY += 15;

      // Company
      if (exp.company) {
        doc.fontSize(11).fillColor(textColor).font("Helvetica-Bold");
        doc.text(exp.company, 60, currentY);
        currentY += 12;
      }

      // Duration
      if (exp.duration) {
        doc.fontSize(10).fillColor(textColor).font("Helvetica");
        doc.text(exp.duration, 60, currentY);
        currentY += 15;
      }

      // Bullet points
      doc.fontSize(11).fillColor(textColor).font("Helvetica");
      exp.bullets.forEach((bullet) => {
        if (currentY > 750) {
          doc.addPage();
          currentY = 60;
        }

        const lines = doc.heightOfString(bullet, { width: 460 });
        doc.text(`• ${bullet}`, 75, currentY, { width: 460 });
        currentY += lines + 3;
      });

      currentY += 10;
    });

    return currentY + 5;
  }

  // Helper method to group experience items
  groupExperienceItems(experienceLines) {
    const groupedExperience = [];
    let currentExp = null;

    for (const line of experienceLines) {
      // Check if this line looks like a job title/company
      if (this.isJobTitle(line)) {
        // Save previous experience if exists
        if (currentExp) {
          groupedExperience.push(currentExp);
        }

        // Start new experience
        currentExp = {
          title: line,
          company: "",
          duration: "",
          bullets: [],
        };
      } else if (this.isCompany(line) && currentExp) {
        currentExp.company = line;
      } else if (this.isDateRange(line) && currentExp) {
        currentExp.duration = line;
      } else if (currentExp) {
        // Add as bullet point
        currentExp.bullets.push(line.replace(/^[•\-\*]\s*/, ""));
      }
    }

    // Add the last experience
    if (currentExp) {
      groupedExperience.push(currentExp);
    }

    return groupedExperience;
  }

  // Helper methods for parsing
  isJobTitle(line) {
    // Simple heuristic: if line contains common job title words and no bullet points
    const jobTitleWords = [
      "engineer",
      "developer",
      "manager",
      "analyst",
      "director",
      "specialist",
      "consultant",
      "coordinator",
      "lead",
      "senior",
      "junior",
    ];
    return (
      jobTitleWords.some((word) => line.toLowerCase().includes(word)) &&
      !line.startsWith("•") &&
      !line.startsWith("-")
    );
  }

  isCompany(line) {
    // Simple heuristic: if line contains company indicators
    const companyWords = [
      "inc",
      "corp",
      "llc",
      "ltd",
      "company",
      "technologies",
      "solutions",
      "systems",
      "services",
    ];
    return (
      companyWords.some((word) => line.toLowerCase().includes(word)) &&
      !line.startsWith("•") &&
      !line.startsWith("-")
    );
  }

  isDateRange(line) {
    // Check for date patterns
    return /\d{4}|\d{1,2}\/\d{4}|\d{4}\s*-\s*\d{4}|\d{4}\s*-\s*Present|Present/.test(
      line
    );
  }

  // Get available templates
  getAvailableTemplates() {
    return [
      {
        id: "clean",
        name: "Clean & Professional",
        description: "Clean, ATS-friendly design with traditional formatting",
      },
      {
        id: "modern",
        name: "Modern Teal",
        description: "Modern design with teal accents and contemporary layout",
      },
      {
        id: "ats-friendly",
        name: "ATS Optimized",
        description:
          "Minimal formatting optimized for Applicant Tracking Systems",
      },
      {
        id: "executive",
        name: "Executive",
        description:
          "Professional executive-level design with elegant typography",
      },
    ];
  }
}

export default ResumeTemplateService;
