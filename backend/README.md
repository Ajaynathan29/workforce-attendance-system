# WorkforceSync - Attendance Management System

A robust, full-stack Attendance Management System developed for the Twite AI Technologies technical assessment. This application provides real-time attendance tracking, automated working hour calculations, and secure user authentication.

## Key Features

### 1. Authentication
- **Secure Login/Registration**: Implemented using JWT (JSON Web Tokens) to ensure secure session management.
- **Role Management**: Supports employee authentication and secure access to dashboard features.

### 2. Attendance Management
- **Real-time Tracking**: Users can mark their attendance with dedicated **Check-In** and **Check-Out** buttons.
- **Automated Calculations**: The system automatically computes the duration between check-in and check-out to display total hours worked (e.g., "5 hrs 47 mins").
- **Timezone Support**: Fully configured for Indian Standard Time (IST) to ensure accurate local logging.
- **History Logs**: Provides a clear view of daily attendance, including dates, check-in/out times, and current status.

### 3. Employee & Dashboard Management
- **Dashboard Overview**: Provides a real-time summary of attendance activities and status updates.
- **Data Export**: Users can export full attendance reports to CSV format for external processing.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express
- **Database**: MySQL (Normalized architecture)

## Setup Instructions

### Prerequisites
- Node.js (v24+)
- MySQL Server

### Backend Setup
1. Navigate to the `backend` folder.
2. Install dependencies:
   ```bash
   npm install