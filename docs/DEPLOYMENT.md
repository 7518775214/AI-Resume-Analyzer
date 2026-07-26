# Deployment & Operations Guide

**Project**: AI Resume Analyzer & Interview Coach  
**Architecture**: Monorepo (Node.js/Express Backend + React/Vite Frontend + MongoDB Atlas Database)

---

## 1. Overview

This document provides complete instructions for configuring, deploying, and maintaining the **AI Resume Analyzer & Interview Coach** platform across cloud providers.

- **Backend**: Render Web Service (Node.js Express API)
- **Frontend**: Vercel Static Web Hosting (React / Vite SPA)
- **Database**: MongoDB Atlas Managed Cluster
- **AI Engine**: Google Gemini API (`@google/generative-ai`)

---

## 2. Environment Variables

### Backend Environment Variables (`server/.env`)

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | Yes | `5000` | HTTP port on which the Express server listens. |
| `NODE_ENV` | Yes | `production` | Environment mode (`development`, `production`, `test`). |
| `MONGODB_URI` | Yes | - | MongoDB Atlas connection string (`mongodb+srv://...`). |
| `JWT_SECRET` | Yes | - | High-entropy secret key for signing JWT tokens (min 32 chars). |
| `JWT_EXPIRES_IN` | No | `7d` | JWT token validity duration. |
| `GEMINI_API_KEY` | Yes | - | Google Gemini AI API Key (`AIzaSy...`). |
| `CLIENT_URL` | Yes | `http://localhost:5173` | Allowed CORS frontend origin(s). Supports comma-separated list. |

### Frontend Environment Variables (`client/.env`)

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `VITE_API_BASE_URL` | Yes | `http://localhost:5000/api` | Public URL pointing to backend API server. |

---

## 3. Database Setup (MongoDB Atlas)

1. Sign in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new cluster (M0 Free Tier or M10 Dedicated).
3. Under **Database Access**, create a database user with `Read and Write to any database` permissions.
4. Under **Network Access**, add `0.0.0.0/0` (or Render outbound IP addresses) to IP Access List.
5. Obtain connection string (`mongodb+srv://<username>:<password>@<cluster>.mongodb.net/ai_resume_analyzer?retryWrites=true&w=majority`).
6. Set `MONGODB_URI` in server environment variables.

---

## 4. Backend Deployment (Render Web Service)

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect repository `AI-Resume-Analyzer`.
4. Configure service settings:
   - **Name**: `ai-resume-analyzer-backend`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
5. Add Environment Variables in Render:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `MONGODB_URI` = `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET` = `<Generated High-Entropy Secret>`
   - `JWT_EXPIRES_IN` = `7d`
   - `GEMINI_API_KEY` = `<Your Gemini API Key>`
   - `CLIENT_URL` = `https://your-app.vercel.app`

---

## 5. Frontend Deployment (Vercel)

1. Log in to [Vercel Dashboard](https://vercel.com/).
2. Click **Add New...** -> **Project**.
3. Import repository `AI-Resume-Analyzer`.
4. Configure framework settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL` = `https://ai-resume-analyzer-backend.onrender.com/api`
6. Deploy! Vercel automatically respects `client/vercel.json` rewrite rules for SPA client-side routing.

---

## 6. Verification & Health Monitoring

- **Health Check Endpoint**: `GET https://ai-resume-analyzer-backend.onrender.com/api/health`
  - Expected HTTP Response: `200 OK`
  - Body:
    ```json
    {
      "status": "success",
      "message": "AI Resume Analyzer & Interview Coach Backend Server is operational.",
      "environment": "production",
      "timestamp": "2026-07-26T23:45:00.000Z"
    }
    ```
