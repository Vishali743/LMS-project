# SkeinLMS - Online Learning Management System

SkeinLMS is a complete, production-ready full-stack Online Learning Management System (LMS) designed for academic specializations and professional syllabus directories.

---

## 1. Technology Stack

- **Frontend**: React.js (Vite, Javascript) with premium custom Vanilla CSS styling (frosted glass panels, glassmorphism, shadows, Outfit/Inter typography, and smooth interactive animations). Iconography is powered by Lucide React and requests by Axios.
- **Backend**: Express.js server on Node.js using MVC architecture.
- **Database**: MySQL. Direct queries are handled via reusable Model files using async/await connection pools.
- **Authentication**: Firebase Authentication. Synced to local MySQL profile tables (`students`, `teachers`, `admins`) using a security verification token middleware.

---

## 2. Directory Structure

```
LMS-Project/
├── frontend/                  # React Vite Client application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── backend/                   # Express REST API application
│   ├── src/
│   │   ├── config/            # Database & Firebase Admin config
│   │   ├── controllers/       # MVC Route controllers
│   │   ├── middleware/        # Security authentication & upload middlewares
│   │   ├── routes/            # Express router mapping files
│   │   ├── models/            # Normalized MySQL query layers (User, Course, etc.)
│   │   └── services/          # Token verification service helper
│   ├── package.json
│   └── .env.example
│
├── database/                  # centralized schema files
│   └── schema.sql
│
├── README.md                  # Unified system guide & documentation
└── .gitignore                 # Root version ignore configurations
```

---

## 3. Prerequisites

1. **Node.js**: Ensure Node.js (v18+) is installed on your local machine.
2. **MySQL Server**: Ensure a local MySQL database instance is active (e.g. MySQL Workbench, XAMPP, or a service).
3. **Firebase Account**:
   - Create a project on the [Firebase Console](https://console.firebase.google.com).
   - Go to **Project Settings** > **Service Accounts** and click **Generate new private key**. Place this JSON file inside `backend/src/config/` as `firebase-service-account.json`.
   - Go to **Authentication** > **Sign-in method** and enable the **Email/Password** provider.
   - Go to **Project Settings** > **General** and copy the Web App configuration parameters.

---

## 4. Setup & Installation

### Step A: Database Configuration
1. Open your MySQL client (e.g., MySQL Workbench) and run the table creation queries found inside [schema.sql](file:///c:/Users/91938/OneDrive/Desktop/LMS-project/database/schema.sql).
2. Configure your database settings inside `backend/.env` (copy from `backend/.env.example`):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   DB_NAME=lms_db
   ```

### Step B: Firebase Client Setup
Create a `.env` file in the `frontend/` directory (copy from `frontend/.env.example`) and copy your Firebase SDK client keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

### Step C: Install Node Modules
In your Visual Studio Code terminal, run the installer:
```bash
npm run install:all
```
This fetches monorepo development packages, Express dependencies, and React libraries.

---

## 5. Running the Application

You can start both applications concurrently from the monorepo root:
```bash
npm run dev
```
Alternatively, you can boot them individually:

- **Launch Backend Express API**:
  ```bash
  cd backend
  npm run dev
  ```
- **Launch Frontend Client**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 6. Creating the First Administrator Account

To configure your first Admin console account on localhost:
1. Register a student account on the frontend portal: `http://localhost:5173/register/student`.
2. Open your MySQL Workbench or database console and run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-registered-email@example.com';
   ```
3. Once updated, your logins are synched. Logging in again will redirect you directly to the Admin console dashboard at `/dashboard/admin`!

---

## 7. How to Use SkeinLMS Features

### Student Portal
- **Catalog Browsing**: Visit `/courses` to view published specializations and check overall ratings.
- **Video Study Player**: Track lessons and tick completion boxes to update your progress gauge.
- **Coursework Submissions**: Upload text essays or external link attachments (Github, Drive) on assignments.
- **Attempt Quizzes**: Answer interactive quiz options. Score results are tracked on the server.
- **Graduation Certificates**: Complete all sections to unlock your golden-border diploma. Print or save directly to PDF.

### Instructor Portal
- **Course Creation**: Create courses and upload local video MP4 lectures or PDF document worksheets.
- **Assignments & Quizzes**: Publish coursework instructions and build assessments using multiple-choice questions.
- **Grade Student Progress**: View student directories, check assignment submissions, write feedback, and grade scores.

### Administrative Control Console
- **Analytics Strip**: View overall platform registers, active instructors, and topics.
- **User Role Management**: Search user registers and change permissions (upgrade Student to Instructor, or add new Admins) on the fly.
