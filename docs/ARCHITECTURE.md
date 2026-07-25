# System Architecture Document
## Project Name: AI Resume Analyzer & Interview Coach
### Degree: B.Tech CSE (Artificial Intelligence & Machine Learning)

---

## 1. High-Level Architecture

The **AI Resume Analyzer & Interview Coach** follows a modern, scalable **3-Tier Web Architecture** built on a **Client-Server** model. The application cleanly decouples the User Interface (Presentation Layer) from the Business & AI Processing Logic (Application Layer) and Data Persistence (Database & Cloud Storage Layer).

### Architectural Pattern Overview
- **Presentation Tier (Frontend)**: Single Page Application (SPA) built with **React (Vite)** and styled with **Tailwind CSS**, hosted on **Vercel**.
- **Application Tier (Backend)**: RESTful API server built using **Node.js** and **Express.js**, hosted on **Render**.
- **Data & Storage Tier**: 
  - **MongoDB Atlas**: Cloud NoSQL document database for structured data storage (Users, Analysis Reports, Interview Sessions).
  - **Cloudinary**: Cloud media storage engine for secure PDF/DOCX resume file hosting.
- **AI Processing Engine**: **Google Gemini API** (`gemini-1.5-flash` / `gemini-2.0-flash`) for natural language processing, ATS scoring, resume extraction, and real-time interview question/answer evaluation.

```
+-----------------------------------------------------------------------+
|                           CLIENT BROWSER                              |
|              React (Vite) + Tailwind CSS (Vercel Edge)                |
+-----------------------------------------------------------------------+
                                   |
                          HTTPS / REST API Call
                                   v
+-----------------------------------------------------------------------+
|                           BACKEND SERVER                              |
|                 Node.js + Express.js API (Render)                     |
+-----------------------------------------------------------------------+
         |                         |                        |
  JWT / Controllers          PDF Buffer               Prompt / JSON
         |                         |                        |
         v                         v                        v
+------------------+     +------------------+     +------------------+
| DATABASE LAYER   |     | STORAGE LAYER    |     | AI LAYER         |
| MongoDB Atlas    |     | Cloudinary CDN   |     | Google Gemini    |
| (UserData/Scores)|     | (Resume Files)   |     | (NLP & Evaluation|
+------------------+     +------------------+     +------------------+
```

---

## 2. Application Layers

The application is structured into five distinct operational layers to maintain single responsibility, high maintainability, and clean separation of concerns.

### 1. Presentation Layer (Client-Side)
- **Technology**: React, Tailwind CSS, Axios, React Router.
- **Responsibility**: Renders dynamic user interfaces, captures user inputs (file upload, answer submission), handles routing, maintains local state, and manages HTTP request/response cycles.

### 2. API Gateway & Security Layer (Middleware)
- **Technology**: Express Middleware, Cors, Express Rate Limit, Helmet.js, JsonWebToken.
- **Responsibility**: Route protection, CORS verification, rate-limiting against abuse, HTTP header security, JWT authentication check, and incoming multipart request parsing (Multer).

### 3. Business & Service Layer (Backend Core)
- **Technology**: Node.js Services (`resumeService.js`, `interviewService.js`, `aiService.js`, `storageService.js`).
- **Responsibility**: Orchestrates application workflow. It parses uploaded document text, constructs tailored prompts for Gemini AI, sanitizes AI responses, and calculates final interview metrics.

### 4. Integration Layer (External APIs)
- **Technology**: `@google/genai` SDK, Cloudinary SDK.
- **Responsibility**: Abstract external API calls into modular utility functions. Ensures seamless communication with Google Gemini and Cloudinary storage.

### 5. Data Persistence Layer (Database)
- **Technology**: MongoDB Atlas, Mongoose ODM.
- **Responsibility**: Data validation, schema definition, document indexing, and persistent storage of user credentials, parsed resume data, ATS evaluations, and mock interview transcripts.

---

## 3. Frontend Architecture

The frontend is constructed as a modern, responsive Single Page Application (SPA) using React powered by Vite for fast bundling.

### Architecture Breakdown
- **Component-Based Hierarchy**: UI is split into atomic re-usable components (Buttons, Cards, Modals, Progress Indicators) and feature-specific page views.
- **Routing Strategy**: Handled by **React Router DOM v6**. Routes are categorized into:
  - **Public Routes**: Home Page, Login, Register.
  - **Protected Routes**: Dashboard, Resume Upload/Analysis, Mock Interview Room, Analytics/History.
- **State Management**:
  - **Global State**: React Context API (`AuthContext`) manages user authentication tokens, active user profiles, and session persistence.
  - **Local Component State**: React `useState` and `useReducer` manage transient form data, recording timers, and UI toggle states.
- **API Communication**: **Axios** instance configured with interceptors:
  - **Request Interceptor**: Automatically attaches `Authorization: Bearer <JWT_TOKEN>` header to outgoing HTTP requests.
  - **Response Interceptor**: Globally captures HTTP `401 Unauthorized` errors and automatically redirects expired sessions to the login page.
- **Styling Architecture**: Tailwind CSS provides utility-first responsive layout design with mobile-first breakpoints and clean UI themes.

---

## 4. Backend Architecture

The backend follows the standard **MVC (Model-View-Controller)** pattern simplified for RESTful web services.

### Folder Directory Structure Pattern
```
server/
│
├── config/             # DB connection, Cloudinary config, Gemini client setup
├── controllers/        # Request handling logic (auth, resume, interview)
├── middlewares/        # JWT auth, error handling, rate limiting, file upload
├── models/             # Mongoose schemas (User, Resume, Interview)
├── routes/             # API route definitions
├── services/           # Business logic & external API interactions
└── utils/              # Helper functions (PDF parsing, prompt builders)
```

### Express Middleware Pipeline
Every incoming HTTP request traverses a predefined execution pipeline:
1. **Security Headers (Helmet.js)**: Configures HTTP response headers.
2. **CORS Middleware**: Verifies client domain request permissions.
3. **Body Parser**: Parses incoming JSON payloads and URL-encoded data.
4. **Rate Limiter**: Limits repetitive requests from a single IP.
5. **Route Matcher**: Matches incoming URI pattern.
6. **Authentication Middleware**: Verifies JWT token validity for protected routes.
7. **Controller Action**: Executes business logic, calls services, interacts with database.
8. **Global Error Handler**: Catches unhandled errors and returns standardized JSON error responses.

---

## 5. Database Layer

The database layer utilizes **MongoDB Atlas**, a cloud-native NoSQL database. MongoDB was selected for its flexible JSON document structure, making it ideal for storing variable resume data and dynamic AI feedback reports.

### Entity-Relationship & Schema Architecture

#### 1. User Schema (`users`)
Stores user profiles and authentication credentials.
- `_id`: ObjectId (Primary Key)
- `name`: String (Required)
- `email`: String (Unique, Indexed)
- `password`: String (Bcrypt Hash)
- `role`: String (Default: 'student')
- `createdAt`: Timestamp

#### 2. Resume Analysis Schema (`resumes`)
Stores raw resume data, Cloudinary storage paths, and AI-generated ATS evaluations.
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key -> `users._id`)
- `fileName`: String
- `cloudinaryUrl`: String
- `cloudinaryPublicId`: String
- `extractedText`: String
- `targetRole`: String
- `atsScore`: Number (0 - 100)
- `parsedData`: Object
  - `skills`: Array of Strings
  - `experienceYears`: Number
  - `education`: Array of Objects
- `analysisResult`: Object
  - `strengths`: Array of Strings
  - `weaknesses`: Array of Strings
  - `missingKeywords`: Array of Strings
  - `formattingFeedback`: String
  - `improvements`: Array of Strings
- `createdAt`: Timestamp

#### 3. Mock Interview Schema (`interviews`)
Stores mock interview sessions, questions, user answers, and individual AI evaluations.
- `_id`: ObjectId (Primary Key)
- `userId`: ObjectId (Foreign Key -> `users._id`)
- `resumeId`: ObjectId (Foreign Key -> `resumes._id`)
- `jobRole`: String
- `difficulty`: String ('Easy', 'Medium', 'Hard')
- `overallScore`: Number (0 - 100)
- `overallFeedback`: String
- `questions`: Array of Objects
  - `questionId`: String
  - `questionText`: String
  - `category`: String ('Technical', 'Behavioral', 'Project-based')
  - `userAnswer`: String
  - `aiEvaluation`: Object
    - `score`: Number (0 - 10)
    - `accuracy`: String
    - `keyStrengths`: String
    - `areasToImprove`: String
    - `idealAnswer`: String
- `status`: String ('In-Progress', 'Completed')
- `createdAt`: Timestamp

### Database Indexing & Performance Strategy
- Compound Index on `(userId, createdAt)` across `resumes` and `interviews` collections to deliver fast dashboard queries.
- Unique Index on `users.email` to prevent duplicate user registrations.

---

## 6. AI Integration Layer

The AI Integration Layer is the primary engine of the application, utilizing **Google Gemini API**.

### AI Model Selection & Prompt Architecture
- **Model**: `gemini-1.5-flash` or `gemini-2.0-flash` chosen for low latency and high cost-efficiency.
- **Structured JSON Output**: System instructions enforce valid JSON output format so the backend can parse AI responses directly into JavaScript objects.

### Core AI Use Cases

#### 1. Resume Parsing & ATS Scoring
- **Prompt Input**: Extracted Resume Text + Target Job Description.
- **AI Task**: Evaluate formatting quality, keyword presence, experience relevance, and calculate an overall ATS Compatibility Score.
- **Response Format**: Strictly JSON containing numeric score, missing keywords list, strengths, and actionable suggestions.

#### 2. Dynamic Interview Question Generation
- **Prompt Input**: User's skills extracted from resume + target job role + difficulty level.
- **AI Task**: Generate tailored behavioral and technical interview questions specific to the user's actual background.

#### 3. Real-Time Answer Evaluation
- **Prompt Input**: Question asked + User's submitted answer (text or voice transcript).
- **AI Task**: Grade answer accuracy, depth of knowledge, communication clarity, and construct constructive feedback along with an ideal model answer.

### Resilience & Sanitization
- **Fallback JSON Parser**: Cleans potential markdown block wrappers (e.g., ````json ... ````) before executing `JSON.parse()`.
- **Retry Mechanism**: Implements 1-retry with exponential delay if Gemini API returns a rate-limit error.

---

## 7. Authentication Flow

The application implements a stateless **JSON Web Token (JWT)** authentication strategy combined with **bcrypt** password hashing.

### Step-by-Step Sequence

```
Client (React)                  Backend Server (Express)             Database (MongoDB)
   |                                     |                                    |
   |--- 1. POST /api/auth/login -------->|                                    |
   |    (email, password)                |                                    |
   |                                     |--- 2. Find User by Email --------->|
   |                                     |<-- User Document (hashed password)-|
   |                                     |                                    |
   |                                     |--- 3. bcrypt.compare(pass, hash)  |
   |                                     |                                    |
   |                                     |--- 4. Sign JWT Token ------------>|
   |                                     |    (Payload: userId, email)        |
   |<-- 5. 200 OK + JWT Token + User ----|                                    |
   |                                     |                                    |
   |--- 6. GET /api/resume (Protected) ->|                                    |
   |    Header: Bearer <Token>           |--- 7. Verify JWT Signature        |
   |                                     |--- 8. Fetch Data ----------------->|
   |<-- 9. 200 OK (Data Payload) --------|<-- Return Data -------------------|
```

1. **User Authentication Request**: The user enters credentials on the frontend React form.
2. **Password Verification**: Express receives credentials, queries MongoDB for the user, and uses `bcrypt.compare()` to verify the plaintext password against the stored salt & hash.
3. **Token Issuance**: If valid, the server signs a JWT containing `userId` and `email` using a secret key (`JWT_SECRET`) with a 7-day expiration time.
4. **Token Storage**: The client stores the JWT in client storage and includes it in the HTTP `Authorization: Bearer <Token>` header for all subsequent protected API calls.
5. **Route Guarding**: Express `authMiddleware` intercepts incoming requests, verifies the JWT signature, extracts user details, and attaches them to `req.user`.

---

## 8. Resume Upload Flow

The resume upload pipeline processes binary document files, uploads them to cloud media storage, and extracts raw text for AI analysis.

### Workflow Execution

```
Client (React)        Express (Multer)          Cloudinary Storage          pdf-parse Engine
  |                         |                          |                           |
  |-- 1. Select & Submit -> |                          |                           |
  |   Multipart PDF File    |-- 2. Buffer in Memory -> |                           |
  |                         |-- 3. Stream Upload ----> |                           |
  |                         |   (Upload PDF Buffer)    |                           |
  |                         |<-- 4. Return Secure URL -|                           |
  |                         |                          |                           |
  |                         |-- 5. Extract Text ---------------------------------> |
  |                         |<-- 6. Raw Plain Text String ------------------------ |
  |                         |
  |<-- 7. Return Metadata --|
```

1. **File Selection**: User selects a PDF/DOCX file (< 5MB limit).
2. **Multipart Request**: Axios submits file using `FormData` interface to `POST /api/resumes/upload`.
3. **Memory Buffering**: Backend uses **Multer** middleware with `memoryStorage()` to hold the file buffer securely in RAM without writing temporary files to local disk.
4. **Cloudinary Upload**: Server streams the file buffer directly to Cloudinary using `cloudinary.uploader.upload_stream()`. Cloudinary returns a secure HTTPS URL and Public ID.
5. **Text Extraction**: Server passes the memory buffer to **pdf-parse** (for PDF) or **mammoth** (for DOCX) to extract raw text content.
6. **Persistence**: Extracted text, Cloudinary URL, and file metadata are saved to MongoDB under the user's ID.

---

## 9. Resume Analysis Flow

The Resume Analysis engine processes raw resume text and compares it against target job requirements using Google Gemini AI.

### Workflow Sequence

```
Client (React)               Express Controller           Gemini AI API           MongoDB Atlas
  |                                  |                          |                       |
  |-- 1. Trigger Analysis ---------> |                          |                       |
  |   (resumeId, targetJobRole)      |                          |                       |
  |                                  |-- 2. Fetch Resume Text ------------------------> |
  |                                  |<-- Raw Text String ----------------------------- |
  |                                  |                          |                       |
  |                                  |-- 3. Build Prompt & ---->|                       |
  |                                  |      Send to Gemini      |                       |
  |                                  |<-- 4. Return JSON ------|                       |
  |                                  |      (ATS Score, Skills) |                       |
  |                                  |                          |                       |
  |                                  |-- 5. Save Analysis Result ---------------------> |
  |                                  |<-- Saved Document ------------------------------ |
  |<-- 6. Return Full Analysis JSON -|
```

1. **Initiation**: User selects a target job role (e.g., "AI Engineer") and clicks "Analyze Resume".
2. **Prompt Construction**: Backend fetches the stored extracted text and builds a specialized system prompt enforcing JSON schema response:
   - Target metrics: ATS Score (0-100), Identified Technical Skills, Soft Skills, Missing Role-Specific Keywords, Grammar & Format Feedback, Strengths, Weaknesses, and Key Recommendations.
3. **Gemini Execution**: Request sent to Gemini API (`gemini-1.5-flash`).
4. **Parsing & Persistence**: Server receives structured JSON, validates properties, saves analysis results into MongoDB `resumes` collection, and returns response to frontend.
5. **Visualization**: Frontend renders visual interactive analytics: Progress circles for ATS score, color-coded tag pills for missing keywords, and expandable feedback cards.

---

## 10. Mock Interview Flow

The Mock Interview feature delivers an adaptive, AI-driven practice session tailored to the candidate's actual resume and targeted position.

### Workflow Architecture

```
User (Browser)               React Application           Express Backend           Gemini AI API
  |                                  |                          |                        |
  |-- 1. Select Role & Start ------> |                          |                        |
  |                                  |-- 2. Request Questions ->|                        |
  |                                  |   (resumeId, jobRole)    |-- 3. Generate 5 Qs --->|
  |                                  |                          |<-- Questions Array ----|
  |<-- 4. Display Question 1 --------|                          |                        |
  |                                  |                          |                        |
  |-- 5. Submit Answer ------------> |                          |                        |
  |   (Speech-to-Text / Typed)       |-- 6. Evaluate Answer --->|                        |
  |                                  |   (Question & Answer)    |-- 7. Grade Answer ---->|
  |                                  |                          |<-- Score + Feedback ---|
  |<-- 8. Show Answer Grade ---------|                          |                        |
  |                                  |                          |                        |
  |   [Repeat for 5 Questions]       |                          |                        |
  |                                  |                          |                        |
  |<-- 9. Final Performance Summary -|-- 10. Save Session -----------------------------> |
                                                                    (MongoDB)
```

### Steps Breakdown
1. **Interview Initialization**: User chooses job role and difficulty level. Backend uses Gemini to generate 5 customized interview questions based on the candidate's extracted resume skills.
2. **Question Rendering**: React displays one question at a time.
3. **Answer Input**: User inputs answer via text field or voice input utilizing Web Speech API (`webkitSpeechRecognition`).
4. **Real-time AI Grading**: User clicks "Submit Answer". Backend passes Question + User Answer to Gemini. Gemini evaluates and returns score (0-10), technical accuracy, areas of improvement, and a model answer.
5. **Session Aggregation**: Once all 5 questions are answered, backend calculates total percentage score, compiles comprehensive feedback, saves the interview report to MongoDB, and displays a performance report to the user.

---

## 11. Security Architecture

Security is built into every layer of the system architecture to safeguard user data and preserve application integrity.

### Security Controls Summary
- **Authentication Security**: Passwords hashed using `bcrypt` with a salt round factor of 10. Direct plaintext storage of passwords is strict prohibited.
- **Authorization & Access Control**: JWT signature validation ensures users can only access, view, or delete their own uploaded resumes and interview reports (`userId` equality check).
- **Transport Layer Security (TLS)**: All communication between Client, Backend, MongoDB Atlas, Cloudinary, and Google Gemini API is encrypted via HTTPS (TLS 1.3).
- **Cross-Origin Resource Sharing (CORS)**: Backend CORS middleware explicitly restricts accepted origins to the frontend deployment domain on Vercel.
- **API Rate Limiting**: Implemented via `express-rate-limit` (e.g., maximum 100 requests per 15 minutes per IP) to mitigate Brute Force attacks and Denial of Service (DoS).
- **Input Sanitization & Injection Prevention**: Mongoose ODM prevents SQL/NoSQL injection by sanitizing query objects. Express validator sanitizes input text fields against Cross-Site Scripting (XSS).
- **Environment Variable Protection**: Secret parameters (`JWT_SECRET`, `MONGODB_URI`, `GEMINI_API_KEY`, `CLOUDINARY_API_SECRET`) are loaded strictly from server environment variables and never exposed to client code.

---

## 12. Deployment Architecture

The application is deployed across dedicated cloud infrastructure platforms optimized for continuous integration and scalability.

```
                                  +-----------------------+
                                  |     GitHub Repo       |
                                  +-----------------------+
                                     /                 \
                     Git Push (Main) /                   \ Git Push (Main)
                                    v                     v
                        +--------------------+   +--------------------+
                        |  Vercel Cloud      |   |  Render Service    |
                        |  (Frontend CI/CD)  |   |  (Backend CI/CD)   |
                        +--------------------+   +--------------------+
                                  |                        |
                              Edge CDN                Node.js Web App
                                  |                        |
                                  +-------- HTTPS ---------+
                                                           |
                                      +--------------------+--------------------+
                                      |                    |                    |
                                      v                    v                    v
                             +------------------+ +------------------+ +------------------+
                             | MongoDB Atlas    | | Cloudinary Media | | Google Gemini    |
                             | Cloud DB Cluster | | Asset CDN        | | AI Cloud API     |
                             +------------------+ +------------------+ +------------------+
```

### Component Deployment Breakdown
- **Frontend Hosting (Vercel)**:
  - Connects directly to the GitHub repository.
  - Automatically triggers production builds on `git push` to `main` branch.
  - Serves static Vite build files across Vercel's global Edge CDN network with automatic SSL certificate creation.
- **Backend Hosting (Render)**:
  - Deployed as a managed Express Node.js Web Service.
  - Automatically builds and runs `npm start` upon code commits.
  - Configured with environment variables for database connections and API secret keys.
- **Cloud Database (MongoDB Atlas)**: Hosted on a managed cloud cluster with automated daily backups and network IP access rules.
- **Media Asset Engine (Cloudinary)**: Handles image and document storage, delivering files over global CDN URLs.

---

## 13. Data Flow

This section details how data travels through the full-stack system during a standard user journey.

### Data Movement Lifecycle
1. **User Authentication**:
   `User Input -> React -> Axios POST -> Express Controller -> bcrypt Verify -> Sign JWT -> Response JSON -> React State / LocalStorage`

2. **Document Ingestion**:
   `PDF File -> Form Upload -> Axios Multipart -> Express (Multer RAM Buffer) -> Cloudinary Stream (Returns CDN URL) -> pdf-parse Engine (Extracts Text) -> MongoDB Save`

3. **AI Resume Analysis**:
   `User Action -> Express Router -> Resume Service -> Format Prompt -> Gemini API HTTP POST -> Parse Clean JSON Response -> MongoDB Update -> Express Response -> React Dynamic UI Update`

4. **Interactive AI Interview**:
   `Speech/Text Input -> React Component -> Axios POST -> Express Router -> Interview Service -> Gemini API Grade -> Save Result to MongoDB -> React Progress View`

---

## 14. Component Diagram (ASCII)

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (REACT SPA)                              |
|                                                                                   |
|  +-------------------+   +--------------------+   +----------------------------+  |
|  |  Auth Components  |   | Resume Components  |   | Mock Interview Components  |  |
|  | (Login, Register) |   | (Upload, View ATS) |   | (Audio/Text Room, Summary) |  |
|  +-------------------+   +--------------------+   +----------------------------+  |
|            |                       |                            |                 |
|            +-----------------------+----------------------------+                 |
|                                    |                                              |
|                                    v                                              |
|                       +--------------------------+                                |
|                       |  Axios Service Layer     |                                |
|                       |  (Interceptors & Auth)   |                                |
|                       +--------------------------+                                |
+------------------------------------+----------------------------------------------+
                                     |
                             HTTPS / JSON REST API
                                     |
+------------------------------------+----------------------------------------------+
|                                 BACKEND (NODE.JS / EXPRESS)                       |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                       Middleware Layer (Cors, Helmet, JWT Auth)             |  |
|  +-----------------------------------------------------------------------------+  |
|                                    |                                              |
|            +-----------------------+-----------------------+                      |
|            v                       v                       v                      |
|  +-------------------+   +-------------------+   +-------------------+            |
|  |  Auth Controller  |   | Resume Controller |   |InterviewController|            |
|  +-------------------+   +-------------------+   +-------------------+            |
|            |                       |                       |                      |
|            v                       v                       v                      |
|  +-----------------------------------------------------------------------------+  |
|  |                            Service & Business Layer                         |  |
|  |        (aiService.js, resumeService.js, interviewService.js)                |  |
|  +-----------------------------------------------------------------------------+  |
+-------------------/-------------------|-------------------\-----------------------+
                   /                    |                    \
                  /                     |                     \
                 v                      v                      v
   +--------------------+    +--------------------+    +--------------------+
   |   MongoDB Atlas    |    |  Cloudinary Storage|    |  Google Gemini API |
   |  (User/Resume Data)|    |  (PDF Asset CDN)   |    |  (LLM NLP Engine)  |
   +--------------------+    +--------------------+    +--------------------+
```

---

## 15. Sequence Diagram (ASCII)

### Sequence 1: Resume Upload & AI Analysis Flow

```
User          React Client         Express Server          Cloudinary            pdf-parse          Gemini API          MongoDB
 |                 |                     |                     |                    |                   |                  |
 |-- 1. Select PDF-|                     |                     |                    |                   |                  |
 |-- 2. Click Upload ------------------->|                     |                    |                   |                  |
 |                 |                     |-- 3. Stream File -->|                    |                   |                  |
 |                 |                     |<-- 4. Secure URL ---|                    |                   |                  |
 |                 |                     |                                          |                   |                  |
 |                 |                     |-- 5. Extract Text Buffer --------------->|                   |                  |
 |                 |                     |<-- 6. Extracted Text String -------------|                   |                  |
 |                 |                     |                                                              |                  |
 |                 |                     |-- 7. Send Prompt + Resume Text ----------------------------->|                  |
 |                 |                     |<-- 8. Return ATS JSON Evaluation ----------------------------|                  |
 |                 |                     |                                                                                 |
 |                 |                     |-- 9. Save Resume Metadata & AI Report ----------------------------------------->|
 |                 |                     |<-- 10. Confirm Saved Document --------------------------------------------------|
 |                 |                     |
 |<-- 11. Render ATS Analysis UI --------|
```

### Sequence 2: Mock Interview & Evaluation Flow

```
User          React Client         Express Server          Gemini API            MongoDB
 |                 |                     |                      |                   |
 |-- 1. Start Session ------------------>|                      |                   |
 |                 |                     |-- 2. Generate 5 Qs ->|                   |
 |                 |                     |<-- 3. Return Qs Array|                   |
 |<-- 4. Display Question 1 -------------|                      |                   |
 |                 |                     |                      |                   |
 |-- 5. Speak / Type Answer ------------>|                      |                   |
 |                 |                     |-- 6. Send Q + Answer>|                   |
 |                 |                     |<-- 7. Grade & Feedback                   |
 |<-- 8. Render AI Score & Feedback -----|                      |                   |
 |                 |                     |                      |                   |
 | [Repeats for all 5 Questions]         |                      |                   |
 |                 |                     |                      |                   |
 |-- 9. Complete Interview ------------->|                      |                   |
 |                 |                     |-- 10. Save Complete Session ------------>|
 |                 |                     |<-- 11. Confirm Save ---------------------|
 |<-- 12. Show Final Performance Analytics
```

---

## 16. Scalability Considerations

To ensure the application performs efficiently under higher user workloads, key scalability techniques are implemented across the stack:

### 1. Stateless Server Architecture
The backend does not store session state in server memory. All authentication is verified using self-contained JWT tokens. This design allows horizontal scaling by deploying multiple Express backend instances behind a load balancer without session syncing issues.

### 2. Offloading File Storage
Uploading resumes directly to Cloudinary isolates heavy file storage and bandwidth consumption from the main Express application server. The backend only handles light text buffers and CDN URL strings.

### 3. Asynchronous Non-Blocking I/O
Node.js processes database operations, external API calls, and file streams asynchronously using `async/await` patterns, preventing server thread blocking during high concurrency.

### 4. Database Connection Pooling & Indexing
Mongoose maintains an active MongoDB connection pool to reuse database connections. Fields frequently queried (e.g., `userId`, `email`, `createdAt`) are indexed to maintain sub-second database response times as document volume grows.

### 5. Caching Readiness
The architecture is designed to support an optional **Redis Cache Layer** between Express and MongoDB/Gemini API to cache static prompt templates, repeated job descriptions, and user profile data.

---

## 17. Future Improvements

While the current system provides a robust, production-ready foundation, several enhancements can be introduced in future iterations:

1. **Real-time Voice & Video AI Interviewer (WebRTC & WebSocket)**:
   Upgrade the mock interview interface from speech-to-text to live, low-latency audio/video streaming using WebSockets and real-time voice synthesis AI models (e.g., Gemini Live API).

2. **Automated Job Description Matching Engine**:
   Allow users to paste job URLs. The backend will scrape the page, extract key requirements, and automatically calculate a compatibility score against the candidate's resume.

3. **Peer-to-Peer Mock Interview Rooms**:
   Add WebRTC peer-to-peer room creation allowing students to conduct practice interviews with peers alongside AI feedback.

4. **Multi-Format Exporting & Resume Builder**:
   Integrate a dynamic resume builder that auto-formats ATS-optimized resumes based on AI suggestions and exports them to PDF/LaTeX.

5. **Advanced Predictive Analytics Dashboard**:
   Provide aggregate skill trend visualizations, tracking a user's ATS score improvements and mock interview readiness over time.
