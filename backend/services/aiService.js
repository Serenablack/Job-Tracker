import { GoogleGenerativeAI } from "@google/generative-ai";
import { AI_CONFIG } from "../config/config.js";
import { cleanAndParseJSON } from "../utils/fileUtils.js";
import DefaultJobData from "../DefaultData.js";

export class AIService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(AI_CONFIG.API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: AI_CONFIG.MODEL });
  }

  async extractJobDetails(jobDescription) {
    const defaultJob = { ...DefaultJobData };

    if (!jobDescription || jobDescription.trim().length === 0) {
      throw new Error("Job description text is required");
    }
    if (jobDescription.length > 500000) {
      throw new Error(
        "Job description too long. Maximum 500,000 characters allowed."
      );
    }

    try {
      const prompt = `You are an expert job posting analyzer for job tracking systems. Extract ALL available information from the job posting below. For any information that is not available, missing, or unclear, use "N/A" as the value.

CRITICAL: Return ONLY a valid JSON object with NO markdown formatting, code blocks, or explanatory text.

Extract these fields with exact key names:
{
  "company": "Company name or N/A",
  "title": "Exact job title or N/A",
  "salary": "Salary range/amount (e.g. $50,000-$70,000, $25/hour) or N/A",
  "location": "Full location (City, State, Country) or Remote or N/A",
  "type": "Full-time/Part-time/Contract/Internship/Temporary/Freelance or N/A",
  "description": "Brief 2-3 sentence summary of role responsibilities or N/A",
  "requirements": ["requirement1", "requirement2"] or [],
  "skills": ["technical skill1", "skill2", "skill3"] or [],
  "experience": "Required years/level (e.g. 3-5 years, Entry level, Senior) or N/A",
  "education": "Education requirements (e.g. Bachelor's degree, High school) or N/A",
  "benefits": ["benefit1", "benefit2"] or [],
  "keywords": ["important keyword1", "keyword2"] or [],
  "department": "Department/Division/Team name or N/A",
  "reportingTo": "Reports to position title or N/A",
  "workModel": "Remote/Hybrid/On-site or N/A",
  "applicationDeadline": "Application deadline date or N/A",
  "applicationUrl": "Application website URL or N/A",
  "contactEmail": "Contact email address or N/A",
  "postedDate": "When job was posted or N/A",
  "industryType": "Industry/Sector (e.g. Technology, Healthcare) or N/A",
  "companySize": "Company size (e.g. 50-100 employees, Startup) or N/A",
  "workSchedule": "Work hours/schedule (e.g. 9-5, Flexible, Shifts) or N/A",
  "travelRequired": "Travel requirements percentage/description or N/A",
  "securityClearance": "Security clearance required or N/A",
  "visaSponsorship": "Visa sponsorship availability (Yes/No/N/A) or N/A"
}

Important rules:
- Use "N/A" for any missing information
- Keep arrays empty [] if no items found
- Extract exact text when possible
- Don't make assumptions or infer information not explicitly stated
- Parse salary formats carefully (annual, hourly, ranges)

Job Posting Text:
${jobDescription}

JSON Response:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let extracted = response.text();

      return cleanAndParseJSON(extracted);
    } catch (error) {
      console.error("GeminiAI extraction failed:", error);
      throw error;
    }
  }

  async compareResumeWithJob(resumeText, jobDescription) {
    try {
      const prompt = `
You are an expert ATS (Applicant Tracking System) resume analyzer with a PhD in Human Resources and 20+ years of experience in talent acquisition.

Your task is to analyze the job description and resume following these EXACT steps:

**STEP 1: Validate Job Description**
- If the job description is missing, empty, or too short (less than 50 words), return ONLY this JSON and STOP:
{
  "error": "Job description is missing or insufficient for meaningful ATS analysis. Please provide a detailed job description with at least 50 words."
}

**STEP 2: Extract Keywords from Job Description ONLY - BE EXTREMELY STRICT**
- Extract ONLY explicit keywords, skills, technologies, tools, certifications, programming languages, frameworks, methodologies, and domain-specific terms that are LITERALLY WRITTEN in the job description text
- NEVER infer, assume, or add generic skills that are not explicitly mentioned
- NEVER add skills from the resume that are not in the job description
- Focus ONLY on: Technical skills, Software names, Programming languages, Frameworks, Certifications, Industry terms, Methodologies, Tools, Required qualifications
- Create a comprehensive list of ONLY what is explicitly stated in the job description

**STEP 3: Compare with Resume - STRICT MATCHING**
- For each keyword extracted from the job description, check if it appears in the resume text
- Use exact matching and common synonym matching (e.g., "JavaScript" matches "JS", "React.js" matches "React", "Node.js" matches "NodeJS")
- Categorize ONLY as:
  - matchedSkills: Skills from job description that are found in resume
  - missingSkills: Skills from job description that are NOT found in resume
- NEVER include skills that are only in the resume but not in the job description

**STEP 4: Generate Targeted Suggestions**
- For each missing skill from the job description, suggest which resume section it could be added to
- Provide actionable advice on how to integrate each missing skill naturally
- Calculate match percentage: (matchedSkills.length / totalExtractedKeywords.length) * 100

**STEP 5: Calculate Experience Match**
- Compare years of experience, job responsibilities, and role levels mentioned in job description vs resume
- Return percentage (0-100)

**STEP 6: Calculate ATS Scores**
- skillsMatch: Percentage of technical skills from job description found in resume
- keywordMatch: Percentage of all keywords from job description found in resume  
- overallScore: Weighted average of skillsMatch (40%), keywordMatch (30%), and experienceMatch (30%)
- atsScore: ATS compatibility score (0-100) based on keyword density and formatting
- matchPercentage: Same as overallScore for backward compatibility

**CRITICAL VALIDATION RULES:**
- matchedSkills and missingSkills must ONLY contain keywords that were explicitly mentioned in the job description
- NEVER include generic skills like "communication", "teamwork", "problem-solving" unless they are specifically mentioned in the job description
- If job description mentions "Python", only include "Python" in analysis, not related terms like "programming" unless also mentioned
- Be precise and literal in keyword extraction
- Double-check that every skill in your response actually exists in the job description

Return response in this EXACT JSON format:
{
  "matchPercentage": <number 0-100>,
  "matchedSkills": [<array of skills found in BOTH job description AND resume>],
  "missingSkills": [<array of skills from job description NOT found in resume>],
  "suggestions": [
    {
      "keyword": "<missing keyword from job description>",
      "section": "<suggested resume section>",
      "suggestion": "<specific actionable advice>"
    }
  ],
  "experienceMatch": <number 0-100>,
  "skillsMatch": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "overallScore": <number 0-100>,
  "atsScore": <number 0-100>,
  "extractedKeywords": [<array of ALL keywords extracted from job description>],
  "explanation": "<brief explanation referencing specific job description requirements and resume content>",
  "error": null
}

**JOB DESCRIPTION TO ANALYZE:**
${jobDescription}

**RESUME CONTENT TO COMPARE:**
${resumeText}

**IMPORTANT:** Before returning your response, double-check that every skill in matchedSkills and missingSkills actually exists in the job description provided above.

JSON Response:
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        const parsedResult = cleanAndParseJSON(text);

        return parsedResult;
      } catch (parseError) {
        throw new Error(
          "Failed to parse AI response as JSON: " + parseError.message
        );
      }
    } catch (error) {
      console.error("Error comparing resume:", error);
      throw error;
    }
  }

  async generateATSResume(resumeContent, jobDescription, comparisonResult) {
    try {
      if (!resumeContent || !jobDescription) {
        throw new Error("Resume content and job description are required");
      }

      const missingSkills = comparisonResult?.missingSkills || [];
      const matchedSkills = comparisonResult?.matchedSkills || [];
      const allSkills = [...matchedSkills, ...missingSkills];

      const prompt = `You are a PROFESSIONAL RESUME WRITER and ATS OPTIMIZATION EXPERT with 20+ years of experience helping job seekers land their dream jobs.

**MISSION:** Transform the provided resume into a professionally formatted, ATS-optimized document that seamlessly integrates missing keywords while maintaining authenticity and readability.

**STRICT REQUIREMENTS:**
1. **KEYWORD INTEGRATION:** Naturally integrate ALL missing skills from the job description
2. **PROFESSIONAL FORMATTING:** Use standard resume formatting with clear sections
3. **ATS COMPATIBILITY:** Ensure 95%+ ATS compatibility
4. **AUTHENTICITY:** Maintain professional credibility - no false claims
5. **READABILITY:** Balance keyword optimization with human readability

**MISSING SKILLS TO INTEGRATE (MUST INCLUDE ALL):**
${missingSkills.join(", ")}

**ALREADY MATCHED SKILLS (KEEP THESE):**
${matchedSkills.join(", ")}

**INTEGRATION STRATEGY:**

**1. PROFESSIONAL SUMMARY (40% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.4)} missing skills
- Create compelling narrative combining experience with target role requirements
- Use quantifiable achievements and impact metrics
- Position candidate as expert in target domain

**2. TECHNICAL SKILLS SECTION (30% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.3)} missing skills
- Group related technologies logically
- Use both full names and abbreviations where appropriate
- Organize by proficiency level or category

**3. PROFESSIONAL EXPERIENCE (20% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.2)} missing skills
- Enhance bullet points with relevant technologies and methodologies
- Quantify achievements with metrics and impact
- Demonstrate progression and leadership

**4. PROJECTS/ACHIEVEMENTS (10% of missing skills)**
- Integrate remaining missing skills
- Showcase relevant technical projects
- Highlight problem-solving and innovation

**FORMATTING REQUIREMENTS:**
- Use clean, professional formatting
- Maintain consistent spacing and alignment
- Use bullet points for achievements and responsibilities
- Include quantifiable metrics where possible
- Ensure proper section hierarchy

**RESUME CONTENT TO OPTIMIZE:**
${resumeContent}

**JOB DESCRIPTION FOR CONTEXT:**
${jobDescription}

**TASK:** Generate a professionally formatted, ATS-optimized resume that:
1. Integrates ALL missing skills naturally
2. Maintains professional credibility
3. Uses clear, readable formatting
4. Demonstrates quantifiable achievements
5. Optimizes for ATS systems

Return the optimized resume in clean, professional format with proper sections and formatting.`;

      const response = await this.model.generateContent(prompt);
      const optimizedResume = response.response.text();

      if (!optimizedResume) {
        throw new Error("Failed to generate optimized resume");
      }

      return {
        optimizedResume,
        message: "Resume optimized successfully with ATS keywords integration",
      };
    } catch (error) {
      console.error("Error generating ATS resume:", error);
      throw new Error(`Failed to generate ATS resume: ${error.message}`);
    }
  }

  async generateFormattedResumeTemplate(
    resumeContent,
    jobDescription,
    comparisonResult,
    format = "markdown"
  ) {
    try {
      if (!resumeContent || !jobDescription) {
        throw new Error("Resume content and job description are required");
      }

      const missingSkills = comparisonResult?.missingSkills || [];
      const matchedSkills = comparisonResult?.matchedSkills || [];
      const allSkills = [...matchedSkills, ...missingSkills];

      const formatInstructions =
        format === "latex"
          ? `
**LATEX FORMATTING REQUIREMENTS:**
- Use proper LaTeX resume template structure
- Include \\documentclass{article} and necessary packages
- Use \\section{} for major sections
- Use \\textbf{} for bold text
- Use \\textit{} for italic text
- Use proper spacing with \\vspace{} and \\hspace{}
- Use itemize environment for bullet points
- Ensure proper margins and spacing
- Use professional fonts and formatting
`
          : `
**MARKDOWN FORMATTING REQUIREMENTS:**
- Use clean markdown formatting
- Use # for main sections, ## for subsections
- Use bullet points with - or *
- Use **bold** for emphasis
- Use *italic* for secondary information
- Maintain consistent spacing
- Use proper hierarchy and structure
`;

      const prompt = `You are a PROFESSIONAL RESUME WRITER and ATS OPTIMIZATION EXPERT with 20+ years of experience helping job seekers land their dream jobs.

**MISSION:** Create a professionally formatted resume template in ${format.toUpperCase()} format that seamlessly integrates ATS keywords while maintaining authenticity and readability.

**STRICT REQUIREMENTS:**
1. **KEYWORD INTEGRATION:** Naturally integrate ALL missing skills from the job description
2. **PROFESSIONAL FORMATTING:** Use ${format.toUpperCase()} formatting with clear sections
3. **ATS COMPATIBILITY:** Ensure 95%+ ATS compatibility
4. **AUTHENTICITY:** Maintain professional credibility - no false claims
5. **READABILITY:** Balance keyword optimization with human readability

**MISSING SKILLS TO INTEGRATE (MUST INCLUDE ALL):**
${missingSkills.join(", ")}

**ALREADY MATCHED SKILLS (KEEP THESE):**
${matchedSkills.join(", ")}

**INTEGRATION STRATEGY:**

**1. PROFESSIONAL SUMMARY (40% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.4)} missing skills
- Create compelling narrative combining experience with target role requirements
- Use quantifiable achievements and impact metrics
- Position candidate as expert in target domain

**2. TECHNICAL SKILLS SECTION (30% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.3)} missing skills
- Group related technologies logically
- Use both full names and abbreviations where appropriate
- Organize by proficiency level or category

**3. PROFESSIONAL EXPERIENCE (20% of missing skills)**
- Integrate ${Math.ceil(missingSkills.length * 0.2)} missing skills
- Enhance bullet points with relevant technologies and methodologies
- Quantify achievements with metrics and impact
- Demonstrate progression and leadership

**4. PROJECTS/ACHIEVEMENTS (10% of missing skills)**
- Integrate remaining missing skills
- Showcase relevant technical projects
- Highlight problem-solving and innovation

${formatInstructions}

**RESUME CONTENT TO OPTIMIZE:**
${resumeContent}

**JOB DESCRIPTION FOR CONTEXT:**
${jobDescription}

**TASK:** Generate a professionally formatted, ATS-optimized resume in ${format.toUpperCase()} format that:
1. Integrates ALL missing skills naturally
2. Maintains professional credibility
3. Uses clear, readable ${format.toUpperCase()} formatting
4. Demonstrates quantifiable achievements
5. Optimizes for ATS systems

Return the optimized resume in ${format.toUpperCase()} format with proper sections and formatting.`;

      const response = await this.model.generateContent(prompt);
      const formattedResume = response.response.text();

      if (!formattedResume) {
        throw new Error("Failed to generate formatted resume template");
      }

      return {
        formattedResume,
        format: format,
        message: `Resume template generated successfully in ${format.toUpperCase()} format with ATS keywords integration`,
      };
    } catch (error) {
      console.error("Error generating formatted resume template:", error);
      throw new Error(
        `Failed to generate formatted resume template: ${error.message}`
      );
    }
  }

  validateKeywordsInJobDescription(keywords, jobDescription) {
    const jobDescriptionLower = jobDescription.toLowerCase();
    const validKeywords = [];
    const invalidKeywords = [];

    keywords.forEach((keyword) => {
      const keywordLower = keyword.toLowerCase();

      const variations = [
        keywordLower,
        keywordLower.replace(/\s+/g, ""),
        keywordLower.replace(/[.-]/g, ""),
        keywordLower + "s",
        keywordLower.replace(/s$/, ""),
      ];

      const isValid = variations.some((variation) =>
        jobDescriptionLower.includes(variation)
      );

      if (isValid) {
        validKeywords.push(keyword);
      } else {
        invalidKeywords.push(keyword);
      }
    });

    return {
      validKeywords,
      invalidKeywords,
      validationRate:
        keywords.length > 0
          ? (validKeywords.length / keywords.length) * 100
          : 100,
    };
  }
}
