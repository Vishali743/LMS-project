# SkeinLMS - Enterprise Learning Management System

SkeinLMS is a production-ready, full-stack Online Learning Management System (LMS) designed for academic specializations, syllabus directory management, interactive coursework, student assessments, and automated certificate issuance.

---

## 1. System Architecture & Features

### Core Architectural Highlights
- **Frontend Client**: Built with **React 19 & Vite**, featuring dynamic glassmorphism UI, theme system, Lucide React icons, and responsive layouts.
- **Backend REST API**: Powered by **Node.js & Express** utilizing standard MVC (Model-View-Controller) architecture.
- **Database Engine**: **MySQL** with connection pooling (`mysql2/promise`), auto-schema migration capabilities, and SSL support for cloud hosting (Render, Aiven, Railway).
- **Authentication**: **Firebase Authentication** integrated with local profile synchronization for Students, Instructors, and Administrators.

### Key Functional Features
- **Student Dashboard**: Enrolled course catalog, lesson progress indicators, assignment submission interface, interactive quizzes, and certificate download.
- **Instructor Portal**: Course creation, video lecture uploads, assignment grading tools, scholar roster, and analytics summary.
- **Administrator Console**: System statistics, role upgrade controls (Student to Instructor / Admin), and platform audit logs.

---

## 2. Directory Structure

```
LMS-Project/
├── frontend/                  # React + Vite Single Page Application
│   ├── src/                   # React components, pages, context, and styles
│   ├── public/                # Static assets & SPA redirect configurations
│   ├── vercel.json            # Vercel SPA routing fallback configuration
│   ├── package.json
│   └── .env.example
│
├── backend/                   # Express Node.js REST API
│   ├── src/
│   │   ├── config/            # MySQL Pool & Firebase Admin config
│   │   ├── controllers/       # Route logic controllers
│   │   ├── middleware/        # Authentication & file upload handlers
│   │   ├── models/            # SQL Query Models
│   │   ├── routes/            # API Route Registries
│   │   └── services/          # Token verification services
│   ├── package.json
│   └── .env.example
│
├── database/                  # Schema definition and seeding
│   └── schema.sql
│
├── README.md                  # Comprehensive platform documentation
└── package.json               # Monorepo task orchestration
```

---

## 3. Production Deployment Guide (Render)

### Option A: Monorepo Single Service (Recommended)
The backend Express server serves both the REST API endpoints (`/api/*`) and the built static React frontend (`dist/index.html`) from a single service instance.

1. Create a **New Web Service** on [Render](https://dashboard.render.com).
2. Connect your GitHub repository: `https://github.com/Vishali743/LMS-project.git`.
3. Configure settings:
   - **Root Directory**: `.` (leave empty for monorepo root)
   - **Build Command**: `npm run install:all && npm run build --prefix frontend`
   - **Start Command**: `npm start` (or `node backend/src/index.js`)

### Option B: Separate Web Service (Backend) & Static Site (Frontend)

#### 1. Backend Service (Render Web Service)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`
- **Environment Variables**:
  - `PORT`: `5000` (or injected automatically by Render)
  - `HOST`: `0.0.0.0`
  - `DB_HOST`: *(Cloud MySQL Host)*
  - `DB_PORT`: `3306`
  - `DB_USER`: *(Cloud MySQL User)*
  - `DB_PASSWORD`: *(Cloud MySQL Password)*
  - `DB_NAME`: `lms_db`
  - `DB_SSL`: `true`
  - `FIREBASE_PROJECT_ID`: *(Your Firebase Project ID)*

#### 2. Frontend Site (Render Static Site / Vercel)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-render-url>/api`
  - `VITE_FIREBASE_API_KEY`: *(Your Firebase API Key)*
  - `VITE_FIREBASE_PROJECT_ID`: *(Your Firebase Project ID)*

---

## 4. Environment Variables Reference

### Backend (`backend/.env.example`)
```env
PORT=5000
HOST=0.0.0.0

DB_HOST=your_mysql_host_here
DB_PORT=3306
DB_USER=your_mysql_user_here
DB_PASSWORD=your_mysql_password_here
DB_NAME=lms_db
DB_SSL=false

FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
FIREBASE_PROJECT_ID=your_firebase_project_id
```

### Frontend (`frontend/.env.example`)
```env
VITE_API_URL=/api
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

---

## 5. Local Setup & Verification

1. Install dependencies across monorepo:
   ```bash
   npm run install:all
   ```
2. Launch dev environment:
   ```bash
   npm run dev
   ```
3. Health check backend:
   ```bash
   curl http://localhost:5000/health
   ```
