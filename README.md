# Case Management Web Application

A production-grade case/task management platform built with React, Redux Toolkit, Node.js, Express, and Firebase.

## Features

- **Authentication**: Email/password login via Firebase Auth
- **Role-Based Access**: Admin (Project Manager) and User (Employee) roles
- **Case Management**: Create, edit, delete, and track cases with priorities and statuses
- **Comments System**: Threaded comments on each case
- **Modern UI**: Glassmorphism design, dark mode, responsive layout

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Redux Toolkit, TailwindCSS, Vite |
| Backend | Node.js, Express.js |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |

## Project Structure

```
├── client/          # React frontend
└── server/          # Node.js backend
```

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## Quick Start

### 1. Clone and Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Add Firebase Service Account

Download your service account key from Firebase Console:
- Go to Project Settings > Service Accounts
- Click "Generate new private key"
- Save as `server/serviceAccountKey.json`

### 4. Run the Application

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm run dev
```

Open http://localhost:5173 in your browser.

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Create, edit, delete cases. Change status. View all cases. |
| User | View cases. Add comments. |

> **Note**: The first user to register automatically becomes an Admin. All subsequent users are assigned the User role.

## License

MIT

## Deployment on Vercel

This project is configured for easy deployment on [Vercel](https://vercel.com).

### Prerequisites
1. A Vercel account
2. The `vercel` CLI installed (optional, can deploy via Git integration)

### Deploying the Client (Frontend)
1. Push your code to a Git repository (GitHub/GitLab/Bitbucket)
2. Import the project in Vercel
3. Select the `client` directory as the **Root Directory**
4. Vercel will automatically detect Vite and configure the build settings
5. Add the environment variables from `client/.env` to the Vercel project settings

### Deploying the Server (Backend)
1. Import the same repository as a **separate project** in Vercel
2. Select the `server` directory as the **Root Directory**
3. Add the environment variables:
   - `FIREBASE_SERVICE_ACCOUNT_JSON`: **(Important)** Paste the *content* of your `serviceAccountKey.json` file here as a single line string. This allows the serverless function to authenticate without needing the file uploaded.
   - `ALLOWED_ORIGINS`: Add your client deployment URL (e.g., `https://your-client-app.vercel.app`)

### Local Development vs Production
- **Local:** The server reads `serviceAccountKey.json` from the file system.
- **Production (Vercel):** The server reads the JSON string from the `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable.
