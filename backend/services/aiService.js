import { GoogleGenerativeAI } from "@google/generative-ai";
import { APP_CONFIG } from "../config/config.js";
import { cleanAndParseJSON } from "../utils/fileUtils.js";
import defaultJobData from "../DefaultData.js";
import { Ollama } from "ollama";

// Initialize AI services
const genAI = new GoogleGenerativeAI(APP_CONFIG.AI.API_KEY);
const model = genAI.getGenerativeModel({ model: APP_CONFIG.AI.MODEL });
const ollama = new Ollama();

export const AIService = {
  extractJobDetails: async (jobDescription) => {
    const defaultJob = { ...defaultJobData };

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

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let extracted = response.text();

      return cleanAndParseJSON(extracted);
    } catch (error) {
      console.error("GeminiAI extraction failed:", error);
      throw error;
    }
  },

  compareResumeWithJob: async (resumeText, jobDescription) => {
    try {
      if (!resumeText || !jobDescription) {
        throw new Error("Resume text and job description are required");
      }

      const prompt = `You are an expert ATS resume reviewer. Analyze the following resume against the job description.

CRITICAL INSTRUCTIONS:
1. Extract keywords and skills ONLY from the job description
2. Check if these job description keywords/skills are present in the resume
3. matchedSkills should ONLY contain skills that are explicitly mentioned in the job description AND found in the resume
4. missingSkills should ONLY contain skills that are explicitly mentioned in the job description BUT NOT found in the resume
5. Do NOT extract skills from the resume that are not mentioned in the job description

Job Description:
${jobDescription}

Resume:
${resumeText}

ANALYSIS PROCESS:
1. First, extract all important keywords and skills from the job description only
2. Then, check if each of these job description keywords/skills appears in the resume
3. Categorize them as matched (found in both) or missing (in job but not in resume)
4. Calculate scores based on how many job description keywords are found in the resume

Return a JSON response with the following structure:
{
  "atsScore": <number between 0-100>,
  "matchedSkills": [<array of skills from job description that are also found in resume>],
  "missingSkills": [<array of skills from job description that are NOT found in resume>],
  "suggestions": [<array of improvement suggestions>],
  "skillsMatch": <number between 0-100>,
  "keywordMatch": <number between 0-100>,
  "extractedKeywords": [<array of important keywords extracted from job description only>],
  "explanation": "<brief explanation of the analysis>"
}

Important guidelines:
1. Focus on technical skills, tools, technologies, and methodologies from the job description
2. Consider both exact matches and related skills when checking resume content
3. Provide realistic scores based on actual content comparison
4. Extract relevant keywords that would be important for ATS systems from the job description only
5. Give actionable suggestions for improvement
6. NEVER include skills from the resume that are not mentioned in the job description`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const analysis = cleanAndParseJSON(text);

      return {
        ...analysis,
        error: null,
      };
    } catch (error) {
      console.error("Error comparing resume with job:", error);
      return {
        matchPercentage: 0,
        matchedSkills: [],
        missingSkills: [],
        suggestions: [],
        experienceMatch: 0,
        skillsMatch: 0,
        keywordMatch: 0,
        overallScore: 0,
        atsScore: 0,
        extractedKeywords: [],
        explanation: "Analysis failed due to an error",
        error: error.message,
      };
    }
  },

  generateATSResume: async (
    resumeContent,
    jobDescription,
    comparisonResult
  ) => {
    try {
      if (!resumeContent || !jobDescription || !comparisonResult) {
        throw new Error(
          "Resume content, job description, and comparison result are required."
        );
      }

      const { missingSkills = [], keywords = [] } = comparisonResult;

      if (!missingSkills || missingSkills.length === 0) {
        return {
          optimizedResume: resumeContent,
          message: "No skills to integrate. Resume is already optimized.",
          processingDetails: {
            integrationStrategy: "No integration needed",
            incorporationRate: 100,
            incorporatedSkills: [],
            remainingMissingSkills: [],
            totalMissingSkills: 0,
          },
        };
      }

      // --- Start of the enhanced prompt for the Generative AI ---
      const prompt = `
      **Objective:** Transform the provided 'Original Resume Content' into a highly ATS-optimized and recruiter-preferred resume. The primary goal is to strategically and contextually integrate the 'Missing Skills to Integrate' into the appropriate sections. This involves demonstrating practical application and plausibly incorporating these skills, even if it requires rephrasing existing achievements or suggesting a replacement/augmentation of current technologies where highly relevant and beneficial.

      **Job Description (for critical context and keyword relevance):**
      ${jobDescription}

      **Missing Skills to Integrate (comma-separated list):**
      ${missingSkills.join(", ")}

      **Original Resume Content (preserve all existing sections and their general formatting):**
      ${resumeContent}

      ---

      **Detailed Instructions for Optimization & Integration:**

      **Phase 1: Analysis & Skill Mapping (Implicit Task for You as AI):**
      * Thoroughly analyze the 'Original Resume Content' to understand the candidate's existing experience, core competencies, projects, and all current hard and soft skills.
      * Carefully read the 'Job Description' to identify its key requirements, essential skills, and the most important keywords.
      * Map the 'Missing Skills to Integrate' against the existing resume content and the job description to identify the best points of integration.

      **Phase 2: Strategic Skill Integration by Section:**

      1.  **Professional Summary:**
          * **Integrate 1-3 of the most relevant missing skills** that significantly enhance the candidate's core value proposition for this specific job description.
          * Weave these skills **naturally** into existing sentences or phrases. Focus on improving the narrative and aligning with the job description's primary focus.
          * **AVOID simple listing or keyword stuffing.** Ensure the integration feels organic.

      2.  **CORE COMPETENCIES / Skills Section:**
          * **Add ALL relevant missing hard skills** to their most appropriate existing categories (e.g., 'Data Analysis & Visualization', 'Database Management', 'Programming & Tools', 'Business Intelligence', 'Technical Skills', 'Soft Skills').
          * If a missing skill does not fit neatly into an existing category, **create a new, logical category** (e.g., 'Cloud Platforms', 'DevOps Tools', 'Project Management Software') and add the skill there.
          * Maintain the existing sub-bullet or comma-separated list format within these categories. Aim for clarity and scannability.

      3.  **PROFESSIONAL EXPERIENCE & PROJECTS (CRITICAL for Demonstration):**
          * This is where the 'Missing Skills' must be shown *in action*.
          * For each 'Missing Skill':
              * **Identify Plausible Connection Points:** Scan all existing bullet points under 'PROFESSIONAL EXPERIENCE', and 'PROJECTS'. Pinpoint specific bullet points where the missing skill *could logically and plausibly have been used*, even if not explicitly stated in the original resume. Focus on achievements that implicitly align.
              * **Rewrite/Augment Existing Bullet Points:**
                  * **Contextual Integration:** Explicitly incorporate the missing skill into the chosen bullet point.
                  * **Action Verbs:** Ensure the modified bullet point starts with a strong action verb (e.g., 'Developed', 'Implemented', 'Utilized', 'Managed', 'Orchestrated', 'Automated').
                  * **Quantifiable Impact:** Whenever possible, connect the newly integrated skill to the existing quantifiable achievement (numbers, percentages, metrics) or, if adding a new bullet, suggest a plausible, measurable outcome from its use.
                  * **Tech Stack Replacement/Augmentation (Crucial):**
                      * If a 'Missing Skill' is a **more modern, relevant, or directly superior technology** to one already mentioned in a bullet point (and aligns better with the Job Description), **replace or augment** the existing technology.
                      * **Example 1 (Replacement):** If original says "Managed data in old-SQL-tool" and missing is "Snowflake," consider: "Managed large-scale data warehouses using **Snowflake** to support real-time analytics dashboards..."
                      * **Example 2 (Augmentation):** If original says "Integrated AWS services..." and missing is "Azure," consider: "Integrated cloud services (AWS, **Azure**) to enhance application scalability and optimize content delivery..."
                      * **Plausibility:** ONLY make these changes if they are highly plausible given the candidate's overall profile and the context of the achievement. **Do not invent entirely new, unrelated experiences.**
              * **Prioritization:** Prioritize integrating missing skills into roles/projects that are most relevant to the 'Job Description'.

      **Phase 3: Overall ATS Optimization & Final Formatting Adherence:**

      1.  **Keyword Density & Distribution:** Ensure the integrated 'Missing Skills' (and other important keywords from the JD) appear naturally across multiple sections (Professional Summary, CORE COMPETENCIES, Professional Experience, Projects) for optimal ATS parsing. Avoid unnatural repetition.
      2.  **Preserve Original Formatting:** Maintain the candidate's original resume's overall structure, section headings (e.g., bolding, capitalization), bullet point style, spacing, and font choices (implicitly, by outputting plain text that retains the visual structure). Do not introduce tables, columns, or complex graphical elements.
      3.  **Maintain Professional Tone:** Ensure the language remains professional, concise, and impactful throughout the entire resume.
      4.  **Thorough Proofreading:** Implicitly proofread for grammatical errors, spelling mistakes, and clarity after all integrations are complete.

      **Output Requirement:**
      Return **ONLY** the complete, optimized resume text, ready for direct use. Do not include any conversational filler, explanations, or extraneous text beyond the resume content itself.
      `;
      // --- End of the enhanced prompt for the Generative AI ---

      const response = await model.generateContent(prompt);
      const result = await response.response;
      const optimizedResume = result.text();

      // Validate skill incorporation (this part of the function logic is robust)
      const incorporatedSkills = missingSkills.filter((skill) =>
        optimizedResume.toLowerCase().includes(skill.toLowerCase())
      );

      const remainingMissingSkills = missingSkills.filter(
        (skill) => !incorporatedSkills.includes(skill)
      );

      return {
        optimizedResume,
        message: "Resume optimized successfully with integrated skills",
        processingDetails: {
          integrationStrategy: "Contextual skill integration",
          incorporationRate: Math.round(
            (incorporatedSkills.length / missingSkills.length) * 100
          ),
          incorporatedSkills,
          remainingMissingSkills,
          totalMissingSkills: missingSkills.length,
        },
      };
    } catch (error) {
      console.error("Error generating ATS resume:", error);
      throw error;
    }
  },

  validateKeywordsInJobDescription: (keywords, jobDescription) => {
    if (!keywords || !Array.isArray(keywords)) {
      return false;
    }

    const jobDescriptionLower = jobDescription.toLowerCase();
    return keywords.every((keyword) =>
      jobDescriptionLower.includes(keyword.toLowerCase())
    );
  },
};
