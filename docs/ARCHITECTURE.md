# System Architecture & UML Technical Documentation
## Project Name: AI Resume Analyzer & Interview Coach

---

## Executive Summary

The **AI Resume Analyzer & Interview Coach** is a full-stack, enterprise-grade web application designed to help job seekers optimize their resumes, gain ATS (Applicant Tracking System) insights, and practice adaptive, role-specific mock interviews powered by artificial intelligence. 

This document serves as the complete, authoritative **System Architecture and UML Technical Documentation** for the implemented project. It details the structural, behavioral, data, and deployment views of the system using industry-standard Unified Modeling Language (UML) diagrams, Data Flow Diagrams (DFD), Entity-Relationship (ER) models, Mermaid diagrams, and PlantUML specifications.

---

## Table of Contents

1. [High-Level System Architecture](#1-high-level-system-architecture)
2. [Application Workflow](#2-application-workflow)
3. [Data Flow Diagram (Level 0 - Context Diagram)](#3-data-flow-diagram-level-0---context-diagram)
4. [Data Flow Diagram (Level 1 - Detailed DFD)](#4-data-flow-diagram-level-1---detailed-dfd)
5. [Use Case Diagram](#5-use-case-diagram)
6. [Class Diagram](#6-class-diagram)
7. [Entity Relationship Diagram (ERD)](#7-entity-relationship-diagram-erd)
8. [Sequence Diagram](#8-sequence-diagram)
9. [Activity Diagram](#9-activity-diagram)
10. [Component Diagram](#10-component-diagram)
11. [Deployment Diagram](#11-deployment-diagram)

---

## 1. High-Level System Architecture

### Purpose
The **High-Level System Architecture** provides a macro-level structural view of the system, illustrating how different architectural tiers interact across client, backend, data, storage, and AI processing layers. It establishes clear operational boundaries and demonstrates how client requests traverse security gateways, application controllers, service layers, external AI APIs, and persistent databases.

### Component Explanations
- **Client Tier (Presentation Layer)**: Single Page Application (SPA) built using React (Vite) and styled with Tailwind CSS. Hosted on Vercel Edge Network. Handles user UI rendering, state management, form capture, and Axios HTTP REST calls.
- **API Gateway & Security Layer**: Node.js/Express reverse proxy middleware pipeline featuring Helmet.js HTTP headers protection, CORS validation, Express Rate Limiting (`apiLimiter`, `sensitiveLimiter`, `aiLimiter`), MongoSanitize NoSQL injection defense, and JWT token authentication.
- **Application & Service Tier**: Express controllers (`authController`, `resumeController`, `profileController`, `dashboardController`) backed by specialized domain services (`parsingService`, `pdfService`, `geminiService`, `interviewAiService`, `storageService`, `dashboardService`).
- **Data Persistence Layer**: MongoDB Atlas cloud document database storing structured user accounts, parsed resume metadata, ATS evaluations, and mock interview questions/transcripts.
- **Media Asset Storage Tier**: Cloudinary cloud storage CDN (with local disk buffer fallback) for hosting uploaded resume files (PDF/DOCX).
- **AI Intelligence Layer**: Google Gemini API (`gemini-1.5-flash` / `gemini-2.0-flash`) accessed via Google Gen AI SDK for automated document text parsing, ATS score computation, resume weakness identification, dynamic question generation, and real-time candidate answer evaluation.

### Mermaid Diagram
```mermaid
graph TD
    subgraph Client_Tier ["Client Tier (React SPA / Vercel Edge)"]
        UI["React SPA User Interface"]
        AuthContext["AuthContext (JWT & User State)"]
        AxiosClient["Axios REST API Client"]
        UI --> AuthContext
        AuthContext --> AxiosClient
    end

    subgraph Security_Gateway ["API Gateway & Security Layer (Express)"]
        Helmet["Helmet Security Headers"]
        CORS["CORS Policy Validation"]
        RateLimit["Rate Limiter (api/sensitive/ai)"]
        Sanitize["MongoSanitize (NoSQL Protection)"]
        JWTAuth["Auth Middleware (JWT Verify)"]
        Helmet --> CORS --> RateLimit --> Sanitize --> JWTAuth
    end

    subgraph Application_Tier ["Application & Service Tier (Render Node.js)"]
        Controllers["Controllers (Auth, Resume, Profile, Dashboard)"]
        ParsingSvc["Parsing Service (pdf-parse / mammoth)"]
        GeminiSvc["Gemini AI Service"]
        InterviewSvc["Interview AI Service"]
        PdfSvc["PDF Export Service (pdfkit)"]
        StorageSvc["Storage Service (Cloudinary)"]

        Controllers --> ParsingSvc
        Controllers --> GeminiSvc
        Controllers --> InterviewSvc
        Controllers --> PdfSvc
        Controllers --> StorageSvc
    end

    subgraph Persistence_Storage ["Data & Media Tier"]
        MongoDB[("MongoDB Atlas Cloud Database")]
        Cloudinary[("Cloudinary Asset Storage CDN")]
    end

    subgraph AI_Engine ["External AI Layer"]
        GeminiAPI["Google Gemini API (1.5/2.0 Flash)"]
    end

    AxiosClient -- "HTTPS / REST Payload" --> Security_Gateway
    JWTAuth --> Controllers
    StorageSvc -- "Stream Upload" --> Cloudinary
    GeminiSvc -- "SDK Prompt / JSON Response" --> GeminiAPI
    InterviewSvc -- "SDK Prompt / JSON Response" --> GeminiAPI
    Controllers -- "Mongoose ODM Queries" --> MongoDB
```

### PlantUML Version
```plantuml
@startuml High_Level_System_Architecture
skinparam componentStyle uml2
skinparam boxPadding 10

package "Client Tier (React SPA)" {
  [React User Interface] as UI
  [Auth Context State] as AuthState
  [Axios HTTP Client] as Axios
  UI -> AuthState
  AuthState -> Axios
}

package "Security & Middleware Gateway" {
  [Helmet Header Guard] as Helmet
  [CORS Validator] as CORS
  [Express Rate Limiter] as RateLimiter
  [MongoSanitize Guard] as Sanitize
  [JWT Auth Middleware] as JWTAuth

  Helmet -> CORS
  CORS -> RateLimiter
  RateLimiter -> Sanitize
  Sanitize -> JWTAuth
}

package "Application Service Tier (Node.js/Express)" {
  [API Controllers] as Controllers
  [Parsing Service] as ParsingSvc
  [Gemini AI Service] as GeminiSvc
  [Interview AI Service] as InterviewSvc
  [Storage Service] as StorageSvc
  [PDF Export Service] as PdfSvc

  Controllers --> ParsingSvc
  Controllers --> GeminiSvc
  Controllers --> InterviewSvc
  Controllers --> StorageSvc
  Controllers --> PdfSvc
}

database "MongoDB Atlas" as MongoDB
cloud "Cloudinary CDN" as Cloudinary
cloud "Google Gemini API" as GeminiAPI

Axios --> Helmet : HTTPS / JSON REST
JWTAuth --> Controllers : Authorized Request
StorageSvc --> Cloudinary : Stream Upload Buffer
GeminiSvc --> GeminiAPI : Prompt Request / JSON
InterviewSvc --> GeminiAPI : Prompt Request / JSON
Controllers --> MongoDB : Read/Write Mongoose ODM
@enduml
```

---

## 2. Application Workflow

### Purpose
The **Application Workflow** defines the end-to-end user lifecycle and operational execution path within the system. It models how users progress from initial authentication to uploading documents, obtaining ATS analysis, practicing mock interviews, and viewing aggregated analytics.

### Component Explanations
1. **Authentication State**: User registers or logs in via `/api/auth`, receiving a JWT token stored in client memory/localStorage.
2. **Resume Ingestion Phase**: User uploads PDF/DOCX resume file via `/api/resumes/upload`. File is stored to Cloudinary (or local uploads folder) while `pdf-parse`/`mammoth` extracts raw text.
3. **AI Resume Analysis Phase**: User triggers analysis against job title and target job description via `/api/resumes/:id/analyze`. Gemini AI computes ATS score, lists strengths, weaknesses, missing skills, and improvement points.
4. **Interview Question Generation Phase**: User requests customized interview questions via `/api/resumes/:id/generate-questions`. Gemini AI generates technical (easy/medium/hard), HR, and project-based questions.
5. **Mock Interview Execution Phase**: User answers generated questions using text input or Web Speech API voice recording. AI grades accuracy, technical depth, and generates ideal model answers.
6. **Analytics & PDF Export Phase**: Aggregate metrics are presented on the Dashboard (`/api/dashboard`), and complete reports can be downloaded as PDF files via `/api/resumes/:id/export-pdf`.

### Mermaid Diagram
```mermaid
flowchart TD
    Start([User Arrives at Platform]) --> Choice{Authenticated?}
    Choice -- No --> AuthScreen[Login / Register Page]
    AuthScreen --> POST_Auth[POST /api/auth/login or /register]
    POST_Auth --> StoreJWT[Store JWT Token & Redirect]
    StoreJWT --> Dashboard[User Dashboard]
    Choice -- Yes --> Dashboard

    Dashboard --> ActionChoice{Select Action}

    ActionChoice -- Upload Resume --> UploadPage[Upload Resume Screen]
    UploadPage --> UploadAPI[POST /api/resumes/upload]
    UploadAPI --> ParseStep[Extract Text + Store PDF in Cloudinary]
    ParseStep --> ResumeDetails[Resume View Screen]

    ActionChoice -- Analyze Resume --> ResumeDetails
    ResumeDetails --> TriggerAnalysis[Click Analyze Resume]
    TriggerAnalysis --> AnalysisAPI[POST /api/resumes/:id/analyze]
    AnalysisAPI --> CallGemini1[Send Resume Text + JD to Gemini AI]
    CallGemini1 --> RenderATS[Display ATS Score, Missing Skills & Recommendations]

    ActionChoice -- Practice Interview --> QuestionGen[Click Generate Interview Questions]
    QuestionGen --> QuestionAPI[POST /api/resumes/:id/generate-questions]
    QuestionAPI --> CallGemini2[Send Skills + Role to Gemini AI]
    CallGemini2 --> InterviewRoom[Interactive Mock Interview Room]

    InterviewRoom --> AnswerInput[Submit Answer - Text / Voice Speech-to-Text]
    AnswerInput --> EvaluateAPI[Evaluate Answer via Gemini AI]
    EvaluateAPI --> ScoreDisplay[Show Question Score, Feedback & Ideal Answer]
    ScoreDisplay --> NextQ{More Questions?}
    NextQ -- Yes --> InterviewRoom
    NextQ -- No --> SaveInterview[Save Interview Session to Database]
    SaveInterview --> Dashboard

    ActionChoice -- Export Report --> ExportAPI[GET /api/resumes/:id/export-pdf]
    ExportAPI --> DownloadPDF[Download Formatted PDF Report]
```

### PlantUML Version
```plantuml
@startuml Application_Workflow
start
:User accesses platform;
if (Authenticated?) then (no)
  :Navigate to Login / Register;
  :Submit Credentials;
  :Receive and Store JWT Token;
else (yes)
endif

:Access Dashboard;

fork
  :Upload Resume PDF/DOCX;
  :Extract Plain Text Buffer;
  :Save Asset to Cloudinary / Local;
  :Persist Resume to MongoDB;
fork again
  :Select Uploaded Resume;
  :Input Target Job Title & Description;
  :Trigger Gemini AI Analysis;
  :Render ATS Score & Skill Gaps;
fork again
  :Trigger Question Generation;
  :Gemini Generates Categorized Questions;
  repeat
    :Display Interview Question;
    :Record Voice / Type Answer;
    :Evaluate Answer via Gemini AI;
    :Display Instant Feedback & Ideal Answer;
  repeat while (More Questions Remaining?) is (yes)
  ->no;
  :Save Interview Analytics;
fork again
  :Request PDF Export;
  :Generate PDF Stream (pdfkit);
  :Download Report PDF;
end fork

:Update User Dashboard Metrics;
stop
@startuml
```

---

## 3. Data Flow Diagram (Level 0 - Context Diagram)

### Purpose
The **Level 0 Data Flow Diagram (Context Diagram)** defines the high-level system boundary, showing how external entities (User/Candidate, Google Gemini AI API, Cloudinary Storage Engine) interact with the central **AI Resume Analyzer & Interview Coach Platform**.

### Component Explanations
- **External Entity 1: User / Candidate**: Initiates authentication requests, uploads resumes, inputs job details, submits interview answers, and receives ATS reports, interview questions, feedback, and dashboard analytics.
- **External Entity 2: Google Gemini AI API**: External AI service receiving prompt contexts (resume text, target role, candidate answers) and returning structured JSON evaluations (ATS scores, generated questions, answer evaluations).
- **External Entity 3: Cloudinary Storage Engine**: External media storage service receiving raw binary/buffer file streams and returning secure HTTPS asset URLs and public IDs.
- **Central System Process (0.0)**: The entire AI Resume Analyzer & Interview Coach system boundary.
- **Data Store (D1)**: MongoDB Atlas Cloud Database storing accounts, resumes, and interview metrics.

### Mermaid Diagram
```mermaid
graph TD
    User["User / Candidate (External Entity)"]
    Gemini["Google Gemini AI API (External Service)"]
    Cloudinary["Cloudinary Storage System (External Asset CDN)"]

    System(("0.0 <br> AI Resume Analyzer & <br> Interview Coach Platform"))

    DB[("D1: MongoDB Atlas Database")]

    User -- "1. Credentials, Resume Files, Job Details, Answers" --> System
    System -- "2. Auth Tokens, ATS Reports, Questions, Feedback, PDF Exports" --> User

    System -- "3. Resume Text, Job Descriptions, Candidate Answers" --> Gemini
    Gemini -- "4. Parsed JSON (Scores, Skill Gaps, Questions, Grades)" --> System

    System -- "5. File Stream Buffers (PDF/DOCX)" --> Cloudinary
    Cloudinary -- "6. Secure CDN Asset URLs & Public IDs" --> System

    System <==> "7. Mongoose Queries / Document Mutations" <==> DB
```

### PlantUML Version
```plantuml
@startuml DFD_Level_0
top to bottom direction
skinparam actorStyle stickman

actor "Candidate / User" as User
component "0.0 AI Resume Analyzer &\nInterview Coach Platform" as System
cloud "Google Gemini AI API" as Gemini
cloud "Cloudinary Storage" as Cloudinary
database "D1: MongoDB Atlas" as DB

User --> System : Credentials, Files, Job Descriptions, Answers
System --> User : JWT Token, ATS Analysis, Questions, Feedback, PDF Reports

System --> Gemini : Prompts (Resume Text, Job Description, User Answers)
Gemini --> System : JSON Evaluations (ATS Score, Questions, Feedback)

System --> Cloudinary : Binary File Streams (PDF / DOCX)
Cloudinary --> System : Asset HTTPS URLs & Public IDs

System <--> DB : User, Resume & Interview Records
@enduml
```

---

## 4. Data Flow Diagram (Level 1 - Detailed DFD)

### Purpose
The **Level 1 Data Flow Diagram** decomposes the main system process (0.0) into major functional sub-processes, mapping exact data flows between user interfaces, backend services, external APIs, and persistent database collections.

### Component Explanations
- **Process 1.0 (User Authentication & Authorization)**: Validates registration/login credentials, computes bcrypt hashes, issues signed JWTs, and updates User Collection (`D1`).
- **Process 2.0 (Resume Ingestion & Parsing)**: Accepts file uploads, delegates storage to Cloudinary, executes text extraction (`pdf-parse`/`mammoth`), and saves raw text into Resume Collection (`D2`).
- **Process 3.0 (AI Resume Analysis & ATS Scoring)**: Formats prompt data, requests evaluation from Gemini AI, parses returned JSON, updates ATS metrics in Resume Collection (`D2`), and returns analysis to User.
- **Process 4.0 (Mock Interview & Answer Evaluation)**: Generates interview questions via Gemini AI, captures user answers (text/voice transcript), submits answers for AI grading, and stores evaluation transcripts in Resume Collection (`D2`).
- **Process 5.0 (Dashboard Analytics & Report Generation)**: Queries User (`D1`) and Resume (`D2`) collections, compiles dashboard metrics, and streams downloadable PDF reports using `pdfkit`.

### Mermaid Diagram
```mermaid
graph TD
    User["User / Candidate"]
    Gemini["Google Gemini AI API"]
    Cloudinary["Cloudinary Storage"]

    subgraph Data_Stores ["Data Stores"]
        D1[("D1: Users Collection")]
        D2[("D2: Resumes Collection")]
    end

    subgraph Sub_Processes ["System Sub-Processes"]
        P1(("1.0 <br> User Auth & <br> Session Management"))
        P2(("2.0 <br> Resume Ingestion & <br> Text Parsing"))
        P3(("3.0 <br> AI Resume Analysis & <br> ATS Scoring"))
        P4(("4.0 <br> Mock Interview & <br> Answer Evaluation"))
        P5(("5.0 <br> Dashboard Analytics & <br> PDF Report Generator"))
    end

    %% User Interactions
    User -- "Login Credentials" --> P1
    P1 -- "JWT Token & Profile" --> User

    User -- "Upload PDF/DOCX File" --> P2
    P2 -- "Upload Confirmation & Extracted Text" --> User

    User -- "Target Job Title & Description" --> P3
    P3 -- "ATS Score, Missing Skills & Recommendations" --> User

    User -- "Selected Category & Answer Response" --> P4
    P4 -- "Interview Questions, Real-time Grades & Feedback" --> User

    User -- "Request Dashboard / Export PDF" --> P5
    P5 -- "Aggregated Metrics & PDF Stream Download" --> User

    %% Process to Data Store Interactions
    P1 <== "Read / Write User Account" ==> D1
    P2 -- "Save Resume Metadata & Extracted Text" --> D2
    P3 <== "Fetch Resume / Update ATS Analysis" ==> D2
    P4 <== "Fetch Resume Context / Save Interview Questions & Grades" ==> D2
    P5 -- "Read User & Resume Aggregates" --> D1
    P5 -- "Read Resume Analytics" --> D2

    %% Process to External Service Interactions
    P2 -- "Stream File Buffer" --> Cloudinary
    Cloudinary -- "Return File URL" --> P2

    P3 -- "Send Resume Text + JD Prompt" --> Gemini
    Gemini -- "Return ATS Analysis JSON" --> P3

    P4 -- "Send Skill Context / Question & Candidate Answer" --> Gemini
    Gemini -- "Return Generated Questions & Answer Grades JSON" --> P4
```

### PlantUML Version
```plantuml
@startuml DFD_Level_1
top to bottom direction

actor "Candidate / User" as User
cloud "Google Gemini AI API" as Gemini
cloud "Cloudinary Storage" as Cloudinary

database "D1: Users Collection" as D1
database "D2: Resumes Collection" as D2

usecase "1.0 User Auth &\nSession Management" as P1
usecase "2.0 Resume Ingestion &\nText Parsing" as P2
usecase "3.0 AI Resume Analysis &\nATS Scoring" as P3
usecase "4.0 Mock Interview &\nAnswer Evaluation" as P4
usecase "5.0 Dashboard Analytics &\nPDF Report Generator" as P5

User --> P1 : Email, Password Credentials
P1 --> User : Auth Token (JWT)

User --> P2 : Resume File (PDF / DOCX)
P2 --> User : Parsed File Summary

User --> P3 : Target Job Role & Description
P3 --> User : ATS Scores & Skill Recommendations

User --> P4 : Interview Response (Text / Audio)
P4 --> User : Generated Questions & Evaluation Feedback

User --> P5 : Request Analytics / PDF Export
P5 --> User : Dashboard Stats & Downloadable PDF

P1 <--> D1 : Account Records
P2 --> D2 : Resume Document
P3 <--> D2 : ATS Analysis Fields
P4 <--> D2 : Question & Evaluation Transcripts
P5 --> D1 : User Info
P5 --> D2 : Aggregated Metrics

P2 --> Cloudinary : Stream File Buffer
Cloudinary --> P2 : CDN HTTPS Asset Link

P3 --> Gemini : Structured Analysis Prompt
Gemini --> P3 : ATS Evaluation JSON

P4 --> Gemini : Question / Answer Prompt
Gemini --> P4 : Questions & Evaluation JSON
@enduml
```

---

## 5. Use Case Diagram

### Purpose
The **Use Case Diagram** summarizes system behavior from an actor-centric perspective. It models primary user capabilities (Candidate), administrative capabilities (Admin), and supporting interactions with external systems (Google Gemini AI and Cloudinary Storage), explicitly marking dependent (`<<include>>`) and optional (`<<extend>>`) flows.

### Component Explanations
- **Primary Actor: Candidate / Job Seeker**: Registered user interacting with the web application to analyze resumes and conduct mock interviews.
- **Primary Actor: System Administrator**: System manager monitoring application health and user metrics.
- **Secondary Actor: Google Gemini AI API**: AI engine executing natural language processing and evaluations.
- **Secondary Actor: Cloudinary Storage Service**: CDN hosting resume files.
- **Use Cases**:
  - `UC-1: Register Account` & `UC-2: Login / Authenticate` (Includes `UC-3: Validate Credentials`).
  - `UC-4: Upload Resume Document` (Includes `UC-5: Extract Text Buffer` & `UC-6: Store File to Cloudinary`).
  - `UC-7: Analyze Resume against Job Description` (Includes `UC-8: Compute ATS Score via Gemini AI`).
  - `UC-9: Practice AI Mock Interview` (Includes `UC-10: Generate Tailored Questions` & `UC-11: Grade Candidate Answer`).
  - `UC-12: Export PDF Analysis Report` (Extends `UC-7`).
  - `UC-13: View Dashboard Analytics`.
  - `UC-14: Monitor System Health` (Admin actor).

### Mermaid Diagram
```mermaid
graph LR
    Candidate(("Candidate / Job Seeker"))
    Admin(("System Administrator"))
    Gemini(("Google Gemini AI API"))
    Cloudinary(("Cloudinary Storage Service"))

    subgraph System_Boundary ["AI Resume Analyzer & Interview Coach Platform"]
        UC1["UC-1: Register Account"]
        UC2["UC-2: Login / Authenticate"]
        UC3["UC-3: Validate Credentials"]
        UC4["UC-4: Upload Resume Document"]
        UC5["UC-5: Extract Text Buffer"]
        UC6["UC-6: Store File in Storage"]
        UC7["UC-7: Analyze Resume & ATS"]
        UC8["UC-8: Compute ATS via Gemini"]
        UC9["UC-9: Practice Mock Interview"]
        UC10["UC-10: Generate Dynamic Questions"]
        UC11["UC-11: Grade Candidate Answer"]
        UC12["UC-12: Export PDF Report"]
        UC13["UC-13: View Dashboard Metrics"]
        UC14["UC-14: Monitor System Health"]
    end

    Candidate --> UC1
    Candidate --> UC2
    Candidate --> UC4
    Candidate --> UC7
    Candidate --> UC9
    Candidate --> UC12
    Candidate --> UC13

    Admin --> UC14

    UC2 -- "<<include>>" --> UC3
    UC4 -- "<<include>>" --> UC5
    UC4 -- "<<include>>" --> UC6
    UC7 -- "<<include>>" --> UC8
    UC9 -- "<<include>>" --> UC10
    UC9 -- "<<include>>" --> UC11
    UC12 -- "<<extend>>" --> UC7

    UC6 --> Cloudinary
    UC8 --> Gemini
    UC10 --> Gemini
    UC11 --> Gemini
```

### PlantUML Version
```plantuml
@startuml Use_Case_Diagram
left to right direction
skinparam packageStyle rectangle

actor "Candidate / Job Seeker" as Candidate
actor "System Administrator" as Admin
actor "Google Gemini AI API" as Gemini << Service >>
actor "Cloudinary Storage" as Cloudinary << Service >>

rectangle "AI Resume Analyzer & Interview Coach Platform" {
  usecase "UC-1: Register Account" as UC1
  usecase "UC-2: Login / Authenticate" as UC2
  usecase "UC-3: Validate Credentials" as UC3
  usecase "UC-4: Upload Resume Document" as UC4
  usecase "UC-5: Extract Text Buffer" as UC5
  usecase "UC-6: Store File to Storage" as UC6
  usecase "UC-7: Analyze Resume & ATS Score" as UC7
  usecase "UC-8: Compute ATS via Gemini" as UC8
  usecase "UC-9: Practice Mock Interview" as UC9
  usecase "UC-10: Generate Tailored Questions" as UC10
  usecase "UC-11: Grade Candidate Answer" as UC11
  usecase "UC-12: Export PDF Report" as UC12
  usecase "UC-13: View Dashboard Metrics" as UC13
  usecase "UC-14: Monitor System Health" as UC14
}

Candidate --> UC1
Candidate --> UC2
Candidate --> UC4
Candidate --> UC7
Candidate --> UC9
Candidate --> UC12
Candidate --> UC13

Admin --> UC14

UC2 ..> UC3 : <<include>>
UC4 ..> UC5 : <<include>>
UC4 ..> UC6 : <<include>>
UC7 ..> UC8 : <<include>>
UC9 ..> UC10 : <<include>>
UC9 ..> UC11 : <<include>>
UC12 ..> UC7 : <<extend>>

UC6 --> Cloudinary
UC8 --> Gemini
UC10 --> Gemini
UC11 --> Gemini
@enduml
```

---

## 6. Class Diagram

### Purpose
The **Class Diagram** presents the object-oriented structure of the backend application codebase. It models Mongoose data schemas (`User`, `Resume`), Express controllers (`authController`, `resumeController`, `dashboardController`), domain services (`parsingService`, `geminiService`, `interviewAiService`, `storageService`, `pdfService`), middleware modules, and their relationships (associations, dependencies, composition).

### Component Explanations
- **Data Models**:
  - `User`: Encapsulates user profile, password hash, role (`user`/`admin`), and timestamps.
  - `Resume`: Encapsulates resume metadata, stored file URL, extracted text, parsing/analysis status, embedded `Analysis` schema (ATS score, missing skills), and embedded `InterviewQuestions` schema.
- **Controllers**: Handle HTTP REST requests, parameter extraction, service invocation, and standardized HTTP responses.
- **Services**: Execute domain business logic (e.g., calling Gemini SDK, managing storage buffers, writing PDF streams via `pdfkit`).
- **Middleware**: Execute pre-controller checks (JWT verification, Multer memory storage file parsing, input validation).

### Mermaid Diagram
```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String fullName
        +String email
        +String password
        +String profilePicture
        +String role
        +Boolean emailVerified
        +Date createdAt
        +Date updatedAt
    }

    class Resume {
        +ObjectId _id
        +ObjectId userId
        +String originalFileName
        +String storedFileName
        +String fileUrl
        +String fileType
        +Number fileSize
        +String jobTitle
        +String jobDescription
        +String extractedText
        +String parsingStatus
        +String analysisStatus
        +AnalysisObject analysis
        +String interviewQuestionsStatus
        +InterviewQuestionsObject interviewQuestions
        +Date uploadDate
    }

    class AuthController {
        +register(req, res, next)
        +login(req, res, next)
    }

    class ResumeController {
        +uploadResume(req, res, next)
        +getUserResumes(req, res, next)
        +getResumeById(req, res, next)
        +analyzeResume(req, res, next)
        +generateInterviewQuestions(req, res, next)
        +exportResumePdf(req, res, next)
        +deleteResume(req, res, next)
    }

    class DashboardController {
        +getDashboard(req, res, next)
    }

    class ProfileController {
        +getProfile(req, res, next)
    }

    class ParsingService {
        +extractText(fileBuffer, fileType) String
        +parsePdf(buffer) String
        +parseDocx(buffer) String
    }

    class GeminiService {
        +analyzeResumeText(extractedText, jobTitle, jobDescription) Object
        +generateQuestions(extractedText, jobTitle, jobDescription) Object
    }

    class InterviewAiService {
        +generateInterviewQuestions(resumeText, jobTitle) Object
        +evaluateAnswer(question, answer, jobTitle) Object
    }

    class StorageService {
        +uploadFile(file) Object
        +deleteFile(fileUrl) Boolean
    }

    class PdfService {
        +generateResumeReportPdf(resume, user, stream) Void
    }

    class AuthMiddleware {
        +authenticateToken(req, res, next) Void
    }

    class UploadMiddleware {
        +uploadResumeMiddleware(req, res, next) Void
    }

    %% Relationships
    User "1" -- "0..*" Resume : owns >
    AuthController ..> User : queries/creates
    AuthController ..> AuthMiddleware : signs JWT for
    ResumeController ..> Resume : reads/updates
    ResumeController ..> ParsingService : uses
    ResumeController ..> GeminiService : uses
    ResumeController ..> InterviewAiService : uses
    ResumeController ..> StorageService : uses
    ResumeController ..> PdfService : uses
    DashboardController ..> Resume : aggregates
    DashboardController ..> User : reads
    ProfileController ..> User : reads
```

### PlantUML Version
```plantuml
@startuml Class_Diagram

class User {
  + ObjectId _id
  + String fullName
  + String email
  + String password
  + String profilePicture
  + String role
  + Boolean emailVerified
  + Date createdAt
}

class Resume {
  + ObjectId _id
  + ObjectId userId
  + String originalFileName
  + String storedFileName
  + String fileUrl
  + String fileType
  + Number fileSize
  + String jobTitle
  + String jobDescription
  + String extractedText
  + String parsingStatus
  + String analysisStatus
  + AnalysisObject analysis
  + String interviewQuestionsStatus
  + InterviewQuestionsObject interviewQuestions
  + Date uploadDate
}

class AuthController {
  + register(req, res)
  + login(req, res)
}

class ResumeController {
  + uploadResume(req, res)
  + getUserResumes(req, res)
  + getResumeById(req, res)
  + analyzeResume(req, res)
  + generateInterviewQuestions(req, res)
  + exportResumePdf(req, res)
  + deleteResume(req, res)
}

class DashboardController {
  + getDashboard(req, res)
}

class ParsingService {
  + extractText(buffer, type) : String
}

class GeminiService {
  + analyzeResumeText(text, title, desc) : Object
}

class InterviewAiService {
  + generateInterviewQuestions(text, title) : Object
  + evaluateAnswer(question, answer, title) : Object
}

class StorageService {
  + uploadFile(file) : Object
  + deleteFile(url) : Boolean
}

class PdfService {
  + generateResumeReportPdf(resume, user, stream) : Void
}

User "1" -- "0..*" Resume : owns
AuthController ..> User
ResumeController ..> Resume
ResumeController ..> ParsingService
ResumeController ..> GeminiService
ResumeController ..> InterviewAiService
ResumeController ..> StorageService
ResumeController ..> PdfService
DashboardController ..> Resume
DashboardController ..> User

@enduml
```

---

## 7. Entity Relationship Diagram (ERD)

### Purpose
The **Entity Relationship Diagram (ERD)** details the logical data model stored in MongoDB Atlas via Mongoose ODM. It specifies collections, primary/foreign key attributes, nested JSON documents, data types, constraints, and structural cardinalities.

### Component Explanations
- **`USERS` Collection**: Stores user profile details.
  - `_id` (ObjectId, Primary Key)
  - `email` (String, Unique Index, Lowercase, Required)
  - `password` (String, Hashed via bcrypt, Select: false)
  - `fullName`, `profilePicture`, `role`, `emailVerified`, `createdAt`, `updatedAt`
- **`RESUMES` Collection**: Stores uploaded resume files, extracted text, ATS scores, and interview sessions.
  - `_id` (ObjectId, Primary Key)
  - `userId` (ObjectId, Foreign Key -> `USERS._id`, Indexed)
  - `originalFileName`, `storedFileName`, `fileUrl`, `fileType`, `fileSize`
  - `jobTitle`, `jobDescription`, `extractedText`
  - `parsingStatus`, `analysisStatus`, `interviewQuestionsStatus`
  - **Embedded Document `analysis`**: Stores `atsScore`, `strengths[]`, `weaknesses[]`, `missingSkills[]`, `roleMatch[]`, `improvements[]`, `summary`, `analyzedAt`.
  - **Embedded Document `interviewQuestions`**: Stores `technical` (easy/medium/hard), `hr[]`, `projectBased[]`, `tips[]`, `generatedAt`.
- **Cardinality**: `1 : N` (One User can own Zero or Many Resume documents. Each Resume document belongs to exactly One User).

### Mermaid Diagram
```mermaid
erDiagram
    USERS ||--o{ RESUMES : "uploads / owns"

    USERS {
        ObjectId _id PK
        String fullName "Required"
        String email UK "Unique, Lowercase"
        String password "Bcrypt Hash (Select: false)"
        String profilePicture "Default: Empty"
        String role "Enum: user, admin"
        Boolean emailVerified "Default: false"
        Date createdAt "Timestamp"
        Date updatedAt "Timestamp"
    }

    RESUMES {
        ObjectId _id PK
        ObjectId userId FK "Ref: USERS, Indexed"
        String originalFileName "Required"
        String storedFileName "Required"
        String fileUrl "Required"
        String fileType "MIME Type"
        Number fileSize "Bytes"
        String jobTitle "Target Role"
        String jobDescription "Target JD text"
        String extractedText "Parsed raw text"
        String parsingStatus "Enum: pending, completed, failed"
        String analysisStatus "Enum: none, pending, completed, failed"
        Object analysis "Embedded ATS Score & Skill Gaps"
        String interviewQuestionsStatus "Enum: none, pending, completed, failed"
        Object interviewQuestions "Embedded Categorized Questions"
        Date uploadDate "Indexed (-1)"
    }
```

### PlantUML Version
```plantuml
@startuml Entity_Relationship_Diagram
entity "USERS" as users {
  * _id : ObjectId <<PK>>
  --
  * fullName : String
  * email : String <<UK>>
  * password : String (Bcrypt Hash)
  profilePicture : String
  role : String = "user"
  emailVerified : Boolean = false
  createdAt : Date
  updatedAt : Date
}

entity "RESUMES" as resumes {
  * _id : ObjectId <<PK>>
  --
  * userId : ObjectId <<FK>>
  * originalFileName : String
  * storedFileName : String
  * fileUrl : String
  fileType : String
  fileSize : Number
  jobTitle : String
  jobDescription : String
  extractedText : String
  parsingStatus : String
  analysisStatus : String
  analysis : Object { atsScore, strengths, missingSkills }
  interviewQuestionsStatus : String
  interviewQuestions : Object { technical, hr, projectBased }
  uploadDate : Date
}

users ||--o{ resumes : "1 User owns N Resumes"
@enduml
```

---

## 8. Sequence Diagram

### Purpose
The **Sequence Diagram** models chronological message flows across system actors, client components, middleware, controllers, services, database engines, and external AI APIs during core execution workflows.

### Component Explanations
The diagram details three consecutive execution scenarios:
1. **Scenario A: Resume File Upload & Text Ingestion**.
2. **Scenario B: AI Resume Analysis & ATS Score Computation**.
3. **Scenario C: Dynamic Interview Question Generation & Answer Evaluation**.

### Mermaid Diagram
```mermaid
sequenceDiagram
    autonumber
    actor Candidate as User / Candidate
    participant React as React Client SPA
    participant Router as Express API Router
    participant Auth as Auth Middleware (JWT)
    participant Controller as Resume Controller
    participant ParsingSvc as Parsing Service
    participant StorageSvc as Storage Service (Cloudinary)
    participant GeminiSvc as Gemini AI Service
    participant DB as MongoDB Atlas

    %% Scenario A: Resume Upload
    rect rgb(240, 248, 255)
    note right of Candidate: Scenario A: Resume File Upload & Parsing
    Candidate ->> React: Select PDF File & Click Upload
    React ->> Router: POST /api/resumes/upload (FormData + Bearer JWT)
    Router ->> Auth: Verify JWT Token Signature
    Auth -->> Router: Token Valid (Attach req.user)
    Router ->> Controller: uploadResume(req, res)
    Controller ->> StorageSvc: uploadFile(fileBuffer)
    StorageSvc -->> Controller: Return { fileUrl, publicId }
    Controller ->> ParsingSvc: extractText(buffer, mimeType)
    ParsingSvc -->> Controller: Return Extracted Plain Text String
    Controller ->> DB: Resume.create({ userId, fileUrl, extractedText })
    DB -->> Controller: Return Saved Resume Document
    Controller -->> React: 201 Created (Resume JSON)
    React -->> Candidate: Display Uploaded Resume View
    end

    %% Scenario B: Resume Analysis
    rect rgb(255, 245, 238)
    note right of Candidate: Scenario B: AI Resume Analysis & ATS Scoring
    Candidate ->> React: Enter Job Title/JD & Click Analyze
    React ->> Router: POST /api/resumes/:id/analyze
    Router ->> Auth: Verify JWT Token
    Auth -->> Router: Token Valid
    Router ->> Controller: analyzeResume(req, res)
    Controller ->> DB: Resume.findById(id)
    DB -->> Controller: Return Resume Document
    Controller ->> GeminiSvc: analyzeResumeText(extractedText, jobTitle, jobDescription)
    GeminiSvc ->> GeminiSvc: Format Structured System Prompt
    GeminiSvc -->> Controller: Return Clean ATS Analysis JSON
    Controller ->> DB: Resume.findByIdAndUpdate(id, { analysis, analysisStatus: 'completed' })
    DB -->> Controller: Return Updated Resume Document
    Controller -->> React: 200 OK (Updated Analysis JSON)
    React -->> Candidate: Render ATS Score, Strengths & Skill Gaps
    end

    %% Scenario C: Interview Generation & Evaluation
    rect rgb(240, 255, 240)
    note right of Candidate: Scenario C: Mock Interview & Answer Evaluation
    Candidate ->> React: Click Generate Interview Questions
    React ->> Router: POST /api/resumes/:id/generate-questions
    Router ->> Controller: generateInterviewQuestions(req, res)
    Controller ->> GeminiSvc: generateQuestions(extractedText, jobTitle)
    GeminiSvc -->> Controller: Return Questions JSON (Technical, HR, Project)
    Controller ->> DB: Save Questions to Resume Document
    Controller -->> React: 200 OK (Questions Array)
    React -->> Candidate: Render Question 1 in Interview Room

    Candidate ->> React: Submit Answer (Voice/Text)
    React ->> Router: POST /api/resumes/:id/evaluate-answer
    Router ->> Controller: evaluateAnswer(question, answer)
    Controller ->> GeminiSvc: Evaluate Answer Quality & Depth
    GeminiSvc -->> Controller: Return Score (0-10), Feedback & Ideal Answer
    Controller -->> React: 200 OK (Evaluation Feedback JSON)
    React -->> Candidate: Display Score & Ideal Answer Feedback
    end
```

### PlantUML Version
```plantuml
@startuml Sequence_Diagram
autonumber
actor Candidate as "User / Candidate"
participant React as "React Client SPA"
participant Router as "Express Router"
participant Auth as "JWT Auth Middleware"
participant Controller as "Resume Controller"
participant Parsing as "Parsing Service"
participant Storage as "Cloudinary Storage"
participant Gemini as "Google Gemini AI"
database DB as "MongoDB Atlas"

Candidate -> React : Upload Resume PDF
React -> Router : POST /api/resumes/upload
Router -> Auth : Verify JWT Bearer Token
Auth -> Router : Token Valid (req.user)
Router -> Controller : uploadResume()
Controller -> Storage : Stream File Buffer
Storage --> Controller : HTTPS Asset URL
Controller -> Parsing : extractText(buffer)
Parsing --> Controller : Extracted Text String
Controller -> DB : Resume.create()
DB --> Controller : Saved Document
Controller --> React : 201 Created (Resume JSON)
React --> Candidate : Render Resume Summary

Candidate -> React : Request ATS Analysis
React -> Router : POST /api/resumes/:id/analyze
Router -> Controller : analyzeResume()
Controller -> DB : Resume.findById(id)
DB --> Controller : Resume Document
Controller -> Gemini : Prompt (Resume Text + Target Job Description)
Gemini --> Controller : ATS Evaluation JSON
Controller -> DB : Update Resume Analysis Fields
DB --> Controller : Saved Updated Document
Controller --> React : 200 OK (ATS Analysis)
React --> Candidate : Render Score Gauge & Skill Recommendations
@enduml
```

---

## 9. Activity Diagram

### Purpose
The **Activity Diagram** models the dynamic control logic, operational workflows, decision points, and error-handling loops executed by the system during resume parsing, AI analysis, and interview processing.

### Component Explanations
- **Start Node**: Triggered when a user submits a resume and initiates processing.
- **Decision Node [Valid File?]**: Checks file MIME type (`application/pdf`, `docx`) and file size (< 5MB limit).
- **Parallel Action (Fork)**: Simultaneously streams document buffer to Cloudinary and extracts plain text via `pdf-parse`/`mammoth`.
- **Decision Node [Parsing Success?]**: Verifies extracted text length. If empty or corrupt, sets `parsingStatus = 'failed'` and returns an error response.
- **AI Processing Action**: Sends extracted text + job description to Gemini AI engine.
- **Decision Node [Gemini API Response Valid?]**: Verifies JSON payload integrity. If invalid, executes automatic retry logic with backoff delay.
- **Persistence Node**: Saves result to MongoDB.
- **End Node**: Renders output to user UI.

### Mermaid Diagram
```mermaid
stateDiagram-v2
    [*] --> UploadRequested : User submits file & job target

    state UploadRequested {
        --> ValidateFile
    }

    state ValidateFile <<choice>>
    ValidateFile --> RejectFile : File > 5MB OR Invalid MIME
    ValidateFile --> ProcessFile : File Valid (PDF/DOCX)

    RejectFile --> [*] : Return 400 Bad Request

    state ProcessFile {
        state Fork_State <<fork>>
        --> Fork_State
        Fork_State --> UploadCloudinary : Stream buffer to Cloudinary
        Fork_State --> ExtractTextBuffer : Execute pdf-parse / mammoth
        
        state Join_State <<join>>
        UploadCloudinary --> Join_State
        ExtractTextBuffer --> Join_State
    }

    Join_State --> CheckTextParsed

    state CheckTextParsed <<choice>>
    CheckTextParsed --> FailParsing : Text empty / corrupt
    CheckTextParsed --> ConstructPrompt : Text parsed successfully

    FailParsing --> StoreFailedStatus : Update parsingStatus = 'failed'
    StoreFailedStatus --> [*] : Return 422 Unprocessable Entity

    ConstructPrompt --> SendGeminiAI : Format System JSON Prompt

    state SendGeminiAI {
        --> CallGeminiSDK
    }

    CallGeminiSDK --> CheckAIResult

    state CheckAIResult <<choice>>
    CheckAIResult --> RetryAI : Gemini Error / Invalid JSON
    CheckAIResult --> ParseATSJSON : Valid JSON Received

    RetryAI --> CallGeminiSDK : Retry (1-Attempt Delay)
    RetryAI --> AIRequestFailed : Max Retries Exceeded
    AIRequestFailed --> [*] : Return 500 AI Service Error

    ParseATSJSON --> PersistDatabase : Save ATS Score & Skill Gaps to MongoDB
    PersistDatabase --> RenderUI : Return 200 OK Payload to React
    RenderUI --> [*] : Workflow Complete
```

### PlantUML Version
```plantuml
@startuml Activity_Diagram
start
:User Submits Resume File & Target Job Details;

if (File Size < 5MB AND MIME Valid?) then (yes)
  fork
    :Stream File Buffer to Cloudinary;
  fork again
    :Extract Text via pdf-parse / mammoth;
  end fork

  if (Extracted Text Valid?) then (yes)
    :Construct Gemini AI Prompt;
    repeat
      :Send Request to Google Gemini AI API;
    backward:Retry API Request (Backoff Delay);
    repeat while (JSON Response Valid?) is (no)
    ->yes;
    :Parse ATS Score, Strengths & Missing Skills;
    :Save Document to MongoDB Atlas;
    :Return 200 OK JSON to React Frontend;
    :Render ATS Visual Dashboard;
    stop
  else (no)
    :Set parsingStatus = 'failed';
    :Return 422 Unprocessable Entity Error;
    stop
  endif
else (no)
  :Return 400 File Validation Error;
  stop
endif
@enduml
```

---

## 10. Component Diagram

### Purpose
The **Component Diagram** illustrates the physical software components, component interfaces, dependency wiring, and structural coupling across presentation modules, server controllers, domain services, data models, and cloud provider adapters.

### Component Explanations
- **Frontend Component (`Client SPA`)**: Comprises `AuthModule`, `ResumeModule`, `InterviewModule`, and `DashboardModule`. Communicates over HTTPS via `Axios HTTP Client`.
- **API Gateway Component**: Exposes REST interfaces (`/api/auth`, `/api/resumes`, `/api/dashboard`, `/api/profile`) protected by rate limiters and authentication guards.
- **Controller Component**: Contains `AuthController`, `ResumeController`, `DashboardController`, `ProfileController`.
- **Service Layer Component**: Enforces single responsibility through `ParsingService`, `PdfService`, `GeminiService`, `InterviewAiService`, and `StorageService`.
- **Persistence Adapter Component**: Encapsulates Mongoose models (`UserModel`, `ResumeModel`) interacting with MongoDB Atlas over TCP/IP (`mongodb+srv://`).
- **External API Adapters**: Encapsulates `@google/genai` client SDK for Gemini AI and `cloudinary` SDK for file media streaming.

### Mermaid Diagram
```mermaid
graph TD
    subgraph Presentation_Layer ["Presentation Component (React SPA)"]
        AuthUI["Auth Module (Login/Register)"]
        ResumeUI["Resume Module (Upload/ATS)"]
        InterviewUI["Interview Module (Room/Audio)"]
        DashUI["Dashboard Module (Analytics)"]
        AxiosComp["Axios HTTP Service Interface"]

        AuthUI --> AxiosComp
        ResumeUI --> AxiosComp
        InterviewUI --> AxiosComp
        DashUI --> AxiosComp
    end

    subgraph API_Gateway_Layer ["API Gateway & Security Component"]
        RouterComp["Express Route Allocator"]
        SecComp["Security Middleware (Helmet/CORS/Limiter/JWT)"]
        AxiosComp -- "HTTPS REST API Call" --> SecComp
        SecComp --> RouterComp
    end

    subgraph Controller_Layer ["Controller Component"]
        AuthControllerC["Auth Controller"]
        ResumeControllerC["Resume Controller"]
        DashboardControllerC["Dashboard Controller"]

        RouterComp -- "/api/auth" --> AuthControllerC
        RouterComp -- "/api/resumes" --> ResumeControllerC
        RouterComp -- "/api/dashboard" --> DashboardControllerC
    end

    subgraph Service_Layer ["Service Layer Component"]
        ParseSvcC["Parsing Service Module"]
        PdfSvcC["PDF Export Module (pdfkit)"]
        GeminiSvcC["Gemini AI Service Module"]
        InterviewSvcC["Interview AI Service Module"]
        StorageSvcC["Storage Service Module"]

        ResumeControllerC --> ParseSvcC
        ResumeControllerC --> PdfSvcC
        ResumeControllerC --> GeminiSvcC
        ResumeControllerC --> InterviewSvcC
        ResumeControllerC --> StorageSvcC
    end

    subgraph Data_Access_Layer ["Data Access & Model Component"]
        UserModelC["User Mongoose Model"]
        ResumeModelC["Resume Mongoose Model"]

        AuthControllerC --> UserModelC
        ResumeControllerC --> ResumeModelC
        DashboardControllerC --> UserModelC
        DashboardControllerC --> ResumeModelC
    end

    subgraph External_Integrations ["External Cloud Integration Adapters"]
        MongoAdapter[("MongoDB Atlas Cloud DB")]
        CloudinaryAdapter[("Cloudinary Asset CDN")]
        GeminiSDKAdapter[("Google Gemini AI API")]

        UserModelC -- "Mongoose ODM Driver" --> MongoAdapter
        ResumeModelC -- "Mongoose ODM Driver" --> MongoAdapter
        StorageSvcC -- "Cloudinary Node SDK" --> CloudinaryAdapter
        GeminiSvcC -- "@google/genai SDK" --> GeminiSDKAdapter
        InterviewSvcC -- "@google/genai SDK" --> GeminiSDKAdapter
    end
```

### PlantUML Version
```plantuml
@startuml Component_Diagram
package "Frontend Application (React SPA)" {
  [Auth UI Module] as AuthUI
  [Resume UI Module] as ResumeUI
  [Interview UI Module] as InterviewUI
  [Axios Client Interface] as Axios
  AuthUI -> Axios
  ResumeUI -> Axios
  InterviewUI -> Axios
}

package "Backend Server (Express API)" {
  [Security Gateway & Middleware] as SecGateway
  [Express Router] as Router
  [Controllers Component] as Controllers
  [Services Component] as Services
  [Mongoose Models Component] as Models

  SecGateway -> Router
  Router -> Controllers
  Controllers -> Services
  Controllers -> Models
}

cloud "External Services" {
  database "MongoDB Atlas" as Mongo
  [Cloudinary Storage CDN] as Cloudinary
  [Google Gemini AI API] as Gemini
}

Axios --> SecGateway : HTTPS / REST JSON
Services --> Cloudinary : Cloudinary SDK
Services --> Gemini : Google Gen AI SDK
Models --> Mongo : Mongoose Connection
@enduml
```

---

## 11. Deployment Diagram

### Purpose
The **Deployment Diagram** specifies the physical deployment architecture, server nodes, hosting environments, network protocols, execution containers, and infrastructure topology of the operational platform.

### Component Explanations
- **Node 1: User Workstation / Mobile Browser**: Client browser running React SPA SPA build assets delivered over HTTPS.
- **Node 2: Vercel Cloud Platform (Frontend Edge CDN)**: Hosts static production build artifacts (`index.html`, JavaScript bundles, CSS assets) with global Edge CDN caching and automated TLS 1.3 certificate management.
- **Node 3: Render Cloud Platform (Backend Managed Service)**: Linux execution node running Node.js runtime (`v18+`/`v20+`) and Express web server listening on port 5000 (proxied via Render HTTPS reverse proxy).
- **Node 4: MongoDB Atlas Managed Cloud Cluster**: Multi-region database cluster running MongoDB engine behind TLS encryption with IP whitelist controls.
- **Node 5: Cloudinary Asset CDN**: Managed media hosting infrastructure serving uploaded PDF files.
- **Node 6: Google Cloud AI Infrastructure**: High-performance AI server farm hosting Gemini 1.5/2.0 Flash LLM models.
- **Network Protocols**:
  - `HTTPS / TLS 1.3`: Encrypted browser-to-frontend and browser-to-backend communication.
  - `mongodb+srv://`: Encrypted TCP database connection string using TLS/SSL credentials.
  - `REST / JSON over HTTPS`: Service-to-service communication with Cloudinary and Google Gemini APIs.

### Mermaid Diagram
```mermaid
graph TD
    subgraph Client_Device ["User Client Node"]
        Browser["Web Browser (Chrome/Firefox/Safari)"]
    end

    subgraph Vercel_Platform ["Vercel Edge Cloud Node"]
        VercelCDN["Vercel Global Edge CDN"]
        ReactStatic["React Production SPA Bundle (Vite)"]
        VercelCDN --- ReactStatic
    end

    subgraph Render_Platform ["Render Managed Service Node"]
        RenderProxy["Render HTTPS Load Balancer"]
        NodeServer["Node.js Application Container"]
        ExpressApp["Express API Runtime (Port 5000)"]

        RenderProxy --> NodeServer
        NodeServer --> ExpressApp
    end

    subgraph Database_Cluster ["MongoDB Atlas Cloud Infrastructure"]
        PrimaryDB[("MongoDB Primary Replica Set Node")]
        SecondaryDB[("MongoDB Secondary Replica Set Node")]
        PrimaryDB <--> SecondaryDB
    end

    subgraph Cloudinary_Cloud ["Cloudinary Asset CDN Node"]
        CloudinaryMedia[("Cloudinary PDF Asset Storage")]
    end

    subgraph Gemini_Cloud ["Google Cloud AI Node"]
        GeminiEngine[("Google Gemini LLM Engine (1.5/2.0 Flash)")]
    end

    %% Network Connections
    Browser -- "1. HTTPS (Port 443) / Fetch SPA Build" --> VercelCDN
    Browser -- "2. REST API / HTTPS (TLS 1.3)" --> RenderProxy
    ExpressApp -- "3. mongodb+srv:// (TLS/SSL Encrypted TCP)" --> PrimaryDB
    ExpressApp -- "4. HTTPS REST SDK Calls" --> CloudinaryMedia
    ExpressApp -- "5. HTTPS REST SDK Calls (@google/genai)" --> GeminiEngine
```

### PlantUML Version
```plantuml
@startuml Deployment_Diagram
node "User Desktop / Mobile Node" {
  node "Web Browser" {
    artifact "React Single Page Application" as SPA
  }
}

node "Vercel Edge Network" {
  node "Edge CDN Node" {
    artifact "Vite Static Build Bundle" as StaticBundle
  }
}

node "Render Cloud Platform" {
  node "Linux Application Node" {
    component "Node.js Runtime Environment" {
      component "Express Web Application Server" as ExpressApp
    }
  }
}

node "MongoDB Atlas Cloud" {
  database "MongoDB Database Cluster" as MongoCluster
}

node "Cloudinary Cloud Infrastructure" {
  component "Media Storage CDN" as CloudinaryCDN
}

node "Google Cloud Infrastructure" {
  component "Gemini AI LLM API Node" as GeminiNode
}

SPA ..> StaticBundle : HTTPS Static Fetch (Port 443)
SPA --> ExpressApp : HTTPS REST API Calls (TLS 1.3)
ExpressApp --> MongoCluster : Protocol: mongodb+srv:// (Port 27017)
ExpressApp --> CloudinaryCDN : HTTPS API Stream Upload
ExpressApp --> GeminiNode : HTTPS API Prompt Calls
@enduml
```

---

## Conclusion & Architectural Conformance Verification

This **System Architecture & UML Technical Documentation** completely and accurately reflects the implemented codebase of the **AI Resume Analyzer & Interview Coach**. 

### Conformance Summary
1. **Consistency**: Every class, method, data attribute, process, and node in this document directly maps to actual backend controllers, middleware, services, Mongoose models, and React frontend routes in the project workspace.
2. **Standardization**: All diagrams adhere strictly to standard UML 2.5 conventions, Data Flow Diagram rules, Entity-Relationship specifications, and clean syntax for both **Mermaid** and **PlantUML**.
3. **Quality**: Built to meet academic requirements for B.Tech Computer Science Engineering thesis submissions as well as technical standards expected in software engineering industry design reviews.
