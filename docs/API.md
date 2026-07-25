# REST API Specification & Architecture Document

**Project Title:** AI Resume Analyzer & Interview Coach  
**System Role:** Production RESTful API Documentation  
**Backend Framework:** Node.js (v20+) with Express.js (v4.19+)  
**Database:** MongoDB Atlas (Mongoose ODM v8.0+)  
**AI Service Integration:** Google Gemini API (`@google/generative-ai`)  
**Media Storage:** Cloudinary SDK  
**Authentication Standard:** JSON Web Token (JWT) with Bcrypt hashing  
**Version:** 1.0.0  
**Date:** July 25, 2026  

---

## 1. Executive Overview & Global Standards

### 1.1 Base URL & Environment Configuration
- **Development Base URL:** `http://localhost:5000/api/v1`
- **Production Base URL:** `https://api.airesumeanalyzer.com/api/v1`

### 1.2 Protocol & Headers
All requests must adhere to HTTP/1.1 or HTTP/2 protocols over TLS (HTTPS in production).

**Default Request Headers:**
- `Content-Type: application/json` (except multipart file uploads)
- `Accept: application/json`
- `Authorization: Bearer <JWT_ACCESS_TOKEN>` (for protected endpoints)

### 1.3 Universal Response Format
All API responses follow a standardized JSON envelope structure:

#### Success Response Envelope
```json
{
  "success": true,
  "message": "Human-readable summary of successful action",
  "data": { ... },
  "meta": {
    "timestamp": "2026-07-25T20:45:08.000Z",
    "requestId": "req_9f8a7b6c5d4e"
  }
}
```

#### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE_NAME",
    "message": "Primary descriptive error message",
    "details": [
      {
        "field": "fieldName",
        "issue": "Specific validation failure or constraint message"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-07-25T20:45:08.000Z",
    "requestId": "req_9f8a7b6c5d4e"
  }
}
```

### 1.4 Global Error Codes & HTTP Status Matrix

| Status Code | Error Code | Description |
| :--- | :--- | :--- |
| **400 Bad Request** | `INVALID_INPUT` / `VALIDATION_ERROR` | Malformed syntax, invalid payload, or failed validation. |
| **401 Unauthorized** | `UNAUTHORIZED` / `TOKEN_EXPIRED` | Missing, invalid, or expired JWT authorization header. |
| **403 Forbidden** | `FORBIDDEN_RESOURCE` | Authenticated user lacks permission for the requested resource. |
| **404 Not Found** | `RESOURCE_NOT_FOUND` | Target resource or endpoint does not exist. |
| **409 Conflict** | `RESOURCE_EXISTS` | Unique constraint violation (e.g., duplicate email address). |
| **422 Unprocessable Entity** | `PROCESSING_ERROR` | Business logic rules violated (e.g., submitting answer to completed interview). |
| **429 Too Many Requests** | `RATE_LIMIT_EXCEEDED` | Request quota exceeded (Rate limiter active). |
| **500 Internal Server Error** | `INTERNAL_SERVER_ERROR` | Unexpected backend or database processing exception. |
| **503 Service Unavailable** | `AI_SERVICE_UNAVAILABLE` | External upstream API (e.g. Gemini API) timeout or failure. |

---

## 2. Authentication API Module

### 2.1 Register User Account

1. **Endpoint:** `/api/v1/auth/register`
2. **HTTP Method:** `POST`
3. **Description:** Registers a new candidate or administrator account. Hashes user password using Bcrypt (10 salt rounds), initializes default profile state in MongoDB Atlas, and returns a signed JWT access token.
4. **Request Body:**
   ```json
   {
     "fullName": "John Doe",
     "email": "john.doe@example.com",
     "password": "Password@123",
     "targetJobRole": "Full Stack Software Engineer"
   }
   ```
5. **Response Body:** Returns created user object and JWT bearer token.
6. **Authentication Required:** No
7. **Validation Rules:**
   - `fullName`: String, required, 2 to 50 characters.
   - `email`: String, required, valid RFC 5322 email format.
   - `password`: String, required, min 8 chars, at least 1 uppercase, 1 lowercase, 1 numeric digit, 1 special character (`@$!%*?&`).
   - `targetJobRole`: String, optional, max 100 characters.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR` (Validation rules breached).
   - **409 Conflict:** `EMAIL_ALREADY_EXISTS` (Account with email exists).
   - **500 Internal Server Error:** `DATABASE_ERROR`.
9. **Example Request:**
   ```http
   POST /api/v1/auth/register HTTP/1.1
   Host: api.airesumeanalyzer.com
   Content-Type: application/json

   {
     "fullName": "Alex Mercer",
     "email": "alex.mercer@example.com",
     "password": "SecurePassword#2026",
     "targetJobRole": "AI / ML Engineer"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "User registered successfully",
      "data": {
        "user": {
          "id": "66a25f9b1c9d4b001f8a2e10",
          "fullName": "Alex Mercer",
          "email": "alex.mercer@example.com",
          "role": "candidate",
          "profile": {
            "targetJobRole": "AI / ML Engineer",
            "experienceLevel": "junior",
            "preferredTechStack": [],
            "avatarUrl": null,
            "phone": null,
            "location": null
          },
          "createdAt": "2026-07-25T20:45:08.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_reg_01"
      }
    }
    ```

---

### 2.2 Login User

1. **Endpoint:** `/api/v1/auth/login`
2. **HTTP Method:** `POST`
3. **Description:** Authenticates user credentials against stored Bcrypt password hash. Updates `lastLoginAt` timestamp and returns a valid JWT access token.
4. **Request Body:**
   ```json
   {
     "email": "alex.mercer@example.com",
     "password": "SecurePassword#2026"
   }
   ```
5. **Response Body:** Returns authenticated user profile and signed JWT access token.
6. **Authentication Required:** No
7. **Validation Rules:**
   - `email`: String, required, valid email format.
   - `password`: String, required, non-empty.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `INVALID_CREDENTIALS` (Email or password mismatch).
   - **403 Forbidden:** `ACCOUNT_SUSPENDED`.
9. **Example Request:**
   ```http
   POST /api/v1/auth/login HTTP/1.1
   Host: api.airesumeanalyzer.com
   Content-Type: application/json

   {
     "email": "alex.mercer@example.com",
     "password": "SecurePassword#2026"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Login successful",
      "data": {
        "user": {
          "id": "66a25f9b1c9d4b001f8a2e10",
          "fullName": "Alex Mercer",
          "email": "alex.mercer@example.com",
          "role": "candidate",
          "profile": {
            "targetJobRole": "AI / ML Engineer",
            "experienceLevel": "junior",
            "preferredTechStack": ["Python", "PyTorch", "Node.js"],
            "avatarUrl": "https://res.cloudinary.com/demo/image/upload/v1/avatars/alex.jpg",
            "phone": "+1-555-0199",
            "location": "San Francisco, CA"
          },
          "lastLoginAt": "2026-07-25T20:45:08.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2YTI1ZjliMWM5ZDRiMDAxZjhhMmUxMCIsInJvbGUiOiJjYW5kaWRhdGUiLCJpYXQiOjE3ODUwMjkxMDgsImV4cCI6MTc4NTExNTUwOH0..."
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_login_02"
      }
    }
    ```

---

### 2.3 Logout User

1. **Endpoint:** `/api/v1/auth/logout`
2. **HTTP Method:** `POST`
3. **Description:** Terminates client authorization session. Invalidates active user token client-side and clears authentication cookies if applicable.
4. **Request Body:** None
5. **Response Body:** Confirmation message.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** Valid `Authorization` header required.
8. **Error Responses:**
   - **401 Unauthorized:** `UNAUTHORIZED` (Missing or invalid JWT).
9. **Example Request:**
   ```http
   POST /api/v1/auth/logout HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "User logged out successfully",
      "data": null,
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_logout_03"
      }
    }
    ```

---

### 2.4 Forgot Password

1. **Endpoint:** `/api/v1/auth/forgot-password`
2. **HTTP Method:** `POST`
3. **Description:** Initiates password recovery. Generates a cryptographically secure, time-limited reset token (valid 15 minutes) and dispatches reset instructions to user's registered email.
4. **Request Body:**
   ```json
   {
     "email": "alex.mercer@example.com"
   }
   ```
5. **Response Body:** Generic delivery message to prevent user enumeration attacks.
6. **Authentication Required:** No
7. **Validation Rules:**
   - `email`: String, required, valid email syntax.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **429 Too Many Requests:** `RATE_LIMIT_EXCEEDED` (Max 3 reset requests per hour).
9. **Example Request:**
   ```http
   POST /api/v1/auth/forgot-password HTTP/1.1
   Host: api.airesumeanalyzer.com
   Content-Type: application/json

   {
     "email": "alex.mercer@example.com"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "If the email is registered, a password reset link has been dispatched.",
      "data": null,
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_forgot_04"
      }
    }
    ```

---

### 2.5 Reset Password

1. **Endpoint:** `/api/v1/auth/reset-password`
2. **HTTP Method:** `POST`
3. **Description:** Validates reset token and updates account password with a new Bcrypt hash.
4. **Request Body:**
   ```json
   {
     "resetToken": "d8f3a9e1b2c4d5e6f7a8b9c0d1e2f3a4",
     "newPassword": "NewSecurePassword#2026"
   }
   ```
5. **Response Body:** Success status message.
6. **Authentication Required:** No
7. **Validation Rules:**
   - `resetToken`: String, required, 32+ hex characters.
   - `newPassword`: String, required, min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special character.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `TOKEN_INVALID_OR_EXPIRED`.
9. **Example Request:**
   ```http
   POST /api/v1/auth/reset-password HTTP/1.1
   Host: api.airesumeanalyzer.com
   Content-Type: application/json

   {
     "resetToken": "d8f3a9e1b2c4d5e6f7a8b9c0d1e2f3a4",
     "newPassword": "NewSecurePassword#2026"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Password reset successfully. You may now log in with your new credentials.",
      "data": null,
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_reset_05"
      }
    }
    ```

---

### 2.6 Get Profile

1. **Endpoint:** `/api/v1/auth/profile`
2. **HTTP Method:** `GET`
3. **Description:** Returns target candidate user details, job preferences, tech stack settings, and account metadata extracted from MongoDB `users` collection.
4. **Request Body:** None
5. **Response Body:** Full user profile object.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** Valid JWT token in header.
8. **Error Responses:**
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `USER_NOT_FOUND`.
9. **Example Request:**
   ```http
   GET /api/v1/auth/profile HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "User profile retrieved successfully",
      "data": {
        "id": "66a25f9b1c9d4b001f8a2e10",
        "fullName": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "role": "candidate",
        "accountStatus": "active",
        "profile": {
          "targetJobRole": "AI / ML Engineer",
          "experienceLevel": "junior",
          "preferredTechStack": ["Python", "PyTorch", "Node.js", "MongoDB"],
          "avatarUrl": "https://res.cloudinary.com/demo/image/upload/v1/avatars/alex.jpg",
          "phone": "+1-555-0199",
          "location": "San Francisco, CA"
        },
        "lastLoginAt": "2026-07-25T20:45:08.000Z",
        "createdAt": "2026-07-25T15:10:00.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_prof_06"
      }
    }
    ```

---

### 2.7 Update Profile

1. **Endpoint:** `/api/v1/auth/profile`
2. **HTTP Method:** `PUT`
3. **Description:** Updates candidate profile attributes including name, job role, experience level, preferred tech stack array, phone number, and location.
4. **Request Body:**
   ```json
   {
     "fullName": "Alex Mercer",
     "targetJobRole": "Senior AI / Software Engineer",
     "experienceLevel": "mid",
     "preferredTechStack": ["Python", "FastAPI", "React", "MongoDB"],
     "phone": "+1-555-0199",
     "location": "Seattle, WA"
   }
   ```
5. **Response Body:** Updated user profile object.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `fullName`: String, optional, 2-50 chars.
   - `experienceLevel`: String, optional, enum: `["entry", "junior", "mid", "senior", "lead"]`.
   - `preferredTechStack`: Array of Strings, optional.
   - `phone`: String, optional, valid phone format.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
9. **Example Request:**
   ```http
   PUT /api/v1/auth/profile HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "fullName": "Alex Mercer",
     "targetJobRole": "Senior AI / Software Engineer",
     "experienceLevel": "mid",
     "preferredTechStack": ["Python", "FastAPI", "React", "MongoDB"],
     "phone": "+1-555-0199",
     "location": "Seattle, WA"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "User profile updated successfully",
      "data": {
        "id": "66a25f9b1c9d4b001f8a2e10",
        "fullName": "Alex Mercer",
        "email": "alex.mercer@example.com",
        "role": "candidate",
        "profile": {
          "targetJobRole": "Senior AI / Software Engineer",
          "experienceLevel": "mid",
          "preferredTechStack": ["Python", "FastAPI", "React", "MongoDB"],
          "avatarUrl": "https://res.cloudinary.com/demo/image/upload/v1/avatars/alex.jpg",
          "phone": "+1-555-0199",
          "location": "Seattle, WA"
        },
        "updatedAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_auth_upd_07"
      }
    }
    ```

---

## 3. Resume Management Module

### 3.1 Upload Resume Document

1. **Endpoint:** `/api/v1/resumes/upload`
2. **HTTP Method:** `POST`
3. **Description:** Receives candidate resume document (`.pdf` or `.docx`), streams asset to Cloudinary storage, extracts raw plain-text content via text-parser middleware, and persists metadata in `resumes` MongoDB collection.
4. **Request Body:** `multipart/form-data` containing:
   - `file`: Binary file attachment (PDF/DOCX, max 5MB).
   - `title`: String (optional, e.g. "SDE_Resume_2026").
5. **Response Body:** Created resume document record with Cloudinary URL and parsed metadata preview.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - File attachment required under key `file`.
   - Max file size: 5,242,880 bytes (5 MB).
   - Allowed MIME types: `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_FILE_TYPE` / `FILE_TOO_LARGE`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **500 Internal Server Error:** `CLOUDINARY_UPLOAD_FAILED` / `TEXT_EXTRACTION_FAILED`.
9. **Example Request:**
   ```http
   POST /api/v1/resumes/upload HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

   ------WebKitFormBoundary7MA4YWxkTrZu0gW
   Content-Disposition: form-data; name="title"

   SDE_Resume_2026
   ------WebKitFormBoundary7MA4YWxkTrZu0gW
   Content-Disposition: form-data; name="file"; filename="Alex_Mercer_Resume.pdf"
   Content-Type: application/pdf

   (Binary PDF Content)
   ------WebKitFormBoundary7MA4YWxkTrZu0gW--
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume uploaded and text extracted successfully",
      "data": {
        "id": "66a261a81c9d4b001f8a2e25",
        "userId": "66a25f9b1c9d4b001f8a2e10",
        "title": "SDE_Resume_2026",
        "originalFileName": "Alex_Mercer_Resume.pdf",
        "fileUrl": "https://res.cloudinary.com/demo/image/upload/v1785029100/resumes/alex_resume.pdf",
        "cloudinaryPublicId": "resumes/alex_resume_pdf_99a",
        "fileFormat": "pdf",
        "fileSizeBytes": 1248500,
        "extractedTextLength": 3450,
        "parsedData": {
          "skills": ["Node.js", "Express", "MongoDB", "Python", "React", "PyTorch"],
          "experienceCount": 2,
          "educationCount": 1
        },
        "createdAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_res_up_01"
      }
    }
    ```

---

### 3.2 Get Resume by ID

1. **Endpoint:** `/api/v1/resumes/:id`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves metadata, Cloudinary URL, and extracted text content for a specific uploaded resume document owned by the candidate.
4. **Request Body:** None
5. **Response Body:** Target resume object.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `id`: Must be a valid 24-character hexadecimal MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **403 Forbidden:** `FORBIDDEN_RESOURCE` (User does not own this resume).
   - **404 Not Found:** `RESUME_NOT_FOUND`.
9. **Example Request:**
   ```http
   GET /api/v1/resumes/66a261a81c9d4b001f8a2e25 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume retrieved successfully",
      "data": {
        "id": "66a261a81c9d4b001f8a2e25",
        "userId": "66a25f9b1c9d4b001f8a2e10",
        "title": "SDE_Resume_2026",
        "originalFileName": "Alex_Mercer_Resume.pdf",
        "fileUrl": "https://res.cloudinary.com/demo/image/upload/v1785029100/resumes/alex_resume.pdf",
        "cloudinaryPublicId": "resumes/alex_resume_pdf_99a",
        "fileFormat": "pdf",
        "fileSizeBytes": 1248500,
        "extractedText": "Alex Mercer\nSoftware Engineer...\nSkills: Node.js, Express, MongoDB, Python, React...",
        "parsedData": {
          "skills": ["Node.js", "Express", "MongoDB", "Python", "React", "PyTorch"],
          "experience": [
            {
              "company": "Tech Solutions Inc.",
              "role": "Backend Intern",
              "duration": "6 months"
            }
          ],
          "education": [
            {
              "institution": "State University",
              "degree": "B.Tech CSE (AI & ML)",
              "year": "2026"
            }
          ]
        },
        "createdAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_res_get_02"
      }
    }
    ```

---

### 3.3 Delete Resume

1. **Endpoint:** `/api/v1/resumes/:id`
2. **HTTP Method:** `DELETE`
3. **Description:** Removes resume document record from MongoDB Atlas and issues Cloudinary API request to destroy linked PDF/DOCX asset storage file.
4. **Request Body:** None
5. **Response Body:** Deletion status message.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** `id` parameter must be valid MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **403 Forbidden:** `FORBIDDEN_RESOURCE`.
   - **404 Not Found:** `RESUME_NOT_FOUND`.
9. **Example Request:**
   ```http
   DELETE /api/v1/resumes/66a261a81c9d4b001f8a2e25 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume and associated Cloudinary media asset deleted successfully",
      "data": {
        "deletedId": "66a261a81c9d4b001f8a2e25"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_res_del_03"
      }
    }
    ```

---

### 3.4 List Uploaded Resumes

1. **Endpoint:** `/api/v1/resumes`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves paginated list of all resumes uploaded by the authenticated user sorted by upload date descending.
4. **Request Body:** None
5. **Response Body:** Array of resume header objects with pagination controls (`page`, `limit`, `totalPages`, `totalCount`).
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - Query parameter `page`: Integer, optional (default: 1, min: 1).
   - Query parameter `limit`: Integer, optional (default: 10, min: 1, max: 50).
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_PAGINATION_PARAMS`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
9. **Example Request:**
   ```http
   GET /api/v1/resumes?page=1&limit=10 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Resumes retrieved successfully",
      "data": {
        "resumes": [
          {
            "id": "66a261a81c9d4b001f8a2e25",
            "title": "SDE_Resume_2026",
            "originalFileName": "Alex_Mercer_Resume.pdf",
            "fileUrl": "https://res.cloudinary.com/demo/image/upload/v1785029100/resumes/alex_resume.pdf",
            "fileFormat": "pdf",
            "fileSizeBytes": 1248500,
            "createdAt": "2026-07-25T20:45:08.000Z"
          }
        ],
        "pagination": {
          "currentPage": 1,
          "totalPages": 1,
          "totalCount": 1,
          "limit": 10
        }
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_res_list_04"
      }
    }
    ```

---

## 4. AI Resume Analysis API Module

### 4.1 Analyze Resume with Gemini AI

1. **Endpoint:** `/api/v1/analyses`
2. **HTTP Method:** `POST`
3. **Description:** Ingests resume extracted text and candidate-provided Job Description (JD), constructs Gemini API prompt, and triggers automated ATS score calculation, match breakdown, keyword gap extraction, and bullet point rewrite suggestions.
4. **Request Body:**
   ```json
   {
     "resumeId": "66a261a81c9d4b001f8a2e25",
     "jobTitle": "Senior Backend Developer",
     "jobDescription": "We are seeking a Backend Engineer skilled in Node.js, Express, MongoDB Atlas, Redis, Microservices architecture, and AWS deployment..."
   }
   ```
5. **Response Body:** Created AI diagnostic report document storing ATS compatibility metrics and recommendations.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `resumeId`: String, required, valid MongoDB `ObjectId`.
   - `jobTitle`: String, required, 2 to 100 characters.
   - `jobDescription`: String, required, min 50 characters, max 10,000 characters.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `RESUME_NOT_FOUND`.
   - **503 Service Unavailable:** `GEMINI_AI_API_ERROR` (Upstream AI service timeout/quota limit).
9. **Example Request:**
   ```http
   POST /api/v1/analyses HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "resumeId": "66a261a81c9d4b001f8a2e25",
     "jobTitle": "Senior Backend Developer",
     "jobDescription": "We are seeking a Backend Engineer skilled in Node.js, Express, MongoDB Atlas, Redis, Microservices architecture, and AWS deployment..."
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume analyzed successfully by Gemini AI",
      "data": {
        "id": "66a263df1c9d4b001f8a2e40",
        "resumeId": "66a261a81c9d4b001f8a2e25",
        "userId": "66a25f9b1c9d4b001f8a2e10",
        "jobTitle": "Senior Backend Developer",
        "overallAtsScore": 82,
        "matchBreakdown": {
          "skillsScore": 85,
          "experienceScore": 78,
          "educationScore": 90,
          "formattingScore": 80
        },
        "matchedKeywords": ["Node.js", "Express", "MongoDB", "React"],
        "missingKeywords": ["Redis", "Microservices", "AWS", "Docker"],
        "strengths": [
          "Strong core demonstration of Node.js and MongoDB database operations",
          "Clear structural layout and academic credentials in Computer Science"
        ],
        "weaknesses": [
          "Lacks explicit mention of containerization tools like Docker",
          "Missing caching technologies such as Redis in project highlights"
        ],
        "improvementSuggestions": [
          "Add project bullet point highlighting Redis caching implementations",
          "Incorporate quantifiable metrics (e.g. 'improved API response time by 40%')"
        ],
        "createdAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_ana_run_01"
      }
    }
    ```

---

### 4.2 Get Previous Analysis

1. **Endpoint:** `/api/v1/analyses/:id`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves detailed diagnostic breakdown of a historical AI resume analysis record.
4. **Request Body:** None
5. **Response Body:** Analysis document.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** `id` path parameter must be a valid MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **403 Forbidden:** `FORBIDDEN_RESOURCE`.
   - **404 Not Found:** `ANALYSIS_NOT_FOUND`.
9. **Example Request:**
   ```http
   GET /api/v1/analyses/66a263df1c9d4b001f8a2e40 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Analysis report retrieved successfully",
      "data": {
        "id": "66a263df1c9d4b001f8a2e40",
        "resumeId": "66a261a81c9d4b001f8a2e25",
        "jobTitle": "Senior Backend Developer",
        "overallAtsScore": 82,
        "matchBreakdown": {
          "skillsScore": 85,
          "experienceScore": 78,
          "educationScore": 90,
          "formattingScore": 80
        },
        "matchedKeywords": ["Node.js", "Express", "MongoDB", "React"],
        "missingKeywords": ["Redis", "Microservices", "AWS", "Docker"],
        "strengths": ["Strong core demonstration of Node.js and MongoDB database operations"],
        "weaknesses": ["Lacks explicit mention of containerization tools like Docker"],
        "improvementSuggestions": ["Add project bullet point highlighting Redis caching implementations"],
        "createdAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_ana_get_02"
      }
    }
    ```

---

### 4.3 Delete Analysis

1. **Endpoint:** `/api/v1/analyses/:id`
2. **HTTP Method:** `DELETE`
3. **Description:** Deletes historical AI resume analysis record from MongoDB `resumeanalyses` collection.
4. **Request Body:** None
5. **Response Body:** Deletion confirmation object.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** `id` path parameter must be a valid MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **403 Forbidden:** `FORBIDDEN_RESOURCE`.
   - **404 Not Found:** `ANALYSIS_NOT_FOUND`.
9. **Example Request:**
   ```http
   DELETE /api/v1/analyses/66a263df1c9d4b001f8a2e40 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Resume analysis record deleted successfully",
      "data": {
        "deletedId": "66a263df1c9d4b001f8a2e40"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_ana_del_03"
      }
    }
    ```

---

## 5. Mock Interview Module

### 5.1 Start Interview Session

1. **Endpoint:** `/api/v1/interviews/start`
2. **HTTP Method:** `POST`
3. **Description:** Initializes multi-turn interactive AI mock interview session. Calls Gemini API to generate contextually tailored questions based on job role, target tech stack, difficulty, and uploaded resume text. Pre-generates initial Question #1.
4. **Request Body:**
   ```json
   {
     "jobRole": "Full Stack Engineer",
     "difficultyLevel": "intermediate",
     "totalQuestions": 5,
     "resumeId": "66a261a81c9d4b001f8a2e25",
     "techStack": ["React", "Node.js", "Express", "MongoDB"]
   }
   ```
5. **Response Body:** Created interview document containing session configuration and the first generated question.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `jobRole`: String, required, 2-100 characters.
   - `difficultyLevel`: String, required, enum: `["beginner", "intermediate", "advanced"]`.
   - `totalQuestions`: Integer, required, min 3, max 10.
   - `resumeId`: String, optional, valid MongoDB `ObjectId`.
   - `techStack`: Array of Strings, optional.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **503 Service Unavailable:** `AI_SERVICE_UNAVAILABLE`.
9. **Example Request:**
   ```http
   POST /api/v1/interviews/start HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "jobRole": "Full Stack Engineer",
     "difficultyLevel": "intermediate",
     "totalQuestions": 5,
     "resumeId": "66a261a81c9d4b001f8a2e25",
     "techStack": ["React", "Node.js", "Express", "MongoDB"]
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 201 Created
    Content-Type: application/json

    {
      "success": true,
      "message": "Mock interview session initialized successfully",
      "data": {
        "interviewId": "66a266e01c9d4b001f8a2e55",
        "jobRole": "Full Stack Engineer",
        "difficultyLevel": "intermediate",
        "status": "in_progress",
        "totalQuestions": 5,
        "currentQuestionIndex": 1,
        "firstQuestion": {
          "questionId": "q_idx_1",
          "questionText": "Can you explain how MongoDB handles index creation and how compound indexes optimize multi-field search queries?",
          "category": "technical",
          "expectedConcepts": ["B-Tree indexing", "Compound index field ordering", "Index prefix execution"]
        }
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_int_start_01"
      }
    }
    ```

---

### 5.2 Get Next Question

1. **Endpoint:** `/api/v1/interviews/:id/next-question`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves active un-answered question payload for ongoing interview session.
4. **Request Body:** None
5. **Response Body:** Question object with sequence index.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** `id` parameter must be valid MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `INTERVIEW_NOT_FOUND`.
   - **409 Conflict:** `INTERVIEW_ALREADY_COMPLETED`.
9. **Example Request:**
   ```http
   GET /api/v1/interviews/66a266e01c9d4b001f8a2e55/next-question HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Next question retrieved successfully",
      "data": {
        "interviewId": "66a266e01c9d4b001f8a2e55",
        "currentQuestionIndex": 2,
        "totalQuestions": 5,
        "question": {
          "questionId": "q_idx_2",
          "questionText": "Describe the difference between server-side rendering (SSR) and client-side rendering (CSR) in React Next.js applications.",
          "category": "technical"
        }
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_int_next_02"
      }
    }
    ```

---

### 5.3 Submit Question Answer

1. **Endpoint:** `/api/v1/interviews/:id/answer`
2. **HTTP Method:** `POST`
3. **Description:** Submits candidate's natural language answer to current interview question. Passes response to Gemini API for real-time scoring (accuracy, clarity, technical depth), constructive feedback, and sample answer generation.
4. **Request Body:**
   ```json
   {
     "questionId": "q_idx_1",
     "answerText": "MongoDB uses B-Trees for indexing. Compound indexes allow queries matching multiple fields to execute efficiently when fields match index prefix order.",
     "timeTakenSeconds": 45
   }
   ```
5. **Response Body:** Evaluation feedback object for submitted answer and progress flag (`hasNextQuestion`).
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `questionId`: String, required.
   - `answerText`: String, required, min 2 characters.
   - `timeTakenSeconds`: Integer, optional, min 1.
8. **Error Responses:**
   - **400 Bad Request:** `VALIDATION_ERROR`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `INTERVIEW_OR_QUESTION_NOT_FOUND`.
   - **422 Unprocessable Entity:** `QUESTION_ALREADY_ANSWERED`.
9. **Example Request:**
   ```http
   POST /api/v1/interviews/66a266e01c9d4b001f8a2e55/answer HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "questionId": "q_idx_1",
     "answerText": "MongoDB uses B-Trees for indexing. Compound indexes allow queries matching multiple fields to execute efficiently when fields match index prefix order.",
     "timeTakenSeconds": 45
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Answer submitted and evaluated successfully",
      "data": {
        "interviewId": "66a266e01c9d4b001f8a2e55",
        "questionId": "q_idx_1",
        "score": 88,
        "feedback": {
          "technicalAccuracyScore": 90,
          "clarityScore": 85,
          "strengths": "Accurately noted B-Tree structures and compound index prefix principles.",
          "areasForImprovement": "Could explicitly mention equality-sort-range (ESR) rule.",
          "sampleOptimalAnswer": "MongoDB utilizes B-Tree indexes. Compound indexes follow the Equality, Sort, Range rule..."
        },
        "hasNextQuestion": true,
        "nextQuestionIndex": 2
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_int_ans_03"
      }
    }
    ```

---

### 5.4 End Interview Session

1. **Endpoint:** `/api/v1/interviews/:id/end`
2. **HTTP Method:** `POST`
3. **Description:** Terminates mock interview session (either manually or after answering all questions). Triggers background Gemini pipeline to aggregate response scores and auto-generate the complete `interviewreports` MongoDB document.
4. **Request Body:**
   ```json
   {
     "reason": "user_completed"
   }
   ```
5. **Response Body:** Session summary and reference ID to generated performance report.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `reason`: String, optional, enum: `["user_completed", "user_terminated", "timeout"]`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `INTERVIEW_NOT_FOUND`.
9. **Example Request:**
   ```http
   POST /api/v1/interviews/66a266e01c9d4b001f8a2e55/end HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Content-Type: application/json

   {
     "reason": "user_completed"
   }
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Interview session finalized and report generated",
      "data": {
        "interviewId": "66a266e01c9d4b001f8a2e55",
        "status": "completed",
        "completedQuestions": 5,
        "overallScore": 86,
        "reportId": "66a268a01c9d4b001f8a2e70",
        "completedAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_int_end_04"
      }
    }
    ```

---

## 6. Reports & Analytics API Module

### 6.1 Get Interview Report

1. **Endpoint:** `/api/v1/reports/:id`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves comprehensive interview evaluation report including 5-axis radar chart scores (Technical Depth, Problem Solving, Communication, System Design, Coding Standards), executive AI assessment summary, strengths, weaknesses, and personalized study roadmap.
4. **Request Body:** None
5. **Response Body:** Full report document.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** `id` path parameter must be a valid MongoDB `ObjectId`.
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **403 Forbidden:** `FORBIDDEN_RESOURCE`.
   - **404 Not Found:** `REPORT_NOT_FOUND`.
9. **Example Request:**
   ```http
   GET /api/v1/reports/66a268a01c9d4b001f8a2e70 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Interview report retrieved successfully",
      "data": {
        "id": "66a268a01c9d4b001f8a2e70",
        "interviewId": "66a266e01c9d4b001f8a2e55",
        "userId": "66a25f9b1c9d4b001f8a2e10",
        "jobRole": "Full Stack Engineer",
        "overallScore": 86,
        "radarChartMetrics": {
          "technicalDepth": 88,
          "problemSolving": 84,
          "communicationClarity": 85,
          "systemDesign": 82,
          "codeQuality": 90
        },
        "executiveSummary": "Candidate demonstrates strong conceptual understanding of backend databases and API architecture with crisp communication.",
        "keyStrengths": [
          "Mastery of NoSQL indexing mechanisms and asynchronous event loops",
          "Clear structuring of technical explanations"
        ],
        "keyWeaknesses": [
          "Could elaborate deeper on distributed systems edge cases"
        ],
        "actionableRoadmap": [
          "Review MongoDB ESR index compound rules",
          "Practice multi-region replication architectures"
        ],
        "createdAt": "2026-07-25T20:45:08.000Z"
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_rep_get_01"
      }
    }
    ```

---

### 6.2 Download Printable PDF Report

1. **Endpoint:** `/api/v1/reports/:id/download`
2. **HTTP Method:** `GET`
3. **Description:** Generates printable PDF performance document containing interview evaluation summary, radar charts, and AI coaching roadmap, streaming file back as binary attachment.
4. **Request Body:** None
5. **Response Body:** Binary PDF file stream (`application/pdf`).
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - `id`: Valid MongoDB `ObjectId`.
   - Query `format`: Optional, string, enum: `["pdf", "json"]` (default: `pdf`).
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_OBJECT_ID`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **404 Not Found:** `REPORT_NOT_FOUND`.
   - **500 Internal Server Error:** `PDF_GENERATION_FAILED`.
9. **Example Request:**
   ```http
   GET /api/v1/reports/66a268a01c9d4b001f8a2e70/download?format=pdf HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/pdf
    Content-Disposition: attachment; filename="Interview_Report_66a268a0.pdf"
    Content-Length: 348200

    [Binary PDF Document Stream Bytes]
    ```

---

## 7. Dashboard API Module

### 7.1 Get Dashboard Statistics

1. **Endpoint:** `/api/v1/dashboard/stats`
2. **HTTP Method:** `GET`
3. **Description:** Computes aggregated metric totals for candidate dashboard widgets using fast MongoDB aggregation pipelines (total resumes uploaded, total analyses executed, average ATS match score, total mock interviews completed, average interview score).
4. **Request Body:** None
5. **Response Body:** Statistical counter and average metrics payload.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:** Header Bearer Token valid.
8. **Error Responses:**
   - **401 Unauthorized:** `UNAUTHORIZED`.
   - **500 Internal Server Error:** `AGGREGATION_FAILED`.
9. **Example Request:**
   ```http
   GET /api/v1/dashboard/stats HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Dashboard statistics calculated successfully",
      "data": {
        "totalResumes": 3,
        "totalAnalyses": 7,
        "averageAtsScore": 84.5,
        "totalInterviews": 4,
        "averageInterviewScore": 86.2,
        "scoreTrends": {
          "atsScoreImprovement": "+12%",
          "interviewScoreImprovement": "+8%"
        }
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_dash_stats_01"
      }
    }
    ```

---

### 7.2 Get Recent Activity Feed

1. **Endpoint:** `/api/v1/dashboard/recent-activity`
2. **HTTP Method:** `GET`
3. **Description:** Retrieves chronological activity feed combining recent resume uploads, completed AI ATS analyses, and finalized interview sessions.
4. **Request Body:** None
5. **Response Body:** Array of activity items with timestamp and resource links.
6. **Authentication Required:** Yes (Bearer Token)
7. **Validation Rules:**
   - Query `limit`: Optional, integer, min 1, max 20 (default: 5).
8. **Error Responses:**
   - **400 Bad Request:** `INVALID_LIMIT_PARAM`.
   - **401 Unauthorized:** `UNAUTHORIZED`.
9. **Example Request:**
   ```http
   GET /api/v1/dashboard/recent-activity?limit=5 HTTP/1.1
   Host: api.airesumeanalyzer.com
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
10. **Example Response:**
    ```http
    HTTP/1.1 200 OK
    Content-Type: application/json

    {
      "success": true,
      "message": "Recent activity feed retrieved successfully",
      "data": {
        "activities": [
          {
            "id": "act_01",
            "type": "interview_completed",
            "title": "Completed Mock Interview",
            "description": "Full Stack Engineer (Score: 86%)",
            "resourceId": "66a266e01c9d4b001f8a2e55",
            "timestamp": "2026-07-25T20:45:08.000Z"
          },
          {
            "id": "act_02",
            "type": "resume_analyzed",
            "title": "AI ATS Resume Analysis",
            "description": "Senior Backend Developer (ATS Score: 82%)",
            "resourceId": "66a263df1c9d4b001f8a2e40",
            "timestamp": "2026-07-25T19:30:00.000Z"
          },
          {
            "id": "act_03",
            "type": "resume_uploaded",
            "title": "Uploaded Resume",
            "description": "SDE_Resume_2026.pdf",
            "resourceId": "66a261a81c9d4b001f8a2e25",
            "timestamp": "2026-07-25T18:15:00.000Z"
          }
        ]
      },
      "meta": {
        "timestamp": "2026-07-25T20:45:08.000Z",
        "requestId": "req_dash_act_02"
      }
    }
    ```
