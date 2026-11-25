# WorkforceSync — Full-Stack Attendance Management System

WorkforceSync is a full-stack employee attendance and time-tracking web application built with **React**, **Node.js**, **Express.js**, and **MySQL**. It supports JWT-authenticated user sessions, real-time daily check-in/check-out logging, duplicate-entry validation, automated working duration calculation, and CSV attendance reporting.

## Tech Stack
- **Frontend:** React (Vite), Tailwind CSS, Axios, Lucide Icons
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), bcrypt
- **Database:** MySQL (users, employees, and attendance relational schema)

## Key Features
- **Authentication & Role Context:** Secure registration and login with JWT bearer token authorization.
- **Real-Time Check-In & Check-Out:** One-click daily check-in and check-out logging with server-side duplicate guards (one active check-in per user per day).
- **Automated Work Duration Calculation:** Computes exact shift duration (hours and minutes) upon check-out and persists records in MySQL.
- **Attendance History & CSV Export:** Displays real-time attendance logs in the dashboard and provides an export endpoint for CSV reporting.

## Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Ajaynathan29/workforce-attendance-system.git
cd workforce-attendance-system
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your local MySQL credentials and JWT secret
node init-db.js
npm run dev
```
The API server runs on http://localhost:5000 (health check: GET /api/health).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The React application runs on http://localhost:5173.

## Author
**Ajay Nathan** — [LinkedIn](https://www.linkedin.com/in/ajay-nathan-81b964313) | [GitHub](https://github.com/Ajaynathan29)