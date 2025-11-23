# KaziNiKazi 🇷🇼

**Bridging the Gap in Rwanda's Informal Sector**

Welcome to **KaziNiKazi**, a dedicated job marketplace platform built to connect informal sector workers (like plumbers, carpenters, cleaners, and electricians) with employers across Rwanda. This application aims to streamline the process of finding work and hiring talent, replacing word-of-mouth with a reliable, digital solution.

Whether you're a skilled worker looking for your next gig or a homeowner needing a quick fix, KaziNiKazi makes the connection simple, secure, and transparent.

---

## Key Features

### For Job Seekers (Users)
* **Browse & Search:** Easily find jobs by category (e.g., Plumbing, Gardening) or location (District).
* **Easy Application:** Apply to jobs with a single click and track the status of your applications.
* **Work Tracking:** Log your work sessions, start/end times, and view your total earnings.
* **Profile Management:** Keep your personal details and skills up to date.

### For Employers
* **Post Jobs:** Create detailed job listings with categories, salary, and deadlines.
* **Manage Applications:** Review applicants, view their profiles and work history, and accept or reject candidates.
* **Session Approval:** Validate work sessions logged by your employees to ensure fair payment.
* **Dashboard:** Get a bird's-eye view of your active jobs, pending applications, and financial summaries.

### For Administrators
* **Platform Oversight:** Monitor total users, jobs, and activity statistics.
* **Content Management:** Ability to manage users and job postings to ensure platform quality.

---

## Tech Stack

### Backend
* **Language:** Python
* **Framework:** FastAPI
* **Database:** SQLite (via SQLAlchemy)
* **Authentication:** JWT (JSON Web Tokens) with OAuth2

### Frontend
* **Framework:** React (with Vite)
* **Styling:** Tailwind CSS
* **State Management & Routing:** React Router, Context API
* **HTTP Client:** Axios
* **Notifications:** React Hot Toast

---

## Getting Started

Follow these instructions to set up the project environment and directory structure on your local machine.

### Prerequisites
* **Python** (3.8 or higher)
* **Node.js** (14.0 or higher) and **npm**

### 1. Create Project Structure

Before adding the files, create the necessary folder structure to organize the backend and frontend code. Open your terminal and run the following commands:

```bash
# Clone repo
git clone https://github.com/KaziNiKazi-app/kazinikazi.git
```
1. Navigate to the backend directory:
```bash
cd kazinikazi

cd backend
```
2. Create a virtual environment:
```bash
# Windows
python -m venv venv
# macOS/Linux
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5 .Configure Environment Variables: Create a new file named .env inside the kazinikazi/backend/app directory. This file is required to securely store your application's secret key.

File: kazinikazi/backend/app/.env

```bash
cd app
SECRET_KEY=your_super_secret_random_string_here
```

6. Run the server:

```bash
cd ..
python run.py
```
The backend server will start at http://127.0.0.1:8000.

You can access the interactive API documentation at http://127.0.0.1:8000/api/docs.


Frontend Setup
The frontend provides the user interface for interacting with the platform.

1. Navigate to the frontend directory: (Open a new terminal window)

```bash
cd kazinikazi/frontend
```
2. Install dependencies: Ensure you have package.json in the kk2/frontend directory.

```bash
npm install
```
3. Start the development server:

```bash
npm run dev
```
The application will be accessible at http://localhost:3000.

## Project Structure Overview
Here is a quick overview of how the code is organized within the folders you created:

```bash

kazinikazi/
├── backend/
│   ├── .env                # Environment variables (Secret Key)
│   ├── app/
│   │   ├── api/            # API route handlers (Auth, Jobs, Users, etc.)
│   │   ├── core/           # Security, config, and utility functions
│   │   ├── models/         # Database models (SQLAlchemy)
│   │   ├── schemas/        # Pydantic models for request/response validation
│   │   └── database.py     # Database connection setup
│   ├── requirements.txt    # Python dependencies
│   └── run.py              # Entry point for the backend server
│
└── frontend/
    ├── public/             # Static assets (images, icons)
    ├── src/
    │   ├── components/     # Reusable UI components (Navbar, ProtectedRoute)
    │   ├── contexts/       # Global state (AuthContext)
    │   ├── pages/          # Application pages (Home, Dashboard, Login, etc.)
    │   ├── services/       # API service functions (Axios calls)
    │   └── App.jsx         # Main application component and routing
    ├── package.json        # Frontend dependencies and scripts
    └── vite.config.js      # Vite configuration
```

## Authentication & Roles
To test the different features, you can register accounts with different roles:

Job Seeker: Select "Sign Up as Job Seeker" on the login page.

Employer: Select "Sign Up as Employer" on the login page.

Admin: Access the admin portal via /admin/login.
