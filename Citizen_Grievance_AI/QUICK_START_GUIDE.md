# Quick Start Guide

Follow these steps to run the full Citizen Grievance AI system.

## Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- MongoDB (Running locally or remote URI)

## 1. Start the Backend Server
This handles the database responsibilities and API logic.

```bash
cd server
npm install
# Create a .env file if it doesn't exist with:
# MONGO_URI=mongodb://localhost:27017/citizen_grievance
# JWT_SECRET=your_secret_key
# EMAIL_USER=your_email
# EMAIL_PASS=your_password
npm run dev
```
*Runs on http://localhost:5000*

## 2. Start the AI Service
This handles intelligent classification and analysis.

```bash
cd ai-service
# Recommended: Create a virtual environment
# python -m venv venv
# .\venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
*Runs on http://localhost:5001*

## 3. Start the Frontend Client
This is the user interface for Citizens, Officers, and Admins.

```bash
cd client
npm install
npm run dev
```
*Runs on http://localhost:5173*

## 4. Test Accounts
Login with these credentials to test different roles:

| Role | Email | Password |
|------|-------|----------|
| **Citizen** | `citizen@test.com` | `password123` |
| **Officer** | `officer@test.com` | `password123` |
| **Admin** | `admin@test.com` | `password123` |

## Troubleshooting
- **Database Connection Error**: Ensure MongoDB is running.
- **AI Service Error**: Ensure all Python dependencies are installed and you are using the correct Python version.
- **Missing Data**: Run `node server/seedDatabase.js` to repopulate the database with sample data.
