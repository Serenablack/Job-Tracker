# Job Tracker Chrome Extension

A comprehensive Chrome extension for tracking job applications and optimizing resumes using AI-powered analysis and professional LaTeX templates.

## 🚀 Features

### Core Functionality
- **Chrome Side Panel Extension** - Persistent interface across all browser tabs
- **Job Application Tracking** - Extract job details and save to Google Sheets
- **AI-Powered Resume Analysis** - Compare resumes against job descriptions
- **Professional Resume Generation** - LaTeX-based templates with multiple output formats
- **Google Drive Integration** - Save resumes directly to Google Drive
- **Real-time Preview** - HTML preview of formatted resumes

### Resume Processing Pipeline
1. **Upload Resume** - Support for PDF, DOC, DOCX formats
2. **AI Analysis** - Gemini AI analyzes resume against job requirements
3. **LaTeX Template Processing** - Jack's professional template system
4. **Multi-format Output** - HTML preview, PDF download, DOCX download
5. **Google Services Integration** - Save to Drive, track in Sheets

## 🏗️ Architecture

### Frontend (Chrome Extension)
- **React 18** with Vite build system
- **Material-UI (MUI)** for professional UI components
- **Chrome Extension Manifest V3** with Side Panel API
- **Context-based State Management** (Auth, Loading, Snackbar, Theme)
- **Chrome Storage API** for persistent data

### Backend (Node.js API)
- **Express.js** REST API server
- **Google APIs Integration** (Sheets, Drive, OAuth2)
- **AI Services** (Gemini AI for resume analysis)
- **LaTeX Template System** (Professional resume formatting)
- **Multi-format Document Generation** (PDF via Puppeteer, DOCX via docx library)

## 📁 Project Structure

```
Job Tracker/
├── frontend/                 # Chrome Extension (React)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Global state management
│   │   ├── services/        # API communication
│   │   ├── utils/          # Helper functions
│   │   └── constants/      # Configuration constants
│   ├── manifest.json       # Chrome extension manifest
│   ├── background.js       # Service worker
│   └── vite.config.js      # Build configuration
│
├── backend/                 # Node.js API Server
│   ├── controllers/        # Request handlers
│   ├── services/           # Business logic
│   │   ├── latexTemplateService.js  # LaTeX resume templates
│   │   ├── aiService.js            # AI integration
│   │   └── googleSheetsService.js  # Google APIs
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth & error handling
│   ├── config/            # Configuration
│   └── utils/             # Helper utilities
│
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Google Cloud Project with APIs enabled
- Chrome browser for extension testing

### Backend Setup
1. **Navigate to backend directory**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Google Services**
   - Create Google Cloud Project
   - Enable Google Sheets API, Google Drive API
   - Create service account and download credentials
   - Place credentials file in `backend/` (will be gitignored)

3. **Environment Configuration**
   ```bash
   # Create .env file with required variables
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

### Frontend Setup
1. **Navigate to frontend directory**
   ```bash
   cd frontend
   npm install
   ```

2. **Build Extension**
   ```bash
   npm run build
   ```

3. **Load Extension in Chrome**
   - Open Chrome Extensions (`chrome://extensions/`)
   - Enable Developer Mode
   - Click "Load unpacked" and select `frontend/dist/`

## 🔧 Configuration

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
PORT=5000
NODE_ENV=development
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
# Add other required variables
```

**Frontend `.env`:**
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your_client_id
```

### Google Cloud Setup
1. Create project in Google Cloud Console
2. Enable APIs: Sheets API, Drive API, OAuth2
3. Create OAuth2 credentials for web application
4. Create service account for backend operations
5. Configure OAuth consent screen

## 🎯 Key Features Deep Dive

### LaTeX Resume Template System
- **Jack's Professional Template** - Industry-standard formatting
- **Structured Data Parsing** - Intelligent resume content extraction
- **Multi-format Output** - HTML preview, PDF download, DOCX generation
- **ATS-Friendly Design** - Optimized for Applicant Tracking Systems

### AI-Powered Analysis
- **Resume-Job Matching** - Analyze compatibility scores
- **Improvement Suggestions** - AI-generated recommendations
- **Keyword Optimization** - Enhance ATS compatibility
- **Professional Formatting** - Maintain consistent styling

### Chrome Extension Features
- **Side Panel Interface** - Persistent across all tabs
- **State Persistence** - Maintains data when switching tabs
- **Chrome Storage Integration** - Secure local data storage
- **Background Service Worker** - Handles extension lifecycle

## 🚀 Usage

1. **Install Extension** - Load the built extension in Chrome
2. **Open Side Panel** - Click extension icon to open side panel
3. **Upload Resume** - Upload your resume file (PDF/DOC/DOCX)
4. **Analyze Job** - Paste job description for AI analysis
5. **Generate Resume** - Create optimized resume with LaTeX templates
6. **Download/Save** - Get PDF/DOCX or save to Google Drive
7. **Track Applications** - Save job details to Google Sheets

## 🔒 Security & Privacy

- **Sensitive Data Protection** - All credentials gitignored
- **Secure API Communication** - JWT-based authentication
- **Google OAuth2** - Secure user authentication
- **Local Storage** - Chrome extension secure storage
- **No Data Persistence** - User data not stored on servers

## 🧪 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd frontend && npm test
```

### Building for Production
```bash
# Backend
cd backend && npm run build

# Frontend (Extension)
cd frontend && npm run build
```

### Code Quality
- ESLint configuration for consistent code style
- Prettier for code formatting
- Git hooks for pre-commit checks

## 📝 API Documentation

### Resume Endpoints
- `POST /api/v1/resume/upload-resume` - Upload and analyze resume
- `POST /api/v1/resume/generate-ats-resume` - Generate optimized resume
- `POST /api/v1/resume/download-resume` - Download resume (PDF/DOCX)
- `POST /api/v1/resume/preview-html` - Generate HTML preview
- `POST /api/v1/resume/save-to-drive` - Save to Google Drive

### Job Endpoints
- `POST /api/v1/jobs/extract-details` - Extract job information
- `POST /api/v1/jobs/add-to-sheet` - Save to Google Sheets

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Jack's LaTeX Resume Template** - Professional resume formatting
- **Google APIs** - Sheets and Drive integration
- **Gemini AI** - Resume analysis and optimization
- **Material-UI** - Professional UI components
- **Chrome Extension APIs** - Side panel and storage functionality

## 📞 Support

For support, email [your-email] or create an issue in the GitHub repository.

---

**Built with ❤️ for job seekers everywhere**