# Job Tracker Backend

A well-organized Node.js backend for the Job Tracker application, following industry best practices with a clean architecture.

## Project Structure

```
backend/
├── config/           # Configuration files
│   └── config.js     # Google Sheets, AI, and server configuration
├── controllers/      # Request handlers and business logic
│   ├── jobController.js     # Job-related operations
│   └── resumeController.js  # Resume-related operations
├── middleware/       # Custom middleware
│   ├── auth.js       # Google OAuth authentication middleware
│   └── errorHandler.js # Error handling middleware
├── routes/           # Route definitions
│   ├── index.js      # Main routes file
│   ├── jobRoutes.js  # Job-related routes
│   └── resumeRoutes.js # Resume-related routes
├── services/         # External API integrations and data processing
│   ├── aiService.js  # AI operations (Gemini)
│   ├── googleSheetsService.js # Google Sheets operations
│   └── resumeService.js # Resume operations
├── utils/            # Utility functions and helpers
│   └── fileUtils.js  # File operations and text extraction
├── assets/           # Static assets
│   ├── DefaultData.js # Default job data
│   └── Jobs_applied.xlsx # Excel file
├── uploads/          # File upload directory
├── server.js         # Main server file
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

## Architecture Overview

### Layers

1. **Routes Layer** (`/routes`)

   - Defines API endpoints
   - Handles HTTP method mapping
   - Applies middleware

2. **Controllers Layer** (`/controllers`)

   - Handles HTTP requests and responses
   - Orchestrates business logic
   - Calls appropriate services

3. **Services Layer** (`/services`)

   - Contains business logic
   - Handles external API integrations
   - Manages data processing

4. **Utils Layer** (`/utils`)

   - Reusable utility functions
   - File operations
   - Data formatting

5. **Config Layer** (`/config`)

   - Environment-specific configuration
   - External service credentials
   - Server settings

6. **Middleware Layer** (`/middleware`)
   - Google OAuth authentication
   - Error handling
   - Request/response processing

## Google OAuth Authentication

The backend uses Google OAuth tokens for authentication, which provides secure access to Google APIs without requiring a database.

### Authentication Flow

1. **Frontend** obtains Google OAuth token from Google Sign-In
2. **Frontend** sends requests with OAuth token in Authorization header
3. **Backend** validates token and uses it for Google API calls
4. **Backend** provides access to protected resources

### API Endpoints

#### Job Management

- `POST /api/v1/jobs/extract-job-details` - Extract job details from description
- `GET /api/v1/jobs/upload-file` - Upload Excel file to Google Sheets
- `POST /api/v1/jobs/job` - Add job to Google Sheet (legacy)
- `POST /api/v1/jobs/add-to-excel/:sheetId` - Add job to specific Google Sheet

#### Resume Management

- `POST /api/v1/resume/upload-resume` - Upload resume file
- `POST /api/v1/resume/compare-resume` - Compare resume with job description
- `POST /api/v1/resume/generate-ats-resume` - Generate ATS-optimized resume
- `POST /api/v1/resume/download-ats-resume` - Download optimized resume as PDF
- `GET /api/v1/resume/resume-summary/:resumeId` - Get resume summary
- `POST /api/v1/resume/download-resume` - Generate DOCX resume (legacy)

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:

   ```
   PORT=5000
   NODE_ENV=development
   GOOGLE_API_KEY=your_gemini_api_key
   GOOGLE_CREDENTIALS_PATH=path_to_credentials.json
   SHEET_ID=your_google_sheet_id
   ```

3. Run the server:

   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

## Key Features

- **Modular Architecture**: Clean separation of concerns
- **Google OAuth Authentication**: Secure token-based authentication
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Google Integration**: Google OAuth and Sheets API integration
- **File Processing**: Support for DOC, DOCX, and TXT files
- **AI Integration**: Gemini AI for job analysis and resume optimization
- **Google Sheets Integration**: Direct integration with Google Sheets API
- **Document Generation**: PDF and DOCX resume generation

## Dependencies

- **Express**: Web framework
- **CORS**: Cross-origin resource sharing
- **Multer**: File upload handling
- **Google APIs**: Google Sheets and Drive integration
- **Gemini AI**: AI-powered job analysis
- **PDFKit**: PDF generation
- **Docx**: DOCX document generation
- **Mammoth**: DOCX text extraction

## Best Practices Implemented

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **OAuth Security**: Proper Google OAuth token validation
3. **Dependency Injection**: Services are injected into controllers
4. **Error Handling**: Centralized error handling with proper logging
5. **Configuration Management**: Environment-based configuration
6. **Middleware Pattern**: Reusable request/response processing
7. **Async/Await**: Modern JavaScript patterns for asynchronous operations
8. **Input Validation**: Proper validation of user inputs
9. **Security**: Authentication and authorization middleware

## Migration from Old Structure

The old `index.js` file has been refactored into the new structure:

- **Routes**: Moved from inline route definitions to dedicated route files
- **Business Logic**: Extracted from route handlers into service classes
- **Configuration**: Centralized in the config directory
- **Utilities**: Extracted helper functions into utils directory
- **Error Handling**: Implemented proper middleware-based error handling
- **Authentication**: Maintained Google OAuth implementation

## Development

To add new features:

1. Create service methods in appropriate service files
2. Add controller methods to handle HTTP requests
3. Define routes in the appropriate route files
4. Add any necessary middleware
5. Update configuration if needed

This structure makes the codebase more maintainable, testable, and scalable.
