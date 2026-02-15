Task Management Web Application

Introduction:
This project is a full‑stack task management web application built to help individuals and small teams organize their work in a simple and structured way. Instead of tracking tasks through chats, notes, or scattered documents, the application provides a single place where users can create tasks, assign them, update their progress, and monitor overall activity.
The goal of this project is not just to create a CRUD application, but to demonstrate how a real web system works end‑to‑end — from user authentication to protected APIs, database storage, and a responsive user interface.
Users can securely log in, view their assigned tasks, update status, and collaborate in a controlled environment. The system also supports role‑based access so that certain actions are restricted depending on the user’s permissions.
The application is built using React for the frontend, Node.js and Express for the backend, Firebase Authentication for secure login, and MongoDB for persistent data storage.

Why this project exists:
In many student groups, small startups, and project teams, task tracking is usually handled through messaging apps, spreadsheets, or memory. This often causes:

• Tasks getting forgotten
• No clear ownership
• No history of work
• Confusion about progress
• Missed deadlines

Large tools exist, but they are often too complex for beginners. This project focuses on simplicity while still following proper software engineering practices.

What the application does:
The platform allows users to:

• Register and log in securely
• View their dashboard
• Create tasks
• Assign tasks to users
• Update task status
• Track progress
• Access only authorized features

All operations are handled through a backend API, and the database stores all task and user information.

System Architecture:
The application follows a client‑server architecture and is divided into three main parts.

Frontend (Client)

The frontend is built using React. It is responsible for:

• Displaying pages
• Handling user interaction
• Sending requests to the backend
• Showing task data

The frontend never directly accesses the database. It communicates only with the backend API.

Backend (Server)

The backend is built using Node.js and Express. It acts as the brain of the system and handles:

• Business logic
• Authentication verification
• Authorization checks
• Data validation
• Database operations

Every request from the frontend goes through the backend first.

Database

MongoDB is used as the database. It stores:

• User information
• Task details
• Assignment data
• Status updates

Mongoose is used to define schemas and interact with MongoDB.

Authentication Flow:
Authentication is handled using Firebase Authentication.
User logs in from the frontend.
Firebase verifies the credentials.
Firebase returns an ID token.
The frontend sends this token with every API request.
The backend verifies the token using Firebase Admin SDK.
If valid, the user is allowed to access protected routes.
This ensures that no one can access the backend APIs without logging in.

AuthorizationL:
The system uses role‑based access control.

Admin

• Can create tasks
• Can assign tasks
• Can view all tasks

Normal User

• Can view assigned tasks
• Can update task status
• Cannot manage other users

The backend checks permissions before performing any action.

Technology Stack:

Frontend
React
React Router
Axios
CSS / Tailwind styling

Backend
Node.js
Express.js
Firebase Admin SDK

Database
MongoDB
Mongoose

Authentication:
Firebase Authentication

API Overview:
The backend exposes REST APIs.

Examples:

GET /tasks → fetch tasks
POST /tasks → create a task
PUT /tasks/ → update a task
DELETE /tasks/ → delete a task

All routes are protected and require a valid authentication token.

Middleware:
Middleware is used in the backend to process requests before they reach the controller.

It handles:

• Token verification
• Permission checking
• Error handling
• Request validation

The authentication middleware reads the token from the Authorization header and verifies the user.

Security:
The application includes several security measures:

• Protected API routes
• Firebase token verification
• Server‑side validation
• No direct database access from frontend

Quick Start

Follow these steps to run the project locally.

1. Clone the repository

git clone https://github.com/bitraze04/Task.git

cd Task

Backend Setup

Go to backend folder

cd backend

Install dependencies

npm install

Create a .env file

Add:

MONGO_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key

Start the backend server

npm run dev

The backend will start on:
http://localhost:5000

Frontend Setup

Open a new terminal
cd frontend
Install dependencies
npm install
Start the frontend
npm start

The frontend will run on:
http://localhost:3000

How to Use
Open the frontend in your browser.
Log in using Firebase authentication.
After login, you will reach the dashboard.
Create a task.
Assign it to a user.
Update the task status.
All changes are stored in the database and reflected in real time after refresh.

Learning Outcomes

This project demonstrates understanding of:

• Full-stack development
• REST API design
• Authentication systems
• Middleware architecture
• Database modeling
• Secure backend design
• Client-server communication

What this project demonstrates:

• Full‑stack development
• REST API design
• Authentication and authorization
• Database modeling
• Secure backend communication
• Client‑server architecture

## User Roles

| Role | Permissions |
|------|-------------|
| Admin | Create, edit, delete cases. Change status. View all cases. |
| User | View cases. Add comments. |

> **Note**: The first user to register automatically becomes an Admin. All subsequent users are assigned the User role.

## Getting Started

Open http://localhost:5173 in your browser.

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

## Author

Aditya Kumar  
B.Tech Computer Science Engineering

This project was created as a learning project to understand how real web applications are built and secured.
