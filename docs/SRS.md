# Software Requirement Specification (SRS)

## Project Title: AI Resume Analyzer & Interview Coach
**Degree Program:** Final Year B.Tech in Computer Science & Engineering (Artificial Intelligence & Machine Learning)  
**Document Standard:** IEEE Std 830-1998 Specification Format  
**Version:** 1.0.0  
**Date:** July 25, 2026  

---

## 1. Introduction

### 1.1 Document Overview
This Software Requirement Specification (SRS) document outlines the complete functional and non-functional requirements for the **AI Resume Analyzer & Interview Coach** system. Developed as a capstone project for the Final Year B.Tech in Computer Science and Engineering (Specialization in AI & ML), this document serves as the foundational agreement between stakeholders, developers, and academic evaluators. It specifies system behavior, user interactions, technical architecture, and execution boundaries following the formal **IEEE Std 830-1998** standard.

### 1.2 Project Context
In the modern hiring ecosystem, Applicant Tracking Systems (ATS) automatically filter over 75% of job applications prior to human review. Fresh graduates and job seekers often struggle to align their resumes with specific job descriptions, identify critical skill gaps, and prepare effectively for technical and behavioral interviews. The **AI Resume Analyzer & Interview Coach** bridges this gap by leveraging generative Artificial Intelligence to provide automated ATS scoring, deep resume diagnostics, skill gap remediation, and an adaptive, dynamic AI-powered mock interview environment.

### 1.3 Definitions, Acronyms, and Abbreviations
* **API:** Application Programming Interface
* **ATS:** Applicant Tracking System
* **Bcrypt:** Password-Hashing Function based on the Blowfish cipher
* **CORS:** Cross-Origin Resource Sharing
* **CRUD:** Create, Read, Update, Delete
* **DOM:** Document Object Model
* **HTTPS:** Hypertext Transfer Protocol Secure
* **IEEE:** Institute of Electrical and Electronics Engineers
* **JSON:** JavaScript Object Notation
* **JWT:** JSON Web Token
* **LLM:** Large Language Model
* **ODM:** Object Document Mapper (e.g., Mongoose)
* **REST:** Representational State Transfer
* **SPA:** Single Page Application
* **SRS:** Software Requirement Specification
* **UI/UX:** User Interface / User Experience

### 1.4 References
1. IEEE Std 830-1998: *IEEE Recommended Practice for Software Requirements Specifications*.
2. Google Cloud Platform: *Google Gemini API Technical Documentation & Prompt Engineering Guidelines*.
3. MongoDB Documentation: *MongoDB Atlas Cloud Database Architecture & Schema Design*.
4. React Documentation: *Vite-powered React Single Page Application Architecture*.
5. Express.js Specification: *Node.js Web Application Framework API Guide*.

---

## 2. Purpose

The primary purpose of the **AI Resume Analyzer & Interview Coach** is to empower candidates with an end-to-end, AI-driven career preparation platform. The platform addresses two primary recruitment hurdles:

1. **Resume Incompatibility:** Raw resumes frequently fail ATS filters due to poor keyword matching, improper formatting, missing core competencies, or unoptimized executive summaries.
2. **Interview Unpreparedness:** Job applicants often lack access to tailored, realistic interview practice environments that evaluate domain-specific technical knowledge and contextual behavioral responses.

By providing instantaneous, granular feedback on resumes alongside dynamic, multi-turn AI mock interviews, the application significantly increases job placement readiness for CSE/AI-ML students and industry practitioners alike.

---

## 3. Scope

### 3.1 In-Scope Functionality
* **User Authentication & Authorization:** Secure registration, login, token management, and profile administration using JWT and bcrypt.
* **Resume Processing & Document Management:** Secure file upload (PDF/DOCX formats) via Cloudinary storage and text extraction.
* **AI-Powered ATS Analysis:** Parsing candidate resumes against specific target Job Descriptions (JD) to generate:
  * Overall ATS Compatibility Score (0–100%).
  * Key Match Metrics (Hard skills, soft skills, keyword density, formatting compliance).
  * Missing Skills Identification & Remediation Guidance.
  * Executive Resume Summary & Tailored Experience Rewriting.
* **Adaptive AI Mock Interview Engine:** Dynamic generation of interview questions (Technical, Behavioral, HR, System Design) based on extracted resume skills and target Job Description using Google Gemini API.
* **Real-Time Answer Evaluation:** Interactive Q&A interface supporting answer submission, real-time AI scoring (Relevance, Technical Accuracy, Communication Clarity), and instant corrective feedback.
* **Comprehensive Performance Reporting:** Aggregated reporting dashboard detailing historical resume scores, interview performance trajectories, and actionable skill acquisition roadmaps.

### 3.2 Out-of-Scope (V1.0)
* Direct job application submission to external job portals (e.g., LinkedIn, Indeed API integrations).
* Real-time video/audio stream computer vision analysis (e.g., eye-tracking or facial expression detection).
* Paid subscription or payment gateway integration (reserved for post-academic commercial releases).

---

## 4. Objectives

The specific measurable technical and operational objectives of the project include:

1. **Parsing Accuracy:** Achieve >90% extraction precision for structural text components across standard PDF and DOCX resume formats.
2. **Analysis Efficiency:** Complete full ATS resume diagnostics and JD matching via Google Gemini within sub-5-second response latency.
3. **Question Customization:** Ensure 100% of generated mock interview questions dynamically map to candidate experience levels and target job role parameters.
4. **Scoring Consistency:** Provide objective, deterministic feedback and structured numerical scoring across mock interview evaluations.
5. **System Usability:** Deliver an intuitive, accessible Single Page Application (SPA) responsive across mobile, tablet, and desktop viewports with zero layout degradation.
6. **Security & Privacy:** Enforce enterprise-grade data protection standards including encrypted data transmission (HTTPS) and salted password storage.

---

## 5. User Roles

The system categorizes access into two distinct user roles:

| User Role | Description | Access Rights & Privileges |
| :--- | :--- | :--- |
| **Candidate / Job Seeker** | Primary end-user (Student, Graduate, Job Applicant). | Upload/delete personal resumes, execute ATS analysis against JDs, initiate and complete AI mock interviews, view personal analytics dashboards, manage account profile. |
| **System Administrator** | Technical administrator / Academic Evaluator. | Manage user accounts, inspect system audit logs, monitor Gemini API usage and token quotas, evaluate global database telemetry. |

---

## 6. Functional Requirements

The functional requirements describe the specific fundamental capabilities of the system. They follow the format `FR-[Category]-[ID]`.

### 6.1 Authentication & User Management (FR-AUTH)
* **FR-AUTH-01 (Registration):** The system shall allow new users to register using a valid name, unique email address, and strong password.
* **FR-AUTH-02 (Password Encryption):** The system shall hash user passwords using `bcrypt` (minimum 10 salt rounds) prior to persisting them to MongoDB.
* **FR-AUTH-03 (Authentication):** The system shall authenticate existing users using email and password credentials, returning a signed JSON Web Token (JWT).
* **FR-AUTH-04 (Session Authorization):** The system shall restrict access to protected API endpoints and dashboard routes to requests containing a valid JWT Bearer header.
* **FR-AUTH-05 (Profile Management):** The system shall allow users to view and update their profile metadata (name, target job roles, preferred tech stack).

### 6.2 Resume Management & Processing (FR-RES)
* **FR-RES-01 (File Upload):** The system shall support uploading candidate resumes in `.pdf` and `.docx` formats with a maximum file size limit of 5 MB.
* **FR-RES-02 (Cloud Storage):** Uploaded resume documents shall be securely routed to and stored on Cloudinary storage via signed upload presets.
* **FR-RES-03 (Text Extraction):** The system backend shall extract clean plain-text representations from uploaded PDF/DOCX documents for downstream natural language parsing.
* **FR-RES-04 (Document Retrieval & History):** The system shall enable users to list, view, and delete their previously uploaded resumes stored in the database.

### 6.3 AI Resume Analysis & ATS Engine (FR-ATS)
* **FR-ATS-01 (JD Comparison Input):** The system shall accept target Job Description text inputs alongside an uploaded resume document.
* **FR-ATS-02 (ATS Compatibility Score Calculation):** The system shall utilize Google Gemini API to analyze the resume against the target JD and output a composite ATS Match Score (0–100%).
* **FR-ATS-03 (Skill Matrix Extraction):** The system shall identify, categorize, and report matching skills, partially matching skills, and critical missing technical skills.
* **FR-ATS-04 (Format & Quality Audit):** The system shall highlight formatting errors, missing contact details, weak action verbs, and quantifiable impact metrics.
* **FR-ATS-05 (AI Summary & Rewriting):** The system shall generate an optimized executive summary and tailored resume bullet points customized for the specified target role.

### 6.4 AI Mock Interview Coach (FR-INT)
* **FR-INT-01 (Session Configuration):** The system shall allow candidates to configure mock interview sessions by selecting domain (e.g., Software Engineering, Data Science, AI/ML), difficulty level (Junior, Mid, Senior), and question types (Technical, Behavioral, System Design).
* **FR-INT-02 (Dynamic Question Generation):** The system shall invoke Google Gemini API to generate a contextually relevant sequence of interview questions tailored specifically to the candidate's resume content and target job description.
* **FR-INT-03 (Interactive Q&A Execution):** The system shall present questions sequentially, accepting candidate text/voice inputs for each prompt.
* **FR-INT-04 (Real-Time Answer Evaluation):** Upon submission of each answer, the system shall evaluate the candidate response across:
  * Technical Accuracy & Correctness (0–10).
  * Relevance to Question (0–10).
  * Communication Clarity & Structure (0–10).
  * Ideal Model Answer & Constructive Feedback.

### 6.5 Analytics & Performance Reporting (FR-REP)
* **FR-REP-01 (Comprehensive Session Report):** Upon completing an interview session, the system shall compile an overall performance report detailing aggregate score, strengths, weakness areas, and targeted learning recommendations.
* **FR-REP-02 (User Performance Dashboard):** The system shall display historical analytics charts visualizing resume score progression, interview score trends, and skill growth over time.
* **FR-REP-03 (Export Capabilities):** The system shall enable users to export ATS analysis reports and interview performance summaries as downloadable PDF files.

---

## 7. Non-Functional Requirements

### 7.1 Performance Requirements (NFR-PERF)
* **NFR-PERF-01 (Page Load Time):** The frontend React single page application shall render the initial interactive screen within **2.0 seconds** under standard 4G network conditions.
* **NFR-PERF-02 (API Latency):** Standard authentication, user profile, and data fetching REST APIs shall respond within **<300 milliseconds**.
* **NFR-PERF-03 (AI Latency):** AI Resume Analysis and Question Generation calls using Google Gemini API shall complete within **<4.0 seconds**.
* **NFR-PERF-04 (Concurrency):** The system backend deployed on Render shall handle up to **100 concurrent active user sessions** without HTTP 5xx server errors.

### 7.2 Security Requirements (NFR-SEC)
* **NFR-SEC-01 (Transport Security):** All client-server communications must be encrypted using HTTPS/TLS 1.3 protocols.
* **NFR-SEC-02 (Data at Rest):** User passwords must be salted and hashed using `bcrypt`. Sensitive credentials (JWT secret, API keys, database URIs) must strictly reside in environment variables (`.env`).
* **NFR-SEC-03 (Authentication Tokens):** JWT access tokens must expire after **24 hours** and be validated on every protected API endpoint.
* **NFR-SEC-04 (Input Sanitization):** All user input fields must be sanitized against SQL/NoSQL Injection and Cross-Site Scripting (XSS) attacks.

### 7.3 Reliability & Availability (NFR-REL)
* **NFR-REL-01 (Availability):** The application shall maintain a operational uptime of **99.5%**, excluding planned maintenance windows.
* **NFR-REL-02 (Fault Tolerance & Graceful Degradation):** In case of Google Gemini API rate-limiting or quota exhaustion, the system must gracefully inform the user via structured UI error alerts rather than crashing.

### 7.4 Usability & Accessibility (NFR-USA)
* **NFR-USA-01 (Design System):** The UI shall adhere to modern visual aesthetics utilizing Tailwind CSS, consistent dark/light themes, clear visual hierarchy, accessible contrast ratios (WCAG 2.1 AA compliant), and responsive layouts.
* **NFR-USA-02 (Feedback & Loading States):** All asynchronous actions (AI processing, file uploading, database mutations) must present visual feedback indicators (skeleton loaders, progress bars, toast notifications).

### 7.5 Maintainability & Portability (NFR-MAIN)
* **NFR-MAIN-01 (Modular Code Architecture):** The codebase must strictly follow modular patterns (React functional components with custom hooks; Express controllers, services, middleware, and Mongoose schemas).
* **NFR-MAIN-02 (Deployment Portability):** The system components must be fully environment-independent, deployable on Vercel (Frontend SPA) and Render (Backend REST API) without source code modification.

---

## 8. Use Cases

### 8.1 Use Case UC-01: User Registration and Authentication
* **Actor:** Candidate / Job Seeker
* **Preconditions:** User is on the landing/login page and has internet connectivity.
* **Main Success Scenario:**
  1. User navigates to the Registration page.
  2. User inputs Name, Email, and Password.
  3. System validates input format and checks email uniqueness.
  4. Backend hashes password using `bcrypt` and creates candidate record in MongoDB Atlas.
  5. System generates JWT, returns auth token, and redirects user to Dashboard.
* **Alternative Flow (Email Exists):** System displays an error toast: *"User already exists with this email address"* and prompts login.

### 8.2 Use Case UC-02: Upload Resume and Execute AI ATS Analysis
* **Actor:** Candidate / Job Seeker
* **Preconditions:** User is logged in and possesses a valid resume file (`.pdf`/`.docx`).
* **Main Success Scenario:**
  1. User navigates to the "Resume Analyzer" section.
  2. User uploads resume file and pastes target Job Description text.
  3. Frontend sends payload to Node.js/Express backend via Axios.
  4. Backend uploads document to Cloudinary and extracts plain text content.
  5. Backend formats structured prompt and queries Google Gemini API.
  6. Gemini processes input and returns structured JSON payload (ATS Score, Skill Gaps, Formatting Advice, Summary).
  7. Backend persists analysis results in MongoDB and returns JSON payload to frontend.
  8. Frontend renders comprehensive interactive ATS analysis report.
* **Alternative Flow (Invalid File Format):** Frontend rejects files non-matching PDF/DOCX and displays format error message.

### 8.3 Use Case UC-03: Dynamic AI Mock Interview Session
* **Actor:** Candidate / Job Seeker
* **Preconditions:** Candidate has uploaded a resume or selected target job domain/difficulty level.
* **Main Success Scenario:**
  1. Candidate initiates a new Mock Interview session from the Dashboard.
  2. Candidate selects job domain, seniority level, and target question count.
  3. Backend sends resume metadata + JD parameters to Google Gemini API to dynamically generate session questions.
  4. Frontend presents Question 1 with text/audio response recorder.
  5. Candidate submits answer.
  6. Backend evaluates answer against target question context using Gemini API.
  7. System displays real-time score breakdown, ideal model answer, and constructive tips.
  8. Steps 4–7 repeat until all session questions are completed.
  9. System generates and displays cumulative session summary report.

---

## 9. User Flow

```
[ Visitor Landing Page ]
         |
         v
[ Login / Register ] ---> (Fails) ---> [ Error Alert ]
         | (Success - JWT Issued)
         v
[ Main User Dashboard ]
         |
         +---------------------------------------+
         |                                       |
         v                                       v
[ Resume Analyzer Module ]               [ AI Interview Coach Module ]
         |                                       |
         v                                       v
[ Upload PDF/DOCX & Paste JD ]          [ Select Domain, Role & Level ]
         |                                       |
         v                                       v
[ Cloudinary Storage & Text Extract ]    [ Gemini API Question Generation ]
         |                                       |
         v                                       v
[ Gemini AI ATS Diagnostic Engine ]      [ Interactive Question & Answer ]
         |                                       |
         v                                       v
[ ATS Score, Skill Gap & Summary ]       [ Real-time Answer Evaluation ]
         |                                       |
         +---------------------------------------+
         |
         v
[ Performance Analytics & Reports ]
```

---

## 10. System Features

| Feature ID | Feature Name | Priority | Feature Description |
| :--- | :--- | :--- | :--- |
| **SF-01** | Secure JWT Authentication | High | User sign-up, login, session persistence, protected route guards using JWT & bcrypt. |
| **SF-02** | Multi-Format Document Parser | High | Secure upload of PDF/DOCX resumes via Cloudinary with background text extraction. |
| **SF-03** | AI ATS Scoring Engine | High | Automated calculation of overall ATS compatibility score (0–100%) against target JDs via Google Gemini. |
| **SF-04** | Skill Gap Diagnostic Matrix | High | Automated extraction of matched, missing, and recommended technical/soft skills. |
| **SF-05** | AI Executive Resume Rewriter | Medium | Generation of optimized executive summaries and action-oriented bullet points tailored to target job descriptions. |
| **SF-06** | Adaptive AI Interview Engine | High | Context-aware, dynamic interview question generation matching candidate profile and job requirements. |
| **SF-07** | Real-Time Answer Evaluator | High | Multi-dimensional scoring (Accuracy, Relevance, Communication) and model answer generation for interview responses. |
| **SF-08** | Analytics Dashboard | Medium | Graphical visualization of candidate progress, resume score trends, and interview performance metrics over time. |
| **SF-09** | PDF Report Exporter | Low | Client-side export of resume evaluation reports and interview feedback summaries to PDF. |

---

## 11. Constraints

### 11.1 Technical & Infrastructure Constraints
* **API Rate Limits:** Free-tier usage of Google Gemini API imposes requests-per-minute (RPM) and tokens-per-minute (TPM) operational limits.
* **Server Cold Starts:** Backend deployed on Render free tier may experience 50-second initial latency upon server wake-up after inactivity.
* **Cloud Storage Quota:** Free Cloudinary tier caps total storage bandwidth and media transformation units.

### 11.2 Academic & Project Constraints
* **Development Timeline:** System design, implementation, testing, and documentation must complete within the final academic semester timeframe.
* **Budgetary Limit:** Implementation relies entirely on zero-cost, open-source technologies and free-tier cloud services.

### 11.3 Data Protection Constraints
* **PII Confidentiality:** Resume data contains Personally Identifiable Information (PII); parsing engines must process data in memory without unauthorized third-party disclosure.

---

## 12. Assumptions

1. **User Accessibility:** End-users possess access to standard modern web browsers (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari) with JavaScript enabled.
2. **Document Structure:** Uploaded resumes contain standard machine-readable text structures and are not encrypted, password-protected, or raw image-only scans.
3. **Third-Party API Uptime:** Google Gemini API and Cloudinary services maintain consistent uptime during academic demonstrations and testing.
4. **Internet Connectivity:** Users maintain stable internet access (>1 Mbps) for API interaction and video/text state rendering.

---

## 13. Technologies Used

### 13.1 Frontend Architecture
* **React (v18+ with Vite):** Core SPA framework delivering high-performance component rendering and fast HMR development cycles.
* **Tailwind CSS:** Utility-first CSS framework establishing a responsive, modern, premium design system.
* **React Router (v6):** Declarative client-side routing and protected route authorization management.
* **Axios:** Promise-based HTTP client for seamless communication with backend REST APIs.

### 13.2 Backend Architecture
* **Node.js:** Asynchronous, event-driven JavaScript runtime engine.
* **Express.js:** Web framework handling routing, CORS policies, JWT middleware, and API controllers.

### 13.3 Database & Authentication
* **MongoDB Atlas:** Cloud-hosted NoSQL document database storing user profiles, resume metadata, analysis outputs, and interview session histories.
* **Mongoose ODM:** Object Document Mapping layer managing schema validation and database queries.
* **JSON Web Token (JWT):** Stateless bearer token authentication protocol.
* **bcrypt.js:** Password encryption hashing library.

### 13.4 AI & Cloud Infrastructure
* **Google Gemini API (`gemini-1.5-flash` / `gemini-1.5-pro`):** Generative AI foundational LLM model executing ATS parsing, skill gap analysis, resume rewriting, dynamic question generation, and response feedback evaluation.
* **Cloudinary:** Cloud storage infrastructure for secure PDF/DOCX resume file management.

### 13.5 Deployment Platform
* **Vercel:** High-speed Edge network platform hosting the React frontend application.
* **Render:** Cloud hosting platform executing the Node.js / Express backend service.

---

## 14. Future Enhancements

1. **Multimodal AI Voice & Video Analysis:** Integration of Speech-to-Text (STT) and computer vision models to evaluate candidate voice tone, pacing, eye contact, and facial expressions during interviews.
2. **Automated ATS Resume Builder:** Interactive multi-template resume builder enabling candidates to auto-generate fully formatted, ATS-friendly PDF/LaTeX resumes directly from their analyzed profiles.
3. **Job Board Aggregator Integration:** Automated scraping and matching of live job postings from LinkedIn, Indeed, and Glassdoor tailored to user ATS scores.
4. **Peer-to-Peer Interview Rooms:** Collaborative WebRTC video rooms allowing students to conduct peer mock interviews with AI co-pilots evaluating both participants.
5. **Enterprise Recruiter Portal:** B2B portal allowing university placement cells and recruiters to upload bulk resumes for automated batch screening and ranking.

---

## 15. Success Criteria

The success of the **AI Resume Analyzer & Interview Coach** project will be evaluated based on the following metrics during university assessment:

| Criteria Category | Success Metric | Verification Method |
| :--- | :--- | :--- |
| **Functional Completeness** | 100% implementation of all high-priority functional requirements (FR-AUTH, FR-RES, FR-ATS, FR-INT). | System Demonstration & Test Suite Execution. |
| **ATS Scoring Precision** | >90% correlation between AI-generated score breakdowns and standard industry resume review guidelines. | Validation against benchmark sample resumes and JDs. |
| **System Latency** | Full resume analysis completed within sub-5-second window. | Browser Developer Tools & Network Profiling. |
| **Security Compliance** | Zero clear-text passwords stored; 100% protected API endpoints verified against missing/invalid JWTs. | Security Penetration Testing & Database Audit. |
| **UI/UX Excellence** | Fluid layout responsiveness across Mobile (375px+), Tablet (768px+), and Desktop (1024px+) viewports. | Cross-browser and Multi-device Manual Testing. |
| **Code Base Quality** | Clean code organization, zero console runtime errors, complete modular abstraction adhering to industry best practices. | Static Code Analysis & Peer Review. |

---
*End of Software Requirement Specification (SRS) Document.*
