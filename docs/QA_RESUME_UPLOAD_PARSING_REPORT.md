# QA Audit & Verification Report: Resume Upload & Parsing Module

**Project:** AI Resume Analyzer & Interview Coach  
**Module Audited:** Resume Upload & Parsing (File Upload, Validation, Security, Text Extraction & DB Storage)  
**Date:** July 26, 2026  
**Auditor:** Senior MERN Stack QA Engineer & Backend Architect  

---

## 1. Executive Summary

A comprehensive Quality Assurance (QA) audit was conducted on the **Resume Upload & Parsing Module** of the AI Resume Analyzer & Interview Coach platform. The objective was to audit, verify, and harden compliance across 15 critical areas spanning file validation, security, text parsing, database storage, error handling, and UX feedback.

During the audit:
- **15 Verification Areas** were audited across backend (Express, Multer, `pdf-parse`, `mammoth`, Mongoose) and frontend (React, Axios, drag-and-drop file uploader).
- **2 Critical Issues** and **5 Major Issues** were identified and fully resolved.
- **1 Minor Issue** was documented.
- All existing features remained intact, no architectural changes were made, and existing utilities (`storageService`, `textCleaner`, `Resume` model) were reused cleanly.

---

## 2. Verification Checklist (15 Criteria)

| # | Verification Criterion | Result | Status / Observation |
|---|------------------------|--------|----------------------|
| **1** | **PDF Upload Functionality** | **PASSED** | Verifies multipart file upload, disk storage via Multer, text extraction via `pdf-parse`, whitespace cleaning via `cleanExtractedText()`, and MongoDB document persistence. |
| **2** | **DOCX Upload Functionality** | **PASSED (FIXED)** | Verifies Office Open XML DOCX text extraction via `mammoth.extractRawText()`. Restricted unsupported legacy `.doc` binary formats upfront across client and server. |
| **3** | **File Size Validation** | **PASSED** | Enforces 5 MB maximum file size limit in frontend (`validateFile`) and backend Multer (`limits.fileSize: 5 * 1024 * 1024`). Returns HTTP 400 with structured JSON on size limit breach. |
| **4** | **File Type Validation** | **PASSED (FIXED)** | Validates extensions (`.pdf`, `.docx`) and MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`). Removed unparsable `.doc` extensions. |
| **5** | **Empty File Handling** | **PASSED (FIXED)** | Validates file size `size > 0` in frontend (`ResumeUpload.jsx`), upload middleware, and controller. Rejects 0-byte files with HTTP 400 Bad Request instead of throwing a Mongoose 500 schema error. |
| **6** | **Corrupted File Handling** | **PASSED (FIXED)** | Catches unparseable, truncated, or damaged file streams during text extraction; deletes temporary file from disk immediately and returns clean 400 error response. |
| **7** | **Duplicate Upload Handling** | **PASSED (FIXED)** | Checks for existing resume matching `userId`, `originalFileName`, and `fileSize`. Deletes previous physical file from disk via `storageService.deleteFile()` and replaces old DB document to prevent disk leakage. |
| **8** | **Resume Parsing Accuracy** | **PASSED** | `textCleaner.js` normalizes CRLF line endings, strips zero-width/control characters, replaces tabs with single spaces, and limits consecutive line breaks to max 2 to preserve section gaps. |
| **9** | **Extraction Error Handling** | **PASSED (FIXED)** | Handles password-protected PDFs and scanned/image-only PDFs. Rejects documents with 0 extracted text characters upfront with clear actionable error messages. |
| **10**| **Database Storage After Upload** | **PASSED** | Persists resume metadata (`userId`, `originalFileName`, `storedFileName`, `fileUrl`, `fileType`, `fileSize`, `extractedText`, `parsingStatus`) in MongoDB with indexed queries (`userId: 1, uploadDate: -1`). |
| **11**| **Uploaded File Cleanup** | **PASSED (FIXED)** | Ensures temporary uploaded files are deleted from `server/uploads/` on validation failure, Multer error, parsing error, database error, or document deletion. |
| **12**| **Upload Progress & Loading** | **PASSED** | Axios `onUploadProgress` tracks real-time progress bar (0-100%). Displays `Loader` component when finalizing upload and storing metadata in MongoDB. |
| **13**| **Success & Error Messages** | **PASSED** | Displays green success alert and uploaded resume metadata card on success; displays red warning alert with detailed validation/server error messages on failure. |
| **14**| **Security Checks (Malicious Files)**| **PASSED (FIXED)** | Enforces strict magic byte signatures (`%PDF-` for PDF, `PK\x03\x04` for DOCX). Removed unsafe fallback to client MIME headers when magic byte signature check fails. |
| **15**| **API Endpoint Validation** | **PASSED (FIXED)** | Protected by `authenticateToken` JWT middleware and `sensitiveLimiter` rate limiting. Sanitizes and caps `jobTitle` (max 200) and `jobDescription` (max 10,000) lengths upfront. |

---

## 3. Discovered Issues & Fix Rationale

### **Critical & Major Issues Fixed**

#### 1. [CRITICAL] ISSUE-RESUME-01: Magic Byte Security Bypass Fallback in Parsing Service
- **Severity:** Critical
- **Affected File:** [parsingService.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/parsingService.js)
- **Root Cause:** `detectFileType()` checked magic bytes, but if magic bytes returned `'unknown'`, it fell back to client-supplied MIME types and file extensions. A malicious executable (`malicious.exe`) or shell script renamed to `.pdf` with header `application/pdf` bypassed magic byte security verification.
- **Fix Applied:** Removed unsafe MIME/extension fallback when magic bytes return `'unknown'`. Enforced strict magic byte signature verification (`%PDF-` for PDF, `PK\x03\x04` for DOCX), throwing an explicit error when binary signatures do not match supported document headers.
- **Why Required:** Prevents arbitrary file upload and MIME spoofing attacks by ensuring only genuine PDF and DOCX binary streams are accepted for text extraction.

#### 2. [CRITICAL] ISSUE-RESUME-02: Disk Leakage / Orphaned Temporary Files on Upload Errors
- **Severity:** Critical
- **Affected Files:** [uploadMiddleware.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/middleware/uploadMiddleware.js), [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js)
- **Root Cause:** When Multer diskStorage saved a file but later encountered a validation error (e.g. file size exceeded, invalid MIME type, or parsing failure), the created file remained on disk in `server/uploads/`, causing cumulative disk space leakage.
- **Fix Applied:** Added `storageService.deleteFile(req.file.filename)` in `uploadResumeMiddleware` error wrapper and `uploadResume` controller error handlers to delete temporary files whenever validation or parsing fails.
- **Why Required:** Ensures production storage hygiene and prevents local disk space exhaustion over time.

#### 3. [MAJOR] ISSUE-RESUME-03: HTTP 500 Internal Server Error on Empty File (0-Byte) Upload
- **Severity:** Major
- **Affected Files:** [uploadMiddleware.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/middleware/uploadMiddleware.js), [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js), [ResumeUpload.jsx](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/client/src/pages/ResumeUpload.jsx)
- **Root Cause:** Neither client nor server checked for `file.size === 0`. When a 0-byte file was uploaded, Mongoose schema validation (`fileSize: { min: [1, 'File size must be greater than 0 bytes'] }`) failed during `Resume.create()`, throwing an unhandled `ValidationError` and returning an HTTP 500 error response.
- **Fix Applied:** Added 0-byte file check in client `validateFile()`, upload middleware, and `uploadResume` controller, returning HTTP 400 Bad Request: `"Uploaded file is empty (0 bytes). Please select a valid PDF or DOCX file."`.
- **Why Required:** Provides immediate, clear 400 validation feedback to the user instead of throwing internal server errors.

#### 4. [MAJOR] ISSUE-RESUME-04: Unsupported Legacy `.doc` Binary Word Document Uploads
- **Severity:** Major
- **Affected Files:** [uploadMiddleware.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/middleware/uploadMiddleware.js), [ResumeUpload.jsx](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/client/src/pages/ResumeUpload.jsx)
- **Root Cause:** `uploadMiddleware.js` and `ResumeUpload.jsx` listed `.doc` in allowed extensions. However, `mammoth` only parses XML-based `.docx` files, causing `parsingService.js` to throw an error whenever a `.doc` file was uploaded.
- **Fix Applied:** Restricted allowed extensions strictly to `['.pdf', '.docx']` and MIME types to `application/pdf` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document` across client and server. Updated UI guidance text.
- **Why Required:** Prevents users from uploading legacy `.doc` files that are guaranteed to fail during text parsing.

#### 5. [MAJOR] ISSUE-RESUME-05: Orphaned Disk Files on Duplicate Resume Uploads
- **Severity:** Major
- **Affected File:** [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js)
- **Root Cause:** Re-uploading an identical resume file (same `originalFileName` and `fileSize`) generated a new physical file name on disk and a duplicate MongoDB document, leaving previous physical files orphaned.
- **Fix Applied:** Added duplicate resume detection in `uploadResume`: `Resume.findOne({ userId, originalFileName, fileSize })`. If a duplicate is found, the previous physical file is deleted via `storageService.deleteFile()`, and the old database document is replaced.
- **Why Required:** Eliminates duplicate physical file accumulation and keeps user resume history clean.

#### 6. [MAJOR] ISSUE-RESUME-06: Scanned/Image-Only PDF Marked as 'completed' with Empty Text
- **Severity:** Major
- **Affected Files:** [parsingService.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/parsingService.js), [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js)
- **Root Cause:** If a PDF contained only scanned images (0 selectable text characters), `parsingService` returned `''` without throwing an error, causing `uploadResume` to set `parsingStatus: 'completed'`. Subsequent AI analysis requests failed unexpectedly with "Resume content is empty".
- **Fix Applied:** Updated `parsingService.js` to throw an error when extracted text is empty (`"No readable text could be extracted from document. The file may be password protected, empty, or a scanned image PDF."`), and updated `uploadResume` to delete the file and return HTTP 400.
- **Why Required:** Informs the user immediately if their uploaded document lacks extractable text content.

#### 7. [MAJOR] ISSUE-RESUME-07: Missing Upfront Length Validation for Payload Metadata
- **Severity:** Major
- **Affected File:** [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js)
- **Root Cause:** Excessive `jobTitle` (>200 chars) or `jobDescription` (>10,000 chars) payloads triggered Mongoose schema validation failures during `Resume.create()`, resulting in 500 status responses.
- **Fix Applied:** Added upfront sanitization and boundary trimming (`slice(0, 200)` for `jobTitle`, `slice(0, 10000)` for `jobDescription`) in `uploadResume`.
- **Why Required:** Protects database insertion logic against schema validation errors.

---

### **Minor Issues Documented**

#### 8. [MINOR] ISSUE-RESUME-08: Non-standard MIME Type Handling for Non-standard PDF Clients
- **Severity:** Minor
- **Affected File:** [uploadMiddleware.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/middleware/uploadMiddleware.js)
- **Observation:** Certain legacy browsers send `application/x-pdf` MIME header. Strict MIME checking paired with magic byte verification in `parsingService.js` ensures non-standard headers are validated accurately.

---

## 4. Test Matrix & Verification Scenarios

| Test Case ID | Test Scenario | Input Data | Expected Result | Verification |
|--------------|---------------|------------|-----------------|--------------|
| **TC-RES-001** | Valid PDF Upload | `resume.pdf` (Valid text PDF, 150 KB) | HTTP 201 Created; text extracted; metadata stored in MongoDB; file saved in `/uploads`. | PASSED |
| **TC-RES-002** | Valid DOCX Upload | `resume.docx` (Valid Word document, 80 KB) | HTTP 201 Created; text extracted via mammoth; metadata stored in MongoDB. | PASSED |
| **TC-RES-003** | Unsupported `.doc` Upload | `old_resume.doc` | HTTP 400 Bad Request; UI displays "Invalid file format. Only PDF (.pdf) and Word (.docx) files are accepted." | PASSED |
| **TC-RES-004** | File Size Exceeding 5 MB | `large_resume.pdf` (6.2 MB) | HTTP 400 Bad Request; UI displays "File size exceeds 5 MB limit."; temp file cleaned up. | PASSED |
| **TC-RES-005** | Empty File (0 Bytes) Upload | `empty.pdf` (0 bytes) | HTTP 400 Bad Request; UI displays "Uploaded file is empty (0 bytes)..."; zero server disk leakage. | PASSED |
| **TC-RES-006** | File Spoofing / Malicious Executable | `malicious.exe` renamed to `resume.pdf` | HTTP 400 Bad Request; magic byte signature check fails; temp file deleted from disk. | PASSED |
| **TC-RES-007** | Password Protected PDF | Encrypted PDF | HTTP 400 Bad Request; returns "PDF document is password-protected or encrypted."; temp file deleted. | PASSED |
| **TC-RES-008** | Duplicate File Upload | `resume.pdf` uploaded twice | HTTP 201 Created; old physical file deleted from disk; DB entry updated cleanly. | PASSED |
| **TC-RES-009** | Scanned / Image PDF | Scanned PDF with no selectable text | HTTP 400 Bad Request; returns "No readable text could be extracted..."; temp file deleted. | PASSED |
| **TC-RES-010** | Unauthenticated File Upload | POST `/api/resumes/upload` without JWT | HTTP 401 Unauthorized; temp file deleted from disk immediately. | PASSED |

---

## 5. Summary of Modified Files

1. [uploadMiddleware.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/middleware/uploadMiddleware.js) - Restricted extensions to `.pdf` and `.docx`; added orphaned temp file cleanup on Multer error.
2. [parsingService.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/services/parsingService.js) - Enforced strict magic byte signature checks; removed unsafe MIME fallback; added zero-text handling for scanned PDFs.
3. [resumeController.js](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/server/controllers/resumeController.js) - Added 0-byte file check; added duplicate upload disk cleanup; added payload length sanitization; ensured temp file deletion on parsing/DB errors.
4. [ResumeUpload.jsx](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/client/src/pages/ResumeUpload.jsx) - Added 0-byte file validation check; updated extension filters and UI guidance to PDF and DOCX.
5. [QA_RESUME_UPLOAD_PARSING_REPORT.md](file:///c:/Users/ashis/Desktop/AI-Resume-Analyzer/docs/QA_RESUME_UPLOAD_PARSING_REPORT.md) - Official QA Audit document.

---
*Report compiled and certified by Senior MERN Stack QA Engineer & Backend Architect.*
