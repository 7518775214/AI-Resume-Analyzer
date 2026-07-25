# Development Roadmap & Implementation Plan Document

**Project Title:** AI Resume Analyzer & Interview Coach  
**System Role:** Senior Engineering Manager Development Roadmap Specification  
**Degree Project:** Final Year B.Tech CSE (Artificial Intelligence & Machine Learning)  
**Target Completion Timeline:** 4-6 Weeks (Estimated Total: ~172 Hours)  
**Version:** 1.0.0  
**Date:** July 25, 2026  

---

## 1. Executive Summary & Strategy Overview

The **AI Resume Analyzer & Interview Coach** is an enterprise-grade, AI-driven career readiness platform designed to evaluate candidate resumes using natural language processing (NLP), generate ATS match metrics, conduct dynamic multi-turn mock technical interviews, and provide actionable real-time feedback using Google's Gemini AI.

### Architectural & Engineering Goals
1. **Modular & Decoupled Architecture:** Maintain strict separation of concerns across 5 application layers (Presentation, API Gateway, Business Service, AI Integration, and Data Persistence).
2. **Production-Grade Reliability:** Implement standard error handling envelopes, robust JWT security policies, rate-limiting, and data validation at both MongoDB `$jsonSchema` and Mongoose ODM layers.
3. **Optimized AI Workflows:** Enforce structured JSON schema prompts with Gemini API to ensure fast response parsing, sub-3s response times, and deterministic analytical metrics.
4. **Seamless Cloud Integration:** Leverage Cloudinary for zero-disk document persistence, MongoDB Atlas for operational data, Vercel for Frontend CDN hosting, and Render for Backend container deployment.

---

## 2. Milestone Summary & Timeline Overview

| Milestone | Phase / Focus Area | Estimated Time | Key Deliverables |
| :--- | :--- | :---: | :--- |
| **Milestone 1** | Project Setup & Monorepo Initialization | 8 Hours | Project scaffolding, Vite React, Tailwind CSS, Express, ESLint, Git repo |
| **Milestone 2** | Backend Foundation & Database Schemas | 16 Hours | Express boilerplate, MongoDB Atlas connection, 5 Mongoose schemas, global handlers |
| **Milestone 3** | Authentication & User Management Engine | 20 Hours | JWT auth, Bcrypt hashing, Auth middleware, Login/Register UI, Auth Context |
| **Milestone 4** | Cloud Storage & Document Ingestion Service | 16 Hours | Multer upload, Cloudinary integration, PDF/DOCX text parsing, File APIs |
| **Milestone 5** | Gemini AI Engine & Resume ATS Analysis Module | 28 Hours | Gemini API integration, structured NLP prompts, ATS breakdown page & radar charts |
| **Milestone 6** | AI Mock Interview Generator & Evaluation Room | 32 Hours | Multi-turn question generation, answer scoring, real-time interview room UI |
| **Milestone 7** | Analytics Engine, Reports & Candidate History | 24 Hours | Aggregation pipelines, candidate dashboard, PDF report export, history views |
| **Milestone 8** | E2E Integration, UI Polish & Performance Tuning | 20 Hours | Axios interceptors, state sync, loading skeletons, dark mode, test coverage |
| **Milestone 9** | Production Deployment, CI/CD & Release Handover | 16 Hours | Render backend deployment, Vercel frontend deployment, SSL/CORS, final docs |

---

## 3. Professional Development Milestones

---

### Milestone 1: Project Setup & Workspace Initialization

#### Objective
Establish a clean, scalable workspace architecture for both backend and frontend applications. Initialize Node.js/Express and React (Vite) projects, configure Tailwind CSS, set up environment configuration files (`.env`), and configure Git version control with proper `.gitignore` definitions.

#### Features
- Dual-repository / Monorepo workspace initialization (`client` and `server`).
- Vite React frontend setup with Tailwind CSS and PostCSS configuration.
- Express backend application scaffolding with npm scripts (`start`, `dev` with `nodemon`).
- Environment variable infrastructure (`.env.example` and `.env`).
- Git repository initialization with comprehensive `.gitignore` rules to prevent credential leaks.
- ESLint and Prettier configuration for unified code style.

#### Files/Folders to Create
```
AI-Resume-Analyzer/
├── .gitignore
├── README.md
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── index.css
│       ├── components/
│       ├── pages/
│       ├── context/
│       ├── services/
│       └── utils/
└── server/
    ├── package.json
    ├── server.js
    ├── .env.example
    ├── config/
    ├── controllers/
    ├── middlewares/
    ├── models/
    ├── routes/
    ├── services/
    └── utils/
```

#### Expected Output
- Runnable backend Express server displaying a operational JSON health check on `http://localhost:5000/api/v1/health`.
- Runnable frontend React Vite server with active Tailwind CSS classes rendering on `http://localhost:5173`.
- Valid `.gitignore` ensuring `node_modules`, `.env`, and build artifacts are ignored.

#### Testing Checklist
- [ ] Run `npm run dev` in `server/` and verify server boots on port 5000.
- [ ] Send GET request to `/api/v1/health` via Postman/cURL and verify HTTP 200 `{"success": true}`.
- [ ] Run `npm run dev` in `client/` and confirm React welcome page opens without console errors.
- [ ] Add a sample Tailwind utility class (e.g. `bg-blue-600`) in `App.jsx` and verify styling renders correctly.
- [ ] Perform `git status` to verify `.env` and `node_modules/` are strictly excluded from staging.

#### Git Commit Message
```text
chore: initialize client and server project workspace with Vite, Tailwind CSS, and Express boilerplate
```

#### Estimated Time
**8 Hours (1 Day)**

---

### Milestone 2: Backend Architecture & Database Foundation

#### Objective
Construct the core Node.js/Express server infrastructure, connect to MongoDB Atlas using Mongoose ODM, implement centralized middleware (CORS, Helmet, Rate Limiter, Error Handler), and declare all 5 database schemas (`User`, `Resume`, `ResumeAnalysis`, `Interview`, `InterviewReport`).

#### Features
- MongoDB Atlas connection utility with automatic reconnect logic and connection pooling.
- Express middleware stack: `cors`, `helmet` for security headers, `express-rate-limit` for DDoS protection, and `express.json()` body parser.
- Standardized REST API error handling middleware capturing operational, validation, and database errors into a uniform JSON structure.
- Declaration of 5 Mongoose Models with indexes and validation:
  - `User.js` (email uniqueness, bcrypt hook placeholder, target profile)
  - `Resume.js` (Cloudinary file metrics, parsed skills/experience/education)
  - `ResumeAnalysis.js` (ATS score, keyword match breakdown, skill gap suggestions)
  - `Interview.js` (Session metadata, multi-turn Q&A array, transcript metrics)
  - `InterviewReport.js` (Radar chart metrics, aggregated performance score, AI executive coaching)

#### Files/Folders to Create
```
server/
├── config/
│   └── db.js
├── middlewares/
│   ├── errorMiddleware.js
│   ├── rateLimiter.js
│   └── securityMiddleware.js
├── models/
│   ├── User.js
│   ├── Resume.js
│   ├── ResumeAnalysis.js
│   ├── Interview.js
│   └── InterviewReport.js
└── utils/
    ├── apiError.js
    └── apiResponse.js
```

#### Expected Output
- Database connection logs confirming `MongoDB Atlas Connected Successfully`.
- Express application gracefully handling non-existent routes with HTTP 404 standard JSON error envelopes.
- Mongoose schemas loaded without compilation or syntax errors.

#### Testing Checklist
- [ ] Verify `db.js` connects to local/Atlas MongoDB string without deprecation warnings.
- [ ] Test invalid JSON request body payload to ensure `errorMiddleware.js` catches parsing errors cleanly.
- [ ] Send 100+ requests rapidly to verify `rateLimiter.js` returns HTTP 429 Too Many Requests.
- [ ] Execute script to instantiate test Mongoose models and confirm schema default values and field validations trigger.

#### Git Commit Message
```text
feat(backend): setup MongoDB Atlas connection, global error handling, security middleware, and core Mongoose models
```

#### Estimated Time
**16 Hours (2 Days)**

---

### Milestone 3: Authentication & User Management Engine

#### Objective
Implement a secure JSON Web Token (JWT) based authentication system. Build user registration, login, token refresh, and profile management API endpoints on the backend, alongside complete client-side Auth Context, protected routing, and responsive authentication forms.

#### Features
- Password hashing using `bcryptjs` with salt round 10 on user save.
- JWT sign and verify utilities (`jwt.sign`, token expiration enforcement).
- Authentication controllers: `registerUser`, `loginUser`, `getCurrentUserProfile`, `updateUserProfile`.
- `authMiddleware.js` (`protect` route guard, `authorize` role guard).
- Client-side `AuthContext.jsx` for global user state, token persistence in `localStorage`, and login/logout handlers.
- Axios HTTP client instance with Request Interceptors attaching `Bearer <token>` and Response Interceptors handling `401 Unauthorized`.
- React Router Protected Route component (`ProtectedRoute.jsx`).
- Responsive, validated Register and Login page UI components.

#### Files/Folders to Create
```
server/
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middlewares/
│   └── authMiddleware.js
└── utils/
    └── generateToken.js

client/
└── src/
    ├── context/
    │   └── AuthContext.jsx
    ├── services/
    │   ├── api.js
    │   └── authService.js
    ├── components/
    │   ├── ProtectedRoute.jsx
    │   └── Navbar.jsx
    └── pages/
        ├── Login.jsx
        ├── Register.jsx
        └── Profile.jsx
```

#### Expected Output
- Operational POST `/api/v1/auth/register` returning JWT token and user details.
- Operational POST `/api/v1/auth/login` validating password hash and issuing authentication token.
- Operational GET `/api/v1/auth/me` returning authenticated user profile when passed valid Bearer header.
- Client application permitting access to `/profile` only when authenticated, automatically redirecting guest traffic to `/login`.

#### Testing Checklist
- [ ] Register a new user and confirm password stored in MongoDB is salted/hashed (not plain text).
- [ ] Attempt login with wrong password and verify HTTP 401 `Invalid credentials` error payload.
- [ ] Access protected GET `/api/v1/auth/me` without authorization header and verify HTTP 401 response.
- [ ] Test frontend login flow: verify token stores in `localStorage` and Navbar updates to user state.
- [ ] Test page refresh on protected route and verify session persists seamlessly via `AuthContext`.

#### Git Commit Message
```text
feat(auth): implement JWT authentication, Bcrypt password hashing, auth middleware, and client AuthContext
```

#### Estimated Time
**20 Hours (2.5 Days)**

---

### Milestone 4: Cloud Storage Integration & File Ingestion Service

#### Objective
Implement document upload capabilities allowing candidates to submit resume files (`.pdf` and `.docx`). Integrate Cloudinary for cloud document hosting, `multer` for multipart request parsing, and `pdf-parse` / `mammoth` for server-side text extraction.

#### Features
- Multer file upload middleware restricting file size (max 5MB) and mime types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
- Cloudinary storage service (`storageService.js`) for uploading document buffers and managing asset public IDs.
- Document text extraction pipeline using `pdf-parse` for PDFs and `mammoth` for DOCX files.
- Resume management API controllers: `uploadResume`, `getAllResumes`, `getResumeById`, `deleteResume`.
- Client-side File Upload component featuring drag-and-drop file picker, upload progress indicator, and format validation alerts.

#### Files/Folders to Create
```
server/
├── config/
│   └── cloudinary.js
├── controllers/
│   └── resumeController.js
├── routes/
│   └── resumeRoutes.js
├── middlewares/
│   └── uploadMiddleware.js
└── services/
    ├── storageService.js
    └── parserService.js

client/
└── src/
    ├── services/
    │   └── resumeService.js
    ├── components/
    │   ├── FileUpload.jsx
    │   └── ResumeCard.jsx
    └── pages/
        └── ResumeUpload.jsx
```

#### Expected Output
- Operational POST `/api/v1/resumes/upload` accepting multipart file form data.
- Resume files successfully uploaded to Cloudinary, returning secure HTTPS URL and Cloudinary Public ID.
- Clean text extracted from uploaded resume file stored in `resumes` MongoDB document `extractedText` field.
- Client file dropzone enabling smooth document selection with upload feedback.

#### Testing Checklist
- [ ] Upload a valid 2MB `.pdf` resume and verify document creates in MongoDB with extracted text populated.
- [ ] Attempt uploading a `.jpg` or `.txt` file and verify `uploadMiddleware` rejects request with HTTP 400.
- [ ] Upload a file exceeding 5MB size limit and confirm size validation error.
- [ ] Verify asset URL in returned response opens uploaded file on Cloudinary CDN.
- [ ] Test resume delete endpoint POST `/api/v1/resumes/:id` and confirm asset is deleted from Cloudinary storage.

#### Git Commit Message
```text
feat(resume): integrate Cloudinary storage SDK, Multer file upload, pdf-parse text extraction, and resume API endpoints
```

#### Estimated Time
**16 Hours (2 Days)**

---

### Milestone 5: Gemini AI Engine & Resume ATS Analysis Module

#### Objective
Integrate the Google Gemini API SDK (`@google/genai`) to power the automated Resume ATS Analyzer. Construct structured NLP prompts to score resumes against target job descriptions, extract skill gaps, evaluate keyword formatting, and render an interactive ATS Analysis diagnostic dashboard.

#### Features
- Google Gemini API client setup (`config/gemini.js`) using `@google/genai` with API key error validation.
- AI Service layer (`aiService.js`) executing system prompts enforcing strict JSON response output formats (`responseSchema`).
- ATS Analysis Controller (`analyzeResume`): compares extracted resume text against optional target job description, generating ATS match score (0-100), missing keywords, formatting errors, and section-by-section improvements.
- Mongoose persistence storing generated ATS reports in `resumeanalyses` collection.
- Frontend ATS Diagnostic Result Page rendering overall match gauge score, radar charts for category metrics, keyword tag clouds, and expandable optimization cards.

#### Files/Folders to Create
```
server/
├── config/
│   └── gemini.js
├── controllers/
│   └── analysisController.js
├── routes/
│   └── analysisRoutes.js
├── services/
│   ├── aiService.js
│   └── atsEngine.js
└── utils/
    └── promptTemplates.js

client/
└── src/
    ├── services/
    │   └── analysisService.js
    ├── components/
    │   ├── ScoreGauge.jsx
    │   ├── SkillGapList.jsx
    │   ├── KeywordBadge.jsx
    │   └── CategoryRadarChart.jsx
    └── pages/
        ├── ATSAnalysis.jsx
        └── AnalysisResult.jsx
```

#### Expected Output
- Operational POST `/api/v1/analysis/generate` triggering Gemini API analysis and saving report to MongoDB.
- Backend reliably returning validated JSON matching ATS analysis structure without markdown formatting wrapping.
- Interactive ATS report page rendering visual score gauge, category breakdown, missing critical keywords, and prioritized suggestions.

#### Testing Checklist
- [ ] Trigger ATS analysis for a sample software developer resume and target job description.
- [ ] Verify Gemini API returns valid JSON payload without throwing JSON parsing syntax errors.
- [ ] Verify match score calculation falls strictly within expected 0-100 numerical range.
- [ ] Test API resilience: pass empty job description and verify AI defaults to role-based industry standards analysis.
- [ ] Confirm visual charts (Radar/Gauge) render accurately on frontend with dynamic report data.

#### Git Commit Message
```text
feat(ai-ats): integrate Google Gemini API SDK, structured ATS prompts, analysis controllers, and visual ATS report components
```

#### Estimated Time
**28 Hours (3.5 Days)**

---

### Milestone 6: AI Mock Interview Generator & Real-time Evaluation Module

#### Objective
Develop the core AI Mock Interview Coach engine. Enable candidates to start customized interview sessions (by job role, experience level, and tech stack), generate dynamic technical and behavioral interview questions, evaluate candidate answers in real-time, and host an interactive Interview Room UI.

#### Features
- Mock Interview controller (`startInterview`, `submitAnswer`, `completeInterview`).
- Gemini AI multi-turn question generator producing tailored technical, situational, and behavioral questions.
- Real-time answer evaluation service assessing response relevance, technical accuracy, clarity, and communication score.
- Dynamic session state management in MongoDB `interviews` collection (updating answer arrays and session status).
- Client-side Interactive Mock Interview Room featuring active question viewer, answer text editor / timer, answer submission state, and instant AI feedback view.

#### Files/Folders to Create
```
server/
├── controllers/
│   └── interviewController.js
├── routes/
│   └── interviewRoutes.js
└── services/
    └── interviewAIService.js

client/
└── src/
    ├── services/
    │   └── interviewService.js
    ├── components/
    │   ├── QuestionCard.jsx
    │   ├── AnswerInput.jsx
    │   ├── InstantFeedback.jsx
    │   └── InterviewTimer.jsx
    └── pages/
        ├── InterviewSetup.jsx
        ├── InterviewRoom.jsx
        └── InterviewSummary.jsx
```

#### Expected Output
- Operational POST `/api/v1/interviews/start` generating 5 adaptive interview questions based on candidate profile.
- Operational POST `/api/v1/interviews/:id/answer` recording candidate response and instantly returning AI rating (0-10) with key critique points.
- Operational POST `/api/v1/interviews/:id/complete` finalizing interview status and calculating overall score metrics.
- Fully functional, stateful client Interview Room guiding candidate through questions with live feedback.

#### Testing Checklist
- [ ] Start a mock interview for "Frontend Engineer - Junior" and verify questions match selected tech stack.
- [ ] Submit an answer to Question 1 and confirm HTTP 200 response with individual score and constructive feedback.
- [ ] Complete all questions in session and verify interview document status updates to `completed`.
- [ ] Test client timer component ensuring auto-submission or warning when time limit expires.
- [ ] Confirm invalid session ID attempts return HTTP 404 standard error.

#### Git Commit Message
```text
feat(interview): implement dynamic AI question generator, real-time answer evaluation APIs, and interactive Interview Room UI
```

#### Estimated Time
**32 Hours (4 Days)**

---

### Milestone 7: Analytics Dashboard, Candidate Reports & History Engine

#### Objective
Build aggregated analytical performance pipelines, historical data query services, and a comprehensive candidate dashboard. Generate full downloadable PDF performance reports combining ATS scores, interview session history, radar metrics, and tailored growth action plans.

#### Features
- MongoDB aggregation pipelines compiling total resumes uploaded, average ATS scores, interview sessions completed, and overall skill progression over time.
- Dashboard API controllers (`getDashboardSummary`, `getUserHistory`, `getInterviewReportById`).
- Final Interview Performance Report Service (`interviewReportService.js`) populating the `interviewreports` collection.
- Frontend Candidate Dashboard rendering quick stats overview cards, score progression line charts, and recent activity logs.
- PDF Export capability allowing candidates to download standalone PDF diagnostic reports of their ATS analysis and mock interview sessions.

#### Files/Folders to Create
```
server/
├── controllers/
│   └── reportController.js
├── routes/
│   └── reportRoutes.js
└── services/
    └── reportAggregationService.js

client/
└── src/
    ├── services/
    │   └── reportService.js
    ├── components/
    │   ├── StatCard.jsx
    │   ├── PerformanceChart.jsx
    │   ├── HistoryTable.jsx
    │   └── PDFExportButton.jsx
    └── pages/
        ├── Dashboard.jsx
        └── ReportView.jsx
```

#### Expected Output
- Operational GET `/api/v1/reports/dashboard` returning aggregated candidate statistics and historical trends.
- Operational GET `/api/v1/reports/interview/:id` returning comprehensive multi-dimensional session feedback.
- Visually striking candidate dashboard displaying analytical summary metrics and actionable skill improvement roadmaps.
- Functional client PDF export generating high-resolution PDF download of analysis report.

#### Testing Checklist
- [ ] Query dashboard summary API for user with multiple sessions and verify aggregation totals match database records.
- [ ] Test history table pagination and filtering by date / score type.
- [ ] Trigger PDF export button on client and verify generated PDF downloads with complete chart graphics.
- [ ] Confirm new candidate account with 0 sessions renders clean dashboard empty states without UI crashes.

#### Git Commit Message
```text
feat(analytics): implement MongoDB aggregation pipelines, candidate dashboard APIs, performance charts, and PDF report export
```

#### Estimated Time
**24 Hours (3 Days)**

---

### Milestone 8: End-to-End Integration, UI Polish & Performance Optimization

#### Objective
Wire all frontend modules seamlessly with backend services, refine visual styling with modern micro-animations and cohesive dark/light themes, implement robust UI state loading skeletons, error boundaries, and optimize overall application performance and test coverage.

#### Features
- Global UI Polish: modern color palettes, subtle hover animations, glassmorphism card styling, and dynamic typography.
- Loading Skeletons and Spinners for asynchronous API calls (resume parsing, AI generation, chart loading).
- React Error Boundaries (`ErrorBoundary.jsx`) preventing full page crashes on component runtime failures.
- Global Toast Notifications (`react-hot-toast` / custom toast) for instant feedback on user actions.
- Frontend route lazy-loading (`React.lazy` + `Suspense`) reducing initial bundle size.
- Comprehensive end-to-end user testing verifying complete flow from registration -> resume upload -> ATS analysis -> mock interview -> candidate report.

#### Files/Folders to Create
```
client/
└── src/
    ├── components/
    │   ├── ErrorBoundary.jsx
    │   ├── LoadingSkeleton.jsx
    │   ├── Toast.jsx
    │   └── Modal.jsx
    ├── hooks/
    │   ├── useFetch.js
    │   └── useAsync.js
    └── utils/
        └── helpers.js
```

#### Expected Output
- High-performing Single Page Application achieving sub-2s page navigation transitions.
- Graceful handling of network latency or API drops with toast notifications and fallback UI.
- Zero open console warnings, unhandled promise rejections, or layout shift glitches.

#### Testing Checklist
- [ ] Perform complete end-to-end candidate workflow walkthrough without manual page refreshes.
- [ ] Test application under simulated slow 3G network conditions to verify skeleton loaders function properly.
- [ ] Trigger simulated API server failure and confirm Error Boundary / Toast gracefully informs candidate.
- [ ] Verify responsive layout integrity across desktop (1920px), tablet (768px), and mobile (375px) viewports.

#### Git Commit Message
```text
refactor(ui): implement route lazy loading, loading skeletons, error boundaries, toast alerts, and responsive UI polish
```

#### Estimated Time
**20 Hours (2.5 Days)**

---

### Milestone 9: Production Deployment, CI/CD & Final Handover

#### Objective
Prepare application for production launch. Deploy backend API service container to Render, deploy frontend SPA application to Vercel CDN, configure production environment variables, enforce SSL/CORS security policies, execute final smoke testing, and finalize project documentation.

#### Features
- Backend deployment configuration (`render.yaml` or Render Web Service setup) with Node version specification and production start scripts.
- Frontend deployment setup (`vercel.json`) with SPA route rewrite rules ensuring seamless client routing.
- Production environment variable configuration (Cloudinary credentials, MongoDB Atlas cluster URI, Gemini API keys, JWT Secrets).
- CORS policy locking down backend API requests to authorized Vercel client origin domain.
- Backend health check probe configuration (`/api/v1/health`) for automatic container uptime monitoring.
- Final production verification, smoke testing, and project documentation updates (`README.md`, `DEPLOYMENT.md`).

#### Files/Folders to Create
```
AI-Resume-Analyzer/
├── render.yaml
└── client/
    └── vercel.json
```

#### Expected Output
- Fully operational, public-facing backend API deployed on Render with HTTPS SSL encryption.
- Fully operational, public-facing frontend web application hosted on Vercel with CDN acceleration.
- End-to-end application executing live Gemini AI resume analysis and mock interviews in production environment.
- Complete documentation suite ready for final B.Tech CSE evaluation and viva presentation.

#### Testing Checklist
- [ ] Verify Render backend deployment build logs complete without errors and health check returns HTTP 200.
- [ ] Verify Vercel frontend deployment builds successfully and custom domain / default URL loads app.
- [ ] Test live user registration, PDF resume upload, ATS analysis, and AI mock interview on production URL.
- [ ] Verify CORS policy blocks unauthorized third-party origins trying to call backend API.
- [ ] Run final lighthouse audit ensuring production app achieves >90 scores in Performance, Accessibility, and SEO.

#### Git Commit Message
```text
deploy: setup Render backend configuration, Vercel frontend deployment rules, production CORS, and final documentation
```

#### Estimated Time
**16 Hours (2 Days)**

---

## 4. Critical Path & Risk Management Plan

```
[M1: Project Setup] ──> [M2: DB & Core Backend] ──> [M3: Auth Engine]
                                                             │
                                                             v
[M6: AI Mock Interview] <── [M5: Gemini ATS Module] <── [M4: Storage & Ingestion]
         │
         v
[M7: Analytics Dashboard] ──> [M8: Integration & Polish] ──> [M9: Production Deploy]
```

### Risk Matrix & Mitigation Strategies

| Potential Technical Risk | Severity | Risk Impact | Proactive Mitigation Strategy |
| :--- | :---: | :--- | :--- |
| **Gemini API Rate Limits / Quotas** | High | AI Analysis / Interview generation fails during live demo | Implement prompt token minimization, caching of common role templates, and fallback error handling with retry logic. |
| **PDF Text Extraction Failure** | Medium | Scanned / Image-based PDF resumes yield empty string | Enforce file validation on client/server; display clear alert advising user to upload text-selectable PDF / DOCX files. |
| **Cloudinary File Upload Timeouts** | Medium | Large document uploads block server event loop | Implement Multer buffer limits (5MB), async upload stream pipelines, and client-side pre-upload file size checks. |
| **Render Cold Start Delays** | Low | Free tier backend instance takes 30s to awaken | Configure `/api/v1/health` ping service or cron trigger to keep backend container warm during project evaluation. |
| **JSON Parsing Errors from AI Response** | High | Raw text returned by AI breaks application frontend | Utilize Gemini `responseSchema` parameters and strict JSON regex stripping in `aiService.js` before returning data. |

---

## 5. Development Summary & Time Allocation

- **Total Milestones:** 9 Professional Milestones
- **Total Development Hours:** ~172 Hours (~4.5 Weeks at 40 Hours/Week)
- **Primary Deliverable:** Production-Ready AI Resume Analyzer & Interview Coach Platform
