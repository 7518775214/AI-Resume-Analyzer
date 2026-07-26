# QA Audit Report: AI Interview Question Generator Module

**Project**: AI Resume Analyzer & Interview Coach  
**Milestone**: AI Interview Generator QA  
**Date**: July 26, 2026  
**Auditor**: Senior AI Engineer, Prompt Engineer & MERN Stack Architect  
**Scope**: End-to-end audit of candidate resume selection, target job role validation, Gemini API integration, prompt engineering, question accuracy, difficulty balancing, duplicate prevention, schema validation, retry & timeout mechanisms, error handling, MongoDB storage, and frontend rendering.

---

## 1. Executive Summary

A comprehensive quality assurance (QA) audit was performed on the **AI Interview Question Generator module** of the AI Resume Analyzer application. The audit verified 20 critical verification areas spanning backend service logic, prompt structure, JSON response normalization, input sanitization, error resilience, logging telemetry, database persistence, and UI rendering.

Findings were categorized into **3 Critical**, **5 Major**, and **1 Minor** issues. All Critical and Major issues were systematically fixed while maintaining existing system architecture, database schemas, and frontend UI design.

Following these fixes, the AI Interview Question Generator achieves robust production readiness: malformed or delimited AI responses are normalized seamlessly, zero-width characters in resumes are stripped, production logging tracks failure tracebacks, target role inputs are validated and bounded, question duplicates are eliminated, and unparseable JSON triggers automatic retry attempts.

---

## 2. Verification Checklist Audit (20 Criteria)

| # | Verification Area | Audit Status | Key Observations & Findings |
|---|---|---|---|
| **1** | **Resume Selection Workflow** | ✅ VERIFIED | Route `/api/resumes/:id/generate-questions` validates document existence and user ownership (`userId` match). Client handles query param `?id=` and resume selection dropdown state. |
| **2** | **Target Job Role Validation** | ⚠️ FIXED (MAJOR) | `customTargetRole` in `req.body` and `resume.jobTitle` are now sanitized, trimmed, and capped at 200 characters to prevent Mongoose `ValidationError` HTTP 500 crashes during document save. |
| **3** | **Gemini API Integration** | ✅ VERIFIED | Reuses `callGeminiApi` from `geminiService.js` with SDK primary caller and REST fallback, supporting model cascade (`gemini-1.5-flash` -> `gemini-1.5-pro` -> `gemini-2.0-flash`). |
| **4** | **Prompt Quality & Consistency** | ⚠️ FIXED (MAJOR) | System prompt defines strict output schema. Improved prompt payload construction by handling empty arrays (`strengths`, `weaknesses`, `missingSkills`) from `aiAnalysis` with fallback context string. |
| **5** | **Question Generation Accuracy** | ✅ VERIFIED | Questions directly reference candidate background, listed tech stack, project history, ATS weakness areas, and target job role. |
| **6** | **Technical Questions Relevance** | ✅ VERIFIED | Easy, Medium, and Hard technical tiers cover language fundamentals, system design, query optimization, and scalability edge cases. |
| **7** | **Behavioral Questions Quality** | ✅ VERIFIED | Behavioral/HR category focuses on teamwork, conflict resolution, technical trade-offs, and STAR framework responses. |
| **8** | **Project-Based Questions Quality** | ✅ VERIFIED | Project deep-dive questions probe architectural decisions, tech stack choices, performance metrics, and technical debt navigation. |
| **9** | **Difficulty Level Balance** | ✅ VERIFIED | Technical questions categorized strictly into Easy (2-3), Medium (2-3), and Hard (2-3) difficulty buckets. |
| **10** | **Duplicate Question Prevention** | ⚠️ FIXED (MAJOR) | `sanitizeStringArray` now implements case-insensitive deduplication using normalized `Set` matching to prevent repeating questions across categories. |
| **11** | **JSON Response Validation** | ⚠️ FIXED (MAJOR) | `validateInterviewQuestionsResponse` strips markdown code blocks (` ```json ... ``` `) and validates required sub-keys (`technical.easy`, `medium`, `hard`, `hr`, `projectBased`, `tips`). |
| **12** | **Invalid AI Response Handling** | ⚠️ FIXED (MAJOR) | Added string-to-array fallback parsing in `sanitizeStringArray`. If Gemini returns newline or comma-delimited strings instead of array objects, the response is parsed into arrays instead of discarded. |
| **13** | **Retry Mechanism** | ⚠️ FIXED (CRITICAL) | Implemented a 2-attempt retry loop in `generateInterviewQuestions` for JSON parsing failures before throwing error, recovering from transient LLM syntax glitches. |
| **14** | **Timeout Handling** | ✅ VERIFIED | Reuses `callGeminiApi` timeout handling (30s `AbortController` timeout per attempt) to prevent server hanging. |
| **15** | **Loading State** | ✅ VERIFIED | Client `Interview.jsx` displays full-screen loader (`isGenerating: true`) with descriptive progress text during AI question generation. |
| **16** | **Error Messages** | ✅ VERIFIED | User-friendly error message returned on API failure without leaking secret keys or internal tracebacks. Client displays clear error banner with retry option. |
| **17** | **Database Storage** | ✅ VERIFIED | Generated questions stored in MongoDB `Resume` document (`interviewQuestions` subdocument and `interviewQuestionsStatus: 'completed'` / `'failed'`). |
| **18** | **Frontend Rendering** | ✅ VERIFIED | `Interview.jsx` renders tabbed dashboard for Technical, HR, Project-Based, and Preparation Tips categories with color-coded badges and question counters. |
| **19** | **Production Logging** | ⚠️ FIXED (CRITICAL) | Replaced `console.error` wrapped in `NODE_ENV === 'development'` checks with Winston `logger` (`server/utils/logger.js`) in `interviewAiService.js` and `resumeController.js`. |
| **20** | **API Validation** | ⚠️ FIXED (CRITICAL) | Integrated `cleanExtractedText` in `interviewAiService.js` to strip zero-width characters (`\u200B`, `\uFEFF`) and non-printable PDF artifacts prior to Gemini prompt generation. |

---

## 3. Categorized Audit Findings

### 🔴 Critical Issues

#### 1. Production Logging Silenced in Production Mode
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L140-L144), [`server/controllers/resumeController.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js#L409-L424)
- **Description**: Error logging was wrapped in `if (process.env.NODE_ENV === 'development')` and used `console.error`. In production mode (`NODE_ENV === 'production'`), error details, parse errors, and Gemini API failures were completely silenced and unmonitored.
- **Fix**: Replaced `console.error` and dev checks with central `logger` (`server/utils/logger.js`).

#### 2. Zero Retries on Unparseable AI Output
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L136-L146)
- **Description**: `interviewAiService.generateInterviewQuestions` made a single call to Gemini API and immediately threw an error on `JSON.parse` failure, unlike `geminiService.js`'s `analyzeResume` which supported a retry loop.
- **Fix**: Implemented a 2-attempt execution and JSON parse retry loop in `interviewAiService.js` with `logger.warn` tracking.

#### 3. Unsanitized Input Text in AI Prompts
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L88-L133)
- **Description**: `extractedText` passed into `interviewAiService.js` was inserted raw into Gemini prompts without removing control characters, zero-width non-breaking spaces (`\u200B`, `\uFEFF`), or carriage return clutter.
- **Fix**: Applied `cleanExtractedText` from `textCleaner.js` prior to prompt construction.

---

### 🟠 Major Issues

#### 4. Discarding Delimited String Responses & Missing String Fallback
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L24-L30)
- **Description**: `sanitizeStringArray` used strict `Array.isArray(arr)`. When Gemini returned questions as newline-separated or comma-delimited strings, the helper discarded the response and fell back to static generic questions.
- **Fix**: Enhanced `sanitizeStringArray` to support string splitting (`/[\n,;]+/`) into array items.

#### 5. Raw Bullet Prefixes and Numbering in Question Text
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L26)
- **Description**: Gemini often prefix-numbers string output (e.g. `1. What is...`, `- Explain...`). Without stripping, the UI displayed `Q1: 1. What is...`.
- **Fix**: Added regex cleaning (`String(item).replace(/^[-*•\d.\s]+/, '').trim()`) to strip leading bullets, numbers, and symbols.

#### 6. Duplicate Question Prevention
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L24-L54)
- **Description**: Questions generated across technical difficulty tiers or categories were not deduplicated, occasionally rendering duplicate questions.
- **Fix**: Implemented case-insensitive deduplication using a tracking `Set` in `sanitizeStringArray`.

#### 7. Unbounded Target Role Length in Controller
- **Files**: [`server/controllers/resumeController.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js#L375-L395)
- **Description**: `customTargetRole` in `req.body` was assigned to `resume.jobTitle` without length validation or capping (schema limit: 200 chars). Excessive strings (>200 chars) caused Mongoose `ValidationError` HTTP 500 crashes.
- **Fix**: Added string trimming and length capping (`substring(0, 200)`) on `sanitizedCustomRole`.

#### 8. Empty AI Analysis Array Property Handling
- **Files**: [`server/services/interviewAiService.js`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/interviewAiService.js#L96-L98)
- **Description**: `aiAnalysis?.strengths.join('; ')` when `strengths` was present as an empty array (`[]`) evaluated to `""` in Gemini prompts instead of fallback context.
- **Fix**: Updated extraction check to require `Array.isArray(...) && length > 0`.

---

### 🟡 Minor Issues

#### 9. Frontend Error Banner for Previously Failed Question Generation
- **Files**: [`client/src/pages/Interview.jsx`](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/client/src/pages/Interview.jsx#L62-L75)
- **Description**: When navigating directly to a resume with `interviewQuestionsStatus === 'failed'`, the UI rendered the default empty state without alerting the user that the previous attempt had failed.
- **Fix**: Updated `fetchResumeDetails` to set an informative error banner prompting the candidate to retry generation.

---

## 4. Summary of Code Modifications

### 1. `server/services/interviewAiService.js`
- Imported `logger` and `cleanExtractedText`.
- Upgraded `validateInterviewQuestionsResponse` with `sanitizeStringArray` supporting string splitting, bullet stripping (`/^[-*•\d.\s]+/`), and `Set`-based deduplication.
- Preprocessed `extractedText` with `cleanExtractedText`.
- Implemented 2-attempt parse retry loop with `logger.warn` and `logger.error` logging.

### 2. `server/controllers/resumeController.js`
- Sanitized `customTargetRole` input and capped length to 200 characters.
- Replaced `console.error` and dev checks with `logger.error`.

### 3. `client/src/pages/Interview.jsx`
- Added explicit failed status alert handling in `fetchResumeDetails`.

---

## 5. Verification & Testing Matrix

| Scenario / Test Case | Input Condition | Expected Result | Pass / Fail |
|---|---|---|---|
| **Clean Resume + Job Role** | Valid PDF text + "Senior React Engineer" | Generates 2 Easy, 2 Medium, 2 Hard technical, 3 HR, 3 Project, 3 Tips | ✅ PASS |
| **Dirty Resume Control Chars** | Text containing `\u200B` & PDF control codes | Preprocessed cleanly via `cleanExtractedText`; prompt executes without errors | ✅ PASS |
| **AI Delimited String Output** | Gemini returns newline-delimited questions string | Converted to array; non-empty questions rendered correctly | ✅ PASS |
| **AI Bullet Numbering** | Output items start with `1. `, `- ` | Leading numbers/bullets stripped; UI displays clean question text | ✅ PASS |
| **Duplicate AI Questions** | Gemini outputs duplicate questions | Duplicate items filtered out via `Set` tracking | ✅ PASS |
| **Unparseable JSON Response** | AI returns invalid JSON on attempt 1 | Triggers attempt 2 retry loop; succeeds or logs structured error | ✅ PASS |
| **Excessive Target Role Length** | `targetRole` string of 500 characters | Truncated to 200 characters; document saved without Mongoose error | ✅ PASS |
| **Empty Analysis Arrays** | `aiAnalysis.strengths = []` | Defaults to fallback prompt text; prompt remains structured | ✅ PASS |

---

## 6. Conclusion & Production Readiness

The **AI Interview Question Generator module** has been fully audited and enhanced. All **Critical** and **Major** issues have been addressed. The module operates with high resilience, safe prompt sanitization, deduplicated outputs, multi-attempt parse retries, and comprehensive Winston production logging telemetry.
