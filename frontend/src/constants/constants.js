// =============================================================================
// APPLICATION CONSTANTS
// =============================================================================

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1",
  ENDPOINTS: {
    RESUME: {
      UPLOAD: "/resume/upload-resume",
      GENERATE_ATS: "/resume/generate-ats-resume",
      DOWNLOAD_ATS: "/resume/download-ats-resume",

      DOWNLOAD_RESUME: "/resume/download-resume",
      GENERATE_AUTOMATED_PDF: "/resume/generate-automated-pdf",
      GENERATE_AUTOMATED_DOCX: "/resume/generate-automated-docx",

      // New LaTeX template endpoints
      PREVIEW_HTML: "/resume/preview-html",
      STRUCTURED_DATA: "/resume/structured-data",
      SAVE_TO_DRIVE: "/resume/save-to-drive",
    },
    JOBS: {
      EXTRACT_DETAILS: "/jobs/extract-details",
      ADD_LEGACY: "/jobs/add-legacy",
      ADD_TO_SHEET: "/jobs/add-to-sheet",
      UPLOAD_TO_SHEETS: "/jobs/upload-to-sheets",
    },
  },
};

// File Upload Configuration
// Removed FILE_UPLOAD_CONFIG in favor of inlining where used

// Removed small UI configuration constants. Inline small, non-secret UI values near usage.

// Resume Configuration
// Removed RESUME_CONFIG (inline near usage)

// Validation Messages
// Removed VALIDATION_MESSAGES (inline where shown to users)

// Error Messages
// Removed ERROR_MESSAGES (inline generic messages)

// Loading States
// Removed LOADING_STATES (inline)

// File Type Icons
// Removed FILE_TYPE_ICONS (not needed or inline)

// Sample Resume Text (for testing/demo purposes)
export const RESUME_TEXT = `John Doe
        Senior Software Engineer | Node.js | TypeScript | AWS
        Email: john.doe@example.com | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe
        
        Professional Summary:
        Results-oriented Full Stack Developer with 6+ years of experience designing and deploying scalable backend systems. Proficient in Node.js, TypeScript, and cloud infrastructure with a proven track record of delivering high-performance microservices and REST APIs in agile teams. Passionate about system design, automation, and performance optimization.
        
        Core Skills:
        - Node.js, TypeScript, JavaScript, Express.js
        - MongoDB, PostgreSQL, Redis
        - REST APIs, WebSockets, GraphQL
        - Docker, Kubernetes, AWS (Lambda, ECS, DynamoDB)
        - CI/CD (GitHub Actions, Jenkins), TDD with Jest and Mocha
        - Agile/Scrum, Jira, Confluence
        
        Professional Experience:
        
        Senior Backend Engineer – XYZ Tech Solutions (Remote) | Jan 2021 – Present
        - Developed and maintained microservices powering a QR-based equipment tracking system for a logistics platform.
        - Refactored monolith codebase into modular services using Node.js and TypeScript, improving deploy time by 50%.
        - Collaborated with frontend team on optimizing API contracts using OpenAPI/Swagger.
        - Implemented authentication and role-based access control (RBAC) using JWT and OAuth2.
        - Automated performance tests, leading to a 30% improvement in backend response times.
        
        Software Developer – ABC Digital Inc. | Jul 2018 – Dec 2020
        - Built real-time data pipelines and RESTful APIs for a telecom analytics platform used by 100k+ subscribers.
        - Designed document audit trail system to track employee department changes and leave approvals with supervisor-level access for accountability.
        - Created reusable components and middleware to standardize error handling and logging.
        
        Education:
        B.Tech in Computer Science – University of Illinois Urbana-Champaign
        
        Certifications:
        - AWS Certified Developer – Associate
        - Node.js Certified Developer (OpenJS Foundation)
        `;

// Export all constants as a single object for easy importing
export const CONSTANTS = {
  API_CONFIG,
  RESUME_TEXT,
};
